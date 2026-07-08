import type { ReactNode } from 'react'
import { ToastsProvider } from './toasts/ToastsProvider'
import { RailProvider } from './rail/RailProvider'
import { SearchProvider } from './search/SearchProvider'

/**
 * Workspace-scoped providers. Overlay hosts (ToastHost, AdvisorRail,
 * SearchOverlay) are rendered by the AppShell so they sit inside the app
 * surface's token scope.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastsProvider>
      <RailProvider>
        <SearchProvider>{children}</SearchProvider>
      </RailProvider>
    </ToastsProvider>
  )
}
