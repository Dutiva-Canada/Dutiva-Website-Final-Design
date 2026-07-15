import { useState } from 'react'
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { useAuth } from '@/features/app/auth/authContext'
import { usePlan } from '@/features/app/billing/planContext'
import { supabase } from '@/lib/supabaseClient'
import { PLANS, getPlanById } from '@/config/plans'
import type { PlanDefinition } from '@/config/plans'
import { Disclaimer } from '@/components/Disclaimer'
import { Seo } from '@/seo/Seo'
import { webApplicationNode } from '@/seo/jsonld'
import { MarketingPageShell, PageCta, PageHero, PageSection } from './MarketingPage'
import type { ReactNode } from 'react'

/** Full-width band with no heading — for the admin-bypass banner and the checkout notice. */
function Band({ children }: { readonly children: ReactNode }) {
  return <section className="mx-auto max-w-[960px] px-6 py-2">{children}</section>
}

interface CheckoutResponse {
  url?: string
  bypass?: boolean
  message?: string
  error?: string
}

function PriceCard({
  plan,
  onCheckout,
  isLoading,
}: {
  readonly plan: PlanDefinition
  readonly onCheckout: (plan: PlanDefinition) => void
  readonly isLoading: boolean
}) {
  const { t } = useI18n()
  const hasPrice = plan.monthlyPrice > 0

  return (
    <div
      className={
        plan.popular
          ? 'relative flex h-full flex-col rounded-2xl border border-gold-border bg-bg-soft p-6 shadow-[0_0_0_1px_rgba(var(--dutiva-gold-rgb),0.12)]'
          : 'relative flex h-full flex-col rounded-2xl border border-border bg-bg-elevated p-6'
      }
    >
      {plan.popular ? (
        <div className="absolute left-6 top-3 inline-flex items-center gap-1.5 rounded-full border border-gold-border bg-gold-subtle px-2.5 py-0.5 text-[0.6875rem] font-semibold text-gold-strong">
          <Sparkles size={12} />
          {t('landing_growth_popular')}
        </div>
      ) : null}

      <div className="mt-4 text-lg font-semibold text-text">{t(plan.nameKey)}</div>
      <p className="mt-2 text-sm leading-6 text-text-2">{t(plan.descKey)}</p>

      <div className="mt-6 flex items-end gap-2">
        <div className="font-display text-4xl font-semibold tracking-[-0.02em] text-text">
          {hasPrice ? `$${plan.monthlyPrice}` : t('landing_free_amt')}
        </div>
        {hasPrice ? <div className="pb-1 text-sm text-text-2">CAD{t('pricing_mo')}</div> : null}
      </div>

      <ul className="m-0 mt-6 flex-1 list-none space-y-3 p-0">
        {plan.featureKeys.map((key) => (
          <li key={key} className="flex items-start gap-3 text-sm text-text-2">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-subtle text-gold-strong">
              <Check size={13} />
            </span>
            {t(key)}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onCheckout(plan)}
        disabled={isLoading}
        className={[
          'mt-8 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm',
          plan.popular ? 'gold-button' : 'ghost-button',
          isLoading ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        {isLoading ? t('pricing_cta_processing') : t(plan.ctaKey)}
        <ArrowRight size={16} className="shrink-0" />
      </button>
    </div>
  )
}

/**
 * /pricing — the full plan comparison page the landing page's Pricing
 * section links to ("Compare all plans"). Checkout goes through the
 * `create-checkout-session` Supabase function (supabase/functions/); an
 * internal Dutiva account bypasses it automatically (adminAccess.ts) and
 * sees a confirmation banner instead of a Stripe redirect.
 */
export function PricingPage() {
  const { t, lang } = useI18n()
  const { status } = useAuth()
  const { isAdmin, plan: currentPlan, stripeCustomerId, loading: planLoading } = usePlan()
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  async function handleCheckout(plan: PlanDefinition) {
    setNotice(null)

    if (plan.id === 'free' || status !== 'signed-in') {
      window.location.href = '/app/welcome'
      return
    }

    if (!supabase) {
      setNotice({ tone: 'error', text: t('pricing_checkout_unavailable') })
      return
    }

    setCheckoutPlanId(plan.id)
    try {
      const { data, error } = await supabase.functions.invoke<CheckoutResponse>(
        'create-checkout-session',
        { body: { plan: plan.id } },
      )
      if (error) throw error

      if (data?.bypass) {
        setNotice({ tone: 'success', text: data.message ?? t('pricing_checkout_bypassed') })
        return
      }
      if (data?.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data?.error ?? 'Checkout session missing url')
    } catch {
      setNotice({ tone: 'error', text: t('pricing_checkout_error') })
    } finally {
      setCheckoutPlanId(null)
    }
  }

  async function handleManageBilling() {
    setNotice(null)
    if (!supabase) {
      setNotice({ tone: 'error', text: t('pricing_checkout_unavailable') })
      return
    }
    setPortalLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke<CheckoutResponse>(
        'create-portal-session',
        { body: {} },
      )
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data?.error ?? 'Portal session missing url')
    } catch {
      setNotice({ tone: 'error', text: t('pricing_portal_error') })
    } finally {
      setPortalLoading(false)
    }
  }

  /* Offer nodes mirror the plan cards rendered below (same PLANS catalogue,
     same visible CAD prices) — schema pricing can never drift from the page. */
  const offers = PLANS.map((plan) => ({ name: t(plan.nameKey), priceCad: plan.monthlyPrice }))
  return (
    <MarketingPageShell>
      <Seo route="pricing" extraNodes={[webApplicationNode(lang, offers)]} />
      <PageHero eyebrow={t('pricing_eyebrow')} title={t('pricing_h1')} intro={t('pricing_intro')} />

      {isAdmin && !planLoading ? (
        <Band>
          <div className="premium-card-soft flex flex-wrap items-center gap-4 border-gold-border p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-subtle text-gold-strong">
              <ShieldCheck size={18} />
            </span>
            <div>
              <div className="badge">{t('pricing_admin_badge')}</div>
              <p className="mt-1.5 text-sm leading-6 text-text-2">{t('pricing_admin_detail')}</p>
            </div>
          </div>
        </Band>
      ) : null}

      {notice ? (
        <Band>
          <div
            role="status"
            className={
              notice.tone === 'success'
                ? 'rounded-xl border border-gold-border bg-gold-subtle px-4 py-3 text-sm text-gold-strong'
                : 'rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text'
            }
          >
            {notice.text}
          </div>
        </Band>
      ) : null}

      {!isAdmin && stripeCustomerId ? (
        <PageSection title={t('pricing_current_plan')}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="badge">
              {t(getPlanById(currentPlan)?.nameKey ?? 'landing_free_name')}
            </span>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="ghost-button inline-flex items-center gap-2 px-5 py-3 text-sm"
            >
              {portalLoading ? t('pricing_cta_processing') : t('pricing_manage_billing')}
            </button>
          </div>
        </PageSection>
      ) : null}

      <PageSection title={t('pricing_compare_title')}>
        <p className="-mt-3 mb-6 max-w-[62ch] text-sm leading-6 text-text-2">
          {t('pricing_compare_sub')}
        </p>
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PriceCard
              key={plan.id}
              plan={plan}
              onCheckout={handleCheckout}
              isLoading={checkoutPlanId === plan.id}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-text-3">
          <span className="inline-flex items-center gap-1.5">
            <Check size={15} className="text-gold-strong" />
            {t('landing_price_foot1')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check size={15} className="text-gold-strong" />
            {t('landing_price_foot2')}
          </span>
        </div>
        <Disclaimer variant="block" className="mt-6" />
      </PageSection>

      <PageSection title={t('pricing_faq_title')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="premium-card-soft p-5">
            <div className="text-sm font-semibold text-text">{t('pricing_faq_legal_q')}</div>
            <p className="mt-2 text-sm leading-6 text-text-2">{t('pricing_faq_legal_a')}</p>
          </div>
          <div className="premium-card-soft p-5">
            <div className="text-sm font-semibold text-text">{t('pricing_faq_jur_q')}</div>
            <p className="mt-2 text-sm leading-6 text-text-2">{t('pricing_faq_jur_a')}</p>
          </div>
        </div>
      </PageSection>

      <PageCta
        title={t('pricing_cta_title')}
        body={t('pricing_cta_body')}
        action={t('landing_free_cta')}
        to="/app/welcome"
      />
      <div className="mx-auto -mt-12 mb-16 flex max-w-[1200px] justify-center px-6">
        <a
          href="mailto:support@dutiva.ca"
          className="text-sm font-semibold text-text-2 transition-opacity hover:opacity-80"
        >
          {t('pricing_cta_ask')}
        </a>
      </div>
    </MarketingPageShell>
  )
}
