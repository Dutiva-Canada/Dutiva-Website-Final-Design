import { useEffect, useRef } from 'react'
import { FileText, Sparkle, TriangleAlert } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { Disclaimer } from '@/components/Disclaimer'
import { pickL } from '@/i18n/core'
import type { Bi, LText } from '@/i18n/core'
import { advisorCore } from '@/i18n/messages/advisorCore'
import { advisorViewMessages as M } from '@/i18n/messages/advisorView'
import { ChatBubble } from '@/features/app/advisor/ChatBubble'
import { ChatComposer } from '@/features/app/advisor/ChatComposer'
import { ReasoningExpander } from '@/features/app/advisor/ReasoningExpander'
import { StreamedText } from '@/features/app/advisor/StreamedText'
import { SuggestionChips } from '@/features/app/advisor/SuggestionChips'
import { ToneCard } from '@/features/app/advisor/ToneCard'
import { TypingDots } from '@/features/app/advisor/TypingDots'
import type { ChatMessage } from '@/features/app/advisor/types'
import { documentTemplatesByKey, followupReplies } from '@/data'
import { estimatorFollowup } from './advisorFlows'
import type { MessageExtras, QuickFormState, SuggestChipSpec } from './advisorFlows'

/**
 * Active conversation pane (prototype `hasActiveConversation` markup):
 * the always-visible jurisdiction context line, the 740px transcript with
 * user/advisor turns (thinking dots → streaming bubble → cards, doc chips,
 * quick form, suggest/follow-up chips; error turn with Retry), and the chat
 * composer footer with the short disclaimer.
 */

const ENTRANCE = 'animate-[fadeInUp_.45s_cubic-bezier(.4,0,.2,1)]'

export interface ChatPaneProps {
  messages: ChatMessage[]
  busy: boolean
  jurisdiction: Bi
  getExtras: (messageId: string) => MessageExtras | undefined
  onSend: (text: string) => void
  onRetry: (messageId: string) => void
  onFollowup: (labelEn: string) => void
  onGenerateDoc: (templateKey: string) => void
  onSuggestChip: (chip: SuggestChipSpec) => void
  onQuickFormChange: (messageId: string, fieldIndex: number, valueEn: string) => void
  onQuickFormSubmit: (messageId: string) => void
}

/** Follow-up chip label: canned-reply label, or the beta-estimator label. */
function followupLabel(labelEn: string): LText {
  if (labelEn === estimatorFollowup.labelEn) return estimatorFollowup.label
  return followupReplies[labelEn]?.label ?? labelEn
}

function docTitle(templateKey: string): LText {
  return documentTemplatesByKey[templateKey]?.title ?? templateKey
}

export function ChatPane({
  messages,
  busy,
  jurisdiction,
  getExtras,
  onSend,
  onRetry,
  onFollowup,
  onGenerateDoc,
  onSuggestChip,
  onQuickFormChange,
  onQuickFormSubmit,
}: ChatPaneProps) {
  const { x, lang } = useI18n()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  /* Keep the newest message (and its streaming tail) in view. */
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Jurisdiction context line — always visible on an active conversation. */}
      <div className="flex shrink-0 justify-center border-b border-border-soft px-[24px] py-[8px]">
        <span className="rounded-[100px] border border-gold-border bg-gold-bg px-[10px] py-[3px] text-[11.5px] font-semibold text-gold-fg">
          {pickL(jurisdiction, lang)}
        </span>
      </div>

      {/* Transcript — polite live region so streamed replies are announced. */}
      <div ref={scrollRef} aria-live="polite" className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[740px] flex-col gap-[22px] px-[24px] pt-[26px] pb-[16px]">
          {messages.map((message) =>
            message.author === 'user' ? (
              <UserTurn key={message.id} message={message} />
            ) : (
              <AdvisorTurn
                key={message.id}
                message={message}
                extras={getExtras(message.id)}
                onRetry={onRetry}
                onFollowup={onFollowup}
                onGenerateDoc={onGenerateDoc}
                onSuggestChip={onSuggestChip}
                onQuickFormChange={onQuickFormChange}
                onQuickFormSubmit={onQuickFormSubmit}
              />
            ),
          )}
          <div className="h-[6px]" />
        </div>
      </div>

      {/* Composer footer */}
      <div className="shrink-0 border-t border-border bg-bg px-[24px] pt-[14px] pb-[16px]">
        <div className="mx-auto max-w-[740px]">
          <ChatComposer
            variant="chat"
            placeholder={x(M.advisorview_composer_msg)}
            onSend={onSend}
            disabled={busy}
          />
        </div>
        <Disclaimer className="mt-[8px] text-center" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- user turn */

function UserTurn({ message }: { message: ChatMessage }) {
  const { lang } = useI18n()
  const chips = message.userChips ?? []
  const text = pickL(message.text, lang)
  return (
    <div className={`flex flex-col items-end gap-[8px] ${ENTRANCE}`}>
      {chips.length > 0 && (
        <div className="flex max-w-[80%] flex-wrap justify-end gap-[6px]">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="rounded-[100px] bg-accent-soft px-[11px] py-[5px] text-[12.5px] font-semibold text-accent"
            >
              {pickL(chip, lang)}
            </span>
          ))}
        </div>
      )}
      {text.length > 0 && <ChatBubble author="user">{text}</ChatBubble>}
    </div>
  )
}

/* ---------------------------------------------------------- advisor turn */

interface AdvisorTurnProps {
  message: ChatMessage
  extras: MessageExtras | undefined
  onRetry: (messageId: string) => void
  onFollowup: (labelEn: string) => void
  onGenerateDoc: (templateKey: string) => void
  onSuggestChip: (chip: SuggestChipSpec) => void
  onQuickFormChange: (messageId: string, fieldIndex: number, valueEn: string) => void
  onQuickFormSubmit: (messageId: string) => void
}

function AdvisorTurn({
  message,
  extras,
  onRetry,
  onFollowup,
  onGenerateDoc,
  onSuggestChip,
  onQuickFormChange,
  onQuickFormSubmit,
}: AdvisorTurnProps) {
  const { x, lang } = useI18n()
  const status = message.status ?? 'done'
  const showBubble = status === 'streaming' || status === 'done'
  const done = status === 'done'
  const text = pickL(message.text, lang)
  const reasoning = message.reasoning ?? []
  const cards = message.cards ?? []
  const docs = extras?.docs ?? []
  const followups = extras?.followups ?? []
  const suggestChips = extras?.suggestChips ?? []
  const quickForm = extras?.quickForm

  return (
    <div className={`flex items-start gap-[12px] ${ENTRANCE}`}>
      <div className="mt-[2px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] bg-navy">
        <Sparkle size={13} fill="#F2D9A8" strokeWidth={0} aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        {status === 'thinking' && <TypingDots label={x(advisorCore.advisor_thinking)} />}

        {status === 'error' && (
          <div className="flex max-w-[520px] flex-col gap-[8px] rounded-[12px] border border-risk-border bg-risk-bg px-[14px] py-[12px]">
            <div className="flex items-start gap-[8px]">
              <TriangleAlert
                size={15}
                strokeWidth={1.9}
                className="mt-[1px] shrink-0 text-risk-dot"
                aria-hidden="true"
              />
              <span className="text-[13.5px] leading-[1.5] text-risk-fg">
                {pickL(message.errorText ?? advisorCore.advisor_error_default, lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="cursor-pointer self-start rounded-[7px] border border-risk-border bg-surface px-[13px] py-[6px] font-sans text-[12.5px] font-semibold text-risk-fg"
            >
              {x(advisorCore.advisor_retry)}
            </button>
          </div>
        )}

        {showBubble && (
          <>
            {reasoning.length > 0 && <ReasoningExpander lines={reasoning} />}

            {text.length > 0 && (
              <ChatBubble author="assistant">
                <StreamedText
                  text={message.text}
                  status={message.status}
                  streamedLen={message.streamedLen}
                />
              </ChatBubble>
            )}

            {done && cards.length > 0 && (
              <div className="flex max-w-[620px] flex-col gap-[10px]">
                {cards.map((card, i) => (
                  <ToneCard key={i} card={card} />
                ))}
              </div>
            )}

            {done && docs.length > 0 && (
              <div className="flex max-w-[620px] flex-wrap gap-[10px]">
                {docs.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-[10px] rounded-[10px] border border-border bg-surface py-[10px] pr-[12px] pl-[10px]"
                  >
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] bg-inset">
                      <FileText
                        size={14}
                        strokeWidth={1.7}
                        className="text-text-muted"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-text">
                      {pickL(docTitle(key), lang)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onGenerateDoc(key)}
                      className="cursor-pointer rounded-[6px] border-none bg-accent-soft px-[11px] py-[6px] font-sans text-[12px] font-bold text-accent"
                    >
                      {x(M.advisorview_generate)}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {done && quickForm && !quickForm.submitted && (
              <QuickForm
                messageId={message.id}
                form={quickForm}
                onChange={onQuickFormChange}
                onSubmit={onQuickFormSubmit}
              />
            )}

            {done && suggestChips.length > 0 && (
              <SuggestionChips
                variant="suggest"
                chips={suggestChips.map((chip) => ({
                  label: chip.label,
                  onClick: () => onSuggestChip(chip),
                }))}
              />
            )}

            {done && followups.length > 0 && (
              <SuggestionChips
                variant="followup"
                chips={followups.map((labelEn) => ({
                  label: followupLabel(labelEn),
                  onClick: () => onFollowup(labelEn),
                }))}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- quick form */

interface QuickFormProps {
  messageId: string
  form: QuickFormState
  onChange: (messageId: string, fieldIndex: number, valueEn: string) => void
  onSubmit: (messageId: string) => void
}

function QuickForm({ messageId, form, onChange, onSubmit }: QuickFormProps) {
  const { lang } = useI18n()
  return (
    <div className="flex max-w-[560px] flex-col gap-[12px] rounded-[12px] border border-border bg-surface p-[16px]">
      {form.fields.map((field, fi) => {
        const selectId = `${messageId}-field-${field.key}`
        return (
          <div key={field.key} className="flex flex-col gap-[5px]">
            <label htmlFor={selectId} className="text-[12px] font-semibold text-text-3">
              {pickL(field.label, lang)}
            </label>
            <select
              id={selectId}
              value={field.value}
              onChange={(e) => onChange(messageId, fi, e.target.value)}
              className="rounded-[8px] border border-border bg-bg px-[10px] py-[9px] font-sans text-[13.5px] text-text"
            >
              {field.options.map((option) => (
                <option key={option.en} value={option.en}>
                  {pickL(option, lang)}
                </option>
              ))}
            </select>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => onSubmit(messageId)}
        className="mt-[2px] cursor-pointer self-start rounded-[8px] border-none bg-navy px-[18px] py-[9px] font-sans text-[13.5px] font-bold text-white"
      >
        {pickL(form.submitLabel, lang)}
      </button>
    </div>
  )
}
