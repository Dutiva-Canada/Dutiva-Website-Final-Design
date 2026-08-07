import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChartNoAxesColumn } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { analyticsMessages as M } from '@/i18n/messages/analytics'
import { casesMessages } from '@/i18n/messages/cases'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { ProductionEmptyState } from '@/features/app/workspaceMode/ProductionEmptyState'
import { listEmployees } from '@/features/app/views/employees/productionApi'
import type { ProductionEmployee } from '@/features/app/views/employees/productionApi'
import { listCases } from '@/features/app/views/cases/productionApi'
import type { ProductionCase, ProductionCaseType } from '@/features/app/views/cases/productionApi'
import { listTasks } from '@/features/app/views/tasks/productionApi'
import type { ProductionTask } from '@/features/app/views/tasks/productionApi'
import { listFindings } from '@/features/app/views/compliance/productionApi'
import type { ProductionFinding } from '@/features/app/views/compliance/productionApi'
import { listPolicies } from '@/features/app/views/policies/productionApi'
import type { ProductionPolicy } from '@/features/app/views/policies/productionApi'
import { listScoreSnapshots, recordScoreSnapshot } from './productionApi'
import type { ScoreSnapshot } from './productionApi'
import { AnalyticsCard, CardEmpty, CardError, CardSkeleton } from './AnalyticsCard'
import { AttentionList } from './AttentionList'
import type { AttentionRow } from './AttentionList'
import { JurisdictionBars } from './JurisdictionBars'
import { OpenCaseRows } from './OpenCaseRows'
import { ScoreBreakdownMeters } from './ScoreBreakdownMeters'
import { ScoreHero } from './ScoreHero'
import { ScoreTrendChart } from './ScoreTrendChart'
import { StatTile } from './StatTile'
import {
  blendScore,
  caseAging,
  monthStartISO,
  rankAttention,
  scoreComponent,
  scoreDelta,
} from './aggregation'
import { attentionChipLabel, attentionSecondary } from './attentionLabels'
import { fill, formatDayISO, intlLocale } from './format'

/**
 * Analytics in production mode. The score's history lives in its own table
 * (compliance_score_snapshots — the one aggregate that can't be recomputed
 * later); everything else is aggregated live from the modules already on
 * real persistence, through their own productionApi boundaries.
 *
 * Each card fetches only the modules it needs and carries its own skeleton,
 * empty state and retry — so a failing module degrades one card, and cards
 * can later be hidden per role without entangling the rest of the page.
 */

const ATTENTION_CAP = 5
const HISTORY_WINDOW_MONTHS = 6

const TYPE_LABEL: Record<ProductionCaseType, (typeof casesMessages)[keyof typeof casesMessages]> = {
  Termination: casesMessages.cases_prod_type_termination,
  Performance: casesMessages.cases_prod_type_performance,
  Accommodation: casesMessages.cases_prod_type_accommodation,
  Onboarding: casesMessages.cases_prod_type_onboarding,
}

type ModuleState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; rows: T[] }

/** Per-module loader with its own retry, so cards stay independently alive. */
function useModuleRows<T>(
  organizationId: string | null,
  list: (organizationId: string) => Promise<T[]>,
): { state: ModuleState<T>; retry: () => void } {
  const [state, setState] = useState<ModuleState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!organizationId) return
    let cancelled = false
    setState({ status: 'loading' })
    list(organizationId)
      .then((rows) => {
        if (!cancelled) setState({ status: 'ready', rows })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [organizationId, list, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { state, retry }
}

/** Skeleton / error / ready gate over the modules a card depends on. */
function CardData({
  deps,
  skeletonLines = 3,
  children,
}: {
  readonly deps: readonly { state: ModuleState<unknown>; retry: () => void }[]
  readonly skeletonLines?: number
  readonly children: () => ReactNode
}) {
  if (deps.some((d) => d.state.status === 'error')) {
    return (
      <CardError
        onRetry={() => {
          for (const dep of deps) if (dep.state.status === 'error') dep.retry()
        }}
      />
    )
  }
  if (deps.some((d) => d.state.status === 'loading')) {
    return <CardSkeleton lines={skeletonLines} />
  }
  return <>{children()}</>
}

function rowsOf<T>(state: ModuleState<T>): T[] {
  return state.status === 'ready' ? state.rows : []
}

export function AnalyticsProductionView() {
  const { x, lang } = useI18n()
  const locale = intlLocale(lang)
  const { organizationId } = useWorkspaceMode()

  const todayISO = new Date().toISOString().slice(0, 10)
  const currentMonthISO = monthStartISO(todayISO)

  const employees = useModuleRows<ProductionEmployee>(organizationId, listEmployees)
  const hrCases = useModuleRows<ProductionCase>(organizationId, listCases)
  const tasks = useModuleRows<ProductionTask>(organizationId, listTasks)
  const findings = useModuleRows<ProductionFinding>(organizationId, listFindings)
  const policies = useModuleRows<ProductionPolicy>(organizationId, listPolicies)
  const snapshots = useModuleRows<ScoreSnapshot>(organizationId, listScoreSnapshots)

  /* ── Score: live components + snapshot history ─────────────────────────── */
  const scoreReady =
    policies.state.status === 'ready' &&
    tasks.state.status === 'ready' &&
    findings.state.status === 'ready'

  const components = useMemo(() => {
    const policyRows = rowsOf(policies.state)
    const taskRows = rowsOf(tasks.state)
    const findingRows = rowsOf(findings.state)
    return [
      scoreComponent(
        'policies',
        policyRows.filter((p) => p.status === 'up_to_date').length,
        policyRows.length,
      ),
      scoreComponent('tasks', taskRows.filter((t) => t.done).length, taskRows.length),
      scoreComponent('findings', findingRows.filter((f) => f.resolved).length, findingRows.length),
    ]
  }, [policies.state, tasks.state, findings.state])

  const liveScore = scoreReady ? blendScore(components) : null

  /* Record this month's snapshot once per page view — history is written as
     a side effect of computing the live score. Failure is dropped: history
     is an enhancement, never a reason to degrade the dashboard. */
  const recordedRef = useRef(false)
  useEffect(() => {
    if (recordedRef.current || !organizationId || liveScore === null) return
    recordedRef.current = true
    recordScoreSnapshot(
      organizationId,
      currentMonthISO,
      liveScore,
      components.map((c) => ({ key: c.key, done: c.done, total: c.total })),
    ).catch(() => {})
  }, [organizationId, liveScore, components, currentMonthISO])

  const history = useMemo(() => {
    if (liveScore === null) return []
    const past = rowsOf(snapshots.state).filter((s) => s.monthISO < currentMonthISO)
    return [...past, { monthISO: currentMonthISO, score: liveScore }].slice(-HISTORY_WINDOW_MONTHS)
  }, [snapshots.state, liveScore, currentMonthISO])

  if (!organizationId) {
    return <ProductionEmptyState title={x(M.analytics_prod_empty_title)} />
  }

  /* ── Whole-page empty state: brand-new workspace with no records at all ── */
  const coreReady =
    scoreReady && employees.state.status === 'ready' && hrCases.state.status === 'ready'
  const hasAnyData =
    rowsOf(employees.state).length +
      rowsOf(hrCases.state).length +
      rowsOf(tasks.state).length +
      rowsOf(findings.state).length +
      rowsOf(policies.state).length >
    0
  if (coreReady && !hasAnyData) {
    return (
      <div className="flex-1 overflow-y-auto px-[14px] pt-[18px] pb-[96px] sm:px-[32px] sm:pt-[26px] sm:pb-[60px]">
        <div className="mx-auto max-w-[900px]">
          <div className="rounded-[12px] border border-border bg-surface px-[24px] py-[40px] text-center">
            <div className="mx-auto mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-inset">
              <ChartNoAxesColumn
                size={20}
                strokeWidth={1.7}
                className="text-text-muted"
                aria-hidden="true"
              />
            </div>
            <div className="mb-[6px] text-[15px] font-semibold text-text">
              {x(M.analytics_prod_empty_title)}
            </div>
            <p className="m-0 text-[13px] text-text-muted">{x(M.analytics_prod_empty_body)}</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Card data ─────────────────────────────────────────────────────────── */
  const scoreDeltaValue = scoreDelta(history)
  const componentLabels: Record<string, string> = {
    policies: x(M.analytics_comp_policies),
    tasks: x(M.analytics_comp_tasks),
    findings: x(M.analytics_comp_findings),
  }
  const presentPcts = components.filter((c) => c.pct !== null).map((c) => c.pct!)
  const lowestPct = presentPcts.length >= 2 ? Math.min(...presentPcts) : null
  const breakdownRows = components
    .filter((c) => c.pct !== null)
    .map((c) => ({
      key: c.key,
      label: componentLabels[c.key] ?? c.key,
      pct: c.pct!,
      valueText: fill(x(M.analytics_comp_value), { done: c.done, total: c.total }),
      flagged: lowestPct !== null && c.pct === lowestPct,
    }))

  const attentionPool = [
    ...rowsOf(tasks.state)
      .filter((t) => !t.done && t.dueDate !== null)
      .map((t) => ({
        id: `task-${t.id}`,
        dueISO: t.dueDate!,
        title: t.title,
        secondary: x(M.analytics_attention_task_kind),
        href: '/app/planning/tasks',
      })),
    ...rowsOf(hrCases.state)
      .filter((c) => c.status !== 'resolved' && c.dueDate !== null)
      .map((c) => ({
        id: `case-${c.id}`,
        dueISO: c.dueDate!,
        title: c.title,
        secondary: attentionSecondary(c.province, undefined, x),
        href: `/app/cases/${c.id}`,
      })),
  ]
  const ranked = rankAttention(attentionPool, todayISO)
  const attentionRows: AttentionRow[] = ranked.slice(0, ATTENTION_CAP).map((r) => ({
    key: r.item.id,
    title: r.item.title,
    secondary: r.item.secondary,
    status: r.status,
    chipLabel: attentionChipLabel(r, x, locale),
    href: r.item.href,
  }))

  const activeEmployees = rowsOf(employees.state).filter((e) => e.status !== 'terminated')
  const headcountCounts = new Map<string, number>()
  for (const employee of activeEmployees) {
    headcountCounts.set(employee.province, (headcountCounts.get(employee.province) ?? 0) + 1)
  }
  const headcountRows = [...headcountCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([province, value]) => ({ key: province, label: province, value }))

  const openCases = rowsOf(hrCases.state).filter((c) => c.status !== 'resolved')
  const aging = caseAging(
    openCases.map((c) => ({ ...c, openedISO: c.createdAt.slice(0, 10) })),
    todayISO,
  )

  return (
    <div className="flex-1 overflow-y-auto px-[14px] pt-[18px] pb-[96px] sm:px-[32px] sm:pt-[26px] sm:pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-[14px] text-[13px] text-text-muted">{x(M.analytics_live_note)}</div>

        <div className="grid grid-cols-1 gap-[14px] min-[900px]:grid-cols-2 min-[900px]:gap-[16px]">
          {/* Compliance score */}
          <AnalyticsCard title={x(M.analytics_score_title)} className="min-[900px]:col-span-2">
            <CardData deps={[policies, tasks, findings, snapshots]} skeletonLines={4}>
              {() =>
                liveScore === null ? (
                  <CardEmpty text={x(M.analytics_score_empty)} />
                ) : (
                  <>
                    <ScoreHero score={liveScore} delta={scoreDeltaValue} />
                    {history.length >= 2 ? (
                      <div className="mt-[10px]">
                        <ScoreTrendChart history={history} />
                      </div>
                    ) : (
                      <p className="mt-[10px] mb-0 text-[12.5px] text-text-muted">
                        {x(M.analytics_score_first_point)}
                      </p>
                    )}
                    {breakdownRows.length > 0 && (
                      <div className="mt-[14px] border-t border-border-soft pt-[14px]">
                        <div className="mb-[10px] text-[11.5px] font-bold tracking-[0.04em] uppercase text-text-muted">
                          {x(M.analytics_score_breakdown_title)}
                        </div>
                        <ScoreBreakdownMeters rows={breakdownRows} />
                      </div>
                    )}
                  </>
                )
              }
            </CardData>
          </AnalyticsCard>

          {/* Needs attention */}
          <AnalyticsCard
            title={x(M.analytics_attention_title)}
            subtitle={x(M.analytics_attention_sub)}
          >
            <CardData deps={[tasks, hrCases]} skeletonLines={4}>
              {() =>
                attentionRows.length === 0 ? (
                  <CardEmpty text={x(M.analytics_attention_empty)} />
                ) : (
                  <AttentionList
                    rows={attentionRows}
                    viewAllHref="/app/planning/tasks"
                    viewAllLabel={fill(x(M.analytics_attention_view_all), { n: ranked.length })}
                  />
                )
              }
            </CardData>
          </AnalyticsCard>

          {/* Headcount by jurisdiction */}
          <AnalyticsCard
            title={x(M.analytics_headcount_title)}
            subtitle={
              activeEmployees.length > 0
                ? fill(x(M.analytics_headcount_total), { n: activeEmployees.length })
                : undefined
            }
          >
            <CardData deps={[employees]} skeletonLines={4}>
              {() =>
                headcountRows.length === 0 ? (
                  <CardEmpty text={x(M.analytics_headcount_empty)} />
                ) : (
                  <>
                    <JurisdictionBars rows={headcountRows} />
                    <p className="mt-[10px] mb-0 text-[11.5px] text-text-faint">
                      {x(M.analytics_headcount_footnote)}
                    </p>
                  </>
                )
              }
            </CardData>
          </AnalyticsCard>

          {/* Open cases */}
          <AnalyticsCard title={x(M.analytics_cases_title)}>
            <CardData deps={[hrCases]} skeletonLines={4}>
              {() =>
                aging === null ? (
                  <CardEmpty text={x(M.analytics_cases_empty)} />
                ) : (
                  <>
                    <div className="mb-[12px] flex gap-[10px]">
                      <StatTile
                        value={String(aging.openCount)}
                        label={x(M.analytics_cases_open_now)}
                      />
                      <StatTile
                        value={String(aging.avgDays)}
                        label={x(M.analytics_cases_avg_age)}
                      />
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
                        typeLabel: x(TYPE_LABEL[caseRow.caseType]),
                        jurisdiction: caseRow.province,
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
                )
              }
            </CardData>
          </AnalyticsCard>

          {/* Policy acknowledgments — no tracking data source in production
              yet; the card states that plainly instead of hiding. */}
          <AnalyticsCard title={x(M.analytics_ack_title)}>
            <CardEmpty text={x(M.analytics_ack_empty)} />
          </AnalyticsCard>
        </div>
      </div>
    </div>
  )
}
