import type { ReactNode } from 'react'
import { ToastsProvider } from './toasts/ToastsProvider'
import { RailProvider } from './rail/RailProvider'
import { SearchProvider } from './search/SearchProvider'
import { DocStudioProvider } from './docstudio/DocStudioProvider'
import { WorkspaceContextProvider } from './workspaceContext/WorkspaceContextProvider'
import { AuthProvider } from './auth/AuthProvider'
import { WorkspaceModeProvider } from './workspaceMode/WorkspaceModeProvider'

/**
 * Workspace-scoped providers. Overlay hosts (ToastHost, AdvisorRail,
 * SearchOverlay, DocStudioOverlay) are rendered by the AppShell so they sit
 * inside the app surface's token scope. DocStudioProvider must stay inside
 * ToastsProvider (it fires "draft ready" toasts). AuthProvider is
 * independent of the rest — it only tracks a Supabase session for features
 * that read real backend data (e.g. Knowledge's legal-sources panel); it
 * does not gate any route. WorkspaceModeProvider reads that session to
 * resolve the demo/production toggle, so it must stay inside AuthProvider.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WorkspaceModeProvider>
        <ToastsProvider>
          <RailProvider>
            <SearchProvider>
              <DocStudioProvider>
                <WorkspaceContextProvider>{children}</WorkspaceContextProvider>
              </DocStudioProvider>
            </SearchProvider>
          </RailProvider>
        </ToastsProvider>
      </WorkspaceModeProvider>
    </AuthProvider>
  )
}
