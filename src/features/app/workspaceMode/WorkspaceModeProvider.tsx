import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { bi } from '@/i18n/core'
import { WORKSPACE_NAME, WORKSPACE_USER } from '@/features/app/shell/navConfig'
import { useAuth } from '@/features/app/auth/authContext'
import { checkIsAdmin, fetchAdminProfile, fetchStoredMode, saveStoredMode } from './api'
import { WorkspaceModeContext } from './workspaceModeContext'
import type { WorkspaceIdentity, WorkspaceMode } from './workspaceModeContext'

const DEMO_IDENTITY: WorkspaceIdentity = { companyName: WORKSPACE_NAME, user: WORKSPACE_USER }

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

interface AdminState {
  isAdmin: boolean
  storedMode: WorkspaceMode
  identity: WorkspaceIdentity | null
}

const SIGNED_OUT_STATE: AdminState = { isAdmin: false, storedMode: 'demo', identity: null }

/**
 * Resolves the workspace mode: 'production' only for a signed-in, confirmed
 * admin (today: just Martin) who has explicitly stored that preference.
 * Every other case — signed out, non-admin, Supabase not configured, or
 * still resolving — stays 'demo', identical to today's behaviour, so this
 * is safe to add without a route guard or affecting any other visitor.
 */
export function WorkspaceModeProvider({ children }: { readonly children: ReactNode }) {
  const { status, session } = useAuth()
  const [admin, setAdmin] = useState<AdminState>(SIGNED_OUT_STATE)

  useEffect(() => {
    if (status !== 'signed-in' || !session) {
      setAdmin(SIGNED_OUT_STATE)
      return
    }
    const userId = session.user.id
    const email = session.user.email ?? ''
    let cancelled = false

    async function load() {
      const isAdmin = await checkIsAdmin()
      if (cancelled) return
      if (!isAdmin) {
        setAdmin(SIGNED_OUT_STATE)
        return
      }

      const [storedMode, profile] = await Promise.all([
        fetchStoredMode(userId),
        fetchAdminProfile(userId),
      ])
      if (cancelled) return

      const contactName = profile?.contactName ?? 'Martin Constantineau'
      setAdmin({
        isAdmin: true,
        storedMode,
        identity: {
          companyName: profile?.companyName ?? 'Dutiva Canada Inc.',
          user: {
            name: contactName,
            initials: initialsOf(contactName),
            role: bi('Admin', 'Administrateur'),
            email,
          },
        },
      })
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [status, session])

  const setMode = useCallback(
    async (next: WorkspaceMode) => {
      if (!admin.isAdmin || !session) return
      const ok = await saveStoredMode(session.user.id, next)
      if (!ok) return
      setAdmin((prev) => ({ ...prev, storedMode: next }))
    },
    [admin.isAdmin, session],
  )

  const value = useMemo(() => {
    const mode: WorkspaceMode = admin.isAdmin && admin.storedMode === 'production' ? 'production' : 'demo'
    return {
      mode,
      isAdmin: admin.isAdmin,
      identity: mode === 'production' && admin.identity ? admin.identity : DEMO_IDENTITY,
      setMode,
    }
  }, [admin, setMode])

  return <WorkspaceModeContext.Provider value={value}>{children}</WorkspaceModeContext.Provider>
}
