import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { supportMessages as M } from '@/i18n/messages/support'
import { STATUS_LABELS, supportCategory } from '@/config/support'
import { getSupportTicket, replyToSupportTicket } from '@/features/support/supportApi'
import type { SupportMessageView, SupportTicketThread } from '@/features/support/supportApi'
import { SupportAttachments } from '@/features/support/SupportAttachments'

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'not_found' }
  | { kind: 'ready'; ticket: SupportTicketThread }

function formatDateTime(iso: string, lang: 'en' | 'fr'): string {
  return new Date(iso).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function SupportTicketDetail() {
  const { x, lang } = useI18n()
  const { ticketId } = useParams()
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticketId) {
      setState({ kind: 'not_found' })
      return
    }
    let cancelled = false
    getSupportTicket(ticketId)
      .then((ticket) => {
        if (cancelled) return
        setState(ticket ? { kind: 'ready', ticket } : { kind: 'not_found' })
      })
      .catch((error: unknown) => {
        console.error('support: failed to load request', error)
        if (!cancelled) setState({ kind: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [ticketId])

  async function onReply(event: FormEvent) {
    event.preventDefault()
    if (state.kind !== 'ready' || !reply.trim() || !ticketId) return
    setSending(true)
    setReplyError(null)
    try {
      const message: SupportMessageView = await replyToSupportTicket(ticketId, reply.trim())
      setReply('')
      setState({ kind: 'ready', ticket: { ...state.ticket, messages: [...state.ticket.messages, message] } })
    } catch (error) {
      console.error('support: reply failed', error)
      setReplyError(x(M.support_reply_error))
    } finally {
      setSending(false)
    }
  }

  const authorLabel = (role: SupportMessageView['authorRole']) =>
    role === 'customer' ? x(M.support_author_you) : role === 'agent' ? x(M.support_author_dutiva) : x(M.support_author_system)

  return (
    <div className="mx-auto max-w-[820px] px-[28px] pt-[8px] pb-[64px] max-[640px]:px-[16px]">
      <Link
        to="/app/support/requests"
        className="mb-[16px] inline-flex items-center gap-[6px] py-[4px] text-[13px] font-semibold text-text-muted hover:text-text"
      >
        <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
        {x(M.support_back_to_requests)}
      </Link>

      {state.kind === 'loading' && (
        <p className="m-0 text-[14px] text-text-3" role="status">
          {x(M.support_requests_loading)}
        </p>
      )}
      {state.kind === 'error' && (
        <p className="m-0 rounded-[12px] border border-risk-border bg-risk-bg px-[16px] py-[12px] text-[14px] text-risk-fg" role="alert">
          {x(M.support_requests_error)}
        </p>
      )}
      {state.kind === 'not_found' && (
        <p className="m-0 text-[14px] text-text-3">{x(M.support_ticket_not_found)}</p>
      )}

      {state.kind === 'ready' && (
        <>
          <header className="mb-[18px]">
            <h1 className="m-0 mb-[6px] font-display text-[22px] font-semibold tracking-[-0.015em] text-text">
              {state.ticket.subject}
            </h1>
            <p className="m-0 text-[12.5px] text-text-muted">
              {state.ticket.publicReference} · {x(supportCategory(state.ticket.category).label)} ·{' '}
              {x(M.support_status_label)}: {x(STATUS_LABELS[state.ticket.status])}
            </p>
          </header>

          <ol className="m-0 mb-[22px] flex list-none flex-col gap-[12px] p-0">
            {state.ticket.messages.map((msg) => {
              const mine = msg.authorRole === 'customer'
              return (
                <li
                  key={msg.id}
                  className={mine ? 'flex flex-col items-end' : 'flex flex-col items-start'}
                >
                  <div
                    className={
                      mine
                        ? 'max-w-[85%] rounded-[12px] rounded-br-[3px] bg-navy px-[16px] py-[11px] text-[14px] leading-[1.5] whitespace-pre-wrap text-white'
                        : 'max-w-[85%] rounded-[12px] rounded-tl-[3px] border border-border bg-surface px-[16px] py-[11px] text-[14px] leading-[1.5] whitespace-pre-wrap text-text'
                    }
                  >
                    {msg.body}
                  </div>
                  <span className="mt-[3px] text-[11px] text-text-faint">
                    {authorLabel(msg.authorRole)} · {formatDateTime(msg.createdAt, lang)}
                  </span>
                </li>
              )
            })}
          </ol>

          <SupportAttachments ticketId={state.ticket.id} canUpload={state.ticket.status !== 'closed'} />

          {state.ticket.status === 'closed' ? (
            <p className="m-0 rounded-[12px] border border-border bg-inset px-[16px] py-[12px] text-[13px] text-text-2">
              {x(M.support_reply_closed)}
            </p>
          ) : (
            <form onSubmit={onReply} className="flex flex-col gap-[10px]">
              <label htmlFor="support-reply" className="text-[13px] font-semibold text-text-2">
                {x(M.support_reply_label)}
              </label>
              <textarea
                id="support-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                maxLength={20000}
                className="min-h-[100px] w-full resize-y rounded-[9px] border border-border bg-surface px-[12px] py-[10px] text-[14px] text-text"
              />
              {replyError && (
                <p role="alert" className="m-0 text-[12.5px] text-risk-fg">
                  {replyError}
                </p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="cursor-pointer rounded-[9px] border-none bg-navy px-[20px] py-[10px] text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  {sending ? x(M.support_reply_sending) : x(M.support_reply_submit)}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
