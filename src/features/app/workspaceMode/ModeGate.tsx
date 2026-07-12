import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '@/i18n/context'
import { moduleLabelFor } from '@/features/app/shell/navConfig'
import { useWorkspaceMode } from './workspaceModeContext'
import { ProductionEmptyState } from './ProductionEmptyState'

/**
 * Route-level gate for fixture-driven views: in demo mode it renders the
 * view unchanged; in production mode it renders the shared empty state,
 * titled with the module's own label (derived from the route, same source
 * as the topbar heading). Wrap a route's element in appViews.tsx — do NOT
 * thread mode conditionals through the view itself. When a module gains
 * real persistence, its gate comes off and the view handles both modes.
 */
export function ModeGate({ children }: { readonly children: ReactNode }) {
  const { mode } = useWorkspaceMode()
  const { pathname } = useLocation()
  const { x } = useI18n()

  if (mode === 'production') {
    return <ProductionEmptyState title={x(moduleLabelFor(pathname))} />
  }
  return children
}
