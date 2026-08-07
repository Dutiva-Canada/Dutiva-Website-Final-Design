import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { bi } from '@/i18n/core'
import { WORKSPACE_NAME, WORKSPACE_USER } from '@/features/app/shell/navConfig'
import { useAuth } from '@/features/app/auth/authContext'
import {
  bootstrapOrganization,
  checkIsAdmin,
  fetchAdminProfile,
  fetchOrganizationMembership,
  fetchStoredMode,
  saveStoredMode,
} from './api'
import { WorkspaceModeContext } from './workspaceModeContext'
import type { WorkspaceIdentity, WorkspaceMode } from './workspaceModeContext'
import type { OrgMemberRole } from './roles'
import { isAdminRole } from './roles'

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
  organizationId: string | null
  memberRole: OrgMemberRole | null
}

const SIGNED_OUT_STATE: AdminState = {
  isAdmin: false,
  storedMode: 'demo',
  identity: null,
  organizationId: null,
  memberRole: null,
}

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

      const [storedMode, profile, membership] = await Promise.all([
        fetchStoredMode(userId),
        fetchAdminProfile(userId),
        fetchOrganizationMembership(userId),
      ])
      if (cancelled) return

      const companyName = profile?.companyName ?? 'Dutiva Canada Inc.'
      /* An admin already in production without an org (e.g. the preference
         predates the org feature) gets provisioned on load; otherwise the
         org is created the first time they switch (see setMode). The RPC
         inserts the caller as the org's active owner. */
      let organizationId = membership?.organizationId ?? null
      let memberRole = membership?.role ?? null
      if (storedMode === 'production' && organizationId === null) {
        organizationId = await bootstrapOrganization(companyName, companyName)
        if (organizationId !== null) memberRole = 'owner'
        if (cancelled) return
      }

      const contactName = profile?.contactName ?? 'Martin Constantineau'
      setAdmin({
        isAdmin: true,
        storedMode,
        organizationId,
        memberRole,
        identity: {
          companyName,
          province: profile?.province ?? 'Ontario',
          city: profile?.city ?? 'Ottawa',
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
      /* First switch to production provisions the real organization (the
         RPC also inserts the caller as its active owner). */
      let organizationId = admin.organizationId
      let memberRole = admin.memberRole
      if (next === 'production' && organizationId === null) {
        const companyName = admin.identity?.companyName ?? 'Dutiva Canada Inc.'
        organizationId = await bootstrapOrganization(companyName, companyName)
        if (organizationId !== null) memberRole = 'owner'
      }
      setAdmin((prev) => ({ ...prev, storedMode: next, organizationId, memberRole }))
    },
    [admin.isAdmin, admin.organizationId, admin.memberRole, admin.identity, session],
  )

  const value = useMemo(() => {
    const mode: WorkspaceMode =
      admin.isAdmin && admin.storedMode === 'production' ? 'production' : 'demo'
    const memberRole = mode === 'production' ? admin.memberRole : null
    return {
      mode,
      isAdmin: admin.isAdmin,
      identity: mode === 'production' && admin.identity ? admin.identity : DEMO_IDENTITY,
      organizationId: mode === 'production' ? admin.organizationId : null,
      memberRole,
      /* Mirrors RLS's is_org_admin: platform admin, or owner/admin role. */
      isOrgAdmin: mode === 'production' && (admin.isAdmin || isAdminRole(memberRole)),
      setMode,
    }
  }, [admin, setMode])

  return <WorkspaceModeContext.Provider value={value}>{children}</WorkspaceModeContext.Provider>
}
