import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sparkle, TriangleAlert } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { authMessages as AM } from '@/i18n/messages/auth'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/features/app/auth/authContext'
import { AuthSignInForm } from '@/features/app/auth/AuthSignInForm'
import { isAllowedSignInEmail } from '@/features/app/auth/allowedEmail'
import { LangToggle, ThemeToggle } from './ShellControls'

/** Where an unauthorized visit to /app/* wanted to end up (see RequireAdminSession). */
interface EntryLocationState {
  from?: { pathname: string }
}

/**
 * CTA that either enters the workspace directly (no Supabase configured —
 * local dev/tests, where RequireAdminSession is a no-op) or jumps to the
 * sign-in panel below (real deployment — the workspace is gated).
 */
function EntryCta({
  gated,
  className,
  children,
}: {
  readonly gated: boolean
  readonly className: string
  readonly children: ReactNode
}) {
  if (gated) {
    return (
      <a href="#signin" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to="/app/home" className={className}>
      {children}
    </Link>
  )
}

function EntrySignInPanel({
  status,
  email,
  signOut,
}: {
  readonly status: ReturnType<typeof useAuth>['status']
  readonly email: string | undefined
  readonly signOut: ReturnType<typeof useAuth>['signOut']
}) {
  const { x, L, lang } = useI18n()
  const helpPath = lang === 'fr' ? '/fr/aide/se-connecter' : '/help/signing-in'

  if (status === 'signed-in' && email) {
    return (
      <div
        id="signin"
        className="mx-auto mb-[64px] max-w-[420px] scroll-mt-[100px] rounded-[16px] border border-border bg-surface p-[28px] text-left shadow-[0_24px_60px_-20px_rgba(27,36,48,0.25)]"
      >
        <div className="flex flex-col gap-[12px]">
          <p className="m-0 text-[13.5px] text-text-2">{email}</p>
          <p className="m-0 text-[13px] text-text-muted">{x(AM.auth_not_authorized)}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="cursor-pointer self-start rounded-[8px] border border-border bg-transparent px-[14px] py-[8px] text-[13px] font-semibold text-text-2"
          >
            {x(AM.auth_sign_out)}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'sent-link') {
    return (
      <div
        id="signin"
        className="mx-auto mb-[64px] max-w-[420px] scroll-mt-[100px] rounded-[16px] border border-border bg-surface p-[28px] text-left shadow-[0_24px_60px_-20px_rgba(27,36,48,0.25)]"
      >
        <p className="m-0 text-[14px] text-text-2">{x(AM.auth_link_sent)}</p>
      </div>
    )
  }

  return (
    <div
      id="signin"
      className="mx-auto mb-[64px] max-w-[420px] scroll-mt-[100px] rounded-[16px] border border-border bg-surface p-[28px] text-left shadow-[0_24px_60px_-20px_rgba(27,36,48,0.25)]"
    >
      <h2 className="m-0 mb-[6px] font-display text-[18px] font-semibold text-text">
        {x(AM.auth_sign_in)}
      </h2>
      <p className="m-0 mb-[16px] text-[13px] text-text-muted">{x(AM.auth_entry_description)}</p>
      <AuthSignInForm idPrefix="welcome" />
      <p className="m-0 mt-[16px] text-[12.5px] text-text-muted">
        {L('Trouble signing in?', 'Un problème de connexion?')}{' '}
        <Link to={helpPath} className="font-semibold text-text-2 hover:text-text">
          {L('Get help', 'Obtenir de l’aide')}
        </Link>
      </p>
    </div>
  )
}

/**
 * App entry stage (/app/welcome) — sign-in landing from `App v2.dc.html`
 * (`isLanding` branch), now doubling as the actual gate: with Supabase
 * configured, every CTA here leads to the magic-link form instead of
 * straight into /app/home (see RequireAdminSession — the workspace is
 * invite-only for one account, not a public demo anymore). Without
 * Supabase configured, CTAs still enter directly, matching every other
 * feature's "degrade to signed-out" posture in local dev/tests.
 */
export function EntryStage() {
  const { x } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, session, signOut } = useAuth()

  const gated = !!supabase
  const email = session?.user.email
  const authorized = status === 'signed-in' && !!email && isAllowedSignInEmail(email)

  useEffect(() => {
    if (!authorized) return
    const from = (location.state as EntryLocationState | null)?.from
    navigate(from?.pathname ?? '/app/home', { replace: true })
  }, [authorized, location.state, navigate])

  return (
    <div className="surface-app min-h-screen bg-bg font-sans text-text">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-[12px] px-[20px] py-[16px] min-[640px]:px-[48px] min-[640px]:py-[22px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex h-[34px] w-[34px] items-center justify-center">
            <img
              src="/brand/dutiva-leaf.png"
              alt="Dutiva"
              className="block h-[26px] w-auto"
              style={{ filter: 'var(--logo-glow)' }}
            />
          </div>
          <span className="font-display text-[17px] font-bold tracking-[-0.01em]">
            Duti<span className="text-gold-dot">va</span>
          </span>
        </div>
        <div className="flex items-center gap-[10px] text-[14.5px] text-text-3 min-[640px]:gap-[22px]">
          <span className="hidden min-[820px]:inline">{x(M.shell_nav_platform)}</span>
          <span className="hidden min-[820px]:inline">{x(M.shell_nav_provinces)}</span>
          <span className="hidden min-[820px]:inline">{x(M.shell_nav_pricing)}</span>
          <LangToggle />
          <ThemeToggle
            className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border-none bg-inset text-text-2"
            iconSize={17}
          />
          <EntryCta
            gated={gated}
            className="hidden whitespace-nowrap text-[14.5px] font-semibold text-text min-[560px]:block"
          >
            {x(M.shell_signin)}
          </EntryCta>
          <EntryCta
            gated={gated}
            className="shrink-0 whitespace-nowrap rounded-[8px] bg-navy px-[18px] py-[10px] text-[14.5px] font-semibold text-white"
          >
            {x(M.shell_start_free)}
          </EntryCta>
        </div>
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="mx-auto mt-[64px] max-w-[840px] px-[32px] text-center">
          <div className="mb-[28px] inline-flex items-center gap-[8px] rounded-full bg-gold-bg px-[14px] py-[6px] text-[13px] font-semibold text-gold-fg">
            <Sparkle size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            {x(M.shell_hero_badge)}
          </div>
          <h1 className="m-0 mb-[22px] font-display text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] min-[560px]:text-[44px] min-[860px]:text-[56px]">
            {x(M.shell_hero_title)}
          </h1>
          <p className="mx-auto mt-0 mb-[36px] max-w-[600px] text-[16px] leading-[1.6] text-text-3 min-[560px]:text-[18px]">
            {x(M.shell_hero_sub)}
          </p>
          <div className="mb-[48px] flex flex-wrap justify-center gap-[12px] min-[560px]:mb-[64px]">
            <EntryCta
              gated={gated}
              className="rounded-[9px] bg-navy px-[26px] py-[14px] text-[15px] font-semibold text-white"
            >
              {x(M.shell_cta_primary)}
            </EntryCta>
            <EntryCta
              gated={gated}
              className="rounded-[9px] border border-border bg-surface px-[26px] py-[14px] text-[15px] font-semibold text-text"
            >
              {x(M.shell_cta_secondary)}
            </EntryCta>
          </div>

          {/* ── Sign-in panel — real gate, only when Supabase is configured
              and the visitor isn't already an authorized session (which
              would have redirected away via the effect above). ────────── */}
          {gated && !authorized && (
            <EntrySignInPanel status={status} email={email} signOut={signOut} />
          )}
        </div>

        {/* ── Advisor conversation preview (browser-chrome frame) ──────── */}
        <div className="mx-auto mb-[80px] max-w-[920px] px-[32px]">
          <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_24px_60px_-20px_rgba(27,36,48,0.25)]">
            <div className="flex items-center gap-[8px] border-b border-border-soft px-[24px] py-[18px]">
              <div className="h-[9px] w-[9px] rounded-full bg-border" />
              <div className="h-[9px] w-[9px] rounded-full bg-border" />
              <div className="h-[9px] w-[9px] rounded-full bg-border" />
              <span className="ml-[8px] text-[12.5px] text-text-muted">
                {x(M.shell_preview_title)}
              </span>
            </div>
            <div className="flex flex-col gap-[14px] bg-surface-2 px-[30px] py-[26px]">
              <div className="max-w-[70%] self-end rounded-[12px] rounded-br-[2px] bg-navy px-[16px] py-[10px] text-[14.5px] text-white">
                {x(M.shell_preview_user)}
              </div>
              <div className="max-w-[80%] self-start rounded-[12px] rounded-tl-[2px] border border-border-soft bg-surface px-[16px] py-[14px] text-[14.5px] leading-[1.55]">
                {x(M.shell_preview_reply)}
              </div>
              <div className="flex max-w-[80%] gap-[8px] self-start rounded-[10px] border border-risk-border bg-risk-bg px-[14px] py-[12px] text-[13.5px] text-risk-fg">
                <TriangleAlert size={15} strokeWidth={1.9} className="mt-px shrink-0" />
                <span>{x(M.shell_preview_risk)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
