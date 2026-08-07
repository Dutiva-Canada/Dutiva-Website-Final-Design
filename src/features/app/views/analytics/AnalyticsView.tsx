import { useI18n } from '@/i18n/context'
import { analyticsMessages as M } from '@/i18n/messages/analytics'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import {
  cases,
  complianceCategories,
  complianceItems,
  demoTodayISO,
  headcountByJurisdiction,
  headcountTotal,
  obligations,
  policyAcknowledgment,
  scoreHistory,
} from '@/data'
import { AnalyticsCard, CardEmpty } from './AnalyticsCard'
import { AnalyticsProductionView } from './AnalyticsProductionView'
import { AckMeter } from './AckMeter'
import { AttentionList } from './AttentionList'
import type { AttentionRow } from './AttentionList'
import { JurisdictionBars } from './JurisdictionBars'
import { OpenCaseRows } from './OpenCaseRows'
import { ScoreBreakdownMeters } from './ScoreBreakdownMeters'
import { ScoreHero } from './ScoreHero'
import { ScoreTrendChart } from './ScoreTrendChart'
import { StatTile } from './StatTile'
import { ackProgress, caseAging, rankAttention, scoreDelta } from './aggregation'
import { attentionChipLabel, attentionSecondary } from './attentionLabels'
import { fill, formatDayISO, intlLocale } from './format'

/**
 * Analytics (formerly Reports) — the workspace dashboard: compliance score
 * with its six-month trend and per-category breakdown, the needs-attention
 * queue, headcount by jurisdiction, open-case aging and policy
 * acknowledgments. Demo mode renders the Northgate diorama below (all
 * numbers computed from `src/data` fixtures against the diorama's fixed
 * "today"); production renders AnalyticsProductionView — live aggregation
 * over the modules already on real persistence.
 */

const ATTENTION_CAP = 5

export function AnalyticsView() {
  const { mode: workspaceMode } = useWorkspaceMode()
  if (workspaceMode === 'production') return <AnalyticsProductionView />
  return <AnalyticsDemoView />
}

function AnalyticsDemoView() {
  const { x, lang } = useI18n()
  const locale = intlLocale(lang)

  /* Compliance score */
  const delta = scoreDelta(scoreHistory)
  const currentScore = scoreHistory.at(-1)?.score ?? 0
  const lowestCategoryScore = Math.min(...complianceCategories.map((c) => c.score))
  const breakdownRows = complianceCategories.map((cat) => ({
    key: cat.key,
    label: x(cat.label),
    pct: cat.score,
    valueText: String(cat.score),
    flagged: cat.score === lowestCategoryScore,
  }))

  /* Needs attention: dated compliance items across programs — the
     obligation register minus rows with evidence on file, plus recommended
     actions that carry a scheduled date. */
  const attentionPool = [
    ...obligations
      .filter((ob) => ob.status !== 'ok')
      .map((ob) => ({
        id: ob.id,
        dueISO: ob.dueISO,
        title: x(ob.title),
        jurisdiction: x(ob.jurLabel),
        affected: ob.affected,
      })),
    ...complianceItems
      .filter((item) => item.severity !== 'Resolved' && item.dueISO !== undefined)
      .map((item) => ({
        id: item.id,
        dueISO: item.dueISO!,
        title: x(item.title),
        jurisdiction: x(item.province),
        affected: item.affected,
      })),
  ]
  const ranked = rankAttention(attentionPool, demoTodayISO)
  const attentionRows: AttentionRow[] = ranked.slice(0, ATTENTION_CAP).map((r) => ({
    key: r.item.id,
    title: r.item.title,
    secondary: attentionSecondary(r.item.jurisdiction, r.item.affected, x),
    status: r.status,
    chipLabel: attentionChipLabel(r, x, locale),
    href: '/app/compliance',
  }))

  /* Open cases */
  const openCases = cases.filter((c) => c.status.en !== 'Resolved')
  const aging = caseAging(openCases, demoTodayISO)

  /* Policy acknowledgments */
  const ack = ackProgress(policyAcknowledgment.signed, policyAcknowledgment.total)

  return (
    <div className="flex-1 overflow-y-auto px-[14px] pt-[18px] pb-[96px] sm:px-[32px] sm:pt-[26px] sm:pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-[14px] text-[13px] text-text-muted">{x(M.analytics_subtitle)}</div>

        <div className="grid grid-cols-1 gap-[14px] min-[900px]:grid-cols-2 min-[900px]:gap-[16px]">
          {/* Compliance score — hero, windowed trend, category breakdown */}
          <AnalyticsCard title={x(M.analytics_score_title)} className="min-[900px]:col-span-2">
            <ScoreHero score={currentScore} delta={delta} />
            <div className="mt-[10px]">
              <ScoreTrendChart history={scoreHistory} />
            </div>
            <div className="mt-[14px] border-t border-border-soft pt-[14px]">
              <div className="mb-[10px] text-[11.5px] font-bold tracking-[0.04em] uppercase text-text-muted">
                {x(M.analytics_score_breakdown_title)}
              </div>
              <ScoreBreakdownMeters rows={breakdownRows} />
            </div>
          </AnalyticsCard>

          {/* Needs attention */}
          <AnalyticsCard
            title={x(M.analytics_attention_title)}
            subtitle={x(M.analytics_attention_sub)}
          >
            {attentionRows.length === 0 ? (
              <CardEmpty text={x(M.analytics_attention_empty)} />
            ) : (
              <AttentionList
                rows={attentionRows}
                viewAllHref="/app/compliance"
                viewAllLabel={fill(x(M.analytics_attention_view_all), { n: ranked.length })}
              />
            )}
          </AnalyticsCard>

          {/* Headcount by jurisdiction */}
          <AnalyticsCard
            title={x(M.analytics_headcount_title)}
            subtitle={fill(x(M.analytics_headcount_total), { n: headcountTotal })}
          >
            <JurisdictionBars
              rows={headcountByJurisdiction.map((row) => ({
                key: row.key,
                label: x(row.label),
                value: row.value,
              }))}
            />
            <p className="mt-[10px] mb-0 text-[11.5px] text-text-faint">
              {x(M.analytics_headcount_footnote)}
            </p>
          </AnalyticsCard>

          {/* Open cases */}
          <AnalyticsCard title={x(M.analytics_cases_title)}>
            {aging === null ? (
              <CardEmpty text={x(M.analytics_cases_empty)} />
            ) : (
              <>
                <div className="mb-[12px] flex gap-[10px]">
                  <StatTile value={String(aging.openCount)} label={x(M.analytics_cases_open_now)} />
                  <StatTile value={String(aging.avgDays)} label={x(M.analytics_cases_avg_age)} />
                  <StatTile
                    value={String(aging.oldestDays)}
                    label={x(M.analytics_cases_oldest)}
                    alert={aging.oldestDays > 14}
                  />
                </div>
                <OpenCaseRows
                  rows={aging.rows.map(({ caseRow, daysOpen }) => ({
                    key: caseRow.id,
                    href: `/app/cases/${caseRow.id}`,
                    typeLabel: x(caseRow.typeLabel),
                    jurisdiction: x(caseRow.province),
                    openedLabel: fill(x(M.analytics_cases_opened), {
                      date: formatDayISO(caseRow.openedISO, locale),
                    }),
                    daysOpen,
                    daysLabel:
                      daysOpen === 1
                        ? x(M.analytics_cases_day_one)
                        : fill(x(M.analytics_cases_days), { n: daysOpen }),
                  }))}
                />
              </>
            )}
          </AnalyticsCard>

          {/* Policy acknowledgments */}
          <AnalyticsCard title={x(M.analytics_ack_title)} subtitle={x(policyAcknowledgment.title)}>
            <AckMeter ack={ack} />
          </AnalyticsCard>
        </div>
      </div>
    </div>
  )
}
