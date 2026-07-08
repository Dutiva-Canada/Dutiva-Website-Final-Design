import { Link } from 'react-router-dom'
import { Sparkle, TriangleAlert } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { LangToggle, ThemeToggle } from './ShellControls'

/**
 * App entry stage (/app/welcome) — the minimal sign-in landing from
 * `App v2.dc.html` (`isLanding` branch): top bar with leaf logo + wordmark,
 * EN/FR pill, theme toggle and navy "Start free"; centered hero with gold
 * badge; Advisor conversation preview in a browser-chrome frame.
 * Every CTA enters the workspace at /app/home.
 */
export function EntryStage() {
  const { x } = useI18n()

  return (
    <div className="surface-app min-h-screen bg-bg font-sans text-text">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-[12px] px-[20px] py-[16px] min-[640px]:px-[48px] min-[640px]:py-[22px]">
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
          <Link
            to="/app/home"
            className="hidden whitespace-nowrap text-[14.5px] font-semibold text-text min-[560px]:block"
          >
            {x(M.shell_signin)}
          </Link>
          <Link
            to="/app/home"
            className="shrink-0 whitespace-nowrap rounded-[8px] bg-navy px-[18px] py-[10px] text-[14.5px] font-semibold text-white"
          >
            {x(M.shell_start_free)}
          </Link>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
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
          <Link
            to="/app/home"
            className="rounded-[9px] bg-navy px-[26px] py-[14px] text-[15px] font-semibold text-white"
          >
            {x(M.shell_cta_primary)}
          </Link>
          <Link
            to="/app/home"
            className="rounded-[9px] border border-border bg-surface px-[26px] py-[14px] text-[15px] font-semibold text-text"
          >
            {x(M.shell_cta_secondary)}
          </Link>
        </div>
      </div>

      {/* ── Advisor conversation preview (browser-chrome frame) ────────── */}
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
              <TriangleAlert size={15} strokeWidth={1.9} className="mt-[1px] shrink-0" />
              <span>{x(M.shell_preview_risk)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
