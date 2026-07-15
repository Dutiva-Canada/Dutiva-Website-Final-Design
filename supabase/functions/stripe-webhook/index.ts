import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { getCheckoutProfilePatch, getSubscriptionProfileUpdate, stringId } from './billing-event.ts'
import type { PriceLookup } from './billing-event.ts'
import { verifyStripeSignature } from './verify-signature.ts'

/**
 * Stripe webhook handler — keeps `public.profiles` in sync with Stripe.
 * Ported from the production dutiva-website repo's stripe-webhook function,
 * narrowed to this repo's three paid plans (starter/growth/pro, monthly
 * billing only — see src/config/plans.ts).
 *
 * An internal Dutiva account never has Stripe events to process for it: the
 * paywall bypass (src/lib/billing/adminAccess.ts) is checked before
 * create-checkout-session ever calls Stripe, so no subscription is created
 * for that account in the first place.
 */

const PRICE_ENV_KEYS: Record<string, { plan: string }> = {
  STRIPE_PRICE_STARTER_MONTHLY: { plan: 'starter' },
  STRIPE_PRICE_GROWTH_MONTHLY: { plan: 'growth' },
  STRIPE_PRICE_PRO_MONTHLY: { plan: 'pro' },
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function buildPriceLookup(): PriceLookup {
  const lookup: PriceLookup = {}
  for (const [envKey, match] of Object.entries(PRICE_ENV_KEYS)) {
    const priceId = Deno.env.get(envKey)?.trim()
    if (priceId) lookup[priceId] = { plan: match.plan, billingPeriod: 'monthly' }
  }
  return lookup
}

async function updateProfileByIdOrEmail(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string | null,
  email: string | null,
  updates: Record<string, unknown>,
) {
  if (userId) {
    return supabase.from('profiles').update(updates).eq('id', userId)
  }

  if (!email) {
    console.warn('[stripe-webhook] No user id or email available for profile update.')
    return null
  }

  // Do NOT interpolate an externally-influenced email into a PostgREST
  // .or() filter string (filter-injection risk) — a parameterized .eq()
  // instead.
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('account_email', email.trim().toLowerCase())
    .maybeSingle()
  if (error) console.warn('[stripe-webhook] profile lookup error:', error.message)
  if (!data?.id) {
    console.warn('[stripe-webhook] Could not resolve profile by checkout email:', email)
    return null
  }

  return supabase.from('profiles').update(updates).eq('id', data.id)
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!webhookSecret || !supabaseUrl || !supabaseKey) {
    return json({ error: 'Webhook not configured.' }, 503)
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  const valid = await verifyStripeSignature(body, sig, webhookSecret)
  if (!valid) return json({ error: 'Invalid signature.' }, 400)

  const event = JSON.parse(body)
  const supabase = createClient(supabaseUrl, supabaseKey)
  const priceLookup = buildPriceLookup()

  if (event.id) {
    const { error: dedupError } = await supabase
      .from('stripe_webhook_events')
      .insert({ event_id: event.id, event_type: event.type ?? 'unknown' })

    if (dedupError) {
      if (dedupError.code === '23505') {
        return json({ received: true, duplicate: true })
      }
      console.warn('[stripe-webhook] dedup insert failed, continuing:', dedupError.message)
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, email, updates } = getCheckoutProfilePatch(session, priceLookup)

    if (!updates.stripe_customer_id) {
      console.warn('[stripe-webhook] checkout.session.completed: customer is not a string ID.')
    }
    if (!updates.stripe_subscription_id) {
      console.warn('[stripe-webhook] checkout.session.completed: subscription is not a string ID.')
    }

    await updateProfileByIdOrEmail(supabase, userId, email, updates)
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const sub = event.data.object
    const { customerId, updates } = getSubscriptionProfileUpdate(sub, priceLookup)

    if (customerId) {
      await supabase.from('profiles').update(updates).eq('stripe_customer_id', customerId)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const customerId = stringId(invoice.customer)
    if (customerId) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const customerId = stringId(sub.customer)
    if (customerId) {
      await supabase
        .from('profiles')
        .update({ plan: 'free', subscription_status: 'canceled' })
        .eq('stripe_customer_id', customerId)
    }
  }

  return json({ received: true })
})
