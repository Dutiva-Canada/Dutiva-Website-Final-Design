import { MessageCircle, Plus, Star } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import { advisorViewMessages as M } from '@/i18n/messages/advisorView'

/**
 * Advisor thread list — the prototype shows these chat groups in the sidebar
 * nav while the Advisor view is active (`showChatGroupsInNav` + `chatGroups`
 * in `renderVals`). Here they render as a left column inside the view,
 * styled after the prototype's chat-group markup: uppercase group labels,
 * 13px thread rows with the chat-bubble glyph, accent-soft active state, and
 * the filled star on pinned threads. The navy 'New conversation' button
 * mirrors the sidebar's `newChatBtnStyle`.
 */

export interface ThreadListItem {
  id: string
  title: Bi
  pinned: boolean
}

export interface ThreadGroup {
  /** Group heading (advisorViewMessages key value). */
  label: Bi
  items: ThreadListItem[]
}

export interface ThreadListProps {
  groups: ThreadGroup[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onNewConversation: () => void
}

export function ThreadList({ groups, activeChatId, onSelect, onNewConversation }: ThreadListProps) {
  const { x } = useI18n()
  return (
    <nav
      aria-label={x(M.advisorview_threads_aria)}
      className="hidden w-[248px] shrink-0 flex-col overflow-y-auto border-r border-border-soft px-[10px] pt-[12px] pb-[12px] md:flex"
    >
      <button
        type="button"
        onClick={onNewConversation}
        className="mb-[6px] flex w-full cursor-pointer items-center gap-[8px] rounded-[8px] border-none bg-navy px-[12px] py-[9px] text-[13.5px] font-semibold text-white"
      >
        <Plus size={15} strokeWidth={2} aria-hidden="true" />
        <span>{x(M.advisorview_new_conversation)}</span>
      </button>

      {groups.map((group, gi) => (
        <div key={gi}>
          <div className="px-[10px] pt-[14px] pb-[6px] text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
            {x(group.label)}
          </div>
          {group.items.map((chat) => {
            const active = chat.id === activeChatId
            return (
              <button
                key={`${gi}-${chat.id}`}
                type="button"
                onClick={() => onSelect(chat.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full cursor-pointer items-center gap-[8px] rounded-[7px] border-none px-[10px] py-[7px] text-left font-sans text-[13px] ${
                  active
                    ? 'bg-accent-soft font-semibold text-accent'
                    : 'bg-transparent font-normal text-text-2'
                }`}
              >
                <MessageCircle
                  size={14}
                  strokeWidth={1.7}
                  className="shrink-0 opacity-70"
                  aria-hidden="true"
                />
                <span className="flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap">
                  {x(chat.title)}
                </span>
                {chat.pinned && (
                  <Star
                    size={12}
                    strokeWidth={0}
                    fill="currentColor"
                    className="shrink-0 opacity-55"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
