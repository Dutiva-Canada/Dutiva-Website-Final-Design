import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * Starts a Stripe Checkout subscription session for the signed-in account.
 * Ported from the production dutiva-website repo's create-checkout-session
 * function, narrowed to this repo's three paid plans (starter/growth/pro —
 * see src/config/plans.ts) and adapted to the bearer-JWT + service-role
 * pattern the other dutiva-* functions use (see advisor-chat).
 *
 * An internal Dutiva account (src/lib/billing/adminAccess.ts, mirrored below
 * since Deno functions can't import from src/) never reaches Stripe — it
 * gets a `bypass: true` response instead, which is the actual "automatically
 * bypass the paywall" behavior PlanProvider also implements client-side.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Kept in sync with src/lib/billing/adminAccess.ts by hand — Deno edge
// functions can't import from src/, and duplicating one short list here is
// simpler than a build step that syncs it.
const ADMIN_EMAILS = ['martin.constantineau@dutiva.ca']

function bypassesPaywall(email: string | null | undefined): boolean {
  const normalized = String(email ?? '')
    .trim()
    .toLowerCase()
  return ADMIN_EMAILS.includes(normalized) || normalized.endsWith('@dutiva.ca')
}

const ALLOWED_PLANS = ['starter', 'growth', 'pro'] as const
type PlanId = (typeof ALLOWED_PLANS)[number]

const PRICE_ENV_KEYS: Record<PlanId, string> = {
  starter: 'STRIPE_PRICE_STARTER_MONTHLY',
  growth: 'STRIPE_PRICE_GROWTH_MONTHLY',
  pro: 'STRIPE_PRICE_PRO_MONTHLY',
}

function normalizePlan(value: unknown): PlanId | null {
  const plan = String(value ?? '').toLowerCase()
  return (ALLOWED_PLANS as readonly string[]).includes(plan) ? (plan as PlanId) : null
}

async function stripePost(path: string, params: Record<string, string>, secretKey: string) {
  const body = new URLSearchParams(params).toString()
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  return res.json()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeKey) return json({ error: 'Payments not configured.' }, 503)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Server configuration missing' }, 500)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const token = authHeader.replace('Bearer ', '')

  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  const user = userData?.user
  if (userError || !user) return json({ error: 'Unauthorized' }, 401)

  if (bypassesPaywall(user.email)) {
    return json({
      bypass: true,
      message: 'Internal Dutiva access already includes full plan access — no checkout needed.',
    })
  }

  let body: { plan?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid body.' }, 400)
  }

  const plan = normalizePlan(body.plan)
  if (!plan) return json({ error: 'Invalid plan.' }, 400)

  const priceId = Deno.env.get(PRICE_ENV_KEYS[plan])
  if (!priceId) return json({ error: 'Missing Stripe price ID for requested plan.' }, 503)

  const { data: profile } = await adminClient
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  let customerId = profile?.stripe_customer_id as string | undefined
  if (!customerId) {
    const customer = await stripePost(
      '/customers',
      { email: user.email ?? '', 'metadata[user_id]': user.id },
      stripeKey,
    )
    customerId = customer.id
    await adminClient
      .from('profiles')
      .upsert({ id: user.id, account_email: user.email, stripe_customer_id: customerId })
  }

  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://www.dutiva.ca'
  const session = await stripePost(
    '/checkout/sessions',
    {
      customer: customerId as string,
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${siteUrl}/pricing?checkout=success&plan=${plan}`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      'metadata[user_id]': user.id,
      'metadata[plan]': plan,
      'metadata[billing_interval]': 'monthly',
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][plan]': plan,
      'subscription_data[metadata][billing_interval]': 'monthly',
    },
    stripeKey,
  )

  if (!session.url) return json({ error: 'Could not start checkout.' }, 502)

  return json({ url: session.url })
})
