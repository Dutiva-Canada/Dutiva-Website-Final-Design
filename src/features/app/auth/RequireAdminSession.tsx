import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './authContext'
import { isAllowedSignInEmail } from './allowedEmail'

/**
 * Gates the whole /app workspace behind a signed-in session for the one
 * allowed account (allowedEmail.ts) — the workspace used to double as a
 * public demo reachable by anyone; it's invite-only now. Unauthorized
 * visitors are sent to /app/welcome (the sign-in gate), carrying the
 * location they wanted so EntryStage can return them there after sign-in.
 *
 * Without Supabase configured (local dev, tests) there is no session to
 * check at all — this stays a no-op rather than locking the workspace out
 * of every environment that doesn't have real credentials, matching how
 * every other Supabase-backed feature here degrades to its signed-out
 * state instead of failing hard.
 */
export function RequireAdminSession({ children }: { readonly children: ReactNode }) {
  const location = useLocation()
  const { status, session } = useAuth()

  if (!supabase) return children

  if (status === 'loading') {
    return <div className="h-screen bg-bg" aria-hidden="true" />
  }

  const email = session?.user.email
  if (status === 'signed-in' && email && isAllowedSignInEmail(email)) {
    return children
  }

  return <Navigate to="/app/welcome" replace state={{ from: location }} />
}
