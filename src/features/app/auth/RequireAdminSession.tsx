import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { isVercelPreview } from '@/lib/deployEnv'
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
 *
 * Vercel *preview* deployments also skip the gate: those builds are private,
 * noindex, and used for internal review, so requiring a magic-link sign-in
 * just gets in the way. This is scoped to VERCEL_ENV === 'preview' — the
 * production deployment (VERCEL_ENV === 'production') always enforces the
 * gate below. Note this only opens the workspace UI; the real backend
 * (guidance/law tables, advisor-chat) stays protected server-side by RLS and
 * an explicit edge-function check, which no client flag can bypass.
 */
export function RequireAdminSession({ children }: { readonly children: ReactNode }) {
  const location = useLocation()
  const { status, session } = useAuth()

  if (!supabase) return children

  if (isVercelPreview()) return children

  if (status === 'loading') {
    return <div className="h-screen bg-bg" aria-hidden="true" />
  }

  const email = session?.user.email
  if (status === 'signed-in' && email && isAllowedSignInEmail(email)) {
    return children
  }

  return <Navigate to="/app/welcome" replace state={{ from: location }} />
}
