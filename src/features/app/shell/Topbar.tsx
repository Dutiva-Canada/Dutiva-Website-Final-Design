import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, Sparkle } from 'lucide-react'
import type { Bi } from '@/i18n/core'
import { bi } from '@/i18n/core'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { useSearch } from '@/features/app/search/searchContext'
import {
  useAskAdvisorBriefing,
  railViewKeyFromPathname,
} from '@/features/app/rail/useAskAdvisorBriefing'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { workspaceModeMessages as WM } from '@/i18n/messages/workspaceMode'
import { AuthMenuButton } from '@/features/app/auth/AuthMenuButton'
import { LangToggle, ThemeToggle } from './ShellControls'
import { cx } from './cx'

/* Sample notifications — prototype `buildNotifications()` (FR from `frDict()`;
   '2 days ago' FR follows the prototype's 'Il y a N jours' pattern). Move to
   '@/data' once the data fixtures land. */
interface NotificationItem {
  id: string
  text: Bi
  time: Bi
  unread: boolean
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    text: bi(
      'Compliance: Remote Work Policy is overdue for review',
      'Conformité : la politique de télétravail est en retard pour révision',
    ),
    time: bi('1h ago', 'Il y a 1 h'),
    unread: true,
  },
  {
    id: 'n2',
    text: bi(
      'Document ready: Termination Letter — Jordan Mensah',
      'Document prêt : lettre de cessation d’emploi — Jordan Mensah',
    ),
    time: bi('2h ago', 'Il y a 2 h'),
    unread: true,
  },
  {
    id: 'n3',
    text: bi(
      'Task assigned: Accommodation review — Amara Okafor',
      'Tâche assignée : examen d’accommodement — Amara Okafor',
    ),
    time: bi('Yesterday', 'Hier'),
    unread: false,
  },
  {
    id: 'n4',
    text: bi('Priya Nair accepted her offer', 'Priya Nair a accepté son offre'),
    time: bi('2 days ago', 'Il y a 2 jours'),
    unread: false,
  },
]

/**
 * Sticky workspace topbar (desktop + tablet) — route title, "Ask Advisor"
 * (opens the contextual rail), EN/FR pill, theme toggle, global search
 * trigger, notifications popover.
 */
export function Topbar({ title }: { readonly title: string }) {
  const { x } = useI18n()
  const { openSearch } = useSearch()
  const askAdvisor = useAskAdvisorBriefing()
  const { pathname } = useLocation()

  const { mode } = useWorkspaceMode()
  const [demoNotifications, setDemoNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const [notifOpen, setNotifOpen] = useState(false)
  /* The sample notifications are demo fixtures — production starts with none. */
  const notifications = mode === 'production' ? [] : demoNotifications
  const hasUnread = notifications.some((n) => n.unread)
  const markAllRead = () =>
    setDemoNotifications((list) => list.map((n) => ({ ...n, unread: false })))

  /* The prototype hides "Ask Advisor" on the Advisor view itself. */
  const showAskAdvisor = !pathname.startsWith('/app/advisor')

  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-bg px-[22px]">
      <h1 className="m-0 font-display text-[18px] font-semibold text-text">{title}</h1>
      <div className="flex items-center gap-[14px]">
        {showAskAdvisor && (
          <button
            type="button"
            onClick={() => askAdvisor(railViewKeyFromPathname(pathname))}
            className="flex cursor-pointer items-center gap-[7px] rounded-[8px] border border-gold-border bg-gold-bg px-[14px] py-[8px] text-[13.5px] font-semibold whitespace-nowrap text-gold-fg"
          >
            <Sparkle size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {x(M.shell_ask_advisor)}
          </button>
        )}
        <LangToggle />
        <ThemeToggle
          className="flex cursor-pointer border-none bg-transparent p-[6px] text-text-3"
          iconSize={18}
        />
        <button
          type="button"
          onClick={openSearch}
          aria-label={x(M.shell_search)}
          className="cursor-pointer border-none bg-transparent p-[6px] text-text-3"
        >
          <Search size={18} strokeWidth={1.7} />
        </button>
        <AuthMenuButton />
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((open) => !open)}
            aria-label={x(M.shell_notifications)}
            aria-expanded={notifOpen}
            className="relative cursor-pointer border-none bg-transparent p-[6px] text-text-3"
          >
            <Bell size={18} strokeWidth={1.7} />
            {hasUnread && (
              <div className="absolute top-[5px] right-[6px] h-[7px] w-[7px] rounded-full border-[1.5px] border-bg bg-risk-dot" />
            )}
          </button>
          {notifOpen && (
            <>
              <div
                onClick={() => setNotifOpen(false)}
                className="fixed inset-0 z-190"
                aria-hidden="true"
              />
              <dialog
                open
                aria-label={x(M.shell_notifications)}
                className="absolute top-[38px] right-0 z-200 m-0 w-[340px] animate-[fadeInUp_.15s_ease] overflow-hidden rounded-[12px] border border-border bg-surface shadow-[0_16px_40px_rgba(27,36,48,0.18)]"
              >
                <div className="flex items-center justify-between border-b border-border-soft px-[14px] py-[12px]">
                  <span className="text-[13.5px] font-bold">{x(M.shell_notifications)}</span>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="cursor-pointer border-none bg-transparent text-[12.5px] font-semibold text-accent"
                  >
                    {x(M.shell_mark_all_read)}
                  </button>
                </div>
                <div className="max-h-[340px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-[14px] py-[18px] text-center text-[12.5px] text-text-muted">
                      {x(WM.wsmode_notifications_empty)}
                    </div>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cx(
                        'flex gap-[10px] border-b border-inset px-[14px] py-[11px]',
                        n.unread ? 'bg-surface-2' : 'bg-surface',
                      )}
                    >
                      <div
                        className={cx(
                          'mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full',
                          n.unread ? 'bg-gold-dot' : 'bg-transparent',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] leading-[1.4] text-text">{x(n.text)}</div>
                        <div className="mt-[2px] text-[11.5px] text-text-muted">{x(n.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </dialog>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
