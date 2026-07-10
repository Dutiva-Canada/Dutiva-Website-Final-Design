import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { loadDoclibData } from './api'
import type { DoclibData } from './api'
import { defaultOrgProfile } from './data'
import type { OrgProfile, WorkspaceRole } from './data'
import { DoclibContext } from './doclibContext'

const ROLE_KEY = 'dutiva-doclib-role'

function initialRole(): WorkspaceRole {
  try {
    const stored = sessionStorage.getItem(ROLE_KEY)
    if (
      stored === 'owner' ||
      stored === 'hr' ||
      stored === 'manager' ||
      stored === 'viewer' ||
      stored === 'external'
    )
      return stored
  } catch {
    /* sessionStorage unavailable */
  }
  return 'hr'
}

export function DoclibProvider({ children }: { readonly children: ReactNode }) {
  const [data, setData] = useState<DoclibData | null>(null)
  const [role, setRoleState] = useState<WorkspaceRole>(initialRole)
  const [org, setOrg] = useState<OrgProfile>(defaultOrgProfile)

  useEffect(() => {
    let cancelled = false
    void loadDoclibData().then((loaded) => {
      if (!cancelled) setData(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      data,
      role,
      setRole: (next: WorkspaceRole) => {
        setRoleState(next)
        try {
          sessionStorage.setItem(ROLE_KEY, next)
        } catch {
          /* non-fatal */
        }
      },
      org,
      setOrg,
    }),
    [data, role, org],
  )

  return <DoclibContext.Provider value={value}>{children}</DoclibContext.Provider>
}

export type { DoclibData }
