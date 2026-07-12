import { createContext, useContext } from 'react'
import type { Bi } from '@/i18n/core'

export type WorkspaceMode = 'demo' | 'production'

export interface WorkspaceIdentity {
  companyName: string
  /** Real operating region — set only on the production identity (from `profiles`). */
  province?: string
  city?: string
  user: {
    name: string
    initials: string
    role: Bi
    email: string
  }
}

export interface WorkspaceModeContextValue {
  mode: WorkspaceMode
  /** True only for a signed-in, confirmed admin (the real is_admin_user() RPC). */
  isAdmin: boolean
  /** Northgate Logistics Inc. fixture identity in demo; the admin's real profile in production. */
  identity: WorkspaceIdentity
  /** No-op for non-admins — the toggle is only ever rendered for isAdmin. */
  setMode: (mode: WorkspaceMode) => Promise<void>
}

export const WorkspaceModeContext = createContext<WorkspaceModeContextValue | null>(null)

export function useWorkspaceMode(): WorkspaceModeContextValue {
  const ctx = useContext(WorkspaceModeContext)
  if (!ctx) throw new Error('useWorkspaceMode must be used within WorkspaceModeProvider')
  return ctx
}
