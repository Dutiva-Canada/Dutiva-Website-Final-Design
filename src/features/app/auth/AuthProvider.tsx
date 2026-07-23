import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useI18n } from '@/i18n/context'
import { authMessages as M } from '@/i18n/messages/auth'
import { supabase } from '@/lib/supabaseClient'
import { AuthContext } from './authContext'
import type { AuthStatus } from './authContext'
import { isAllowedSignInEmail } from './allowedEmail'

/**
 * Tracks the Supabase auth session (magic-link only) and exposes it via
 * useAuth(). Without VITE_SUPABASE_URL/ANON_KEY configured, `supabase` is
 * null and this stays permanently signed-out — features that read it
 * degrade to their signed-out state rather than erroring.
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const { x } = useI18n()
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'signed-out')

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setStatus(data.session ? 'signed-in' : 'signed-out')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setStatus(nextSession ? 'signed-in' : 'signed-out')
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = useCallback(
    async (email: string, opts?: { name?: string }) => {
      if (!supabase) return 'Real legal sources are not configured in this environment.'
      /* The whole workspace is invite-only, not just this feature. The real
         boundary is enforced server-side (RLS on guidance_sources/
         law_updates, an explicit check in the advisor-chat edge function,
         and the route guard that keeps /app unreachable without a matching
         session) — this check is just to avoid sending a magic-link email
         that can't do anything useful, and to fail fast. */
      if (!isAllowedSignInEmail(email)) {
        return x(M.auth_domain_restricted)
      }
      /* The sign-up tab collects a display name; carry it as user metadata on
         the same passwordless OTP call. signInWithOtp already creates the user
         on first sign-in, so "sign up" and "sign in" are the same magic-link
         action — the name just personalizes the created account. */
      const name = opts?.name?.trim()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        /* Land the magic link on the dedicated confirm route, which exchanges
           the token via verifyOtp (see AuthConfirm). A clean same-origin URL —
           not window.location.href — keeps the `#signin` fragment and any
           transient state out of the redirect target. Pair with a Supabase
           email template pointing at {{ .RedirectTo }}?token_hash=…&
           type=magiclink so scanner prefetches can't burn the one-time token. */
        options: {
          emailRedirectTo: `${window.location.origin}/app/auth/confirm`,
          ...(name ? { data: { full_name: name } } : {}),
        },
      })
      if (error) return error.message
      setStatus('sent-link')
      return undefined
    },
    [x],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({ status, session, signInWithEmail, signOut }),
    [status, session, signInWithEmail, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
