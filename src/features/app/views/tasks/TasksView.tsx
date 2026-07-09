import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { Bi } from '@/i18n/core'
import { tasksMessages as M } from '@/i18n/messages/tasks'
import { cases, chats, taskPriorityLabels, taskPriorityTones, tasks } from '@/data'
import type { Task, Tone } from '@/data'
import type { AdvisorSearchNavState } from '@/features/app/search/searchCorpus'

/**
 * Tasks view — the Advisor-generated checklist (prototype `buildTasksView()`
 * + tasks markup, App v2.dc.html lines 1125–1152). Each row: done toggle,
 * clickable body that opens the linked Advisor conversation, and status +
 * priority chips. Toggling only flips local done state (prototype
 * `toggleTask()` — no toast).
 */

/* Prototype `statusChipStyle(tone)` — unknown tones fall back to info. */
const chipToneClasses: Record<Tone, string> = {
  risk: 'bg-risk-bg text-risk-fg',
  warning: 'bg-warn-bg text-warn-fg',
  success: 'bg-ok-bg text-ok-fg',
  info: 'bg-accent-soft text-accent',
  suggestion: 'bg-accent-soft text-accent',
}

function chipClass(tone: Tone): string {
  return `inline-flex rounded-[100px] px-[10px] py-[3px] text-[12px] font-semibold whitespace-nowrap ${chipToneClasses[tone]}`
}

/** Linked case (matched on chatId) or, failing that, the chat thread itself. */
function linkedFor(task: Task): Bi | null {
  const linkedCase = cases.find((c) => c.chatId === task.chatId)
  if (linkedCase) return linkedCase.title
  const linkedChat = chats.find((c) => c.id === task.chatId)
  return linkedChat ? linkedChat.title : null
}

export function TasksView() {
  const { x } = useI18n()
  const navigate = useNavigate()
  /* Fixture done flags are the seed; toggles live in view state. */
  const [doneById, setDoneById] = useState<Record<string, boolean>>({})

  const isDone = (task: Task) => doneById[task.id] ?? task.done
  const toggleTask = (task: Task) =>
    setDoneById((prev) => ({ ...prev, [task.id]: !(prev[task.id] ?? task.done) }))

  const openChat = (task: Task) => {
    navigate('/app/advisor', { state: { chatId: task.chatId } satisfies AdvisorSearchNavState })
  }

  /* Prototype `activateOnKey` — Enter / Space activate role="button" targets. */
  const openChatOnKey = (task: Task) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openChat(task)
    }
  }

  const openCount = tasks.filter((task) => !isDone(task)).length

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-[18px] text-[13px] text-text-muted">
          {openCount} {x(M.tasks_open_label)}
        </div>
        <div className="flex flex-col gap-[10px]">
          {tasks.map((task) => {
            const done = isDone(task)
            const linked = linkedFor(task)
            const statusTone: Tone = done ? 'success' : task.blocked ? 'warning' : 'info'
            const statusLabel = done
              ? M.tasks_status_done
              : task.blocked
                ? M.tasks_status_blocked
                : M.tasks_status_open
            return (
              <div
                key={task.id}
                className="flex items-start gap-[12px] rounded-[11px] border border-border bg-surface px-[16px] py-[13px]"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task)}
                  aria-label={x(M.tasks_toggle_aria)}
                  aria-pressed={done}
                  className={`relative flex h-[19px] w-[19px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] after:absolute after:-inset-[13px] after:content-[''] ${
                    done ? 'border-none bg-ok-fg' : 'border-[1.5px] border-border bg-surface'
                  }`}
                >
                  {done && (
                    <Check size={13} strokeWidth={3} className="text-white" aria-hidden="true" />
                  )}
                </button>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openChat(task)}
                  onKeyDown={openChatOnKey(task)}
                  aria-label={x(M.tasks_open_chat_aria).replace('{title}', x(task.title))}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  {/* Deliberate deviation: the prototype's titleStyle says
                      var(--ink) — a border/frame tone that is near-invisible in
                      both themes (~1.5:1). Every sibling view titles rows in
                      var(--text); treated as a prototype typo. */}
                  <div
                    className={`text-[13.5px] font-semibold ${
                      done ? 'text-text-faint line-through' : 'text-text'
                    }`}
                  >
                    {x(task.title)}
                  </div>
                  <div className="mt-[3px] text-[12px] text-text-muted">
                    {x(task.due)} · {x(M.tasks_owner)}: {task.owner} · {x(task.jur)}
                  </div>
                  {linked && (
                    <div className="mt-[2px] text-[12px] text-text-muted">
                      {x(M.tasks_linked_prefix)}
                      {x(linked)}
                    </div>
                  )}
                  {task.blocked && (
                    <div className="mt-[4px] text-[12px] font-semibold text-warn-fg">
                      {x(task.blocked)}
                    </div>
                  )}
                  {task.evidence && (
                    <div className="mt-[4px] text-[12px] text-ok-fg">{x(task.evidence)}</div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-[6px]">
                  <span className={chipClass(statusTone)}>{x(statusLabel)}</span>
                  <span className={chipClass(taskPriorityTones[task.priority])}>
                    {x(taskPriorityLabels[task.priority])}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {tasks.length === 0 && (
          <div className="px-[20px] py-[48px] text-center text-text-muted">
            <div className="text-[14.5px] font-semibold text-text">{x(M.tasks_empty)}</div>
            <div className="mt-[4px] text-[13px]">{x(M.tasks_empty_sub)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
