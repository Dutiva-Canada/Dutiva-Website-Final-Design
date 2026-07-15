import { Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '@/i18n/context'
import { shellMessages } from '@/i18n/messages/shell'
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
 * Workspace shell — App v2 app frame. The prototype's Desktop/Tablet/Mobile
 * switcher is a prototype affordance; the same layouts come from breakpoints:
 *
 * - desktop ≥1024px — hover-expanding sidebar rail over a 64px spacer + topbar
 * - tablet 768–1023px — static collapsed rail + topbar
 * - mobile <768px — hamburger topbar, slide-in drawer + scrim, bottom tab nav
 */
type LayoutMode = 'desktop' | 'tablet' | 'mobile'

function currentLayoutMode(): LayoutMode {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop'
  if (window.matchMedia('(min-width: 768px)').matches) return 'tablet'
  return 'mobile'
}

/**
 * Keeps the mobile drawer mounted for the duration of its close transition
 * (`entered` drives the slide/fade; `mounted` gates whether it's in the DOM
 * at all) instead of snapping in/out with the raw `open` boolean.
 */
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

  /* Once the drawer mounts with its closed (off-screen/transparent)
     classes, force a synchronous layout flush before flipping to
     "entered" — otherwise React/the browser can coalesce both style
     states into a single paint and skip the transition. Reading
     `offsetHeight` (rather than requestAnimationFrame) works even when
     the tab is backgrounded, where rAF callbacks are throttled. */
  useLayoutEffect(() => {
    if (mounted && open) {
      // Force a synchronous layout read so React/the browser doesn't coalesce
      // the mount and entered styles into a single paint.
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

  /* The prototype closes the drawer on every navigation (`go()`). */
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const isMobile = layout === 'mobile'
  useEscapeToClose(isMobile && drawerOpen, () => setDrawerOpen(false))
  const { mounted: drawerMounted, entered: drawerEntered } = useDrawerTransition(
    isMobile && drawerOpen,
  )

  /* viewLabelFor titles the employee-profile route with the fixture person's
     name — in production mode that's demo data, so title by module instead. */
  const { mode: workspaceMode } = useWorkspaceMode()
  const title = x(
    workspaceMode === 'production' ? moduleLabelFor(pathname) : viewLabelFor(pathname),
  )

  return (
    <div className="surface-app flex h-screen flex-col overflow-hidden bg-bg font-sans text-text">
      {isMobile && <MobileTopbar title={title} onOpenDrawer={() => setDrawerOpen(true)} />}

      <div className="relative flex min-h-0 flex-1">
        {/* Desktop hover rail floats over a fixed 64px spacer. */}
        {layout === 'desktop' && <div className="w-[64px] shrink-0" />}
        {layout === 'desktop' && <Sidebar mode="hover" />}
        {layout === 'tablet' && <Sidebar mode="rail" />}
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
            <dialog open aria-modal="true" aria-label={x(shellMessages.shell_primary_nav)} className="m-0 h-full w-full max-w-full border-none bg-transparent p-0">
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
            {/* Boundary for the lazy view chunks — keeps the shell chrome up
                while a view loads. */}
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {isMobile && <MobileNav drawerOpen={drawerOpen} onOpenDrawer={() => setDrawerOpen(true)} />}

      {/* Overlay hosts — inside the .surface-app token scope. */}
      <SearchOverlay />
      <AdvisorRail />
      <DocStudioOverlay />
      <ToastHost />
    </div>
  )
}
