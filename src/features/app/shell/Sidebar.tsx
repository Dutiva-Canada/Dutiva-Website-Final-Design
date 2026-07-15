import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { readPref, writePref } from '@/lib/prefs'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { useProductionNavBadges } from '@/features/app/workspaceMode/useProductionNavBadges'
import type { NavGroup, NavItem } from './navConfig'
import { NAV_GROUPS, isNavActive } from './navConfig'
import { cx } from './cx'
import { SidebarCollapseButton } from './SidebarCollapseButton'
import { SidebarCreateMenu } from './SidebarCreateMenu'
import { SidebarFooter } from './SidebarFooter'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarSearch } from './SidebarSearch'
import { SidebarSection } from './SidebarSection'

export type SidebarMode = 'expanded' | 'compact' | 'drawer'

const SECTION_KEYS = ['records', 'programs', 'insights'] as const
type SectionKey = (typeof SECTION_KEYS)[number]

const SECTION_PREFS_KEY = 'dutiva.sidebar.sections.v1'
const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  records: true,
  programs: true,
  insights: false,
}

const EXPANDED_WIDTH = 'w-[292px]'
const COMPACT_WIDTH = 'w-[64px]'

function readSectionPrefs(): Record<SectionKey, boolean> {
  try {
    const raw = readPref(SECTION_PREFS_KEY, '')
    if (!raw) return DEFAULT_SECTIONS
    const parsed = JSON.parse(raw) as Partial<Record<SectionKey, boolean>>
    return { ...DEFAULT_SECTIONS, ...parsed }
  } catch {
    return DEFAULT_SECTIONS
  }
}

function writeSectionPrefs(state: Record<SectionKey, boolean>): void {
  try {
    writePref(SECTION_PREFS_KEY, JSON.stringify(state))
  } catch {
    /* best effort */
  }
}

function activeGroupIndex(pathname: string): number | null {
  for (let i = 0; i < NAV_GROUPS.length; i += 1) {
    const group = NAV_GROUPS[i]
    if (!group || !group.heading) continue
    for (const item of group.items) {
      if (item.isActive ? item.isActive(pathname) : isNavActive(item.to, pathname)) {
        return i
      }
    }
  }
  return null
}

function isActiveItem(item: NavItem, pathname: string): boolean {
  return item.isActive ? item.isActive(pathname) : isNavActive(item.to, pathname)
}

function sidebarClasses(mode: SidebarMode, drawerEntered: boolean) {
  const expanded = mode === 'expanded' || mode === 'drawer'
  return cx(
    'flex h-full shrink-0 flex-col border-r border-border bg-inset',
    expanded ? EXPANDED_WIDTH : COMPACT_WIDTH,
    mode === 'compact' && 'relative z-1',
    mode === 'drawer' &&
      'fixed top-0 bottom-0 left-0 z-70 shadow-[8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-220 ease-in-out',
    mode === 'drawer' && (drawerEntered ? 'translate-x-0' : '-translate-x-full'),
  )
}

interface SidebarProps {
  mode: SidebarMode
  onCloseDrawer?: () => void
  drawerEntered?: boolean
  onToggleExpanded?: () => void
}

export function Sidebar({
  mode,
  onCloseDrawer,
  drawerEntered = true,
  onToggleExpanded,
}: SidebarProps) {
  const { x } = useI18n()
  const { pathname } = useLocation()
  const { identity, mode: workspaceMode } = useWorkspaceMode()
  const productionBadges = useProductionNavBadges()
  const expanded = mode === 'expanded' || mode === 'drawer'

  const [sections, setSections] = useState<Record<SectionKey, boolean>>(readSectionPrefs)
  const activeGroup = useMemo(() => activeGroupIndex(pathname), [pathname])

  const toggleSection = useCallback((key: SectionKey) => {
    setSections((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      writeSectionPrefs(next)
      return next
    })
  }, [])

  const effectiveSections = useMemo(() => {
    const next = { ...sections }
    if (activeGroup !== null) {
      const key = SECTION_KEYS[activeGroup - 1]
      if (key) next[key] = true
    }
    return next
  }, [sections, activeGroup])

  useEffect(() => {
    if (mode !== 'drawer') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const aside = document.querySelector('aside[aria-label]')
      if (!aside) return
      const focusables = Array.from(
        aside.querySelectorAll<HTMLElement>('a, button, input, select, textarea'),
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  const renderGroupItems = (group: NavGroup) =>
    group.items.map((item) => {
      const itemWithBadge =
        workspaceMode === 'production' ? { ...item, badge: productionBadges[item.key] } : item
      return (
        <SidebarNavItem
          key={item.key}
          item={itemWithBadge}
          expanded={expanded}
          active={isActiveItem(item, pathname)}
          onClick={onCloseDrawer}
        />
      )
    })

  return (
    <aside aria-label={x(M.shell_primary_nav)} className={sidebarClasses(mode, drawerEntered)}>
      <div className="flex shrink-0 flex-col px-[10px] pb-[8px] pt-[8px]">
        <SidebarHeader
          expanded={expanded}
          inDrawer={mode === 'drawer'}
          identity={identity}
          onCloseDrawer={onCloseDrawer}
        />
        <div className={cx('flex gap-[8px]', expanded ? 'flex-col' : 'flex-col items-center')}>
          <SidebarCreateMenu expanded={expanded} onNavigate={onCloseDrawer} />
          <SidebarSearch expanded={expanded} />
        </div>
      </div>

      <nav
        aria-label={x(M.shell_primary_nav)}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[10px] pb-[8px]"
      >
        {NAV_GROUPS.map((group, i) => {
          const isWorkspace = group.heading === null
          if (isWorkspace) {
            return (
              <div key="workspace" className="flex flex-col">
                {renderGroupItems(group)}
              </div>
            )
          }
          const key = SECTION_KEYS[i - 1]
          if (!key || !group.heading) return null
          const heading = x(group.heading)
          return (
            <SidebarSection
              key={key}
              id={key}
              heading={heading}
              expanded={expanded}
              open={!!effectiveSections[key]}
              onToggle={() => toggleSection(key)}
            >
              {renderGroupItems(group)}
            </SidebarSection>
          )
        })}
      </nav>

      <div className="flex shrink-0 flex-col border-t border-border-soft px-[10px] pt-[8px] pb-[10px]">
        {mode !== 'drawer' && onToggleExpanded && (
          <SidebarCollapseButton expanded={expanded} onToggle={onToggleExpanded} />
        )}
        <SidebarFooter expanded={expanded} identity={identity} onNavigate={onCloseDrawer} />
      </div>
    </aside>
  )
}
