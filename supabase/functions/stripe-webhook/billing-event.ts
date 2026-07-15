/**
 * Pure helpers for turning a Stripe checkout/subscription event payload into
 * a `public.profiles` patch. Adapted from the production dutiva-website
 * repo's `billing-event.ts`, narrowed to this repo's four plans
 * (free/starter/growth/pro — see src/config/plans.ts) instead of
 * starter/growth/advanced/enterprise.
 */
export type ProfileUpdate = {
  subscription_status: string
  billing_period?: 'monthly'
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  plan?: string
}

export type CheckoutProfilePatch = {
  userId: string | null
  email: string | null
  updates: ProfileUpdate
}

export type PriceLookup = Record<string, { plan: string; billingPeriod: 'monthly' }>

const ALLOWED_PLANS = new Set(['starter', 'growth', 'pro'])

export function stringId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' && id.trim() ? id : null
  }
  return null
}

export function normalizePlan(value: unknown): string | null {
  const plan = String(value ?? '').toLowerCase()
  return ALLOWED_PLANS.has(plan) ? plan : null
}

export function inferCheckoutPrice(session: Record<string, unknown>): string | null {
  const lineItems = session.line_items as { data?: Array<{ price?: unknown }> } | undefined
  const lineItemPrice = lineItems?.data?.[0]?.price
  return stringId(lineItemPrice)
}

export function inferSubscriptionPrice(subscription: Record<string, unknown>): string | null {
  const items = subscription.items as
    { data?: Array<{ price?: unknown; plan?: unknown }> } | undefined
  const item = items?.data?.[0]
  return stringId(item?.price) ?? stringId(item?.plan)
}

export function getCheckoutProfilePatch(
  session: Record<string, unknown>,
  priceLookup: PriceLookup = {},
): CheckoutProfilePatch {
  const metadata = (session.metadata ?? {}) as Record<string, unknown>
  const priceId = inferCheckoutPrice(session)
  const priceMatch = priceId ? priceLookup[priceId] : null
  // Prefer the actual purchased price (authoritative) over client-editable
  // metadata.plan, and default to the free plan — never silently grant a
  // paid plan for a checkout whose price we don't recognize.
  const plan = priceMatch?.plan ?? normalizePlan(metadata.plan) ?? 'free'

  return {
    userId: stringId(metadata.user_id) ?? stringId(session.client_reference_id),
    email:
      stringId(session.customer_email) ??
      stringId((session.customer_details as { email?: unknown } | undefined)?.email),
    updates: {
      plan,
      subscription_status: 'active',
      billing_period: 'monthly',
      stripe_customer_id: stringId(session.customer),
      stripe_subscription_id: stringId(session.subscription),
    },
  }
}

export function getSubscriptionProfileUpdate(
  subscription: Record<string, unknown>,
  priceLookup: PriceLookup = {},
): { customerId: string | null; updates: ProfileUpdate } {
  const metadata = (subscription.metadata ?? {}) as Record<string, unknown>
  const priceId = inferSubscriptionPrice(subscription)
  const priceMatch = priceId ? priceLookup[priceId] : null
  // Prefer the actual subscribed price over client-editable metadata.plan.
  const plan = priceMatch?.plan ?? normalizePlan(metadata.plan) ?? null
  const updates: ProfileUpdate = {
    subscription_status: String(subscription.status ?? 'active'),
    stripe_subscription_id: stringId(subscription.id),
  }

  if (plan) updates.plan = plan

  return {
    customerId: stringId(subscription.customer),
    updates,
  }
}
