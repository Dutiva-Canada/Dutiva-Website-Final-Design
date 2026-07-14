import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

/**
 * Minimal auth context — scoped to what the real legal-sources feature and
 * the workspace's invite-only gate (RequireAdminSession) need: an
 * authenticated Supabase session for the one allowed account
 * (allowedEmail.ts). No org/tenant membership beyond that. See docs — this
 * is deliberately narrower than the eventual Auth + org/tenant + RLS
 * foundation.
 */

export type AuthStatus = 'loading' | 'signed-out' | 'sent-link' | 'signed-in'

export interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  /** Sends a magic-link email; resolves to an error message, or undefined on success. */
  signInWithEmail: (email: string) => Promise<string | undefined>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
