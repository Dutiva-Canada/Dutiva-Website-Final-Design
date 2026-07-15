import { Link } from 'react-router-dom'
import { ArrowRight, Lock } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { getPlanById, hasPlanAccess } from '@/config/plans'
import type { PlanId } from '@/config/plans'
import { usePlan } from './planContext'

/**
 * Reusable plan gate for future paid views (not wired into /app yet — see
 * CONVENTIONS.md "prep work only" scope). Renders `children` once the
 * signed-in account meets `required`; an internal Dutiva account
 * (adminAccess.ts) always passes, matching PlanProvider's bypass.
 */
export function PlanGate({
  required,
  children,
}: {
  readonly required: PlanId
  readonly children: React.ReactNode
}) {
  const { plan, isAdmin, loading } = usePlan()

  if (loading) return null
  if (isAdmin || hasPlanAccess(plan, required)) return <>{children}</>
  return <UpgradeNudge required={required} />
}

function UpgradeNudge({ required }: { readonly required: PlanId }) {
  const { t } = useI18n()
  const requiredPlan = getPlanById(required)

  return (
    <div className="premium-card-soft flex flex-col items-start gap-3 p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-subtle text-gold-strong">
        <Lock size={18} />
      </span>
      {requiredPlan ? (
        <p className="text-sm leading-[1.55] text-text-2">{t(requiredPlan.descKey)}</p>
      ) : null}
      <Link
        to={`/pricing?upgrade=${required}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-strong transition-opacity hover:opacity-80"
      >
        {t('landing_price_compare')}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
