import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import { doclibMessages } from '@/i18n/messages/doclib'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { useDoclib } from '../doclibContext'
import { applicability, can, computedTokens, fillProgress, resolveBlocks } from '../engine'
import type { ApplicabilityKind } from '../engine'
import {
  ActBtn,
  DocChip,
  DocPaper,
  JurisdictionPill,
  SegButton,
  Skel,
  StepDots,
} from '../components'
import { jurisdictionInfo, reviewStatusInfo, riskLevelInfo, sizeTiers } from '../data'
import type {
  DocCase,
  DocChipTone,
  DocEmployee,
  DocTemplate,
  Jurisdiction,
  TemplateQuestion,
} from '../data'

const STUDIO_PATH = '/app/documents/studio'
const REPOSITORY_PATH = '/app/documents'

/* Simulated autosave cadence (prototype timing): change → unsaved,
   +800ms → saving, +650ms → saved. */
const SAVE_DEBOUNCE_MS = 800
const SAVE_SETTLE_MS = 650

type SaveState = 'unsaved' | 'saving' | 'saved'

interface WizardState {
  step: 0 | 1 | 2
  employeeId?: string
  caseId?: string
  jurisdiction: Jurisdiction
  language: 'en' | 'fr'
  answers: Record<string, string>
  saveState: SaveState
}

const APPLIC_TONE: Record<ApplicabilityKind, DocChipTone> = {
  required: 'gold',
  applies: 'ok',
  below: 'neutral',
  union: 'info',
}

const inputClass =
  'w-full rounded-[10px] border border-border bg-surface px-[12px] py-[9px] text-[13px] text-text placeholder:text-text-faint'

const cardClass =
  'rounded-[12px] border border-border bg-surface p-[18px] shadow-sm max-[640px]:p-[14px]'

const sectionHeadingClass =
  'mb-3 text-[11px] font-bold tracking-[0.08em] uppercase text-(--gold-fg)'

function FieldLabel({
  htmlFor,
  required,
  requiredTitle,
  children,
}: {
  readonly htmlFor?: string
  readonly required?: boolean
  readonly requiredTitle: string
  readonly children: string
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[12.5px] font-semibold text-text">
      {children}
      {required && (
        <span className="ml-0.5 text-risk-fg" title={requiredTitle} aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

function SegRow({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex w-fit flex-wrap gap-[3px] rounded-[10px] border border-border bg-inset p-[3px]">
      {children}
    </div>
  )
}

/** One guided-questions input, keyed to the wizard answers by question id. */
function QuestionField({
  question,
  value,
  autofilled,
  onChange,
}: {
  readonly question: TemplateQuestion
  readonly value: string
  readonly autofilled: boolean
  readonly onChange: (value: string) => void
}) {
  const { t, x } = useI18n()
  const inputId = `q-${question.id}`
  const placeholder = question.placeholder ? x(question.placeholder) : undefined

  let control: ReactNode
  switch (question.type) {
    case 'textarea':
      control = (
        <textarea
          id={inputId}
          value={value}
          rows={4}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )
      break
    case 'select':
      control = (
        <select
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">—</option>
          {(question.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {x(option.label)}
            </option>
          ))}
        </select>
      )
      break
    case 'radio':
      control = (
        <SegRow>
          {(question.options ?? []).map((option) => (
            <SegButton
              key={option.value}
              active={value === option.value}
              onClick={() => onChange(option.value)}
            >
              {x(option.label)}
            </SegButton>
          ))}
        </SegRow>
      )
      break
    default:
      /* text / date / number map straight onto the input type. */
      control = (
        <input
          id={inputId}
          type={question.type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )
  }

  return (
    <div>
      <FieldLabel
        htmlFor={question.type === 'radio' ? undefined : inputId}
        required={question.required}
        requiredTitle={t('doclib_gen_required')}
      >
        {x(question.label)}
      </FieldLabel>
      {control}
      {autofilled && <div className="mt-1 text-[11px] text-accent">{t('doclib_gen_autofill')}</div>}
      {question.hint && <div className="mt-1 text-[11px] text-text-faint">{x(question.hint)}</div>}
    </div>
  )
}

function AutosaveIndicator({ state }: { readonly state: SaveState }) {
  const { t } = useI18n()
  const dot =
    state === 'saving' ? 'bg-accent animate-pulse' : state === 'saved' ? 'bg-ok-fg' : 'bg-gold-dot'
  const label =
    state === 'saving'
      ? t('doclib_gen_saving')
      : state === 'saved'
        ? t('doclib_gen_saved')
        : t('doclib_gen_unsaved')
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap text-text-muted"
    >
      <span className={`h-[7px] w-[7px] rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}

interface SectionGroup {
  key: string
  section: Bi
  questions: TemplateQuestion[]
}

function groupQuestions(template: DocTemplate): SectionGroup[] {
  const groups: SectionGroup[] = []
  const byKey = new Map<string, SectionGroup>()
  for (const question of template.questions) {
    const key = question.section.en
    let group = byKey.get(key)
    if (!group) {
      group = { key, section: question.section, questions: [] }
      byKey.set(key, group)
      groups.push(group)
    }
    group.questions.push(question)
  }
  return groups
}

function GenerateWizard({
  template,
  employees,
  cases,
}: {
  readonly template: DocTemplate
  readonly employees: DocEmployee[]
  readonly cases: DocCase[]
}) {
  const { t, x, lang } = useI18n()
  const { org, role } = useDoclib()
  const { showToast } = useToasts()
  const navigate = useNavigate()

  const [wiz, setWiz] = useState<WizardState>(() => ({
    step: 0,
    jurisdiction: template.jurisdictions.includes(org.primaryJurisdiction)
      ? org.primaryJurisdiction
      : (template.jurisdictions[0] ?? org.primaryJurisdiction),
    language: lang,
    answers: {},
    saveState: 'saved',
  }))

  /* Simulated autosave timers — cleared on every change and on unmount. */
  const timersRef = useRef<number[]>([])
  useEffect(
    () => () => {
      for (const id of timersRef.current) window.clearTimeout(id)
    },
    [],
  )
  const kickAutosave = () => {
    for (const id of timersRef.current) window.clearTimeout(id)
    const settle = window.setTimeout(() => {
      setWiz((w) => ({ ...w, saveState: 'saving' }))
      const done = window.setTimeout(
        () => setWiz((w) => ({ ...w, saveState: 'saved' })),
        SAVE_SETTLE_MS,
      )
      timersRef.current.push(done)
    }, SAVE_DEBOUNCE_MS)
    timersRef.current = [settle]
  }

  const setAnswer = (id: string, value: string) => {
    setWiz((w) => ({ ...w, answers: { ...w.answers, [id]: value }, saveState: 'unsaved' }))
    kickAutosave()
  }

  /* The name question this template prefills from the chosen employee. */
  const nameQuestion = template.questions.find(
    (q) => q.id === 'employee_name' || q.id === 'candidate_name',
  )

  const selectedEmployee = employees.find((e) => e.id === wiz.employeeId)

  const selectEmployee = (id: string) => {
    const employee = employees.find((e) => e.id === id)
    setWiz((w) => {
      const answers =
        employee && nameQuestion && (w.answers[nameQuestion.id] ?? '').trim() === ''
          ? { ...w.answers, [nameQuestion.id]: employee.name }
          : w.answers
      return {
        ...w,
        employeeId: id === '' ? undefined : id,
        /* Cases are scoped to the employee — reset the pick on change. */
        caseId: undefined,
        answers,
      }
    })
  }

  const goStep = (step: number) => {
    const clamped = Math.max(0, Math.min(2, step)) as 0 | 1 | 2
    setWiz((w) => ({ ...w, step: clamped }))
  }

  const employeeRequired = template.subject === 'employee'
  const contextReady = !employeeRequired || wiz.employeeId !== undefined
  const showsPeoplePickers = template.subject === 'employee' || template.subject === 'candidate'
  const employeeCases = cases.filter(
    (c) => wiz.employeeId === undefined || c.employeeId === wiz.employeeId,
  )

  const sections = useMemo(() => groupQuestions(template), [template])
  const blocks = useMemo(
    () =>
      resolveBlocks(template, {
        jurisdiction: wiz.jurisdiction,
        headcount: org.headcount,
        unionized: org.unionized,
      }),
    [template, wiz.jurisdiction, org.headcount, org.unionized],
  )
  /* Merge values: computed tokens (in the chosen DOCUMENT language) under the
     wizard answers. Caveat: DocPaper renders block copy in the UI language, so
     the document-language toggle only affects the computed tokens (today /
     jurisdiction / statute wording) — acceptable for the demo. */
  const todayString = useMemo(
    () =>
      new Date().toLocaleDateString(wiz.language === 'fr' ? 'fr-CA' : 'en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [wiz.language],
  )
  const values = useMemo(
    () => ({ ...computedTokens(wiz.jurisdiction, wiz.language, todayString), ...wiz.answers }),
    [wiz.jurisdiction, wiz.language, todayString, wiz.answers],
  )

  const progress = fillProgress(template, wiz.answers)
  const progressPct =
    progress.total === 0 ? 100 : Math.round((progress.filled / progress.total) * 100)
  const riskInfo = riskLevelInfo[template.risk]
  const reviewInfo = reviewStatusInfo[template.review]
  const jurisdictionName = (code: Jurisdiction): string => {
    const info = jurisdictionInfo.find((j) => j.code === code)
    return info ? x(info.name) : code
  }

  const applic = applicability(template, org)
  const sizeTier = sizeTiers.find(
    (tier) => org.headcount >= tier.min && (tier.max === null || org.headcount <= tier.max),
  )

  const saveToRepository = () => {
    if (!can(role, 'generate')) {
      showToast(doclibMessages.doclib_toast_denied, 'info')
      return
    }
    /* Demo mode has no write path — surface the created toast and return to
       the repository without persisting anything. */
    showToast(doclibMessages.doclib_toast_created, 'ok')
    navigate(REPOSITORY_PATH)
  }

  const subtitle =
    wiz.step === 0
      ? t('doclib_gen_contextSub')
      : wiz.step === 2
        ? t('doclib_gen_reviewSub')
        : `${t('doclib_gen_step')} 2 ${t('doclib_gen_of')} 3 — ${t('doclib_gen_questions')}`

  return (
    <div>
      {/* Header: title + step-appropriate subtitle */}
      <header className="mb-4">
        <h1 className="font-display text-[19px] font-bold tracking-[-0.01em] text-text">
          {`${t('doclib_gen_title')} · ${x(template.name)}`}
        </h1>
        <p className="mt-0.5 text-[13px] text-text-muted">{subtitle}</p>
      </header>

      {/* Cancel · step dots · autosave */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-[10px]">
        <Link
          to={STUDIO_PATH}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-muted hover:text-text"
        >
          <ChevronLeft size={15} strokeWidth={1.8} aria-hidden="true" />
          {t('doclib_gen_cancel')}
        </Link>
        <div className="flex-1">
          <StepDots
            step={wiz.step}
            labels={[t('doclib_gen_context'), t('doclib_gen_questions'), t('doclib_gen_review')]}
            onJump={goStep}
          />
        </div>
        <AutosaveIndicator state={wiz.saveState} />
      </div>

      {/* Org compliance strip (screenshot: size tier · union status · applicability) */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-surface px-[14px] py-[9px] max-[640px]:px-[10px]">
        {sizeTier && (
          <span className="inline-flex items-center rounded-full border border-border bg-inset px-[10px] py-[3px] text-[12px] font-semibold text-text-muted">
            {`${x(sizeTier.label)} · ${org.headcount}`}
          </span>
        )}
        <span className="inline-flex items-center rounded-full border border-border bg-inset px-[10px] py-[3px] text-[12px] font-semibold text-text-muted">
          {org.unionized ? t('doclib_profile_union') : t('doclib_profile_nonunion')}
        </span>
        <DocChip tone={APPLIC_TONE[applic.kind]}>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-[6px] w-[6px] rounded-full bg-current opacity-70"
              aria-hidden="true"
            />
            {x(applic.label)}
          </span>
        </DocChip>
      </div>

      {/* Two-column: wizard step + sticky live preview (stacks below 1024px) */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] items-start gap-6 max-[1023px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-4">
          {wiz.step === 0 && (
            <section className={cardClass} aria-label={t('doclib_gen_context')}>
              <h2 className={sectionHeadingClass}>{t('doclib_gen_context')}</h2>
              <div className="flex flex-col gap-4">
                {showsPeoplePickers ? (
                  <>
                    <div>
                      <FieldLabel
                        htmlFor="gen-employee"
                        required={employeeRequired}
                        requiredTitle={t('doclib_gen_required')}
                      >
                        {employeeRequired ? t('doclib_gen_employeeReq') : t('doclib_gen_candLink')}
                      </FieldLabel>
                      <select
                        id="gen-employee"
                        aria-label={
                          employeeRequired ? t('doclib_gen_employeeReq') : t('doclib_gen_candLink')
                        }
                        value={wiz.employeeId ?? ''}
                        onChange={(event) => selectEmployee(event.target.value)}
                        className={inputClass}
                      >
                        <option value="">{t('doclib_gen_none')}</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-[11px] text-text-faint">
                        {employeeRequired ? t('doclib_gen_empRequired') : t('doclib_gen_candHint')}
                      </div>
                    </div>
                    <div>
                      <FieldLabel htmlFor="gen-case" requiredTitle={t('doclib_gen_required')}>
                        {t('doclib_gen_case')}
                      </FieldLabel>
                      <select
                        id="gen-case"
                        aria-label={t('doclib_gen_case')}
                        value={wiz.caseId ?? ''}
                        onChange={(event) =>
                          setWiz((w) => ({
                            ...w,
                            caseId: event.target.value === '' ? undefined : event.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        <option value="">{t('doclib_gen_none')}</option>
                        {employeeCases.map((c) => (
                          <option key={c.id} value={c.id}>
                            {x(c.title)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[8px] border border-(--accent-soft-border) bg-accent-soft px-3 py-2 text-[12px] text-text-muted">
                    {template.subject === 'org'
                      ? t('doclib_gen_orgWideNote')
                      : t('doclib_gen_extNote')}
                  </div>
                )}

                <div>
                  <FieldLabel requiredTitle={t('doclib_gen_required')}>
                    {t('doclib_gen_jurisdiction')}
                  </FieldLabel>
                  <SegRow>
                    {template.jurisdictions.map((code) => (
                      <SegButton
                        key={code}
                        active={wiz.jurisdiction === code}
                        onClick={() => setWiz((w) => ({ ...w, jurisdiction: code }))}
                      >
                        {code}
                      </SegButton>
                    ))}
                  </SegRow>
                </div>

                <div>
                  <FieldLabel requiredTitle={t('doclib_gen_required')}>
                    {t('doclib_gen_language')}
                  </FieldLabel>
                  <SegRow>
                    {(['en', 'fr'] as const).map((docLang) => (
                      <SegButton
                        key={docLang}
                        active={wiz.language === docLang}
                        onClick={() => setWiz((w) => ({ ...w, language: docLang }))}
                      >
                        {docLang.toUpperCase()}
                      </SegButton>
                    ))}
                  </SegRow>
                </div>
              </div>
            </section>
          )}

          {wiz.step === 1 &&
            sections.map((group) => (
              <section key={group.key} className={cardClass} aria-label={x(group.section)}>
                <h2 className={sectionHeadingClass}>{x(group.section)}</h2>
                <div className="flex flex-col gap-4">
                  {group.questions.map((question) => (
                    <QuestionField
                      key={question.id}
                      question={question}
                      value={wiz.answers[question.id] ?? ''}
                      autofilled={
                        question === nameQuestion &&
                        selectedEmployee !== undefined &&
                        wiz.answers[question.id] === selectedEmployee.name
                      }
                      onChange={(value) => setAnswer(question.id, value)}
                    />
                  ))}
                </div>
              </section>
            ))}

          {wiz.step === 2 && (
            <section className={cardClass} aria-label={t('doclib_gen_review')}>
              <h2 className={sectionHeadingClass}>{t('doclib_gen_review')}</h2>

              {/* Fill progress */}
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-text">
                  {`${progress.filled}/${progress.total}`}{' '}
                  <span className="font-medium text-text-muted">{t('doclib_gen_mergeFilled')}</span>
                </span>
                <span className="text-[12px] text-text-muted">
                  {progress.total - progress.filled > 0
                    ? `${progress.total - progress.filled} ${t('doclib_gen_mergeRemaining')}`
                    : `${progressPct}%`}
                </span>
              </div>
              <div className="h-[8px] overflow-hidden rounded-full bg-inset" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-(--navy) transition-[width]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Risk & review posture + context summary */}
              <dl className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2.5 text-[12.5px]">
                <dt className="font-semibold text-text-muted">{t('doclib_gen_riskLine')}</dt>
                <dd>
                  <DocChip tone={riskInfo.tone}>{x(riskInfo.label)}</DocChip>
                </dd>
                <dt className="font-semibold text-text-muted">{t('doclib_gen_reviewLine')}</dt>
                <dd>
                  <DocChip tone={reviewInfo.tone}>{x(reviewInfo.label)}</DocChip>
                </dd>
                <dt className="font-semibold text-text-muted">{t('doclib_gen_jurisdiction')}</dt>
                <dd className="flex items-center gap-2 text-text">
                  <JurisdictionPill code={wiz.jurisdiction} />
                  {jurisdictionName(wiz.jurisdiction)}
                </dd>
                <dt className="font-semibold text-text-muted">{t('doclib_gen_language')}</dt>
                <dd className="font-semibold text-text">{wiz.language.toUpperCase()}</dd>
              </dl>

              {(template.requiresLawyerReview || template.review === 'hr_review_required') && (
                <div
                  className={`mt-4 rounded-[8px] border px-3 py-2 text-[12px] ${
                    template.requiresLawyerReview
                      ? 'border-(--risk-border) bg-risk-bg text-risk-fg'
                      : 'border-border bg-warn-bg text-warn-fg'
                  }`}
                >
                  {template.requiresLawyerReview
                    ? t('doclib_gen_lawyerWarn')
                    : t('doclib_gen_hrWarn')}
                </div>
              )}
            </section>
          )}

          {/* Back / Next / Save */}
          <div className="flex items-center justify-between gap-3">
            <div>
              {wiz.step > 0 && (
                <ActBtn onClick={() => goStep(wiz.step - 1)}>{t('doclib_gen_back')}</ActBtn>
              )}
            </div>
            {wiz.step < 2 ? (
              <button
                type="button"
                disabled={wiz.step === 0 && !contextReady}
                onClick={() => goStep(wiz.step + 1)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] bg-(--navy) px-[12px] py-[7px] text-[12.5px] font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {t('doclib_gen_next')}
              </button>
            ) : (
              <ActBtn variant="primary" onClick={saveToRepository}>
                {t('doclib_gen_createDoc')}
              </ActBtn>
            )}
          </div>
        </div>

        {/* Sticky live-preview rail */}
        <aside className="sticky top-[16px] min-w-0 self-start max-[1023px]:static">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted">
              {t('doclib_gen_livePreview')}
            </h2>
            <div className="flex items-center gap-1.5">
              <JurisdictionPill code={wiz.jurisdiction} />
              <span className="inline-flex items-center rounded-[6px] border border-border bg-inset px-[6px] py-px text-[10.5px] font-bold tracking-[0.04em] text-text-muted">
                {wiz.language.toUpperCase()}
              </span>
            </div>
          </div>
          <DocPaper blocks={blocks} values={values} />
          <p className="mt-2 text-[11px] text-text-faint">{t('doclib_disc_short')}</p>
        </aside>
      </div>
    </div>
  )
}

/** Skeleton mirroring the wizard layout while the catalogue loads. */
function GenerateSkeleton() {
  return (
    <div>
      <Skel className="h-[22px] w-[340px]" />
      <Skel className="mt-2 h-[14px] w-[240px]" />
      <div className="mt-4 flex items-center justify-between border-y border-border py-[10px]">
        <Skel className="h-[16px] w-[70px]" />
        <Skel className="h-[24px] w-[300px]" />
        <Skel className="h-[16px] w-[110px]" />
      </div>
      <Skel className="mt-4 h-[40px] w-full" />
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] gap-6 max-[1023px]:grid-cols-1">
        <Skel className="h-[320px]" />
        <Skel className="h-[420px]" />
      </div>
    </div>
  )
}

/**
 * Generate wizard — /app/documents/generate/:templateId. Three steps
 * (context → guided questions → review & risk) with a sticky live preview
 * rendered through the shared engine + DocPaper. Demo posture: answers are
 * local component state only; nothing is persisted.
 */
export function GenerateScreen() {
  const { templateId } = useParams()
  const { data } = useDoclib()

  if (!data) return <GenerateSkeleton />

  const template = data.templates.find((candidate) => candidate.id === templateId)
  if (!template) return <Navigate to={STUDIO_PATH} replace />

  return (
    <GenerateWizard
      key={template.id}
      template={template}
      employees={data.employees}
      cases={data.cases}
    />
  )
}
