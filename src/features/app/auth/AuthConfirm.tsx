import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { EmailOtpType } from '@supabase/supabase-js'
import { useI18n } from '@/i18n/context'
import { authMessages as M } from '@/i18n/messages/auth'
import { supabase } from '@/lib/supabaseClient'

const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  'magiclink',
  'email',
  'recovery',
  'invite',
  'email_change',
])

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && EMAIL_OTP_TYPES.has(value as EmailOtpType)
}

/**
 * Magic-link landing route (/app/auth/confirm). The sign-in email links here
 * with a `token_hash` (and `type`) in the query string; we exchange it for a
 * session with verifyOtp, then enter the workspace.
 *
 * Why this instead of the default `/auth/v1/verify` GET link: that link spends
 * its one-time token the moment anything fetches it, so email-provider link
 * scanners (Gmail/Outlook prefetch the URL from Google/Microsoft IPs) burn the
 * token before the user clicks — the classic "Email link is invalid or has
 * expired". Here the token is spent only when verifyOtp runs in the browser,
 * which a scanner (no JS) never triggers. verifyOtp with a token_hash also
 * needs no PKCE code-verifier, so a link opened on a different device than it
 * was requested from still works.
 *
 * Requires the Supabase magic-link email template to point here, e.g.
 *   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=magiclink
 * (RedirectTo is the emailRedirectTo set in AuthProvider — the current origin's
 * /app/auth/confirm). The `?code=` branch covers a PKCE fallback; the session
 * branch covers a fragment link that supabase-js auto-detected on load.
 */
export function AuthConfirm() {
  const { x } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [failed, setFailed] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    if (!supabase) {
      navigate('/app/welcome', { replace: true })
      return
    }
    const client = supabase

    /* Supabase appends these when the link itself is rejected upstream. */
    const linkError = params.get('error_description') ?? params.get('error')
    if (linkError) {
      console.error('auth confirm: link rejected —', linkError)
      setFailed(true)
      return
    }

    const tokenHash = params.get('token_hash')
    const type = params.get('type')
    const code = params.get('code')

    void (async () => {
      try {
        if (tokenHash && isEmailOtpType(type)) {
          const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type })
          if (error) throw error
        } else if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          /* A fragment-style link may have been auto-detected on load. */
          const { data } = await client.auth.getSession()
          if (!data.session) throw new Error('No sign-in token in the confirmation link.')
        }
        navigate('/app/home', { replace: true })
      } catch (error) {
        console.error('auth confirm: verification failed —', error)
        setFailed(true)
      }
    })()
  }, [navigate, params])

  if (!supabase) return null

  return (
    <div className="surface-app flex min-h-screen items-center justify-center bg-bg px-[24px] font-sans text-text">
      <div className="w-full max-w-[420px] rounded-[16px] border border-border bg-surface p-[28px] text-center shadow-[0_24px_60px_-20px_rgba(27,36,48,0.25)]">
        {failed ? (
          <div className="flex flex-col gap-[12px]" role="alert">
            <h1 className="m-0 font-display text-[18px] font-semibold text-text">
              {x(M.auth_confirm_error_title)}
            </h1>
            <p className="m-0 text-[13.5px] text-text-muted">{x(M.auth_confirm_error_body)}</p>
            <Link
              to="/app/welcome"
              className="self-center rounded-[8px] bg-navy px-[16px] py-[9px] text-[13.5px] font-semibold text-white"
            >
              {x(M.auth_confirm_retry)}
            </Link>
          </div>
        ) : (
          <p className="m-0 text-[14px] text-text-2" role="status">
            {x(M.auth_confirm_verifying)}
          </p>
        )}
      </div>
    </div>
  )
}
