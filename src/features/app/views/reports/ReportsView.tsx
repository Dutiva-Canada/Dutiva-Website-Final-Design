import { useI18n } from '@/i18n/context'
import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { reportsMessages as M } from '@/i18n/messages/reports'
import { shellMessages } from '@/i18n/messages/shell'

/**
 * Reports view — headcount-by-province bars + compliance-score trend line
 * (prototype `buildReportsView()` + reports markup, App v2.dc.html lines
 * 1204–1231). The numbers are the prototype's viewmodel constants (they do
 * not exist as entity fixtures).
 */

/* FR for 'Federal' from the prototype frDict; province codes are neutral. */
const headcount: { p: Bi; v: number }[] = [
  { p: bi('ON', 'ON'), v: 34 },
  { p: bi('BC', 'BC'), v: 21 },
  { p: bi('QC', 'QC'), v: 12 },
  { p: bi('AB', 'AB'), v: 9 },
  { p: bi('Federal', 'Fédéral'), v: 6 },
]
const maxHeadcount = Math.max(...headcount.map((h) => h.v))
const headcountTotal = headcount.reduce((a, h) => a + h.v, 0)

const scoreTrend = [74, 76, 79, 78, 81, 82]
const MAX_SCORE = 100
/* Same expression as the prototype so the polyline is point-identical. */
const trendPoints = scoreTrend
  .map((v, i) => i * (240 / (scoreTrend.length - 1)) + ',' + (60 - (v / MAX_SCORE) * 60))
  .join(' ')
const latestScore = scoreTrend[scoreTrend.length - 1] ?? 0

export function ReportsView() {
  const { x } = useI18n()

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-[18px] text-[13px] text-text-muted">
          {x(shellMessages.shell_sub_reports)}
        </div>
        <div className="flex flex-wrap gap-[16px]">
          {/* Headcount by province */}
          <div className="min-w-[280px] flex-1 rounded-[12px] border border-border bg-surface p-[20px]">
            <div className="mb-[4px] text-[13px] font-bold text-text-2">
              {x(M.reports_headcount_title)}
            </div>
            <div className="mb-[16px] text-[12px] text-text-muted">
              {headcountTotal} {x(M.reports_total_employees)}
            </div>
            <div className="flex h-[110px] items-end gap-[18px]">
              {headcount.map((h) => (
                <div key={h.p.en} className="flex flex-col items-center gap-[6px]">
                  <div
                    className="w-[30px] rounded-t-[5px] bg-navy"
                    style={{ height: `${Math.round((h.v / maxHeadcount) * 100)}px` }}
                  />
                  <span className="text-[11px] text-text-muted">{x(h.p)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance score trend */}
          <div className="min-w-[280px] flex-1 rounded-[12px] border border-border bg-surface p-[20px]">
            <div className="mb-[4px] text-[13px] font-bold text-text-2">
              {x(M.reports_trend_title)}
            </div>
            <div className="mb-[16px] text-[12px] text-text-muted">
              {x(M.reports_trend_sub).replace('{score}', String(latestScore))}
            </div>
            <svg
              width="100%"
              height="60"
              viewBox="0 0 240 60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points={trendPoints}
                fill="none"
                stroke="currentColor"
                className="text-ok-fg"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
