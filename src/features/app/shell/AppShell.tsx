import { Suspense, useEffect, useState } from 'react'
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
        {isMobile && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-[rgba(20,25,32,0.4)]"
              aria-hidden="true"
            />
            <div role="dialog" aria-modal="true" aria-label={x(shellMessages.shell_primary_nav)}>
              <Sidebar mode="drawer" onCloseDrawer={() => setDrawerOpen(false)} />
            </div>
          </>
        )}

        <div className="relative flex min-w-0 flex-1 flex-col bg-bg">
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
        </div>
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
