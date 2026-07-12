import { useCallback, useEffect, useState } from 'react'
import { ChartNoAxesColumn } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import { reportsMessages as M } from '@/i18n/messages/reports'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { ProductionEmptyState } from '@/features/app/workspaceMode/ProductionEmptyState'
import { listEmployees } from '@/features/app/views/employees/productionApi'
import type { ProductionEmployee } from '@/features/app/views/employees/productionApi'
import { listCases } from '@/features/app/views/cases/productionApi'
import type { ProductionCase } from '@/features/app/views/cases/productionApi'
import { listTasks } from '@/features/app/views/tasks/productionApi'
import type { ProductionTask } from '@/features/app/views/tasks/productionApi'
import { listFindings } from '@/features/app/views/compliance/productionApi'
import type { ProductionFinding } from '@/features/app/views/compliance/productionApi'
import { listPolicies } from '@/features/app/views/policies/productionApi'
import type { ProductionPolicy } from '@/features/app/views/policies/productionApi'

/**
 * Reports in production mode — no table of its own: every number is
 * aggregated live from the modules already on real persistence
 * (employees, hr_cases, compliance_tasks, compliance_findings,
 * hr_policies). Stat cards, the demo's headcount-by-province bars over
 * real employees, cases-by-status, and policy posture. Richer trends
 * (like the demo's score line) arrive once history accumulates.
 */

interface ReportData {
  employees: ProductionEmployee[]
  cases: ProductionCase[]
  tasks: ProductionTask[]
  findings: ProductionFinding[]
  policies: ProductionPolicy[]
}

function countBy<T>(rows: readonly T[], key: (row: T) => string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const k = key(row)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return counts
}

function BreakdownRow({
  label,
  value,
  max,
  barClass,
}: {
  readonly label: string
  readonly value: number
  readonly max: number
  readonly barClass: string
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <span className="w-[92px] shrink-0 text-[12px] text-text-muted">{label}</span>
      <div className="h-[8px] min-w-0 flex-1 overflow-hidden rounded-[100px] bg-inset">
        <div
          className={`h-full rounded-[100px] ${barClass}`}
          style={{ width: max > 0 ? `${Math.round((value / max) * 100)}%` : '0%' }}
        />
      </div>
      <span className="w-[28px] shrink-0 text-right text-[12.5px] font-semibold text-text">
        {value}
      </span>
    </div>
  )
}

export function ReportsProductionView() {
  const { x } = useI18n()
  const { organizationId } = useWorkspaceMode()

  const [data, setData] = useState<ReportData | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  const load = useCallback(async () => {
    if (!organizationId) return
    setLoadFailed(false)
    try {
      const [employees, cases, tasks, findings, policies] = await Promise.all([
        listEmployees(organizationId),
        listCases(organizationId),
        listTasks(organizationId),
        listFindings(organizationId),
        listPolicies(organizationId),
      ])
      setData({ employees, cases, tasks, findings, policies })
    } catch {
      setData(null)
      setLoadFailed(true)
    }
  }, [organizationId])

  useEffect(() => {
    void load()
  }, [load])

  if (!organizationId) {
    return <ProductionEmptyState title={x(M.reports_prod_empty_title)} />
  }

  if (loadFailed) {
    return (
      <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center justify-between gap-[12px] rounded-[11px] border border-risk-border bg-risk-bg px-[16px] py-[12px]">
            <span className="text-[13px] text-risk-fg">{x(M.reports_prod_error)}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="cursor-pointer rounded-[8px] border-none bg-surface px-[12px] py-[6px] font-sans text-[12px] font-bold text-text"
            >
              {x(M.reports_prod_retry)}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
        <div className="mx-auto max-w-[900px] text-[13px] text-text-muted">
          {x(M.reports_prod_loading)}
        </div>
      </div>
    )
  }

  const { employees, cases, tasks, findings, policies } = data
  const hasAnyData =
    employees.length + cases.length + tasks.length + findings.length + policies.length > 0

  if (!hasAnyData) {
    return (
      <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
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
              {x(M.reports_prod_empty_title)}
            </div>
            <p className="m-0 text-[13px] text-text-muted">{x(M.reports_prod_empty_body)}</p>
          </div>
        </div>
      </div>
    )
  }

  const openCases = cases.filter((c) => c.status !== 'resolved').length
  const openTasks = tasks.filter((t) => !t.done).length
  const openFindings = findings.filter((f) => !f.resolved).length

  const stats: { value: number; label: Bi }[] = [
    { value: employees.length, label: M.reports_prod_stat_employees },
    { value: openCases, label: M.reports_prod_stat_open_cases },
    { value: openTasks, label: M.reports_prod_stat_open_tasks },
    { value: openFindings, label: M.reports_prod_stat_open_findings },
  ]

  const headcount = [...countBy(employees, (e) => e.province).entries()].sort((a, b) => b[1] - a[1])
  const maxHeadcount = headcount[0]?.[1] ?? 0

  const caseCounts = countBy(cases, (c) => c.status)
  const caseRows: { label: Bi; value: number; barClass: string }[] = [
    { label: M.reports_prod_cases_open, value: caseCounts.get('open') ?? 0, barClass: 'bg-navy' },
    {
      label: M.reports_prod_cases_in_review,
      value: caseCounts.get('in_review') ?? 0,
      barClass: 'bg-gold-dot',
    },
    {
      label: M.reports_prod_cases_resolved,
      value: caseCounts.get('resolved') ?? 0,
      barClass: 'bg-ok-fg',
    },
  ]
  const maxCase = Math.max(...caseRows.map((r) => r.value))

  const policyCounts = countBy(policies, (p) => p.status)
  const policyRows: { label: Bi; value: number; barClass: string }[] = [
    {
      label: M.reports_prod_policies_up_to_date,
      value: policyCounts.get('up_to_date') ?? 0,
      barClass: 'bg-ok-fg',
    },
    {
      label: M.reports_prod_policies_needs_review,
      value: policyCounts.get('needs_review') ?? 0,
      barClass: 'bg-gold-dot',
    },
    {
      label: M.reports_prod_policies_missing,
      value: policyCounts.get('missing') ?? 0,
      barClass: 'bg-risk-dot',
    },
  ]
  const maxPolicy = Math.max(...policyRows.map((r) => r.value))

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-[18px] text-[13px] text-text-muted">{x(M.reports_prod_live_note)}</div>

        {/* Stat cards */}
        <div className="mb-[20px] flex flex-wrap gap-[14px]">
          {stats.map((stat) => (
            <div
              key={stat.label.en}
              className="min-w-[140px] flex-1 rounded-[12px] border border-border bg-surface p-[16px]"
            >
              <div className="font-display text-[28px] font-bold text-text">{stat.value}</div>
              <div className="mt-[2px] text-[12.5px] text-text-muted">{x(stat.label)}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-[16px]">
          {/* Headcount by province — real employees */}
          {employees.length > 0 && (
            <div className="min-w-[280px] flex-1 rounded-[12px] border border-border bg-surface p-[20px]">
              <div className="mb-[4px] text-[13px] font-bold text-text-2">
                {x(M.reports_prod_headcount_title)}
              </div>
              <div className="mb-[16px] text-[12px] text-text-muted">
                {employees.length} {x(M.reports_prod_total_suffix)}
              </div>
              <div className="flex flex-col gap-[8px]">
                {headcount.map(([province, value]) => (
                  <BreakdownRow
                    key={province}
                    label={province}
                    value={value}
                    max={maxHeadcount}
                    barClass="bg-navy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cases by status */}
          {cases.length > 0 && (
            <div className="min-w-[280px] flex-1 rounded-[12px] border border-border bg-surface p-[20px]">
              <div className="mb-[16px] text-[13px] font-bold text-text-2">
                {x(M.reports_prod_cases_title)}
              </div>
              <div className="flex flex-col gap-[8px]">
                {caseRows.map((row) => (
                  <BreakdownRow
                    key={row.label.en}
                    label={x(row.label)}
                    value={row.value}
                    max={maxCase}
                    barClass={row.barClass}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Policy posture */}
          {policies.length > 0 && (
            <div className="min-w-[280px] flex-1 rounded-[12px] border border-border bg-surface p-[20px]">
              <div className="mb-[16px] text-[13px] font-bold text-text-2">
                {x(M.reports_prod_policies_title)}
              </div>
              <div className="flex flex-col gap-[8px]">
                {policyRows.map((row) => (
                  <BreakdownRow
                    key={row.label.en}
                    label={x(row.label)}
                    value={row.value}
                    max={maxPolicy}
                    barClass={row.barClass}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
