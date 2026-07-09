import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, FileText, Info, Sparkle } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { pickL } from '@/i18n/core'
import type { Bi, LText } from '@/i18n/core'
import {
  caseNotes as seededCaseNotes,
  caseRecommendationByType,
  caseRiskAxesByType,
  caseRiskByType,
  complianceItems,
  documentTemplatesByKey,
  employeeDetails,
  employees,
  tasks,
} from '@/data'
import type { ComplianceItem, Tone } from '@/data'
import { useRail } from '@/features/app/rail/railContext'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { useDocStudio } from '@/features/app/docstudio/docStudioContext'
import {
  contextFromEmployee,
  useWorkspaceContext,
} from '@/features/app/workspaceContext/workspaceContextStore'
import { cardToneStyles } from '@/features/app/advisor/toneStyles'
import type { ToneCardData } from '@/features/app/advisor/types'
import type { AdvisorSearchNavState } from '@/features/app/search/searchCorpus'
import { casesMessages as M } from '@/i18n/messages/cases'
import { statusChipClass } from '@/components/chips'
import {
  activityDotClass,
  barToneClass,
  findCase,
  isFixtureCaseType,
  pendingRecommendation,
  pendingRisk,
  pendingRiskAxes,
  riskLevelTone,
  timelineDotClass,
} from './caseModel'
import type { WorkspaceCase } from './caseModel'

/**
 * Case detail — port of the prototype's case workspace (markup 1791–1971,
 * `buildCaseDetail`): header with status chip + Ask Advisor, five tabs
 * (Overview / Risk review / Legal review / Activity log / Notes), the
 * overview two-column grid (summary, Advisor recommendation, risk
 * assessment, workflow, timeline · people, approvals, linked tasks,
 * documents, compliance flags), the six-axis risk review, the legal-review
 * record, the composed activity feed, and the private notes composer.
 */
export function CaseDetailView() {
  const { caseId } = useParams()
  const caze = caseId ? findCase(caseId) : undefined
  if (!caze) return <CaseNotFound />
  /* Key by case id so notes/tasks/approval state resets per case. */
  return <CaseDetail key={caze.id} caze={caze} />
}

type CaseTab = 'overview' | 'risk' | 'legal' | 'activity' | 'notes'

interface LocalNote {
  text: LText
  author: string
  time: LText
}

const cardClass = 'rounded-[12px] border border-border bg-surface'

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)

function CaseDetail({ caze }: { caze: WorkspaceCase }) {
  const { x, lang } = useI18n()
  const navigate = useNavigate()
  const { openRail, closeRail } = useRail()
  const { showToast } = useToasts()
  const { openDocFromLibrary } = useDocStudio()

  const [tab, setTab] = useState<CaseTab>('overview')
  const [approvalRequested, setApprovalRequested] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [notes, setNotes] = useState<LocalNote[]>(() =>
    (seededCaseNotes[caze.id] ?? []).map((n) => ({ text: n.text, author: n.author, time: n.time })),
  )

  const emp = caze.empId ? employees.find((e) => e.id === caze.empId) : undefined
  const det = emp ? employeeDetails[emp.id] : undefined

  /* Prototype: opening a case pins it as the Advisor's workspace context
     ("Advisor is using · On case …", logic 4281). The localized typeLabel is
     the topic chip — the prototype translates its raw c.type via tr(). */
  const { setContext } = useWorkspaceContext()
  useEffect(() => {
    if (emp) setContext(contextFromEmployee(emp, caze.typeLabel, 'case'))
  }, [emp, caze.typeLabel, setContext])
  const linkedTasks = tasks.filter((t) => t.chatId === caze.chatId)
  const [taskDone, setTaskDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(linkedTasks.map((t) => [t.id, t.done])),
  )
  const docs = det?.docs ?? []
  const timeline = det?.timeline ?? []
  const flags = complianceItems.filter((ci) => ci.chatId === caze.chatId)

  const risk = isFixtureCaseType(caze.type) ? caseRiskByType[caze.type] : pendingRisk
  const rec = isFixtureCaseType(caze.type)
    ? caseRecommendationByType[caze.type]
    : pendingRecommendation
  const axes = isFixtureCaseType(caze.type) ? caseRiskAxesByType[caze.type] : pendingRiskAxes
  const recTone = cardToneStyles[rec.tone]

  /* ── Approvals (prototype `caseApprovals` state + `requestApproval`) ────── */
  const approvalTarget =
    caze.type === 'Termination'
      ? M.cases_approval_target_counsel
      : M.cases_approval_target_people_ops
  const approvalStatus: Bi = approvalRequested
    ? {
        en: M.cases_approval_requested_prefix.en + approvalTarget.en,
        fr: M.cases_approval_requested_prefix.fr + approvalTarget.fr,
      }
    : caze.type === 'Termination'
      ? M.cases_approval_termination
      : caze.type === 'Onboarding'
        ? M.cases_approval_onboarding
        : M.cases_approval_default
  const canRequestApproval =
    !approvalRequested && caze.type !== 'Onboarding' && caze.type !== 'Termination'
  const requestApproval = () => {
    setApprovalRequested(true)
    showToast(M.cases_toast_approval, 'ok')
  }

  /* ── People involved ────────────────────────────────────────────────────── */
  const manager = det?.manager ?? 'Riley Summers'
  const people: { name: LText; role: LText; initials: string }[] = [
    {
      name: caze.empName,
      role: {
        en: M.cases_people_subject_prefix.en + caze.province.en,
        fr: M.cases_people_subject_prefix.fr + caze.province.fr,
      },
      initials: initialsOf(pickL(caze.empName, 'en')),
    },
    { name: manager, role: M.cases_people_manager, initials: initialsOf(manager) },
    { name: caze.owner, role: M.cases_people_owner, initials: initialsOf(caze.owner) },
  ]
  if (caze.type === 'Termination') {
    people.push({
      name: M.cases_people_partner_counsel,
      role: M.cases_people_counsel_role,
      initials: 'PC',
    })
  }

  /* ── Activity feed (prototype-composed) ─────────────────────────────────── */
  const openedText: Bi = {
    /* Prototype: 'Case opened and risk assessed as ' + level.toLowerCase() + ' severity'
       / 'Dossier ouvert et risque évalué comme gravité ' + level.toLowerCase(). */
    en: `Case opened and risk assessed as ${risk.levelLabel.en.toLowerCase()} severity`,
    fr: `Dossier ouvert et risque évalué comme gravité ${risk.levelLabel.fr.toLowerCase()}`,
  }
  const activity: { actor: string; text: LText; time: LText; tone?: Tone }[] = [
    { actor: 'Advisor', text: openedText, time: caze.opened, tone: risk.tone },
  ]
  caze.steps
    .filter((st) => st.done)
    .forEach((st, i) =>
      activity.push({
        actor: i === 0 ? 'Riley Summers' : 'Advisor',
        text: st.label,
        time: caze.opened,
        tone: 'success',
      }),
    )
  timeline
    .slice(0, 2)
    .forEach((t) => activity.push({ actor: 'System', text: t.text, time: t.date, tone: t.tone }))
  if (approvalRequested) {
    activity.unshift({
      actor: 'Riley Summers',
      text: M.cases_activity_requested,
      time: M.cases_just_now,
      tone: 'info',
    })
  }

  /* ── Advisor rail affordances ───────────────────────────────────────────── */
  const openChat = (chatId: string) =>
    navigate('/app/advisor', { state: { chatId } satisfies AdvisorSearchNavState })

  /* Prototype `askAdvisorAboutEmployee(emp)`. */
  const askAdvisor = () => {
    if (!emp) return
    const flag = emp.risk
    const flagChatId = flag?.chatId ?? null
    const cards: ToneCardData[] = flag
      ? [
          {
            tone: flag.tone,
            title: flag.title,
            body: flag.body,
            actions: flagChatId
              ? [
                  {
                    label: M.cases_open_full_case,
                    primary: true,
                    onClick: () => {
                      closeRail()
                      openChat(flagChatId)
                    },
                  },
                ]
              : [],
          },
        ]
      : []
    openRail(
      emp.name,
      { text: emp.insight, cards },
      { chips: [emp.province, emp.role, caze.typeLabel], initials: emp.initials },
    )
  }

  /* Prototype `askAdvisorAboutRisk(item)`. */
  const openFlag = (item: ComplianceItem) => {
    const chatId = item.chatId
    openRail(item.title, {
      text: M.cases_flag_intro,
      cards: [
        {
          tone: item.tone,
          title: item.title,
          body: item.detail,
          citations: item.citations.map((c) => ({ label: c.label })),
          actions: chatId
            ? [
                {
                  label: M.cases_open_full_case,
                  primary: true,
                  onClick: () => {
                    closeRail()
                    openChat(chatId)
                  },
                },
              ]
            : [{ label: M.cases_draft_fix, primary: true, onClick: () => closeRail() }],
        },
      ],
    })
  }

  /* ── Notes ──────────────────────────────────────────────────────────────── */
  const addNote = () => {
    const draft = noteDraft.trim()
    if (!draft) return
    setNotes((prev) => [...prev, { text: draft, author: 'Riley Summers', time: M.cases_just_now }])
    setNoteDraft('')
    showToast(M.cases_toast_note_added, 'ok')
  }

  /* ── Legal review record ────────────────────────────────────────────────── */
  const legalRows: { label: Bi; value: LText }[] = [
    {
      label: M.cases_legal_counsel,
      value:
        caze.type === 'Termination'
          ? M.cases_legal_counsel_termination
          : M.cases_legal_counsel_none,
    },
    { label: M.cases_legal_scope, value: caze.legalScope ?? '—' },
    { label: M.cases_legal_due, value: caze.due || '—' },
    { label: M.cases_legal_retention, value: caze.retention },
    {
      label: M.cases_legal_outcome,
      value:
        caze.status.en === 'Resolved' ? M.cases_legal_outcome_closed : M.cases_legal_outcome_open,
    },
  ]

  const tabs: { key: CaseTab; label: Bi }[] = [
    { key: 'overview', label: M.cases_tab_overview },
    { key: 'risk', label: M.cases_tab_risk },
    { key: 'legal', label: M.cases_tab_legal },
    { key: 'activity', label: M.cases_tab_activity },
    { key: 'notes', label: M.cases_tab_notes },
  ]

  const docTitle = (key: string): LText => documentTemplatesByKey[key]?.title ?? key

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[24px] pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <button
          type="button"
          onClick={() => navigate('/app/cases')}
          className="mb-[16px] flex cursor-pointer items-center gap-[6px] border-none bg-transparent p-0 font-sans text-[13px] font-semibold text-text-muted"
        >
          <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
          {x(M.cases_all_cases)}
        </button>

        {/* Header */}
        <div className="mb-[6px] flex flex-wrap items-start justify-between gap-[16px]">
          <div className="min-w-0">
            <div className="font-display text-[22px] font-semibold text-text">
              {pickL(caze.title, lang)}
            </div>
            <div className="mt-[3px] text-[13px] text-text-muted">
              {x(caze.typeLabel)} · {x(caze.province)} · {x(M.cases_owner)} {caze.owner} ·{' '}
              {x(M.cases_opened)} {caze.opened}
            </div>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-[8px]">
            <span className={statusChipClass(caze.tone)}>{x(caze.status)}</span>
            <button
              type="button"
              onClick={askAdvisor}
              className="flex cursor-pointer items-center gap-[7px] rounded-[9px] border border-gold-border bg-gold-bg px-[14px] py-[8px] font-sans text-[13px] font-bold text-gold-fg"
            >
              <Sparkle size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              {x(M.cases_ask_advisor)}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-[18px] mb-[20px] flex gap-[2px] overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 cursor-pointer border-b-2 bg-transparent px-[14px] py-[9px] font-sans text-[13px] font-semibold whitespace-nowrap ${
                tab === t.key ? 'border-navy text-text' : 'border-transparent text-text-muted'
              }`}
            >
              {x(t.label)}
            </button>
          ))}
        </div>

        {/* ── Overview ───────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 items-start gap-[16px] sm:grid-cols-[1.6fr_1fr]">
            <div className="flex min-w-0 flex-col gap-[14px]">
              <div
                className={`${cardClass} px-[18px] py-[16px] text-[14px] leading-[1.6] text-text-2`}
              >
                {x(caze.summary)}
              </div>

              {/* Advisor recommendation (prototype `prepCard(caseRecommendation)`) */}
              <div
                className={`flex flex-col gap-[8px] rounded-[12px] border px-[16px] py-[14px] ${recTone.card}`}
              >
                <div className="flex items-center gap-[8px]">
                  <div className={`h-[7px] w-[7px] shrink-0 rounded-full ${recTone.dot}`} />
                  <div className={`text-[13.5px] font-bold ${recTone.title}`}>{x(rec.title)}</div>
                </div>
                <div className="text-[13.5px] leading-[1.55] text-text-2">{x(rec.body)}</div>
              </div>

              {/* Risk assessment */}
              <div className={`${cardClass} px-[18px] py-[16px]`}>
                <div className="mb-[12px] flex items-center justify-between">
                  <span className="text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
                    {x(M.cases_risk_assessment)}
                  </span>
                  <span className={statusChipClass(risk.tone)}>{x(risk.levelLabel)}</span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  {risk.factors.map((f, i) => (
                    <div key={i} className="flex gap-[9px]">
                      <div
                        className={`mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full ${barToneClass(risk.tone)}`}
                      />
                      <span className="text-[13px] leading-[1.5] text-text-2">{x(f)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow */}
              <div className={`${cardClass} px-[18px] py-[16px]`}>
                <div className="mb-[12px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
                  {x(M.cases_workflow)}
                </div>
                <div className="flex flex-col gap-[11px]">
                  {caze.steps.map((st, i) => (
                    <div key={i} className="flex items-center gap-[10px]">
                      <div
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                          st.done ? 'bg-ok-fg' : 'border-[1.5px] border-border bg-surface'
                        }`}
                      >
                        {st.done && (
                          <Check
                            size={11}
                            strokeWidth={3}
                            className="text-white"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <span
                        className={`text-[13px] ${st.done ? 'text-text-2' : 'text-text-muted'}`}
                      >
                        {x(st.label)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              {timeline.length > 0 && (
                <div className={`${cardClass} px-[18px] py-[8px]`}>
                  <div className="pt-[12px] pb-[4px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
                    {x(M.cases_timeline)}
                  </div>
                  {timeline.map((ev, i) => (
                    <div key={i} className="flex gap-[12px] border-t border-inset py-[11px]">
                      <div
                        className={`mt-[4px] h-[9px] w-[9px] shrink-0 rounded-full ${timelineDotClass(ev.kind, ev.tone)}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] leading-[1.5] text-text">{x(ev.text)}</div>
                        <div className="mt-[2px] text-[11.5px] text-text-muted">{ev.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-[14px]">
              {/* People involved */}
              <div className={`${cardClass} px-[16px] py-[14px]`}>
                <div className="mb-[10px] text-[12px] font-bold text-text-2">
                  {x(M.cases_people_involved)}
                </div>
                <div className="flex flex-col gap-[10px]">
                  {people.map((p, i) => (
                    <div key={i} className="flex items-center gap-[9px]">
                      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10.5px] font-bold text-accent">
                        {p.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-text">
                          {pickL(p.name, lang)}
                        </div>
                        <div className="text-[11.5px] text-text-muted">{pickL(p.role, lang)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openChat(caze.chatId)}
                  className="mt-[12px] w-full cursor-pointer rounded-[8px] border-none bg-navy p-[9px] font-sans text-[12.5px] font-bold text-white"
                >
                  {x(M.cases_open_conversation)}
                </button>
              </div>

              {/* Approvals */}
              <div className={`${cardClass} px-[16px] py-[14px]`}>
                <div className="mb-[8px] text-[12px] font-bold text-text-2">
                  {x(M.cases_approvals)}
                </div>
                <div className="text-[12.5px] leading-[1.5] text-text-3">
                  {pickL(approvalStatus, lang)}
                </div>
                {canRequestApproval && (
                  <button
                    type="button"
                    onClick={requestApproval}
                    className="mt-[10px] w-full cursor-pointer rounded-[8px] border border-(--accent-soft-border) bg-accent-soft p-[8px] font-sans text-[12.5px] font-semibold text-accent"
                  >
                    {x(M.cases_request_approval)}
                  </button>
                )}
                {approvalRequested && (
                  <div className="mt-[10px] flex items-center gap-[7px] rounded-[8px] border border-ok-border bg-ok-bg px-[10px] py-[8px] text-[12px] font-semibold text-ok-fg">
                    <Check size={13} strokeWidth={2.2} aria-hidden="true" />
                    {x(M.cases_requested)}
                  </div>
                )}
              </div>

              {/* Linked tasks */}
              {linkedTasks.length > 0 && (
                <div className={`${cardClass} px-[16px] py-[14px]`}>
                  <div className="mb-[10px] text-[12px] font-bold text-text-2">
                    {x(M.cases_linked_tasks)}
                  </div>
                  <div className="flex flex-col gap-[9px]">
                    {linkedTasks.map((t) => {
                      const done = taskDone[t.id] ?? t.done
                      return (
                        <div key={t.id} className="flex items-center gap-[9px]">
                          <button
                            type="button"
                            aria-label={x(M.cases_toggle_task_aria)}
                            onClick={() =>
                              setTaskDone((prev) => ({ ...prev, [t.id]: !(prev[t.id] ?? t.done) }))
                            }
                            className={`relative flex h-[17px] w-[17px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] after:absolute after:-inset-[14px] after:content-[''] ${
                              done
                                ? 'border-none bg-ok-fg'
                                : 'border-[1.5px] border-border bg-surface'
                            }`}
                          >
                            {done && (
                              <Check
                                size={11}
                                strokeWidth={3}
                                className="text-white"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-[13px] ${done ? 'text-text-faint line-through' : 'text-text'}`}
                            >
                              {x(t.title)}
                            </div>
                            <div className="text-[11px] text-text-muted">{x(t.due)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Documents */}
              {docs.length > 0 && (
                <div className={`${cardClass} px-[16px] py-[14px]`}>
                  <div className="mb-[10px] text-[12px] font-bold text-text-2">
                    {x(M.cases_documents)}
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    {docs.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => openDocFromLibrary(key)}
                        className="flex cursor-pointer items-center gap-[9px] border-none bg-transparent p-0 text-left font-sans"
                      >
                        <FileText
                          size={14}
                          strokeWidth={1.7}
                          className="shrink-0 text-text-muted"
                          aria-hidden="true"
                        />
                        <span className="text-[13px] font-medium text-text">
                          {pickL(docTitle(key), lang)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance flags */}
              {flags.length > 0 && (
                <div className={`${cardClass} px-[16px] py-[14px]`}>
                  <div className="mb-[10px] text-[12px] font-bold text-text-2">
                    {x(M.cases_compliance_flags)}
                  </div>
                  <div className="flex flex-col gap-[9px]">
                    {flags.map((ci) => (
                      <button
                        key={ci.id}
                        type="button"
                        onClick={() => openFlag(ci)}
                        className="flex cursor-pointer items-start gap-[8px] border-none bg-transparent p-0 text-left font-sans"
                      >
                        <span className={statusChipClass(ci.tone)}>{x(ci.severityLabel)}</span>
                        <span className="text-[12.5px] leading-[1.4] text-text-2">
                          {x(ci.title)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Risk review ────────────────────────────────────────────────── */}
        {tab === 'risk' && (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[12px]">
              {axes.map((ra, i) => (
                <div key={i} className={`${cardClass} px-[17px] py-[15px]`}>
                  <div className="mb-[8px] flex items-center justify-between gap-[8px]">
                    <span className="text-[12.5px] font-bold text-text">{x(ra.axis)}</span>
                    <span className={statusChipClass(riskLevelTone(ra.level))}>
                      {x(ra.levelLabel)}
                    </span>
                  </div>
                  <div className="text-[13px] leading-[1.55] text-text-2">{x(ra.reason)}</div>
                  <div className="mt-[8px] border-t border-inset pt-[8px] text-[12.5px] leading-[1.5] text-text-3">
                    <span className="font-bold text-text-muted">{x(M.cases_mitigation)} · </span>
                    {x(ra.mitigation)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[16px] text-[11px] text-text-faint">
              {x(M.cases_disclaimer_short)}
            </div>
          </>
        )}

        {/* ── Legal review ───────────────────────────────────────────────── */}
        {tab === 'legal' && (
          <div className="flex max-w-[640px] flex-col gap-[14px]">
            <div className={`${cardClass} px-[18px] py-[16px]`}>
              <div className="mb-[8px] text-[12px] font-bold tracking-[0.04em] text-text-muted uppercase">
                {x(M.cases_legal_status)}
              </div>
              <div className="text-[13.5px] leading-[1.55] text-text-2">
                {pickL(approvalStatus, lang)}
              </div>
              {canRequestApproval && (
                <button
                  type="button"
                  onClick={requestApproval}
                  className="mt-[12px] cursor-pointer rounded-[8px] border-none bg-navy px-[15px] py-[9px] font-sans text-[12.5px] font-bold text-white"
                >
                  {x(M.cases_legal_request)} →
                </button>
              )}
            </div>
            <div className={`${cardClass} px-[18px] py-[8px]`}>
              {legalRows.map((row, i) => (
                <div
                  key={i}
                  className={`flex gap-[12px] border-t py-[11px] ${
                    i === 0 ? 'border-transparent' : 'border-inset'
                  }`}
                >
                  <span className="w-[160px] shrink-0 text-[12.5px] font-semibold text-text-muted">
                    {x(row.label)}
                  </span>
                  <span className="text-[13px] text-text-2">{pickL(row.value, lang)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-[8px] text-[11.5px] leading-[1.5] text-text-muted">
              <Info size={14} strokeWidth={1.7} className="mt-[1px] shrink-0" aria-hidden="true" />
              <span>{x(M.cases_disclaimer_full)}</span>
            </div>
          </div>
        )}

        {/* ── Activity log ───────────────────────────────────────────────── */}
        {tab === 'activity' && (
          <div className={`${cardClass} max-w-[640px] px-[18px] py-[8px]`}>
            {activity.map((a, i) => (
              <div key={i} className="flex gap-[12px] border-t border-inset py-[13px]">
                <div
                  className={`mt-[5px] h-[8px] w-[8px] shrink-0 rounded-full ${activityDotClass(a.tone)}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-[1.5] text-text">{pickL(a.text, lang)}</div>
                  <div className="mt-[2px] text-[11.5px] text-text-muted">
                    {a.actor} · {pickL(a.time, lang)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Notes ──────────────────────────────────────────────────────── */}
        {tab === 'notes' && (
          <div className="max-w-[640px]">
            <div className="mb-[16px] flex items-end gap-[10px] rounded-[12px] border border-border bg-surface py-[8px] pr-[8px] pl-[14px]">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    addNote()
                  }
                }}
                placeholder={x(M.cases_note_placeholder)}
                rows={1}
                className="max-h-[120px] flex-1 resize-none border-none bg-transparent py-[7px] font-sans text-[13.5px] leading-[1.5] text-text outline-none"
              />
              <button
                type="button"
                onClick={addNote}
                className="shrink-0 cursor-pointer rounded-[8px] border-none bg-navy px-[15px] py-[9px] font-sans text-[12.5px] font-bold text-white"
              >
                {x(M.cases_note_add)}
              </button>
            </div>
            {notes.length > 0 && (
              <div className="flex flex-col gap-[10px]">
                {notes.map((n, i) => (
                  <div
                    key={i}
                    className="rounded-[11px] border border-border bg-surface px-[16px] py-[13px]"
                  >
                    <div className="text-[13.5px] leading-[1.55] text-text-2">
                      {pickL(n.text, lang)}
                    </div>
                    <div className="mt-[6px] text-[11.5px] text-text-muted">
                      {n.author} · {pickL(n.time, lang)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Gentle empty state for an unknown case id, with a route back to the list. */
function CaseNotFound() {
  const { x } = useI18n()
  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[24px] pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <Link
          to="/app/cases"
          className="mb-[16px] flex w-fit items-center gap-[6px] text-[13px] font-semibold text-text-muted no-underline"
        >
          <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
          {x(M.cases_all_cases)}
        </Link>
        <div className="mx-auto mt-[48px] max-w-[420px] rounded-[12px] border border-border bg-surface px-[24px] py-[28px] text-center">
          <div className="font-display text-[17px] font-semibold text-text">
            {x(M.cases_not_found_title)}
          </div>
          <div className="mt-[8px] text-[13px] leading-[1.55] text-text-3">
            {x(M.cases_not_found_body)}
          </div>
          <Link
            to="/app/cases"
            className="mt-[16px] inline-block rounded-[9px] bg-navy px-[16px] py-[9px] text-[12.5px] font-bold text-white no-underline"
          >
            {x(M.cases_all_cases)}
          </Link>
        </div>
      </div>
    </div>
  )
}
