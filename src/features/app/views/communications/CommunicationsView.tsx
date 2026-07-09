import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, Sparkle } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import { communicationDetails, communications } from '@/data'
import type { Communication, CommunicationDetail, Tone } from '@/data'
import { useRail } from '@/features/app/rail/railContext'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { communicationsMessages as M } from '@/i18n/messages/communications'

/**
 * Communications view — the announcement pipeline with Advisor review
 * dimensions, linked entities, and the sensitive-send review gate. Port of
 * the prototype's `isCommunicationsView` markup + `buildCommunicationsView()`
 * / `sendCommunication()` / `markCommSent()` (App v2.dc.html).
 */

/** Prototype `statusChipStyle(tone)` as token utilities. */
const chipTones: Record<Tone, string> = {
  risk: 'bg-risk-bg text-risk-fg',
  warning: 'bg-warn-bg text-warn-fg',
  success: 'bg-ok-bg text-ok-fg',
  info: 'bg-accent-soft text-accent',
  suggestion: 'bg-accent-soft text-accent',
}

const chipClass = (tone: Tone) =>
  `inline-flex rounded-[100px] px-[10px] py-[3px] text-[12px] font-semibold whitespace-nowrap ${chipTones[tone]}`

/** View display order from the prototype's `buildCommunicationsView()`. */
const DISPLAY_ORDER = ['cm1', 'cm5', 'cm6', 'cm4', 'cm2', 'cm3']

/** Review dimensions rendered in the prototype's fixed order. */
const DIM_KEYS = ['tone', 'legal', 'clarity', 'policy'] as const

const dimLabels: Record<(typeof DIM_KEYS)[number], Bi> = {
  tone: M.comms_dim_tone,
  legal: M.comms_dim_legal,
  clarity: M.comms_dim_clarity,
  policy: M.comms_dim_policy,
}

export function CommunicationsView() {
  const { x, lang } = useI18n()
  const navigate = useNavigate()
  const { openRail, closeRail } = useRail()
  const { showToast } = useToasts()
  /** Comms sent in this session (prototype `state.commStatus`). */
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({})

  const items = DISPLAY_ORDER.map((id) => {
    const comm = communications.find((c) => c.id === id)
    const detail = communicationDetails[id]
    return comm && detail ? { comm, detail } : null
  }).filter(
    (entry): entry is { comm: Communication; detail: CommunicationDetail } => entry !== null,
  )

  const markSent = (id: string) => {
    setSentIds((prev) => ({ ...prev, [id]: true }))
    showToast(M.comms_sent_toast, 'ok')
  }

  /* Prototype `sendCommunication(c)` — sensitive sends open a review gate. */
  const sendCommunication = (comm: Communication, detail: CommunicationDetail) => {
    if (detail.sensitive) {
      openRail(comm.title, {
        text: M.comms_sensitive_intro,
        cards: [
          {
            tone: 'warning',
            title: M.comms_gate_title,
            body: detail.gateNote ?? comm.note,
            actions: [
              {
                label: M.comms_gate_confirm,
                primary: true,
                onClick: () => {
                  closeRail()
                  markSent(comm.id)
                },
              },
            ],
          },
        ],
      })
      return
    }
    markSent(comm.id)
  }

  /* Prototype per-comm `onReview` — Advisor's read on the message. */
  const reviewCommunication = (comm: Communication) => {
    openRail(
      comm.title,
      {
        text: M.comms_review_intro,
        cards: [
          {
            tone: comm.tone === 'success' || comm.tone === 'suggestion' ? 'info' : comm.tone,
            title: M.comms_review_card_title,
            body: comm.note,
            actions: [
              {
                label: M.comms_open_in_documents,
                primary: true,
                onClick: () => {
                  closeRail()
                  navigate('/app/templates')
                },
              },
            ],
          },
        ],
      },
      { chips: [comm.province, comm.audience], initials: 'AN' },
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-[18px] text-[13px] text-text-muted">{x(M.comms_subtitle)}</div>
        <div className="flex flex-col gap-[12px]">
          {items.map(({ comm, detail }) => {
            const status0 = comm.status.en
            const sent = sentIds[comm.id] === true || status0 === 'Sent'
            const statusLabel = sent
              ? M.comms_status_sent
              : status0 === 'Scheduled'
                ? M.comms_status_scheduled
                : M.comms_status_draft
            const updated = sentIds[comm.id] ? M.comms_just_now : comm.updated
            return (
              <div
                key={comm.id}
                className="flex flex-col gap-[10px] rounded-[12px] border border-border bg-surface px-[18px] py-[16px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-[12px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <span className="text-[14.5px] font-semibold text-text">{x(comm.title)}</span>
                      <span className="rounded-[100px] bg-accent-soft px-[9px] py-[3px] text-[10.5px] font-bold tracking-[0.03em] text-accent uppercase">
                        {x(detail.audienceType)}
                      </span>
                    </div>
                    <div className="mt-[3px] text-[12px] text-text-muted">
                      {x(comm.audience)} · {x(updated)} · {x(detail.bilingual)}
                    </div>
                  </div>
                  <span className={chipClass(sent ? 'success' : comm.tone)}>{x(statusLabel)}</span>
                </div>

                {/* Advisor review dimensions (Tone / Legal / Clarity / Policy). */}
                <div className="flex flex-wrap gap-[6px]">
                  {DIM_KEYS.map((key) => {
                    const ok = detail.review[key]
                    const label = dimLabels[key]
                    const suffix = ok ? M.comms_dim_ok_suffix : M.comms_dim_review_suffix
                    return (
                      <span key={key} className={chipClass(ok ? 'success' : 'warning')}>
                        {x(label)}
                        {lang === 'fr' ? suffix.fr : suffix.en}
                      </span>
                    )
                  })}
                </div>

                {detail.linkedTo && (
                  <div className="flex items-center gap-[6px] text-[12px] text-text-muted">
                    <Link size={12} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
                    {x(detail.linkedTo)}
                  </div>
                )}

                {/* Advisor note. */}
                <div className="flex items-start gap-[8px] rounded-[9px] border border-gold-border bg-gold-bg px-[13px] py-[10px]">
                  <Sparkle
                    size={14}
                    strokeWidth={0}
                    fill="currentColor"
                    className="mt-[1px] shrink-0 text-gold-dot"
                    aria-hidden="true"
                  />
                  <span className="text-[12.5px] leading-[1.5] text-gold-fg">{x(comm.note)}</span>
                </div>

                <div className="flex flex-wrap gap-[8px]">
                  <button
                    type="button"
                    onClick={() => reviewCommunication(comm)}
                    className="cursor-pointer rounded-[8px] border-none bg-accent-soft px-[13px] py-[7px] font-sans text-[12.5px] font-bold text-accent"
                  >
                    {x(M.comms_review_with_advisor)}
                  </button>
                  {!sent && (
                    <button
                      type="button"
                      onClick={() => sendCommunication(comm, detail)}
                      className="cursor-pointer rounded-[8px] border-none bg-navy px-[14px] py-[7px] font-sans text-[12.5px] font-bold text-white"
                    >
                      {x(status0 === 'Scheduled' ? M.comms_send_now : M.comms_send)}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
