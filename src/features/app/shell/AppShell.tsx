import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '@/i18n/context'
import { shellMessages } from '@/i18n/messages/shell'
import { readPref, writePref } from '@/lib/prefs'
import { useEscapeToClose } from '@/lib/escapeStack'
import { SearchOverlay } from '@/features/app/search/SearchOverlay'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { DocStudioOverlay } from '@/features/app/docstudio/DocStudioOverlay'
import { ToastHost } from '@/features/app/toasts/ToastHost'
import { useWorkspaceMode } from '@/features/app/workspaceMode/workspaceModeContext'
import { Sidebar } from './Sidebar'
import { cx } from './cx'
import { Topbar } from './Topbar'
import { MobileNav, MobileTopbar } from './MobileNav'
import { ModuleContextBanner } from './ModuleContextBanner'
import { WorkspaceContextBanner } from './WorkspaceContextBanner'
import { moduleLabelFor, viewLabelFor } from './navConfig'

/**
 * Workspace shell — App v2 app frame.
 *
 * - desktop ≥1024px — expanded or compact sidebar, user toggled, persisted.
 * - tablet 768–1023px — compact sidebar.
 * - mobile <768px — hamburger topbar, slide-in drawer + scrim, bottom tab nav.
 */
type LayoutMode = 'desktop' | 'tablet' | 'mobile'

const SIDEBAR_EXPANDED_KEY = 'dutiva.sidebar.expanded.v1'

function currentLayoutMode(): LayoutMode {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
  if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
  return 'mobile'
}

function readExpandedPref(): boolean {
  return readPref(SIDEBAR_EXPANDED_KEY, 'true') === 'true'
}

function writeExpandedPref(value: boolean): void {
  writePref(SIDEBAR_EXPANDED_KEY, String(value))
}

function useDrawerTransition(open: boolean, duration = 220) {
  const [mounted, setMounted] = useState(open)
  const [entered, setEntered] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    setEntered(false)
    const timer = window.setTimeout(() => setMounted(false), duration)
    return () => window.clearTimeout(timer)
  }, [open, duration])

  useLayoutEffect(() => {
    if (mounted && open) {
      const reflow = document.body.offsetHeight
      if (reflow >= 0) setEntered(true)
    }
  }, [mounted, open])

  return { mounted, entered }
}

function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(currentLayoutMode)
  useEffect(() => {
    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 768px)'),
    ]
    const update = () => setMode(currentLayoutMode())
    queries.forEach((q) => q.addEventListener('change', update))
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])
  return mode
}

export function AppShell() {
  const { x } = useI18n()
  const layout = useLayoutMode()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(readExpandedPref)
  const drawerTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const previousDrawerOpen = useRef(drawerOpen)
  useEffect(() => {
    if (previousDrawerOpen.current && !drawerOpen) {
      drawerTriggerRef.current?.focus()
    }
    previousDrawerOpen.current = drawerOpen
  }, [drawerOpen])

  const isMobile = layout === 'mobile'
  useEscapeToClose(isMobile && drawerOpen, () => setDrawerOpen(false))
  const { mounted: drawerMounted, entered: drawerEntered } = useDrawerTransition(
    isMobile && drawerOpen,
  )

  const { mode: workspaceMode } = useWorkspaceMode()
  const title = x(
    workspaceMode === 'production' ? moduleLabelFor(pathname) : viewLabelFor(pathname),
  )

  const toggleSidebarExpanded = useCallback(() => {
    setSidebarExpanded((prev) => {
      const next = !prev
      writeExpandedPref(next)
      return next
    })
  }, [])

  const sidebarMode = isMobile
    ? 'drawer'
    : layout === 'tablet'
      ? 'compact'
      : sidebarExpanded
        ? 'expanded'
        : 'compact'

  return (
    <div className="surface-app flex h-screen flex-col overflow-hidden bg-bg font-sans text-text">
      {isMobile && (
        <MobileTopbar
          title={title}
          onOpenDrawer={() => setDrawerOpen(true)}
          triggerRef={drawerTriggerRef}
        />
      )}

      <div className="relative flex min-h-0 flex-1">
        {!isMobile && (
          <Sidebar
            mode={sidebarMode}
            onToggleExpanded={layout === 'desktop' ? toggleSidebarExpanded : undefined}
          />
        )}
        {isMobile && drawerMounted && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              className={cx(
                'fixed inset-0 z-60 bg-[rgba(20,25,32,0.4)] transition-opacity duration-220 ease-in-out',
                drawerEntered ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden="true"
            />
            <dialog
              open
              aria-modal="true"
              aria-label={x(shellMessages.shell_primary_nav)}
              className="m-0 h-full w-full max-w-full border-none bg-transparent p-0"
            >
              <Sidebar
                mode="drawer"
                onCloseDrawer={() => setDrawerOpen(false)}
                drawerEntered={drawerEntered}
              />
            </dialog>
          </>
        )}

        <main className="relative flex min-w-0 flex-1 flex-col bg-bg">
          {!isMobile && <Topbar title={title} />}
          <WorkspaceContextBanner />
          <ModuleContextBanner />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {isMobile && <MobileNav drawerOpen={drawerOpen} onOpenDrawer={() => setDrawerOpen(true)} />}

      <SearchOverlay />
      <AdvisorRail />
      <DocStudioOverlay />
      <ToastHost />
    </div>
  )
}
