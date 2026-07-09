import type { ReactNode } from 'react'
import { ToastsProvider } from './toasts/ToastsProvider'
import { RailProvider } from './rail/RailProvider'
import { SearchProvider } from './search/SearchProvider'
import { DocStudioProvider } from './docstudio/DocStudioProvider'
import { WorkspaceContextProvider } from './workspaceContext/WorkspaceContextProvider'

/**
 * Workspace-scoped providers. Overlay hosts (ToastHost, AdvisorRail,
 * SearchOverlay, DocStudioOverlay) are rendered by the AppShell so they sit
 * inside the app surface's token scope. DocStudioProvider must stay inside
 * ToastsProvider (it fires "draft ready" toasts).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastsProvider>
      <RailProvider>
        <SearchProvider>
          <DocStudioProvider>
            <WorkspaceContextProvider>{children}</WorkspaceContextProvider>
          </DocStudioProvider>
        </SearchProvider>
      </RailProvider>
    </ToastsProvider>
  )
}
