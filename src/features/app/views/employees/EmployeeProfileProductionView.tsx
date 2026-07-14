import { useCallback, useEffect, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { employeesMessages as M } from '@/i18n/messages/employees'
import { casesMessages as CM } from '@/i18n/messages/cases'
import { statusChipClass } from '@/components/chips'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { ProductionEmptyState } from '@/features/app/workspaceMode/ProductionEmptyState'
import { listCases } from '@/features/app/views/cases/productionApi'
import type { ProductionCase } from '@/features/app/views/cases/productionApi'
import {
  addEmployeeNote,
  getEmployee,
  listEmployeeNotes,
  updateEmployeeStatus,
} from './productionApi'
import type {
  ProductionEmployee,
  ProductionEmployeeNote,
  ProductionEmployeeStatus,
} from './productionApi'

/**
 * Employee profile in production mode — the real record for one
 * public.employees row: facts header with the status select, this
 * employee's open cases (hr_cases filtered by employee_id, linking to the
 * case detail), and the hr_employee_notes thread (migration 0010). The
 * demo profile's tabs (timeline, documents, compensation, …) return as
 * those flows gain real backends.
 */

const STATUS_LABEL: Record<ProductionEmployeeStatus, (typeof M)[keyof typeof M]> = {
  active: M.employees_prod_status_active,
  on_leave: M.employees_prod_status_on_leave,
  terminated: M.employees_prod_status_terminated,
}

const STATUS_TONE: Record<ProductionEmployeeStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  on_leave: 'warning',
  terminated: 'neutral',
}

const EMPLOYEE_STATUSES: readonly ProductionEmployeeStatus[] = ['active', 'on_leave', 'terminated']

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function EmployeeProfileProductionView() {
  const { x } = useI18n()
  const { employeeId } = useParams()
  const { showToast } = useToasts()
  const { organizationId } = useWorkspaceMode()

  const [employee, setEmployee] = useState<ProductionEmployee | null>(null)
  const [openCases, setOpenCases] = useState<ProductionCase[]>([])
  const [notes, setNotes] = useState<ProductionEmployeeNote[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'failed'>('loading')
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!organizationId || !employeeId) return
    setState('loading')
    try {
      const [loaded, loadedNotes, allCases] = await Promise.all([
        getEmployee(employeeId),
        listEmployeeNotes(employeeId),
        listCases(organizationId),
      ])
      if (!loaded) {
        setState('missing')
        return
      }
      setEmployee(loaded)
      setNotes(loadedNotes)
      setOpenCases(allCases.filter((c) => c.employeeId === employeeId && c.status !== 'resolved'))
      setState('ready')
    } catch {
      setState('failed')
    }
  }, [organizationId, employeeId])

  useEffect(() => {
    void load()
  }, [load])

  if (!organizationId) {
    return <ProductionEmptyState title={x(M.employees_prod_empty_title)} />
  }

  const onStatusChange = async (status: ProductionEmployeeStatus) => {
    if (!employee) return
    try {
      await updateEmployeeStatus(employee.id, status)
      setEmployee({ ...employee, status })
      showToast(M.employees_prod_status_updated, 'ok')
    } catch {
      showToast(M.employees_prod_status_update_failed, 'info')
    }
  }

  const onAddNote = async (e: SubmitEvent) => {
    e.preventDefault()
    if (!employee || !draft.trim() || saving) return
    setSaving(true)
    try {
      const added = await addEmployeeNote(organizationId, employee.id, draft.trim())
      setNotes((prev) => [...prev, added])
      setDraft('')
      showToast(M.employees_prod_note_added, 'ok')
    } catch {
      showToast(M.employees_prod_note_failed, 'info')
    } finally {
      setSaving(false)
    }
  }

  const facts: { label: (typeof M)[keyof typeof M]; value: string | null }[] = employee
    ? [
        { label: M.employees_prod_detail_title, value: employee.title },
        { label: M.employees_prod_detail_email, value: employee.email },
        { label: M.employees_prod_detail_province, value: employee.province },
        { label: M.employees_prod_detail_start, value: employee.startDate },
      ]
    : []

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[760px]">
        <Link
          to="/app/employees"
          className="mb-[16px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-text-muted hover:text-text"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
          {x(M.employees_prod_back)}
        </Link>

        {state === 'loading' && (
          <div className="text-[13px] text-text-muted">{x(M.employees_prod_loading)}</div>
        )}

        {state === 'missing' && (
          <div className="rounded-[12px] border border-border bg-surface px-[24px] py-[36px] text-center">
            <div className="text-[14.5px] font-semibold text-text">
              {x(M.employees_prod_not_found)}
            </div>
          </div>
        )}

        {state === 'failed' && (
          <div className="flex items-center justify-between gap-[12px] rounded-[11px] border border-risk-border bg-risk-bg px-[16px] py-[12px]">
            <span className="text-[13px] text-risk-fg">{x(M.employees_prod_detail_error)}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="cursor-pointer rounded-[8px] border-none bg-surface px-[12px] py-[6px] font-sans text-[12px] font-bold text-text"
            >
              {x(M.employees_prod_retry)}
            </button>
          </div>
        )}

        {state === 'ready' && employee && (
          <>
            {/* Facts header */}
            <div className="mb-[18px] rounded-[12px] border border-border bg-surface px-[20px] py-[18px]">
              <div className="mb-[14px] flex flex-wrap items-center gap-[12px]">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-[14px] font-bold text-accent">
                  {initialsOf(employee.name)}
                </div>
                <h1 className="m-0 min-w-0 flex-1 font-display text-[20px] font-semibold text-text">
                  {employee.name}
                </h1>
                <span className={statusChipClass(STATUS_TONE[employee.status])}>
                  {x(STATUS_LABEL[employee.status])}
                </span>
                <select
                  value={employee.status}
                  onChange={(e) => void onStatusChange(e.target.value as ProductionEmployeeStatus)}
                  aria-label={`${x(M.employees_prod_status_aria)} — ${employee.name}`}
                  className="cursor-pointer rounded-[8px] border border-border bg-surface px-[8px] py-[5px] font-sans text-[12px] text-text"
                >
                  {EMPLOYEE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {x(STATUS_LABEL[s])}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
                {facts
                  .filter((f) => f.value)
                  .map((f) => (
                    <div key={f.label.en}>
                      <div className="text-[11px] font-bold tracking-[0.04em] text-text-muted uppercase">
                        {x(f.label)}
                      </div>
                      <div className="mt-[2px] text-[13px] font-semibold text-text">{f.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Open cases for this employee */}
            <div className="mb-[10px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
              {x(M.employees_prod_cases_title)}
            </div>
            <div className="mb-[18px] overflow-hidden rounded-[12px] border border-border bg-surface">
              {openCases.length === 0 && (
                <div className="px-[18px] py-[14px] text-[13px] text-text-muted">
                  {x(M.employees_prod_cases_none)}
                </div>
              )}
              {openCases.map((caze) => (
                <Link
                  key={caze.id}
                  to={`/app/cases/${caze.id}`}
                  className="flex items-center gap-[12px] border-t border-inset px-[18px] py-[12px] first:border-t-0 hover:bg-inset"
                >
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-text">
                    {caze.title}
                  </span>
                  <span
                    className={statusChipClass(caze.status === 'in_review' ? 'warning' : 'info')}
                  >
                    {x(
                      caze.status === 'in_review'
                        ? CM.cases_prod_status_in_review
                        : CM.cases_prod_status_open,
                    )}
                  </span>
                </Link>
              ))}
            </div>

            {/* Notes thread */}
            <div className="mb-[10px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
              {x(M.employees_prod_notes_title)}
            </div>
            <div className="mb-[14px] overflow-hidden rounded-[12px] border border-border bg-surface">
              {notes.length === 0 && (
                <div className="px-[18px] py-[16px] text-[13px] text-text-muted">
                  {x(M.employees_prod_notes_empty)}
                </div>
              )}
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border-t border-inset px-[18px] py-[12px] first:border-t-0"
                >
                  <div className="text-[13px] leading-[1.55] whitespace-pre-wrap text-text">
                    {note.body}
                  </div>
                  <div className="mt-[4px] text-[11.5px] text-text-faint">
                    {note.createdAt.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>

            {/* Add note */}
            <form onSubmit={(e) => void onAddNote(e)} className="flex gap-[8px]">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={x(M.employees_prod_note_placeholder)}
                aria-label={x(M.employees_prod_note_placeholder)}
                className="min-w-0 flex-1 rounded-[10px] border border-border bg-surface px-[14px] py-[10px] font-sans text-[13.5px] text-text"
              />
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                className="cursor-pointer rounded-[10px] border-none bg-navy px-[16px] py-[10px] font-sans text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {x(M.employees_prod_note_add)}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
