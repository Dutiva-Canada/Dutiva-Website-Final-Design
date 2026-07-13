import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import { Disclaimer } from '@/components/Disclaimer'
import { homeMessages as M } from '@/i18n/messages/home'
import { ChatComposer } from '@/features/app/advisor/ChatComposer'
import { statusChipClass } from '@/components/chips'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { listEmployees } from '@/features/app/views/employees/productionApi'
import { listCases } from '@/features/app/views/cases/productionApi'
import type { ProductionCase } from '@/features/app/views/cases/productionApi'
import { listTasks } from '@/features/app/views/tasks/productionApi'
import type { ProductionTask } from '@/features/app/views/tasks/productionApi'
import { listFindings } from '@/features/app/views/compliance/productionApi'
import { listPolicies } from '@/features/app/views/policies/productionApi'
import { HomeProductionEmptyState } from './HomeProductionEmptyState'

/**
 * Home in production mode — the real command centre. A brand-new workspace
 * keeps the "Your workspace is ready" welcome (HomeProductionEmptyState);
 * once records exist this renders live stat tiles that deep-link to their
 * modules, a due-soon list drawn from real cases and tasks (overdue
 * flagged), and a policy-attention row. Everything loads through the
 * modules' own productionApi boundaries, like Reports.
 */

interface HomeData {
  employees: number
  cases: ProductionCase[]
  tasks: ProductionTask[]
  openFindings: number
  policiesNeedingAttention: number
}

interface DueItem {
  key: string
  kind: Bi
  title: string
  dueDate: string
  to: string
  overdue: boolean
}

/** Today as YYYY-MM-DD — due dates are date-only strings, comparable lexically. */
const today = (): string => new Date().toISOString().slice(0, 10)

export function HomeProductionView({ onSend }: { readonly onSend: (text: string) => void }) {
  const { x } = useI18n()
  const { identity, organizationId } = useWorkspaceMode()

  const [data, setData] = useState<HomeData | null>(null)
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
      setData({
        employees: employees.length,
        cases,
        tasks,
        openFindings: findings.filter((f) => !f.resolved).length,
        policiesNeedingAttention: policies.filter((p) => p.status !== 'up_to_date').length,
      })
    } catch {
      setData(null)
      setLoadFailed(true)
    }
  }, [organizationId])

  useEffect(() => {
    void load()
  }, [load])

  /* No org yet (bootstrap pending/failed) or still loading — the welcome
     state stays useful and never flashes an error at the front door. */
  if (!organizationId || (data === null && !loadFailed)) {
    return <HomeProductionEmptyState identity={identity} onSend={onSend} />
  }

  if (loadFailed) {
    return (
      <div className="flex-1 overflow-y-auto px-[14px] pt-[18px] pb-[96px] sm:px-[32px] sm:pt-[26px] sm:pb-[60px]">
        <div className="mx-auto max-w-[640px] pt-[48px]">
          <div className="mb-[24px] flex items-center justify-between gap-[12px] rounded-[11px] border border-risk-border bg-risk-bg px-[16px] py-[12px]">
            <span className="text-[13px] text-risk-fg">{x(M.home_prod_error)}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="cursor-pointer rounded-[8px] border-none bg-surface px-[12px] py-[6px] font-sans text-[12px] font-bold text-text"
            >
              {x(M.home_prod_retry)}
            </button>
          </div>
          <ChatComposer
            variant="chat"
            placeholder={x(M.home_composer_placeholder)}
            onSend={onSend}
          />
          <Disclaimer className="mt-[8px] text-center" />
        </div>
      </div>
    )
  }

  /* Unreachable (loadFailed and data===null are mutually exclusive above),
     but TypeScript can't correlate the two guards. */
  if (data === null) {
    return <HomeProductionEmptyState identity={identity} onSend={onSend} />
  }

  const totalRecords =
    data.employees +
    data.cases.length +
    data.tasks.length +
    data.openFindings +
    data.policiesNeedingAttention
  if (totalRecords === 0) {
    return <HomeProductionEmptyState identity={identity} onSend={onSend} />
  }

  const openCases = data.cases.filter((c) => c.status !== 'resolved')
  const openTasks = data.tasks.filter((t) => !t.done)

  const stats: { value: number; label: Bi; to: string }[] = [
    { value: data.employees, label: M.home_prod_stat_employees, to: '/app/employees' },
    { value: openCases.length, label: M.home_prod_stat_open_cases, to: '/app/cases' },
    { value: openTasks.length, label: M.home_prod_stat_open_tasks, to: '/app/tasks' },
    { value: data.openFindings, label: M.home_prod_stat_open_findings, to: '/app/compliance' },
  ]

  const now = today()
  const dueItems: DueItem[] = [
    ...openCases
      .filter((c) => c.dueDate !== null)
      .map((c) => ({
        key: `case-${c.id}`,
        kind: M.home_prod_kind_case,
        title: c.title,
        dueDate: c.dueDate ?? '',
        to: '/app/cases',
        overdue: (c.dueDate ?? '') < now,
      })),
    ...openTasks
      .filter((t) => t.dueDate !== null)
      .map((t) => ({
        key: `task-${t.id}`,
        kind: M.home_prod_kind_task,
        title: t.title,
        dueDate: t.dueDate ?? '',
        to: '/app/tasks',
        overdue: (t.dueDate ?? '') < now,
      })),
  ]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)

  return (
    <div className="flex-1 overflow-y-auto px-[14px] pt-[18px] pb-[96px] sm:px-[32px] sm:pt-[26px] sm:pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        {/* Header */}
        <div className="mb-[18px]">
          <div className="mb-[6px] text-[10.5px] font-bold tracking-[0.09em] text-gold-dot uppercase">
            {identity.companyName}
          </div>
          <h1 className="m-0 mb-[4px] font-display text-[23px] font-semibold text-text">
            {x(M.home_prod_greeting)}
          </h1>
          <p className="m-0 text-[13.5px] text-text-muted">{x(M.home_prod_sub)}</p>
        </div>

        {/* Stat tiles → modules */}
        <div className="mb-[20px] flex flex-wrap gap-[14px]">
          {stats.map((stat) => (
            <Link
              key={stat.label.en}
              to={stat.to}
              className="min-w-[140px] flex-1 rounded-[12px] border border-border bg-surface p-[16px] transition-[border-color,transform] duration-150 hover:-translate-y-[1px] hover:border-(--accent-soft-border)"
            >
              <div className="font-display text-[28px] font-bold text-text">{stat.value}</div>
              <div className="mt-[2px] text-[12.5px] text-text-muted">{x(stat.label)}</div>
            </Link>
          ))}
        </div>

        {/* Due soon */}
        <div className="mb-[20px]">
          <div className="mb-[10px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
            {x(M.home_prod_due_title)}
          </div>
          <div className="overflow-hidden rounded-[12px] border border-border bg-surface">
            {dueItems.length === 0 && (
              <div className="px-[18px] py-[16px] text-[13px] text-text-muted">
                {x(M.home_prod_due_none)}
              </div>
            )}
            {dueItems.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="flex items-center gap-[12px] border-t border-inset px-[18px] py-[12px] first:border-t-0 hover:bg-inset"
              >
                <span className={statusChipClass(item.overdue ? 'risk' : 'info')}>
                  {item.overdue ? x(M.home_prod_overdue) : x(item.kind)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-text">
                  {item.title}
                </span>
                <span className="shrink-0 text-[12px] text-text-muted">{item.dueDate}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Policy attention */}
        {data.policiesNeedingAttention > 0 && (
          <Link
            to="/app/policies"
            className="mb-[20px] flex items-center gap-[12px] rounded-[12px] border border-gold-border bg-gold-bg px-[16px] py-[13px] hover:opacity-90"
          >
            <BookOpen
              size={16}
              strokeWidth={1.7}
              className="shrink-0 text-gold-fg"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 text-[13px] font-semibold text-gold-fg">
              {data.policiesNeedingAttention}{' '}
              {x(
                data.policiesNeedingAttention === 1
                  ? M.home_prod_policy_attention_one
                  : M.home_prod_policy_attention_many,
              )}
            </span>
            <span className="shrink-0 text-[12.5px] font-bold text-gold-fg">
              {x(M.home_prod_policy_open)}
            </span>
          </Link>
        )}

        {/* Composer */}
        <div className="mx-auto mt-[26px] max-w-[760px]">
          <div className="rounded-[14px] shadow-[0_10px_30px_-16px_rgba(27,36,48,0.18)]">
            <ChatComposer
              variant="chat"
              placeholder={x(M.home_composer_placeholder)}
              onSend={onSend}
            />
          </div>
          <Disclaimer className="mt-[8px] text-center" />
        </div>
      </div>
    </div>
  )
}
