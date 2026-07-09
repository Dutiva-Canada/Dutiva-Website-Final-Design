import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, Settings, X } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { useSearch } from '@/features/app/search/searchContext'
import type { NavBadgeTone, NavItem } from './navConfig'
import { NAV_GROUPS, WORKSPACE_NAME, WORKSPACE_USER, isNavActive } from './navConfig'
import { cx } from './cx'

/**
 * Workspace sidebar — App v2 `SidebarNav`.
 *
 * - `hover`  (desktop ≥1024px): 64px icon rail, absolutely positioned over a
 *   64px spacer; expands to 256px on hover (150ms leave delay, house easing).
 * - `rail`   (tablet 768–1023px): static collapsed 64px rail.
 * - `drawer` (mobile <768px): fixed slide-over, always expanded, with a close
 *   button. (The prototype renders the drawer from the same sidebar markup;
 *   expanded so the close button + workspace identity are usable.)
 */
export type SidebarMode = 'hover' | 'rail' | 'drawer'

const BADGE_CLASSES: Record<NavBadgeTone, string> = {
  gold: 'rounded-[9px] border border-gold-border bg-gold-bg px-[6px] py-[1px] text-[10px] font-bold text-gold-fg',
  neutral: 'rounded-[9px] bg-border-soft px-[6px] py-[1px] text-[10.5px] font-bold text-text-3',
  risk: 'rounded-[9px] bg-risk-dot px-[6px] py-[1px] text-[10.5px] font-bold text-white',
  warn: 'rounded-[9px] bg-warn-border px-[6px] py-[1px] text-[10.5px] font-bold text-warn-fg',
}

function NavLinkItem({
  item,
  expanded,
  active,
  onNavigate,
}: {
  item: NavItem
  expanded: boolean
  active: boolean
  onNavigate?: () => void
}) {
  const { x } = useI18n()
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-label={x(item.label)}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'my-[1px] flex w-full items-center gap-[10px] rounded-[7px] text-[13.5px]',
        expanded ? 'px-[10px] py-[8px]' : 'justify-center p-[9px]',
        active ? 'bg-accent-soft font-semibold text-accent' : 'font-medium text-text-2',
      )}
    >
      <Icon size={16} strokeWidth={1.7} className="shrink-0" />
      {expanded && (
        <>
          <span className={item.badge ? 'flex-1 text-left' : undefined}>{x(item.label)}</span>
          {item.badge && <span className={BADGE_CLASSES[item.badge.tone]}>{item.badge.value}</span>}
        </>
      )}
    </Link>
  )
}

export function Sidebar({
  mode,
  onCloseDrawer,
}: {
  mode: SidebarMode
  onCloseDrawer?: () => void
}) {
  const { x, L } = useI18n()
  const { openSearch } = useSearch()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  /* Hover-rail expansion with the prototype's 150ms leave delay. */
  const [hovered, setHovered] = useState(false)
  const leaveTimer = useRef<number | null>(null)
  const onMouseEnter = useCallback(() => {
    if (mode !== 'hover') return
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
    setHovered(true)
  }, [mode])
  const onMouseLeave = useCallback(() => {
    if (mode !== 'hover') return
    if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current)
    leaveTimer.current = window.setTimeout(() => {
      setHovered(false)
      leaveTimer.current = null
    }, 150)
  }, [mode])
  useEffect(
    () => () => {
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current)
    },
    [],
  )

  const [profileOpen, setProfileOpen] = useState(false)

  const expanded = mode === 'drawer' ? true : mode === 'hover' ? hovered : false
  const sidePad = expanded ? 'px-[10px]' : 'px-[8px]'

  const sectionHeading = (label: string) => (
    <div className="px-[10px] pt-[16px] pb-[6px] text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
      {label}
    </div>
  )

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cx(
        'flex h-full shrink-0 flex-col border-r border-border bg-inset',
        expanded ? 'w-[256px]' : 'w-[64px]',
        mode === 'hover' &&
          'absolute top-0 bottom-0 left-0 transition-[width,box-shadow] duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        mode === 'hover' &&
          (expanded ? 'z-40 shadow-[8px_0_28px_rgba(0,0,0,0.28)]' : 'z-[5] shadow-none'),
        mode === 'rail' && 'relative z-[1]',
        mode === 'drawer' &&
          'fixed top-0 bottom-0 left-0 z-[70] shadow-[8px_0_30px_rgba(0,0,0,0.15)]',
      )}
    >
      {/* Workspace header */}
      <div
        className={cx(
          'flex shrink-0 items-center gap-[9px] pt-[16px] pb-[12px]',
          expanded ? 'px-[14px]' : 'px-[8px]',
        )}
      >
        <div className="h-[30px] w-[30px] shrink-0">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-navy text-[14px] font-bold text-[#F2D9A8]">
            N
          </div>
        </div>
        {expanded && (
          <div className="min-w-0">
            <div className="truncate text-[14px] leading-[1.2] font-bold text-text">
              {WORKSPACE_NAME}
            </div>
            <div className="truncate text-[11px] text-text-muted">{x(M.shell_hr_workspace)}</div>
          </div>
        )}
        {mode === 'drawer' && (
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label={x(M.shell_close_menu)}
            className="ml-auto cursor-pointer border-none bg-transparent p-[4px]"
          >
            <X size={18} strokeWidth={1.8} className="text-text-3" />
          </button>
        )}
      </div>

      {/* New conversation + search */}
      <div className={cx('pb-[10px]', sidePad)}>
        <Link
          to="/app/advisor"
          /* Prototype newChatClicked: always reset to the fresh empty state,
             even when the Advisor view is already open on a thread. */
          state={{ newConversation: true }}
          onClick={onCloseDrawer}
          aria-label={x(M.shell_new_conversation)}
          className={cx(
            'mb-[6px] flex w-full items-center gap-[8px] rounded-[8px] bg-navy text-[13.5px] font-semibold text-white',
            expanded ? 'px-[12px] py-[9px]' : 'justify-center p-[9px]',
          )}
        >
          <Plus size={15} strokeWidth={2} className="shrink-0" />
          {expanded && <span>{x(M.shell_new_conversation)}</span>}
        </Link>
        <button
          type="button"
          onClick={openSearch}
          aria-label={x(M.shell_search)}
          className={cx(
            'mb-[4px] flex w-full cursor-pointer items-center gap-[8px] rounded-[8px] border border-border bg-transparent text-[13px] font-medium text-text-3',
            expanded ? 'px-[12px] py-[8px]' : 'justify-center p-[8px]',
          )}
        >
          <Search size={15} strokeWidth={1.8} className="shrink-0" />
          {expanded && (
            <>
              <span className="flex-1 text-left">{x(M.shell_search)}</span>
              <span className="rounded-[4px] border border-border px-[5px] py-[1px] text-[11px] text-text-faint">
                ⌘K
              </span>
            </>
          )}
        </button>
      </div>

      {/* Grouped nav */}
      <nav
        aria-label={x(M.shell_primary_nav)}
        className={cx('flex-1 overflow-y-auto pb-[12px]', sidePad)}
      >
        {NAV_GROUPS.map((group, i) => (
          <div key={group.heading ? group.heading.en : `group-${i}`}>
            {group.heading && expanded && sectionHeading(x(group.heading))}
            {group.items.map((item) => (
              <NavLinkItem
                key={item.key}
                item={item}
                expanded={expanded}
                active={isNavActive(item.to, pathname)}
                onNavigate={onCloseDrawer}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: settings, account, powered-by */}
      <div className={cx('shrink-0 border-t border-border-soft pb-[10px]', sidePad)}>
        <NavLinkItem
          item={{
            key: 'settings',
            to: '/app/settings',
            icon: Settings,
            label: M.shell_nav_settings,
          }}
          expanded={expanded}
          active={isNavActive('/app/settings', pathname)}
          onNavigate={onCloseDrawer}
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label={L(
              `Account menu for ${WORKSPACE_USER.name}`,
              `Menu du compte de ${WORKSPACE_USER.name}`,
            )}
            aria-expanded={profileOpen}
            className={cx(
              'relative mt-[4px] flex w-full cursor-pointer items-center gap-[9px] rounded-[8px] border-none text-text',
              expanded ? 'px-[10px] py-[7px]' : 'justify-center p-[7px]',
              profileOpen ? 'bg-border-soft' : 'bg-transparent',
            )}
          >
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-navy text-[11.5px] font-bold text-[#F2D9A8]">
              {WORKSPACE_USER.initials}
            </div>
            {expanded && (
              <div className="min-w-0 text-left">
                <div className="truncate text-[13px] font-semibold">{WORKSPACE_USER.name}</div>
                <div className="text-[11px] text-text-muted">{x(WORKSPACE_USER.role)}</div>
              </div>
            )}
          </button>
          {profileOpen && (
            <div
              role="menu"
              aria-label={L('Account menu', 'Menu du compte')}
              className="absolute bottom-full left-0 z-[60] mb-[6px] w-[200px] overflow-hidden rounded-[11px] border border-border bg-surface shadow-[0_16px_36px_rgba(27,36,48,0.2)]"
            >
              <div className="border-b border-border-soft px-[14px] py-[12px]">
                <div className="text-[13px] font-bold text-text">{WORKSPACE_USER.name}</div>
                <div className="text-[11.5px] text-text-muted">{WORKSPACE_USER.email}</div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false)
                  onCloseDrawer?.()
                  navigate('/app/settings')
                }}
                className="block w-full cursor-pointer border-none bg-transparent px-[14px] py-[10px] text-left text-[13px] text-text-2 hover:bg-inset"
              >
                {x(M.shell_nav_settings)}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/app/welcome')
                }}
                className="block w-full cursor-pointer border-none bg-transparent px-[14px] py-[10px] text-left text-[13px] text-risk-dot hover:bg-risk-bg"
              >
                {x(M.shell_sign_out)}
              </button>
            </div>
          )}
        </div>

        <div
          className={cx(
            'mt-[8px] flex items-center gap-[7px] border-t border-border-soft px-[6px] pt-[12px] pb-[2px]',
            expanded ? 'justify-start' : 'justify-center',
          )}
        >
          <div className="flex h-[19px] w-[19px] shrink-0 items-center justify-center">
            <img
              src="/brand/dutiva-leaf.png"
              alt="Dutiva"
              className="block h-[15px] w-auto"
              style={{ filter: 'var(--logo-glow)' }}
            />
          </div>
          {expanded && (
            <span className="text-[11px] tracking-[0.01em] text-text-faint">
              {x(M.shell_powered_by)} <span className="font-bold text-text-muted">Dutiva</span>
            </span>
          )}
        </div>
      </div>

      {/* Click-away for the account menu */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          className="fixed inset-0 z-[55]"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
