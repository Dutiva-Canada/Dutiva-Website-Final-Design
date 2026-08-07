import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { analyticsMessages as M } from '@/i18n/messages/analytics'
import { statusChipClass } from '@/components/chips'
import type { ScoreDelta } from './aggregation'
import { formatMonthISO } from './aggregation'
import { fill, formatSignedDelta, intlLocale } from './format'

/**
 * The score card's hero figure: score out of 100 plus the signed delta vs
 * the start of the window ("+8 vs February") as a status chip — direction
 * carried by icon + signed text together, never colour alone.
 */
export function ScoreHero({
  score,
  delta,
}: {
  readonly score: number
  readonly delta: ScoreDelta | null
}) {
  const { x, lang } = useI18n()
  const locale = intlLocale(lang)

  let chip = null
  if (delta !== null) {
    const month = formatMonthISO(delta.baselineMonthISO, locale, 'long')
    if (delta.delta === 0) {
      chip = (
        <span className={`${statusChipClass('neutral')} items-center`}>
          <Minus size={12} strokeWidth={1.9} className="mr-[5px]" aria-hidden="true" />
          {fill(x(M.analytics_score_delta_flat), { month })}
        </span>
      )
    } else {
      const up = delta.delta > 0
      const Icon = up ? TrendingUp : TrendingDown
      chip = (
        <span className={`${statusChipClass(up ? 'success' : 'risk')} items-center`}>
          <Icon size={12} strokeWidth={1.9} className="mr-[5px]" aria-hidden="true" />
          {fill(x(M.analytics_score_delta), {
            delta: formatSignedDelta(delta.delta),
            month,
          })}
        </span>
      )
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px]">
      <span className="flex items-baseline gap-[2px]">
        <span className="font-display text-[46px] leading-none font-bold text-text">{score}</span>
        <span className="text-[15px] font-semibold text-text-muted">/100</span>
      </span>
      {chip}
    </div>
  )
}
