import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { isCurrentUserAdmin } from '@/features/support/supportAdminApi'
import type { WorkspaceIdentity } from '@/features/app/workspaceMode/workspaceModeContext'
import { SidebarTooltip } from './SidebarTooltip'
import { cx } from './cx'

interface SidebarFooterProps {
  readonly expanded: boolean
  readonly identity: WorkspaceIdentity
  readonly onNavigate?: () => void
}

export function SidebarFooter({ expanded, identity, onNavigate }: SidebarFooterProps) {
  const { x, L, lang } = useI18n()
  const navigate = useNavigate()
  const helpCentrePath = lang === 'fr' ? '/fr/aide' : '/help'
  const { pathname } = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true
    isCurrentUserAdmin()
      .then((admin) => {
        if (active) setIsAdmin(admin)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const settingsActive = pathname.startsWith('/app/settings')

  return (
    <div className="shrink-0 border-t border-border-soft px-[10px] pb-[10px]">
      <SidebarTooltip label={x(M.shell_nav_settings)} show={!expanded}>
        <Link
          to="/app/settings"
          onClick={onNavigate}
          aria-current={settingsActive ? 'page' : undefined}
          aria-label={expanded ? undefined : x(M.shell_nav_settings)}
          className={cx(
            'my-px flex w-full items-center gap-[10px] rounded-[7px] text-[13.5px] transition-colors duration-150',
            expanded ? 'px-[10px] py-[8px]' : 'justify-center p-[9px]',
            settingsActive
              ? 'border-l-2 border-accent bg-accent-soft font-semibold text-accent'
              : 'border-l-2 border-transparent font-medium text-text-2 hover:bg-inset hover:text-text',
          )}
        >
          <Settings size={16} strokeWidth={1.7} className="shrink-0" />
          <span
            aria-hidden={!expanded}
            className={cx(
              'overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-150 ease-in-out motion-reduce:transition-none',
              expanded
                ? 'max-w-[190px] translate-x-0 opacity-100 delay-75'
                : 'max-w-0 -translate-x-1 opacity-0',
            )}
          >
            {x(M.shell_nav_settings)}
          </span>
        </Link>
      </SidebarTooltip>

      <div className="relative mt-[4px]">
        <SidebarTooltip label={identity.user.name} show={!expanded}>
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label={
              expanded
                ? undefined
                : L(
                    `Account menu for ${identity.user.name}`,
                    `Menu du compte de ${identity.user.name}`,
                  )
            }
            aria-expanded={profileOpen}
            className={cx(
              'relative flex w-full cursor-pointer items-center gap-[9px] rounded-[8px] border-none text-text transition-colors duration-150',
              expanded ? 'px-[10px] py-[7px]' : 'justify-center p-[7px]',
              profileOpen ? 'bg-border-soft' : 'bg-transparent hover:bg-inset',
            )}
          >
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-navy text-[11.5px] font-bold text-gold-on-navy">
              {identity.user.initials}
            </div>
            {expanded && (
              <div className="min-w-0 text-left">
                <div className="truncate text-[13px] font-semibold">{identity.user.name}</div>
                <div className="text-[11px] text-text-muted">{x(identity.user.role)}</div>
              </div>
            )}
          </button>
        </SidebarTooltip>

        {profileOpen && (
          <div
            role="menu"
            aria-label={L('Account menu', 'Menu du compte')}
            className="absolute bottom-full left-0 z-60 mb-[6px] w-[200px] overflow-hidden rounded-[11px] border border-border bg-surface shadow-[0_16px_36px_rgba(27,36,48,0.2)]"
          >
            <div className="border-b border-border-soft px-[14px] py-[12px]">
              <div className="text-[13px] font-bold text-text">{identity.user.name}</div>
              <div className="text-[11.5px] text-text-muted">{identity.user.email}</div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileOpen(false)
                onNavigate?.()
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
                onNavigate?.()
                navigate(helpCentrePath)
              }}
              className="block w-full cursor-pointer border-none bg-transparent px-[14px] py-[10px] text-left text-[13px] text-text-2 hover:bg-inset"
            >
              {L('Help Centre', 'Centre d’aide')}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileOpen(false)
                onNavigate?.()
                navigate('/app/support')
              }}
              className="block w-full cursor-pointer border-none bg-transparent px-[14px] py-[10px] text-left text-[13px] text-text-2 hover:bg-inset"
            >
              {L('Contact support', 'Contacter le soutien')}
            </button>
            {isAdmin && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false)
                  onNavigate?.()
                  navigate('/app/support/admin')
                }}
                className="block w-full cursor-pointer border-none bg-transparent px-[14px] py-[10px] text-left text-[13px] text-text-2 hover:bg-inset"
              >
                {L('Support dashboard', 'Tableau de bord du soutien')}
              </button>
            )}
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
        <span
          aria-hidden={!expanded}
          className={cx(
            'overflow-hidden whitespace-nowrap text-[11px] tracking-[0.01em] text-text-faint transition-[max-width,opacity,transform] duration-150 ease-in-out motion-reduce:transition-none',
            expanded
              ? 'max-w-[150px] translate-x-0 opacity-100 delay-75'
              : 'max-w-0 -translate-x-1 opacity-0',
          )}
        >
          {x(M.shell_powered_by)} <span className="font-bold text-text-muted">Dutiva</span>
        </span>
      </div>

      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          className="fixed inset-0 z-55"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
