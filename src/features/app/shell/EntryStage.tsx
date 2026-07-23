import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, Sparkle } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { authMessages as M } from '@/i18n/messages/auth'
import { usePublicPath } from '@/seo/usePublicPath'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/features/app/auth/authContext'
import { AuthPanel } from '@/features/app/auth/AuthPanel'
import { isAllowedSignInEmail } from '@/features/app/auth/allowedEmail'
import { LangToggle, ThemeToggle } from './ShellControls'

/** Where an unauthorized visit to /app/* wanted to end up (see RequireAdminSession). */
interface EntryLocationState {
  from?: { pathname: string }
}

/** Wordmark on the app surface (themed) — used in the mobile/tablet top bar.
    Links back to the marketing home page (same as the marketing header logo). */
function AppWordmark() {
  const { home } = usePublicPath()
  return (
    <Link
      to={home('top')}
      className="flex w-fit items-center gap-[10px] rounded-[8px] transition-opacity hover:opacity-80"
    >
      {/* Decorative: the adjacent wordmark text already names the brand. */}
      <img
        src="/brand/dutiva-leaf.png"
        alt=""
        className="block h-[26px] w-auto"
        style={{ filter: 'var(--logo-glow)' }}
      />
      <span className="font-display text-[17px] font-bold tracking-[-0.01em]">
        Duti<span className="text-gold-dot">va</span>
      </span>
    </Link>
  )
}

/**
 * Left brand rail — always a dark navy surface regardless of theme, so its
 * copy uses explicit light/gold colors rather than the theme-flipping tokens.
 * Hidden below `lg`, where the form panel stands on its own.
 */
function BrandRail() {
  const { x } = useI18n()
  const { home } = usePublicPath()
  const points = [M.auth_brand_point_1, M.auth_brand_point_2, M.auth_brand_point_3]

  return (
    <aside
      className="relative hidden w-[45%] max-w-[600px] shrink-0 flex-col justify-between overflow-hidden px-[52px] py-[44px] lg:flex"
      style={{
        background:
          'radial-gradient(130% 120% at 12% 8%, #1b3350 0%, var(--dutiva-navy) 46%, #081018 100%)',
      }}
    >
      {/* Gold glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[130px] -right-[120px] h-[340px] w-[340px] rounded-full opacity-[0.18]"
        style={{ background: 'radial-gradient(circle, var(--dutiva-gold) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[150px] -left-[110px] h-[320px] w-[320px] rounded-full opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, var(--dutiva-gold) 0%, transparent 70%)' }}
      />

      <Link
        to={home('top')}
        className="relative flex w-fit items-center gap-[10px] transition-opacity hover:opacity-80"
      >
        {/* Decorative: the adjacent wordmark text already names the brand. */}
        <img
          src="/brand/dutiva-leaf.png"
          alt=""
          className="block h-[28px] w-auto"
          style={{ filter: 'drop-shadow(0 0 6px rgba(var(--dutiva-gold-rgb),0.35))' }}
        />
        <span className="font-display text-[18px] font-bold tracking-[-0.01em] text-white">
          Duti<span style={{ color: 'var(--dutiva-gold)' }}>va</span>
        </span>
      </Link>

      <div className="relative">
        <div className="mb-[22px] inline-flex items-center gap-[8px] rounded-full border border-[rgba(var(--dutiva-gold-rgb),0.28)] bg-[rgba(var(--dutiva-gold-rgb),0.10)] px-[13px] py-[6px] text-[12px] font-semibold text-[#e9c877]">
          <Sparkle size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          {x(M.auth_brand_badge)}
        </div>
        <h2 className="m-0 mb-[16px] max-w-[460px] font-display text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-white">
          {x(M.auth_brand_headline)}
        </h2>
        <p className="m-0 mb-[30px] max-w-[430px] text-[14.5px] leading-[1.6] text-white/70">
          {x(M.auth_brand_sub)}
        </p>
        <ul className="m-0 flex list-none flex-col gap-[14px] p-0">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-[11px] text-[13.5px] leading-[1.5] text-white/85">
              <span className="mt-px flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[rgba(var(--dutiva-gold-rgb),0.16)] text-[#e9c877]">
                <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              </span>
              {x(point)}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative text-[12px] text-white/45">{x(M.auth_brand_footer)}</div>
    </aside>
  )
}

/**
 * Direct-entry card for local dev / tests, where Supabase isn't configured and
 * RequireAdminSession is a no-op — no sign-in is needed, so offer a plain way
 * into the workspace. Matches every feature's "degrade to signed-out" posture.
 */
function EnterWorkspaceCard() {
  const { x } = useI18n()
  return (
    <div className="rounded-[18px] border border-border bg-surface p-[28px] text-center shadow-[0_20px_50px_-24px_rgba(13,27,42,0.35)] min-[640px]:p-[32px]">
      <h1 className="m-0 font-display text-[22px] font-semibold tracking-[-0.01em] text-text">
        {x(M.auth_welcome_title)}
      </h1>
      <p className="mx-auto mt-[8px] mb-[22px] max-w-[300px] text-[13.5px] leading-[1.5] text-text-3">
        {x(M.auth_welcome_sub)}
      </p>
      <Link
        to="/app/home"
        className="flex h-[46px] w-full items-center justify-center rounded-[11px] bg-navy text-[14px] font-semibold text-white"
      >
        {x(M.auth_enter_workspace)}
      </Link>
    </div>
  )
}

function FormColumn({ children }: { readonly children: ReactNode }) {
  const { L, lang } = useI18n()
  const legalPath = lang === 'fr' ? '/fr/juridique' : '/legal'

  return (
    <main className="relative flex flex-1 flex-col">
      <div className="flex items-center justify-between px-[24px] py-[20px] min-[640px]:px-[40px]">
        <div className="lg:hidden">
          <AppWordmark />
        </div>
        {/* ml-auto keeps the controls right-aligned at lg+, where the wordmark
            above is display:none and would otherwise let justify-between pull
            this lone flex child to the left edge. */}
        <div className="ml-auto flex items-center gap-[10px]">
          <LangToggle />
          <ThemeToggle
            className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border-none bg-inset text-text-2"
            iconSize={17}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-[24px] pb-[40px] min-[640px]:px-[40px]">
        <div className="w-full max-w-[400px] animate-[fadeInUp_.4s_ease]">{children}</div>
      </div>

      <div className="px-[24px] pb-[26px] text-center min-[640px]:px-[40px]">
        <p className="m-0 text-[11.5px] text-text-faint">
          © Dutiva Canada Inc. ·{' '}
          <Link to={legalPath} className="hover:text-text-muted">
            {L('Legal', 'Juridique')}
          </Link>
        </p>
      </div>
    </main>
  )
}

/**
 * App entry stage (/app/welcome) — the dedicated sign in / sign up page. A
 * two-panel layout: a dark navy brand rail (hidden below `lg`) beside the
 * auth form. With Supabase configured the workspace is gated (invite-only for
 * one account, see RequireAdminSession), so the form emails a passwordless
 * magic link via AuthPanel; without it, CTAs enter directly, matching every
 * feature's "degrade to signed-out" posture in local dev/tests. An already
 * authorized session is redirected straight into the workspace.
 */
export function EntryStage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { status, session } = useAuth()

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
      <div className="flex min-h-screen">
        <BrandRail />
        <FormColumn>
          {gated ? !authorized && <AuthPanel /> : <EnterWorkspaceCard />}
        </FormColumn>
      </div>
    </div>
  )
}
