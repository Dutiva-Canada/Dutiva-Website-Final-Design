import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { supportMessages as M } from '@/i18n/messages/support'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  supportCategory,
} from '@/config/support'
import type { SupportPriority, SupportStatus } from '@/config/support'
import { adminGetTicket, isCurrentUserAdmin, runAgentAction } from '@/features/support/supportAdminApi'
import type { AdminMessage, AdminTicket } from '@/features/support/supportAdminApi'

const PRIORITIES: SupportPriority[] = ['critical', 'high', 'standard', 'low']

function formatDateTime(iso: string, lang: 'en' | 'fr'): string {
  return new Date(iso).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const selectClass = 'rounded-[8px] border border-border bg-surface px-[10px] py-[7px] text-[13px] text-text'

export function SupportAdminTicket() {
  const { x, L, lang } = useI18n()
  const { ticketId } = useParams()
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [ticket, setTicket] = useState<AdminTicket | null | 'missing'>(null)
  const [reply, setReply] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(false)

  useEffect(() => {
    isCurrentUserAdmin().then(setAdmin).catch(() => setAdmin(false))
  }, [])

  const load = useCallback(async () => {
    if (!ticketId) return
    const t = await adminGetTicket(ticketId)
    setTicket(t ?? 'missing')
  }, [ticketId])

  useEffect(() => {
    if (admin === true) void load().catch(() => setTicket('missing'))
  }, [admin, load])

  async function act(payload: Parameters<typeof runAgentAction>[1], clear?: () => void) {
    if (!ticketId) return
    setBusy(true)
    setActionError(false)
    try {
      await runAgentAction(ticketId, payload)
      clear?.()
      await load()
    } catch (e) {
      console.error('support admin: action failed', e)
      setActionError(true)
    } finally {
      setBusy(false)
    }
  }

  if (admin === false) {
    return (
      <div className="mx-auto max-w-[820px] px-[28px] pt-[24px]">
        <p className="m-0 rounded-[12px] border border-border bg-inset px-[16px] py-[12px] text-[14px] text-text-2">
          {x(M.support_admin_denied)}
        </p>
      </div>
    )
  }

  const authorLabel = (m: AdminMessage) =>
    m.authorRole === 'agent' ? x(M.support_author_dutiva) : L('Customer', 'Client')

  return (
    <div className="mx-auto max-w-[860px] px-[28px] pt-[8px] pb-[64px] max-[640px]:px-[16px]">
      <Link
        to="/app/support/admin"
        className="mb-[16px] inline-flex items-center gap-[6px] py-[4px] text-[13px] font-semibold text-text-muted hover:text-text"
      >
        <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
        {x(M.support_admin_title)}
      </Link>

      {ticket === null && (
        <p className="m-0 text-[14px] text-text-3" role="status">
          {x(M.support_requests_loading)}
        </p>
      )}
      {ticket === 'missing' && <p className="m-0 text-[14px] text-text-3">{x(M.support_ticket_not_found)}</p>}

      {ticket && ticket !== 'missing' && (
        <>
          <header className="mb-[16px]">
            <h1 className="m-0 mb-[6px] font-display text-[22px] font-semibold tracking-[-0.015em] text-text">
              {ticket.subject}
            </h1>
            <p className="m-0 text-[12.5px] text-text-muted">
              {ticket.publicReference} · {x(supportCategory(ticket.category).label)} ·{' '}
              {ticket.requesterEmail ?? '—'}
              {ticket.restricted && (
                <span className="ml-[6px] rounded-[4px] bg-risk-bg px-[5px] py-px text-[10.5px] font-semibold text-risk-fg">
                  {x(M.support_admin_restricted_badge)}
                </span>
              )}
            </p>
          </header>

          {/* Operator controls */}
          <div className="mb-[20px] flex flex-wrap items-center gap-[16px] rounded-[12px] border border-border bg-inset px-[16px] py-[12px]">
            <label className="flex items-center gap-[8px] text-[12.5px] font-semibold text-text-2">
              {x(M.support_admin_set_status)}
              <select
                className={selectClass}
                value={ticket.status}
                disabled={busy}
                onChange={(e) => void act({ action: 'status', status: e.target.value as SupportStatus })}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {x(STATUS_LABELS[s])}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-[8px] text-[12.5px] font-semibold text-text-2">
              {x(M.support_admin_set_priority)}
              <select
                className={selectClass}
                value={ticket.priority}
                disabled={busy}
                onChange={(e) => void act({ action: 'priority', priority: e.target.value as SupportPriority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {x(PRIORITY_LABELS[p])}
                  </option>
                ))}
              </select>
            </label>
            {busy && <span className="text-[12px] text-text-muted">{x(M.support_admin_working)}</span>}
          </div>

          {actionError && (
            <p role="alert" className="m-0 mb-[14px] rounded-[10px] border border-risk-border bg-risk-bg px-[14px] py-[10px] text-[13px] text-risk-fg">
              {x(M.support_admin_action_error)}
            </p>
          )}

          <ol className="m-0 mb-[22px] flex list-none flex-col gap-[10px] p-0">
            {ticket.messages.map((m) => (
              <li key={m.id}>
                <div
                  className={
                    m.isInternal
                      ? 'rounded-[12px] border border-gold-border bg-gold-bg px-[16px] py-[11px] text-[14px] leading-[1.5] whitespace-pre-wrap text-gold-fg'
                      : m.authorRole === 'agent'
                        ? 'rounded-[12px] rounded-tl-[3px] border border-border bg-surface px-[16px] py-[11px] text-[14px] leading-[1.5] whitespace-pre-wrap text-text'
                        : 'rounded-[12px] rounded-br-[3px] bg-inset px-[16px] py-[11px] text-[14px] leading-[1.5] whitespace-pre-wrap text-text'
                  }
                >
                  {m.body}
                </div>
                <span className="mt-[3px] block text-[11px] text-text-faint">
                  {m.isInternal ? x(M.support_admin_internal_badge) : authorLabel(m)} ·{' '}
                  {formatDateTime(m.createdAt, lang)}
                </span>
              </li>
            ))}
          </ol>

          {/* Reply (customer-visible) */}
          <div className="mb-[16px] flex flex-col gap-[8px]">
            <label htmlFor="admin-reply" className="text-[13px] font-semibold text-text-2">
              {x(M.support_admin_reply_label)}
            </label>
            <textarea
              id="admin-reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={20000}
              className="min-h-[90px] w-full resize-y rounded-[9px] border border-border bg-surface px-[12px] py-[10px] text-[14px] text-text"
            />
            <div>
              <button
                type="button"
                disabled={busy || !reply.trim()}
                onClick={() => void act({ action: 'reply', body: reply.trim() }, () => setReply(''))}
                className="cursor-pointer rounded-[9px] border-none bg-navy px-[18px] py-[9px] text-[13.5px] font-semibold text-white disabled:opacity-60"
              >
                {x(M.support_admin_reply_send)}
              </button>
            </div>
          </div>

          {/* Internal note */}
          <div className="flex flex-col gap-[8px]">
            <label htmlFor="admin-note" className="text-[13px] font-semibold text-text-2">
              {x(M.support_admin_note_label)}
            </label>
            <textarea
              id="admin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={20000}
              className="min-h-[70px] w-full resize-y rounded-[9px] border border-gold-border bg-gold-bg px-[12px] py-[10px] text-[14px] text-gold-fg"
            />
            <div>
              <button
                type="button"
                disabled={busy || !note.trim()}
                onClick={() => void act({ action: 'note', body: note.trim() }, () => setNote(''))}
                className="cursor-pointer rounded-[9px] border border-border bg-surface px-[18px] py-[9px] text-[13.5px] font-semibold text-text-2 disabled:opacity-60"
              >
                {x(M.support_admin_note_send)}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
