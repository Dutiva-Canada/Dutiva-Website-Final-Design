import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Briefcase, House, ListChecks, Menu, Search, Star } from 'lucide-react'
import type { Bi } from '@/i18n/core'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { useSearch } from '@/features/app/search/searchContext'
import { AuthMenuButton } from '@/features/app/auth/AuthMenuButton'
import { ThemeToggle } from './ShellControls'
import { cx } from './cx'
import { isNavActive } from './navConfig'

/**
 * Mobile (<768px) chrome — App v2 `showMobileTopbar` bar and the bottom
 * compact nav (`isMobileFrame` footer): Home · Case Files · Ask (raised navy
 * star) · Tasks · More.
 */

export function MobileTopbar({ title, onOpenDrawer }: { title: string; onOpenDrawer: () => void }) {
  const { x } = useI18n()
  const { openSearch } = useSearch()
  return (
    <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-border bg-surface px-[14px]">
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label={x(M.shell_open_menu)}
        className="cursor-pointer border-none bg-transparent p-[6px]"
      >
        <Menu size={20} strokeWidth={1.8} className="text-text" />
      </button>
      <span className="font-display text-[16px] font-semibold">{title}</span>
      <div className="flex items-center gap-[2px]">
        <ThemeToggle
          className="flex cursor-pointer border-none bg-transparent p-[6px] text-text"
          iconSize={18}
        />
        <button
          type="button"
          onClick={openSearch}
          aria-label={x(M.shell_search)}
          className="cursor-pointer border-none bg-transparent p-[6px]"
        >
          <Search size={19} strokeWidth={1.8} className="text-text" />
        </button>
        <AuthMenuButton compact />
      </div>
    </div>
  )
}

function MobileTab({
  to,
  icon,
  label,
  active,
}: {
  to: string
  icon: ReactNode
  label: Bi
  active: boolean
}) {
  const { x } = useI18n()
  return (
    <Link
      to={to}
      aria-label={x(label)}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'relative flex flex-1 flex-col items-center gap-[3px] pt-[7px] pb-[6px] text-[10px] font-semibold',
        active ? 'text-accent' : 'text-text-muted',
      )}
    >
      {icon}
      <span>{x(label)}</span>
    </Link>
  )
}

export function MobileNav({
  drawerOpen,
  onOpenDrawer,
}: {
  drawerOpen: boolean
  onOpenDrawer: () => void
}) {
  const { x } = useI18n()
  const { pathname } = useLocation()
  return (
    <nav
      aria-label={x(M.shell_primary_nav)}
      className="relative z-50 flex shrink-0 items-end justify-around border-t border-border bg-surface px-[4px] pb-[5px]"
    >
      <MobileTab
        to="/app/home"
        icon={<House size={21} strokeWidth={1.8} />}
        label={M.shell_tab_home}
        active={isNavActive('/app/home', pathname)}
      />
      <MobileTab
        to="/app/cases"
        icon={<Briefcase size={21} strokeWidth={1.8} />}
        label={M.shell_nav_cases}
        active={isNavActive('/app/cases', pathname)}
      />
      <Link
        to="/app/advisor"
        state={{ newConversation: true }}
        aria-label={x(M.shell_ask_advisor)}
        className="flex flex-none flex-col items-center gap-[3px] px-[4px]"
      >
        <span className="mt-[-16px] flex h-[50px] w-[50px] items-center justify-center rounded-full border-[3px] border-surface bg-navy shadow-[0_6px_18px_-4px_rgba(31,58,95,0.5)]">
          <Star size={22} strokeWidth={0} fill="#F2D9A8" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-semibold text-accent">{x(M.shell_tab_ask)}</span>
      </Link>
      <MobileTab
        to="/app/tasks"
        icon={<ListChecks size={21} strokeWidth={1.8} />}
        label={M.shell_nav_tasks}
        active={isNavActive('/app/tasks', pathname)}
      />
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label={x(M.shell_tab_more)}
        aria-expanded={drawerOpen}
        className={cx(
          'relative flex flex-1 cursor-pointer flex-col items-center gap-[3px] border-none bg-transparent pt-[7px] pb-[6px] text-[10px] font-semibold',
          drawerOpen ? 'text-accent' : 'text-text-muted',
        )}
      >
        <Menu size={21} strokeWidth={1.8} />
        <span>{x(M.shell_tab_more)}</span>
      </button>
    </nav>
  )
}
