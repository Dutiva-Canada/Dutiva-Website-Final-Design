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
 * ToastsProvider (it fires "draft ready" toasts). AuthProvider tracks the
 * Supabase session — both for features that read real backend data (e.g.
 * Knowledge's legal-sources panel) and, via RequireAdminSession wrapping
 * the /app route, as the actual gate keeping the workspace invite-only.
 * WorkspaceModeProvider reads that session to resolve the demo/production
 * toggle, so it must stay inside AuthProvider.
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
