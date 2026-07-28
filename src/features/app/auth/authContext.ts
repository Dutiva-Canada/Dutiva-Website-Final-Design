import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

/**
 * Minimal auth context — scoped to what the real legal-sources feature and
 * the workspace's invite-only gate (RequireAdminSession) need: an
 * authenticated Supabase session for an invited account (the admin, or
 * anyone on the beta list — see the `current_user_is_workspace_member`
 * Postgres function, supabase/migrations/0026_open_workspace_to_beta_list.sql).
 * No org/tenant membership beyond that. See docs — this is deliberately
 * narrower than the eventual Auth + org/tenant + RLS foundation.
 */

export type AuthStatus = 'loading' | 'signed-out' | 'sent-link' | 'signed-in'

export interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  /**
   * Whether the signed-in session is invited into the workspace — null
   * while signed out, or while the membership check is still in flight
   * right after signing in (RequireAdminSession/EntryStage treat that as a
   * loading state, not "not authorized", so a legitimate session never
   * flashes the wrong screen).
   */
  authorized: boolean | null
  /**
   * Sends a magic-link email; resolves to an error message, or undefined on
   * success. Passwordless throughout — the sign-up tab passes `{ name }` so
   * the same OTP call carries a display name as user metadata; sign-in omits
   * it. No password/credential path.
   *
   * Sends the link to any syntactically valid address regardless of
   * workspace membership — checking membership first, client-side, would
   * mean answering "is this address on the beta list" for an address that
   * isn't necessarily the caller's own, which is exactly the oracle
   * create-beta-signup's duplicate-signup handling was built to avoid (see
   * that function's own comment). Ineligible sign-ins still get in only as
   * far as `/app/welcome`'s "not authorized" screen — the real boundary is
   * enforced server-side regardless (RLS, the edge-function checks).
   */
  signInWithEmail: (email: string, opts?: { name?: string }) => Promise<string | undefined>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
