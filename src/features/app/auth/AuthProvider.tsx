import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useI18n } from '@/i18n/context'
import { authMessages as M } from '@/i18n/messages/auth'
import { supabase } from '@/lib/supabaseClient'
import { AuthContext } from './authContext'
import type { AuthStatus } from './authContext'

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
  const [authorized, setAuthorized] = useState<boolean | null>(null)

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

  useEffect(() => {
    if (!supabase || status !== 'signed-in') {
      setAuthorized(null)
      return
    }
    let cancelled = false
    setAuthorized(null)
    supabase.rpc('current_user_is_workspace_member').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('auth: workspace membership check failed —', error)
        setAuthorized(false)
        return
      }
      setAuthorized(data === true)
    })
    return () => {
      cancelled = true
    }
  }, [status, session?.user.id])

  const signInWithEmail = useCallback(
    async (email: string, opts?: { name?: string }) => {
      if (!supabase) return x(M.auth_not_configured)
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
      if (error) {
        /* Don't surface Supabase's raw English error.message — it would leak
           into the French UI. Log the specific failure, show a localized
           generic instead. */
        console.error('auth: magic-link request failed —', error)
        return x(M.auth_generic_error)
      }
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
    () => ({ status, session, authorized, signInWithEmail, signOut }),
    [status, session, authorized, signInWithEmail, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
