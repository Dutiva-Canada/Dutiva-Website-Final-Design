import { useState } from 'react'
import type { FormEvent } from 'react'
import { useI18n } from '@/i18n/context'
import { authMessages as M } from '@/i18n/messages/auth'
import { useAuth } from './authContext'

/**
 * Shared magic-link sign-in form (email + submit + sent/error feedback).
 * No "why sign in" copy — embedders own that context (see
 * GuidanceSourcesPanel, AuthMenuButton). No prototype counterpart.
 */
export function AuthSignInForm({ idPrefix = 'auth' }: { idPrefix?: string }) {
  const { x } = useI18n()
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(undefined)
    void signInWithEmail(email).then((nextError) => {
      setSending(false)
      if (nextError) setError(nextError)
    })
  }

  const emailId = `${idPrefix}-signin-email`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <div className="flex flex-wrap gap-[8px]">
        <label className="sr-only" htmlFor={emailId}>
          {x(M.auth_email_label)}
        </label>
        <input
          id={emailId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={x(M.auth_email_placeholder)}
          className="min-w-0 flex-1 rounded-[10px] border border-border bg-bg px-[14px] py-[9px] font-sans text-[13.5px] text-text"
        />
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 cursor-pointer rounded-[10px] bg-navy px-[16px] py-[9px] text-[13.5px] font-semibold text-white disabled:opacity-60"
        >
          {sending ? x(M.auth_sending) : x(M.auth_send_link)}
        </button>
      </div>
      {error && <p className="text-[12.5px] text-risk-fg">{error}</p>}
    </form>
  )
}
