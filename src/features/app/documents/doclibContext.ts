import { createContext, useContext } from 'react'
import type { DoclibData } from './api'
import type { OrgProfile, WorkspaceRole } from './data'

/**
 * Feature-scoped state: the loaded catalogue, the demo "Viewing as" role
 * (prototype-only permission demo control — real auth is out of scope for
 * this phase), and the editable org compliance profile that drives the
 * applicability engine live.
 */
export interface DoclibContextValue {
  /** null while the catalogue is loading (screens render skeletons). */
  data: DoclibData | null
  role: WorkspaceRole
  setRole: (role: WorkspaceRole) => void
  org: OrgProfile
  setOrg: (org: OrgProfile) => void
}

export const DoclibContext = createContext<DoclibContextValue | null>(null)

export function useDoclib(): DoclibContextValue {
  const ctx = useContext(DoclibContext)
  if (!ctx) throw new Error('useDoclib must be used within DoclibProvider')
  return ctx
}
