import { describe, expect, it } from 'vitest'
import {
  getCheckoutProfilePatch,
  getSubscriptionProfileUpdate,
  inferCheckoutPrice,
  normalizePlan,
  stringId,
} from './billing-event'

const priceLookup = {
  price_starter_monthly: { plan: 'starter', billingPeriod: 'monthly' as const },
  price_growth_monthly: { plan: 'growth', billingPeriod: 'monthly' as const },
  price_pro_monthly: { plan: 'pro', billingPeriod: 'monthly' as const },
}

describe('stripe webhook billing event helpers', () => {
  it('extracts string ids from expanded Stripe objects', () => {
    expect(stringId('cus_123')).toBe('cus_123')
    expect(stringId({ id: 'sub_123', object: 'subscription' })).toBe('sub_123')
    expect(stringId({ object: 'subscription' })).toBeNull()
  })

  it('normalizes supported plan labels and rejects unknown ones', () => {
    expect(normalizePlan('Growth')).toBe('growth')
    expect(normalizePlan('unknown')).toBeNull()
    expect(normalizePlan('enterprise')).toBeNull()
  })

  it('falls back to the free plan for unrecognized metadata.plan', () => {
    const patch = getCheckoutProfilePatch(
      {
        customer: 'cus_old',
        subscription: 'sub_old',
        metadata: { user_id: 'user_old', plan: 'enterprise' },
      },
      priceLookup,
    )

    expect(patch).toEqual({
      userId: 'user_old',
      email: null,
      updates: {
        plan: 'free',
        subscription_status: 'active',
        billing_period: 'monthly',
        stripe_customer_id: 'cus_old',
        stripe_subscription_id: 'sub_old',
      },
    })
  })

  it('prefers the actual purchased price over client-editable metadata.plan', () => {
    const patch = getCheckoutProfilePatch(
      {
        client_reference_id: 'user_from_pricing_table',
        customer: { id: 'cus_new' },
        subscription: { id: 'sub_new' },
        customer_details: { email: 'buyer@example.com' },
        line_items: { data: [{ price: { id: 'price_growth_monthly' } }] },
        metadata: { plan: 'starter' },
      },
      priceLookup,
    )

    expect(patch).toEqual({
      userId: 'user_from_pricing_table',
      email: 'buyer@example.com',
      updates: {
        plan: 'growth',
        subscription_status: 'active',
        billing_period: 'monthly',
        stripe_customer_id: 'cus_new',
        stripe_subscription_id: 'sub_new',
      },
    })
  })

  it('falls back to checkout email when no user id is available', () => {
    const patch = getCheckoutProfilePatch(
      {
        customer: 'cus_email',
        subscription: 'sub_email',
        customer_email: 'buyer@example.com',
        line_items: { data: [{ price: 'price_pro_monthly' }] },
      },
      priceLookup,
    )

    expect(patch.userId).toBeNull()
    expect(patch.email).toBe('buyer@example.com')
    expect(patch.updates.plan).toBe('pro')
  })

  it('infers prices from checkout line items', () => {
    expect(
      inferCheckoutPrice({
        line_items: { data: [{ price: { id: 'price_growth_monthly' } }] },
      }),
    ).toBe('price_growth_monthly')
  })

  it('updates subscription events from price id, keeping the reported status', () => {
    const result = getSubscriptionProfileUpdate(
      {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'past_due',
        items: { data: [{ price: { id: 'price_starter_monthly' } }] },
        metadata: {},
      },
      priceLookup,
    )

    expect(result).toEqual({
      customerId: 'cus_123',
      updates: {
        plan: 'starter',
        subscription_status: 'past_due',
        stripe_subscription_id: 'sub_123',
      },
    })
  })
})
