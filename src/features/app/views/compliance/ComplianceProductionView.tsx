import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Shield, Trash2 } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { complianceMessages as M } from '@/i18n/messages/compliance'
import { statusChipClass } from '@/components/chips'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { ProductionEmptyState } from '@/features/app/workspaceMode/ProductionEmptyState'
import {
  PRODUCTION_FINDING_SEVERITIES,
  addFinding,
  listFindings,
  removeFinding,
  setFindingResolved,
} from './productionApi'
import type { ProductionFinding, ProductionFindingSeverity } from './productionApi'

/**
 * Compliance in production mode — a findings register on the backend's own
 * public.compliance_findings table (no new schema; the AI assessment
 * pipeline writes to the same table). Log / resolve / reopen / remove. The
 * demo view's posture scores, obligation register and watchlist return as
 * real assessment data accumulates.
 */

const SEVERITY_LABEL: Record<ProductionFindingSeverity, (typeof M)[keyof typeof M]> = {
  info: M.compliance_prod_sev_info,
  low: M.compliance_prod_sev_low,
  medium: M.compliance_prod_sev_medium,
  high: M.compliance_prod_sev_high,
  critical: M.compliance_prod_sev_critical,
}

const SEVERITY_TONE: Record<ProductionFindingSeverity, 'info' | 'neutral' | 'warning' | 'risk'> = {
  info: 'info',
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'risk',
}

const inputClass =
  'w-full rounded-[10px] border border-border bg-surface px-[12px] py-[9px] font-sans text-[13.5px] text-text'
const labelClass = 'mb-[4px] block text-[12px] font-semibold text-text-3'

const EMPTY_FORM = {
  title: '',
  severity: 'medium' as ProductionFindingSeverity,
  description: '',
  recommendation: '',
}

export function ComplianceProductionView() {
  const { x } = useI18n()
  const { showToast } = useToasts()
  const { organizationId } = useWorkspaceMode()

  const [rows, setRows] = useState<ProductionFinding[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!organizationId) return
    setLoadFailed(false)
    try {
      setRows(await listFindings(organizationId))
    } catch {
      setRows([])
      setLoadFailed(true)
    }
  }, [organizationId])

  useEffect(() => {
    void load()
  }, [load])

  if (!organizationId) {
    return <ProductionEmptyState title={x(M.compliance_prod_empty_title)} />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      const added = await addFinding(organizationId, { ...form, title: form.title.trim() })
      setRows((prev) => [added, ...(prev ?? [])])
      setForm(EMPTY_FORM)
      setFormOpen(false)
      showToast(M.compliance_prod_added, 'ok')
    } catch {
      showToast(M.compliance_prod_add_failed, 'info')
    } finally {
      setSaving(false)
    }
  }

  const onToggleResolved = async (finding: ProductionFinding) => {
    const resolved = !finding.resolved
    try {
      await setFindingResolved(finding.id, resolved)
      setRows((prev) =>
        (prev ?? []).map((r) =>
          r.id === finding.id ? { ...r, resolved, status: resolved ? 'resolved' : 'open' } : r,
        ),
      )
    } catch {
      showToast(M.compliance_prod_status_failed, 'info')
    }
  }

  const onRemove = async (finding: ProductionFinding) => {
    try {
      await removeFinding(finding.id)
      setRows((prev) => (prev ?? []).filter((r) => r.id !== finding.id))
      showToast(M.compliance_prod_removed, 'ok')
    } catch {
      showToast(M.compliance_prod_remove_failed, 'info')
    }
  }

  const openCount = rows?.filter((r) => !r.resolved).length ?? 0

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[16px]">
          <div className="text-[13px] text-text-muted">
            {rows === null
              ? x(M.compliance_prod_loading)
              : `${openCount} ${x(
                  openCount === 1 ? M.compliance_prod_count_open_one : M.compliance_prod_count_open,
                )}`}
          </div>
          {!formOpen && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="flex cursor-pointer items-center gap-[7px] rounded-[8px] border-none bg-navy px-[14px] py-[8px] font-sans text-[13px] font-semibold text-white"
            >
              <Plus size={14} strokeWidth={2} aria-hidden="true" />
              {x(M.compliance_prod_add)}
            </button>
          )}
        </div>

        {loadFailed && (
          <div className="mb-[14px] flex items-center justify-between gap-[12px] rounded-[11px] border border-risk-border bg-risk-bg px-[16px] py-[12px]">
            <span className="text-[13px] text-risk-fg">{x(M.compliance_prod_error)}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="cursor-pointer rounded-[8px] border-none bg-surface px-[12px] py-[6px] font-sans text-[12px] font-bold text-text"
            >
              {x(M.compliance_prod_retry)}
            </button>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mb-[18px] rounded-[12px] border border-border bg-surface px-[20px] py-[18px]"
          >
            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="finding-title" className={labelClass}>
                  {x(M.compliance_prod_title_label)}
                </label>
                <input
                  id="finding-title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="finding-severity" className={labelClass}>
                  {x(M.compliance_prod_severity)}
                </label>
                <select
                  id="finding-severity"
                  value={form.severity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      severity: e.target.value as ProductionFindingSeverity,
                    }))
                  }
                  className={inputClass}
                >
                  {PRODUCTION_FINDING_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {x(SEVERITY_LABEL[s])}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="finding-description" className={labelClass}>
                  {x(M.compliance_prod_description)}
                </label>
                <textarea
                  id="finding-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="finding-recommendation" className={labelClass}>
                  {x(M.compliance_prod_recommendation)}
                </label>
                <textarea
                  id="finding-recommendation"
                  rows={2}
                  value={form.recommendation}
                  onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-[16px] flex gap-[8px]">
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-[8px] border-none bg-navy px-[14px] py-[8px] font-sans text-[13px] font-semibold text-white disabled:opacity-60"
              >
                {x(M.compliance_prod_save)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false)
                  setForm(EMPTY_FORM)
                }}
                className="cursor-pointer rounded-[8px] border border-border bg-surface px-[14px] py-[8px] font-sans text-[13px] font-semibold text-text"
              >
                {x(M.compliance_prod_cancel)}
              </button>
            </div>
          </form>
        )}

        {rows !== null && rows.length === 0 && !loadFailed && !formOpen && (
          <div className="rounded-[12px] border border-border bg-surface px-[24px] py-[40px] text-center">
            <div className="mx-auto mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-inset">
              <Shield size={20} strokeWidth={1.7} className="text-text-muted" aria-hidden="true" />
            </div>
            <div className="mb-[6px] text-[15px] font-semibold text-text">
              {x(M.compliance_prod_empty_title)}
            </div>
            <p className="m-0 text-[13px] text-text-muted">{x(M.compliance_prod_empty_body)}</p>
          </div>
        )}

        {rows !== null && rows.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            {rows.map((finding) => (
              <div
                key={finding.id}
                className="rounded-[11px] border border-border bg-surface px-[16px] py-[13px]"
              >
                <div className="flex flex-wrap items-center gap-[10px]">
                  <span className={statusChipClass(SEVERITY_TONE[finding.severity])}>
                    {x(SEVERITY_LABEL[finding.severity])}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[13.5px] font-semibold ${
                      finding.resolved ? 'text-text-faint line-through' : 'text-text'
                    }`}
                  >
                    {finding.title}
                  </span>
                  {finding.resolved && (
                    <span className={statusChipClass('success')}>
                      {x(M.compliance_prod_resolved_chip)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void onToggleResolved(finding)}
                    className="cursor-pointer rounded-[8px] border border-border bg-surface px-[10px] py-[5px] font-sans text-[12px] font-semibold text-text"
                  >
                    {finding.resolved ? x(M.compliance_prod_reopen) : x(M.compliance_prod_resolve)}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRemove(finding)}
                    aria-label={`${x(M.compliance_prod_remove)} — ${finding.title}`}
                    className="cursor-pointer border-none bg-transparent p-[6px] text-text-muted hover:text-risk-fg"
                  >
                    <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                </div>
                {finding.description && (
                  <p className="m-0 mt-[8px] text-[12.5px] leading-[1.55] text-text-muted">
                    {finding.description}
                  </p>
                )}
                {finding.recommendation && (
                  <div className="mt-[8px] rounded-[9px] bg-inset px-[12px] py-[9px]">
                    <div className="mb-[2px] text-[10.5px] font-bold tracking-[0.04em] text-text-muted uppercase">
                      {x(M.compliance_prod_rec_label)}
                    </div>
                    <div className="text-[12.5px] leading-[1.55] text-text-2">
                      {finding.recommendation}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
