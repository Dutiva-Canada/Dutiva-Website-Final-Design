import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleCheck, ShieldCheck } from 'lucide-react'
import { usePublicPath } from '@/seo/usePublicPath'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'

const SIGNUPS_KEY = 'dutiva-beta-signups'

/** Same validation shape as the prototype's beta-form handler (linear-time). */
function isValidEmail(value: string): boolean {
  const at = value.indexOf('@')
  if (at <= 0 || at === value.length - 1) return false
  const domain = value.slice(at + 1)
  const dot = domain.lastIndexOf('.')
  if (dot <= 0 || dot === domain.length - 1) return false
  return !value.startsWith(' ') && !value.endsWith(' ') && !value.includes(' ')
}

const LABEL = 'text-[0.8125rem] font-semibold text-text'
const INPUT =
  'rounded-xl border border-control-border bg-bg px-4 font-sans text-text placeholder:text-text-3'

function readSignups(): string[] {
  try {
    const raw = localStorage.getItem(SIGNUPS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

type Status = 'idle' | 'sending' | 'done'

export function BetaSignup() {
  const { lt } = useLanding()
  const { legalDoc } = usePublicPath()
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [province, setProvince] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<{ key: LandingMessageKey; isError: boolean } | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    if (!isValidEmail(value)) {
      setMessage({ key: 'landing_cta_error', isError: true })
      return
    }
    const list = readSignups()
    if (list.includes(value.toLowerCase())) {
      setMessage({ key: 'landing_cta_dup', isError: false })
      return
    }
    setMessage(null)
    setStatus('sending')
    timerRef.current = window.setTimeout(() => {
      try {
        list.push(value.toLowerCase())
        localStorage.setItem(SIGNUPS_KEY, JSON.stringify(list))
      } catch {
        /* localStorage unavailable — success state still shown, as in the prototype */
      }
      setStatus('done')
    }, 700)
  }

  return (
    <section id="start" className="mx-auto max-w-[1200px] scroll-mt-[80px] px-6 pt-6 pb-[72px]">
      <div className="premium-card grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-10 p-[clamp(28px,4vw,56px)]">
        <div>
          <span className="badge">{lt('landing_cta_badge')}</span>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-text">
            {lt('landing_cta_title')}
          </h2>
          <p className="mt-3.5 max-w-[44ch] text-base leading-[1.6] text-text-2">
            {lt('landing_cta_p')}
          </p>
        </div>

        <div>
          {status === 'done' ? (
            <div className="flex items-center gap-3 rounded-[14px] border border-(--gold-border-soft) bg-gold-subtle px-5 py-[18px]">
              <CircleCheck size={22} className="flex-none text-gold-strong" />
              <div>
                <div className="font-semibold text-text">{lt('landing_cta_done_t')}</div>
                <p className="m-0 mt-0.5 text-sm text-text-2">{lt('landing_cta_done_p')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="beta-email" className={LABEL}>
                  {lt('landing_cta_email_label')}
                </label>
                <input
                  id="beta-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={lt('landing_cta_email_ph')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`min-h-12 text-[0.9375rem] ${INPUT}`}
                />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
                  <label htmlFor="beta-company" className={LABEL}>
                    {lt('landing_cta_company_label')}
                  </label>
                  <input
                    id="beta-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    placeholder={lt('landing_cta_company_ph')}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={`min-h-11 text-sm ${INPUT}`}
                  />
                </div>
                <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
                  <label htmlFor="beta-prov" className={LABEL}>
                    {lt('landing_cta_prov_label')}
                  </label>
                  <select
                    id="beta-prov"
                    name="province"
                    autoComplete="address-level1"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="min-h-11 rounded-xl border border-control-border bg-bg px-3 font-sans text-sm text-text"
                  >
                    <option value="">{lt('landing_cta_prov_0')}</option>
                    <option value="on">{lt('landing_cta_prov_on')}</option>
                    <option value="qc">{lt('landing_cta_prov_qc')}</option>
                    <option value="fed">{lt('landing_cta_prov_fed')}</option>
                    <option value="other">{lt('landing_cta_prov_other')}</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="gold-button"
                disabled={status === 'sending'}
                style={{
                  minHeight: 48,
                  padding: '0 22px',
                  fontSize: '0.9375rem',
                  alignSelf: 'flex-start',
                  ...(status === 'sending' ? { opacity: 0.6 } : null),
                }}
              >
                {status === 'sending' ? (
                  lt('landing_cta_sending')
                ) : (
                  <>
                    {lt('landing_cta_btn')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <div
                role="status"
                aria-live="polite"
                className="text-[0.8125rem] leading-normal"
                style={{
                  display: message ? 'block' : 'none',
                  color: message?.isError ? 'var(--danger)' : 'var(--text-2)',
                }}
              >
                {message ? lt(message.key) : null}
              </div>
              <p className="m-0 text-xs leading-[1.55] text-text-3">
                {lt('landing_cta_consent')}{' '}
                <Link
                  to={legalDoc('privacy')}
                  className="font-semibold text-text-2 transition-opacity hover:opacity-80"
                >
                  {lt('landing_cta_privacy_link')}
                </Link>
                {'.'}
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-text-3">
                <ShieldCheck size={14} className="text-gold-strong" />
                {lt('landing_cta_disclaimer')}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
