import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { AuthContext } from './authContext'
import type { AuthStatus } from './authContext'

/**
 * Tracks the Supabase auth session (magic-link only) and exposes it via
 * useAuth(). Without VITE_SUPABASE_URL/ANON_KEY configured, `supabase` is
 * null and this stays permanently signed-out — features that read it
 * degrade to their signed-out state rather than erroring.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
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

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return 'Real legal sources are not configured in this environment.'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
    if (error) return error.message
    setStatus('sent-link')
    return undefined
  }, [])

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
