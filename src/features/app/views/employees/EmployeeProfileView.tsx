import { useEffect, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FileText, Info, Lock, Shield, Sparkle } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import {
  cases,
  complianceItems,
  documentTemplatesByKey,
  employees,
  employeeDetails,
  leaveStatusLabels,
  leaveStatusTones,
  supportSignals,
} from '@/data'
import type { ComplianceItem, TimelineEvent, TimelineKind } from '@/data'
import { useRail } from '@/features/app/rail/railContext'
import { useDocStudio } from '@/features/app/docstudio/docStudioContext'
import {
  contextFromEmployee,
  useWorkspaceContext,
} from '@/features/app/workspaceContext/workspaceContextStore'
import type { AdvisorSearchNavState } from '@/features/app/search/searchCorpus'
import { employeesMessages as M } from '@/i18n/messages/employees'
import { dotToneClass, sourceChipClass, statusChipClass } from './chipStyles'
import type { ChipTone } from './chipStyles'
import { RiskFlagCard } from './RiskFlagCard'
import { useAskAdvisorAboutEmployee } from './useAskAdvisorAboutEmployee'

/**
 * Employee profile hub — the prototype's `isProfileView` markup (App
 * v2.dc.html, 1436–1622) + `buildProfileView()` (4202–4267): identity
 * header, eight tabs (three restricted), the auto-composed timeline, the
 * document shelf, leave & accommodation records, compensation, wellbeing
 * support signals, related compliance flags and linked cases.
 */

type ProfileTab =
  | 'overview'
  | 'timeline'
  | 'documents'
  | 'leave'
  | 'compensation'
  | 'wellbeing'
  | 'compliance'
  | 'cases'

const PROFILE_TABS: ReadonlyArray<{ key: ProfileTab; label: Bi; locked: boolean }> = [
  { key: 'overview', label: M.employees_tab_overview, locked: false },
  { key: 'timeline', label: M.employees_tab_timeline, locked: false },
  { key: 'documents', label: M.employees_tab_documents, locked: false },
  { key: 'leave', label: M.employees_tab_leave, locked: true },
  { key: 'compensation', label: M.employees_tab_compensation, locked: true },
  { key: 'wellbeing', label: M.employees_tab_wellbeing, locked: true },
  { key: 'compliance', label: M.employees_tab_compliance, locked: false },
  { key: 'cases', label: M.employees_tab_cases, locked: false },
]

/** Governing statute per jurisdiction (prototype `statuteMap`, 4214–4215). */
const STATUTES: Record<string, Bi> = {
  Ontario: M.employees_statute_on,
  Quebec: M.employees_statute_qc,
  'British Columbia': M.employees_statute_bc,
  Alberta: M.employees_statute_ab,
  Federal: M.employees_statute_fed,
}

/** Prototype `timelineKindMeta(kind)` (4111–4123). */
const TIMELINE_META: Record<TimelineKind, { source: Bi; tone: ChipTone }> = {
  hire: { source: M.employees_src_onboarding, tone: 'info' },
  review: { source: M.employees_src_performance, tone: 'info' },
  comp: { source: M.employees_src_compensation, tone: 'success' },
  case: { source: M.employees_src_case, tone: 'warning' },
  wellbeing: { source: M.employees_src_wellbeing, tone: 'warning' },
  doc: { source: M.employees_src_documents, tone: 'neutral' },
  comms: { source: M.employees_src_communications, tone: 'info' },
  ack: { source: M.employees_src_policy, tone: 'success' },
  compliance: { source: M.employees_src_compliance, tone: 'warning' },
}

/** Prototype `sensitiveCaseTypes()` — these case rows carry the lock badge. */
const SENSITIVE_CASE_TYPES: readonly string[] = [
  'Termination',
  'Discipline',
  'Harassment / workplace investigation',
  'Complaint',
  'Compensation review',
]

const money = (n: number) => '$' + n.toLocaleString('en-US')

const TAB_KEYS: readonly ProfileTab[] = PROFILE_TABS.map((t) => t.key)

/** Compensation/Wellbeing deep links navigate here with { tab } router state
    (prototype `openProfile(id)` + `setProfileTab(...)`). */
function readNavTab(state: unknown): ProfileTab | null {
  if (state !== null && typeof state === 'object' && 'tab' in state) {
    const value = (state as { tab?: unknown }).tab
    if (typeof value === 'string' && (TAB_KEYS as readonly string[]).includes(value)) {
      return value as ProfileTab
    }
  }
  return null
}

export function EmployeeProfileView() {
  const { employeeId } = useParams()
  const location = useLocation()
  const { x, lang } = useI18n()
  const navigate = useNavigate()
  const { openRail, closeRail } = useRail()
  const { openDocFromLibrary } = useDocStudio()
  const askAdvisor = useAskAdvisorAboutEmployee()
  const { setContext } = useWorkspaceContext()
  const [tab, setTab] = useState<ProfileTab>(() => readNavTab(location.state) ?? 'overview')

  /* Same component instance across profile navigations — re-apply the deep-linked
     tab (or reset) when the person or the incoming state changes. */
  useEffect(() => {
    setTab(readNavTab(location.state) ?? 'overview')
  }, [employeeId, location.state])

  /* Prototype `openProfile()` pins the person as the Advisor's workspace
     context ("Advisor is using · Working with …"). */
  useEffect(() => {
    const contextEmp = employees.find((e) => e.id === employeeId)
    if (contextEmp) setContext(contextFromEmployee(contextEmp))
  }, [employeeId, setContext])

  const emp = employees.find((e) => e.id === employeeId)
  const det = emp ? employeeDetails[emp.id] : undefined
  if (!emp || !det) return null

  const risk = emp.risk
  const riskChatId = risk?.chatId ?? null
  const statute = STATUTES[emp.province.en] ?? M.employees_statute_fallback
  const wbSignals = supportSignals.filter((sg) => sg.employeeId === emp.id)
  const empCases = cases.filter((c) => c.empId === emp.id)
  const firstName = emp.name.split(' ')[0] ?? emp.name
  const relatedCompliance = complianceItems.filter(
    (ci) => ci.title.en.includes(firstName) || ci.title.en.includes(emp.name),
  )
  const marketDelta = Math.round(((det.salary - det.market) / det.market) * 100)
  const marketDeltaLabel =
    (marketDelta >= 0 ? '+' : '') + marketDelta + x(M.employees_vs_market_suffix)

  /* FR typography puts a space before the colon in the header meta line. */
  const colon = lang === 'fr' ? ' : ' : ': '

  const recordRows: Array<{ k: string; v: string }> = [
    { k: x(M.employees_rr_location), v: `${x(emp.province)} · ${x(statute)}` },
    { k: x(M.employees_rr_type), v: x(M.employees_rr_type_value) },
    { k: x(M.employees_rr_department), v: x(emp.dept) },
    { k: x(M.employees_manager_label), v: det.manager },
    { k: x(M.employees_rr_start), v: `${det.startDate} · ${x(emp.tenure)}` },
    { k: x(M.employees_rr_band), v: det.band },
  ]

  const openAdvisorChat = (chatId: string) => {
    navigate('/app/advisor', { state: { chatId } satisfies AdvisorSearchNavState })
  }

  /* Prototype `composeTimeline(det)` — doc events open Document Studio, case
     events open the case record; everything else is inert. */
  const eventAction = (ev: TimelineEvent): (() => void) | null => {
    if (ev.docKey !== undefined) {
      const docKey = ev.docKey
      return () => openDocFromLibrary(docKey)
    }
    if (ev.caseId !== undefined) {
      const caseId = ev.caseId
      return () => navigate(`/app/cases/${caseId}`)
    }
    return null
  }
  const activateOnKey = (fn: () => void) => (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }

  /* Prototype `askAdvisorAboutRisk(item)` (3302–3304). */
  const resolveWithAdvisor = (item: ComplianceItem) => {
    openRail(item.title, {
      text: M.employees_risk_flag_intro,
      cards: [
        {
          tone: item.tone,
          title: item.title,
          body: item.detail,
          citations: item.citations.map((c) => ({ label: c.label })),
          actions: item.chatId
            ? [
                {
                  label: M.employees_open_full_case,
                  primary: true,
                  onClick: () => {
                    closeRail()
                    openAdvisorChat(item.chatId)
                  },
                },
              ]
            : [{ label: M.employees_draft_fix, primary: true, onClick: () => closeRail() }],
        },
      ],
    })
  }

  const goldBanner = (text: Bi, extraClass = '') => (
    <div
      className={`flex items-start gap-[8px] rounded-[10px] border border-gold-border bg-gold-bg px-[14px] py-[11px] ${extraClass}`}
    >
      <Lock
        size={14}
        strokeWidth={1.8}
        className="mt-[1px] shrink-0 text-gold-fg"
        aria-hidden="true"
      />
      <span className="text-[12.5px] leading-[1.55] font-semibold text-gold-fg">{x(text)}</span>
    </div>
  )

  const emptyState = (title: Bi, body: Bi) => (
    <div className="rounded-[12px] border border-border bg-surface px-[20px] py-[48px] text-center">
      <div className="mb-[4px] text-[14px] font-semibold text-text">{x(title)}</div>
      <div className="mx-auto max-w-[400px] text-[13px] text-text-muted">{x(body)}</div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[24px] pb-[60px]">
      <div className="mx-auto max-w-[920px]">
        <button
          type="button"
          onClick={() => navigate('/app/employees')}
          className="mb-[16px] flex cursor-pointer items-center gap-[6px] border-none bg-transparent p-0 font-sans text-[13px] font-semibold text-text-muted"
        >
          <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
          {x(M.employees_back_all_people)}
        </button>

        {/* Identity header */}
        <div className="mb-[6px] flex flex-wrap items-start gap-[16px]">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-navy text-[19px] font-bold text-[#F2D9A8]">
            {emp.initials}
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="font-display text-[23px] font-semibold text-text">{emp.name}</div>
            <div className="mt-[2px] text-[13.5px] text-text-3">
              {x(emp.role)} · {x(emp.dept)} · {x(emp.province)}
            </div>
            <div className="mt-[10px] flex flex-wrap items-center gap-[8px]">
              <span className={statusChipClass(emp.tone)}>{x(emp.status)}</span>
              <span className="text-[12px] text-text-muted">
                {x(emp.tenure)} · {x(M.employees_manager_label)}
                {colon}
                {det.manager} · {x(M.employees_since_label)} {det.startDate}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => askAdvisor(emp)}
            className="flex shrink-0 cursor-pointer items-center gap-[7px] rounded-[9px] border border-gold-border bg-gold-bg px-[15px] py-[9px] font-sans text-[13px] font-bold text-gold-fg"
          >
            <Sparkle size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {x(M.employees_ask_advisor)}
          </button>
        </div>

        {/* Tab strip */}
        <div className="mt-[18px] mb-[22px] flex gap-[2px] overflow-x-auto border-b border-border">
          {PROFILE_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`cursor-pointer border-0 border-b-2 bg-transparent px-[14px] py-[9px] font-sans text-[13px] font-semibold whitespace-nowrap ${
                tab === t.key ? 'border-b-navy text-text' : 'border-b-transparent text-text-muted'
              }`}
            >
              <span className="inline-flex items-center gap-[5px]">
                {x(t.label)}
                {t.locked && (
                  <Lock size={11} strokeWidth={2} className="opacity-70" aria-hidden="true" />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="flex flex-col gap-[14px]">
            <div className="rounded-[12px] border border-border bg-surface px-[18px] py-[16px] text-[14px] leading-[1.6] text-text-2">
              {x(emp.insight)}
            </div>
            <div className="rounded-[12px] border border-border bg-surface px-[18px] py-[8px]">
              {recordRows.map((rr, i) => (
                <div key={i} className="flex gap-[12px] border-b border-b-inset py-[10px]">
                  <span className="flex-[0_0_180px] text-[12.5px] font-semibold text-text-muted">
                    {rr.k}
                  </span>
                  <span className="text-[13px] leading-[1.5] text-text-2">{rr.v}</span>
                </div>
              ))}
            </div>
            {risk && (
              <RiskFlagCard
                tone={risk.tone}
                title={risk.title}
                body={risk.body}
                actions={
                  riskChatId
                    ? [
                        {
                          label: M.employees_open_full_case,
                          primary: true,
                          onClick: () => openAdvisorChat(riskChatId),
                        },
                      ]
                    : []
                }
              />
            )}
            <div className="flex flex-wrap gap-[12px]">
              <div className="min-w-[150px] flex-1 rounded-[12px] border border-border bg-surface p-[15px]">
                <div className="text-[12px] text-text-muted">{x(M.employees_base_salary)}</div>
                <div className="mt-[3px] font-display text-[20px] font-semibold text-text">
                  {money(det.salary)}
                </div>
              </div>
              <div className="min-w-[150px] flex-1 rounded-[12px] border border-border bg-surface p-[15px]">
                <div className="text-[12px] text-text-muted">{x(M.employees_support_signals)}</div>
                <div className="mt-[3px] font-display text-[20px] font-semibold text-text">
                  {wbSignals.length}
                </div>
              </div>
              <div className="min-w-[150px] flex-1 rounded-[12px] border border-border bg-surface p-[15px]">
                <div className="text-[12px] text-text-muted">{x(M.employees_open_cases)}</div>
                <div className="mt-[3px] font-display text-[20px] font-semibold text-text">
                  {empCases.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Timeline ─────────────────────────────────────────────────── */}
        {tab === 'timeline' && (
          <>
            <div className="mb-[12px] flex items-center gap-[7px] text-[12px] text-text-muted">
              <Sparkle
                size={14}
                fill="currentColor"
                strokeWidth={0}
                className="shrink-0 text-gold-dot"
                aria-hidden="true"
              />
              <span>{x(M.employees_timeline_auto_note)}</span>
            </div>
            {det.timeline.length > 0 ? (
              <div className="rounded-[12px] border border-border bg-surface px-[18px] py-[8px]">
                {det.timeline.map((ev, i) => {
                  const meta = TIMELINE_META[ev.kind]
                  const tone: ChipTone = ev.tone ?? meta.tone
                  const action = eventAction(ev)
                  return (
                    <div
                      key={i}
                      {...(action
                        ? {
                            role: 'button',
                            tabIndex: 0,
                            onClick: action,
                            onKeyDown: activateOnKey(action),
                          }
                        : {})}
                      className={`flex gap-[12px] border-b border-b-inset py-[14px] ${
                        action ? 'cursor-pointer hover:bg-inset' : 'cursor-default'
                      }`}
                    >
                      <div
                        className={`mt-[4px] h-[9px] w-[9px] shrink-0 rounded-full ${dotToneClass(tone)}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-[8px]">
                          <span className={sourceChipClass(tone)}>{x(meta.source)}</span>
                          <span className="text-[13.5px] leading-[1.5] text-text">
                            {x(ev.text)}
                          </span>
                        </div>
                        <div className="mt-[3px] text-[12px] text-text-muted">{ev.date}</div>
                      </div>
                      {action && (
                        <ChevronRight
                          size={15}
                          strokeWidth={2}
                          className="mt-[3px] shrink-0 text-text-faint"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              emptyState(M.employees_no_recorded_events, M.employees_timeline_empty_body)
            )}
          </>
        )}

        {/* ── Documents ────────────────────────────────────────────────── */}
        {tab === 'documents' && det.docs.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            {det.docs.map((docKey) => {
              const template = documentTemplatesByKey[docKey]
              return (
                <button
                  key={docKey}
                  type="button"
                  onClick={() => openDocFromLibrary(docKey)}
                  className="flex cursor-pointer items-center gap-[12px] rounded-[11px] border border-border bg-surface px-[16px] py-[13px] text-left font-sans"
                >
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] bg-inset">
                    <FileText
                      size={14}
                      strokeWidth={1.7}
                      className="text-text-muted"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[13.5px] font-semibold text-text">
                    {template ? x(template.title) : docKey}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Leave & accommodation ────────────────────────────────────── */}
        {tab === 'leave' && (
          <>
            {goldBanner(M.employees_leave_banner, 'mb-[14px]')}
            {det.leave.length > 0 ? (
              <div className="rounded-[12px] border border-border bg-surface px-[18px] py-[8px]">
                {det.leave.map((lr, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-[12px] border-b border-b-inset py-[13px]"
                  >
                    <div className="min-w-[180px] flex-1">
                      <div className="text-[13.5px] font-semibold text-text">{x(lr.type)}</div>
                      <div className="mt-[2px] text-[12px] text-text-muted">
                        {x(lr.period)} · {x(lr.note)}
                      </div>
                    </div>
                    <span className={statusChipClass(leaveStatusTones[lr.status])}>
                      {x(leaveStatusLabels[lr.status])}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              emptyState(M.employees_leave_empty_title, M.employees_leave_empty_body)
            )}
          </>
        )}

        {/* ── Compensation ─────────────────────────────────────────────── */}
        {tab === 'compensation' && (
          <div className="flex flex-col gap-[14px]">
            {goldBanner(M.employees_comp_banner)}
            <div className="flex flex-wrap gap-[12px]">
              <div className="min-w-[150px] flex-1 rounded-[12px] border border-border bg-surface p-[16px]">
                <div className="text-[12px] text-text-muted">{x(M.employees_base_salary)}</div>
                <div className="mt-[3px] font-display text-[22px] font-semibold text-text">
                  {money(det.salary)}
                </div>
                <div className="mt-[2px] text-[12px] text-text-muted">
                  {x(M.employees_band_label)} {det.band}
                </div>
              </div>
              <div className="min-w-[150px] flex-1 rounded-[12px] border border-border bg-surface p-[16px]">
                <div className="text-[12px] text-text-muted">{x(M.employees_market_midpoint)}</div>
                <div className="mt-[3px] font-display text-[22px] font-semibold text-text">
                  {money(det.market)}
                </div>
                <div className="mt-[6px]">
                  <span className={statusChipClass(marketDelta < -4 ? 'warning' : 'success')}>
                    {marketDeltaLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-[8px] rounded-[12px] border border-(--accent-soft-border) bg-accent-soft px-[16px] py-[14px]">
              <Info
                size={16}
                strokeWidth={1.7}
                className="mt-[1px] shrink-0 text-accent"
                aria-hidden="true"
              />
              <span className="text-[13px] leading-[1.55] text-text-2">
                {x(M.employees_pay_equity_note)}
              </span>
            </div>
          </div>
        )}

        {/* ── Wellbeing ────────────────────────────────────────────────── */}
        {tab === 'wellbeing' && (
          <>
            {goldBanner(M.employees_wellbeing_banner, 'mb-[14px]')}
            {wbSignals.length > 0 ? (
              <div className="flex flex-col gap-[12px]">
                {wbSignals.map((sg) => (
                  <div
                    key={sg.id}
                    className="rounded-[12px] border border-border bg-surface px-[18px] py-[16px]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-[12px]">
                      <div className="text-[14px] leading-[1.45] font-semibold text-text">
                        {x(sg.type)}
                      </div>
                      <span className={statusChipClass(sg.tone)}>{x(sg.sensitivity)}</span>
                    </div>
                    <div className="mt-[3px] text-[12px] text-text-muted">
                      {x(M.employees_wb_source)}: {x(sg.source)} · {x(M.employees_wb_confidence)}:{' '}
                      {x(sg.confidence)}
                    </div>
                    <div className="mt-[8px] text-[13px] leading-[1.55] text-text-3">
                      {x(sg.why)}
                    </div>
                    <div className="mt-[9px] flex flex-col gap-[4px] rounded-[9px] bg-inset px-[13px] py-[10px]">
                      <span className="text-[11px] font-bold tracking-[0.03em] text-gold-dot uppercase">
                        {x(M.employees_wb_action)}
                      </span>
                      <span className="text-[12.5px] leading-[1.5] text-text-2">
                        {x(sg.action)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              emptyState(M.employees_wb_empty_title, M.employees_wb_empty_body)
            )}
          </>
        )}

        {/* ── Compliance ───────────────────────────────────────────────── */}
        {tab === 'compliance' && relatedCompliance.length > 0 && (
          <div className="flex flex-col gap-[12px]">
            {relatedCompliance.map((it) => (
              <div
                key={it.id}
                className="flex flex-col gap-[8px] rounded-[12px] border border-border bg-surface px-[18px] py-[16px]"
              >
                <div className="flex items-center gap-[10px]">
                  <span className={statusChipClass(it.tone)}>{x(it.severityLabel)}</span>
                  <span className="text-[14px] font-semibold text-text">{x(it.title)}</span>
                </div>
                <div className="text-[13px] leading-[1.55] text-text-3">{x(it.detail)}</div>
                <button
                  type="button"
                  onClick={() => resolveWithAdvisor(it)}
                  className="cursor-pointer self-start rounded-[8px] border-none bg-accent-soft px-[13px] py-[7px] font-sans text-[12.5px] font-bold text-accent"
                >
                  {x(M.employees_resolve_with_advisor)}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Cases ────────────────────────────────────────────────────── */}
        {tab === 'cases' && empCases.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            {empCases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/app/cases/${c.id}`)}
                className="flex cursor-pointer items-center justify-between gap-[12px] rounded-[11px] border border-border bg-surface px-[16px] py-[14px] text-left font-sans"
              >
                <div>
                  <div className="text-[14px] font-semibold text-text">{x(c.title)}</div>
                  <div className="mt-[2px] text-[12px] text-text-muted">{x(c.typeLabel)}</div>
                </div>
                <div className="flex shrink-0 items-center gap-[10px]">
                  {SENSITIVE_CASE_TYPES.includes(c.type) && (
                    <span className="inline-flex items-center gap-[4px] text-[10.5px] font-bold tracking-[0.03em] text-gold-fg uppercase">
                      <Lock size={11} strokeWidth={2} aria-hidden="true" />
                      {x(M.employees_restricted)}
                    </span>
                  )}
                  <span className={statusChipClass(c.tone)}>{x(c.status)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Audit footnote */}
        <div className="mt-[22px] flex items-start gap-[7px] text-[11px] leading-[1.5] text-text-faint">
          <Shield size={12} strokeWidth={1.8} className="mt-[1px] shrink-0" aria-hidden="true" />
          <span>{x(M.employees_audit_foot)}</span>
        </div>
      </div>
    </div>
  )
}
