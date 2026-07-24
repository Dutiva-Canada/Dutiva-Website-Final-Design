import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Globe, LogIn, Menu, Moon, Sun, X } from 'lucide-react'
import { HTML_LANG, writeLang } from '@/i18n/lang'
import type { Lang } from '@/i18n/core'
import { useTheme } from '@/lib/themeContext'
import { usePublicPath } from '@/seo/usePublicPath'
import type { SeoRouteId } from '@/seo/routes'
import { LeafTile, Wordmark } from '../Brand'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'

/* Header nav entries. Most are landing-section anchors, resolved against the
   locale homepage ('/' or '/fr') so they work from subpages in either
   language; on the landing page itself the path is a no-op and the browser
   jumps to the anchor. `route` entries (Pricing) link straight to a dedicated
   page instead of a homepage section. */
const NAV_ITEMS: { key: LandingMessageKey; hash?: string; route?: SeoRouteId }[] = [
  { hash: 'how', key: 'landing_nav_how' },
  { hash: 'workflows', key: 'landing_nav_workflows' },
  { hash: 'product', key: 'landing_nav_docs' },
  { hash: 'coverage', key: 'landing_nav_coverage' },
  { route: 'pricing', key: 'landing_nav_pricing' },
  { route: 'guides', key: 'landing_nav_guides' },
]

/** A nav entry: a router link for `route` entries (Pricing → /pricing), or a
    homepage anchor otherwise. Shared by the desktop bar and the mobile drawer. */
function NavLink({
  item,
  className,
  onClick,
  children,
}: {
  readonly item: (typeof NAV_ITEMS)[number]
  readonly className: string
  readonly onClick?: () => void
  readonly children?: ReactNode
}) {
  const { lt } = useLanding()
  const { home, p } = usePublicPath()
  if (item.route) {
    return (
      <Link to={p(item.route)} className={className} onClick={onClick}>
        {lt(item.key)}
        {children}
      </Link>
    )
  }
  return (
    <a href={home(item.hash ?? 'top')} className={className} onClick={onClick}>
      {lt(item.key)}
      {children}
    </a>
  )
}

/* Compact desktop control pill (lang / theme) — prototype `.hdr-ctrl`. */
const CTRL =
  'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-border-strong bg-bg-elevated px-3 font-sans text-[0.8125rem] font-semibold text-text transition-[border-color,background-color,color] duration-[160ms] ease-in-out hover:border-gold-border hover:bg-[rgba(127,127,127,0.06)] motion-reduce:transition-none'

/* Large mobile pill (lang · theme · hamburger) — prototype `.hdr-pill`. */
const PILL =
  'inline-flex h-[46px] min-w-[46px] cursor-pointer items-center justify-center gap-[7px] rounded-2xl border border-border-strong bg-bg-elevated px-4 font-sans text-[0.9375rem] font-semibold text-text transition-[border-color,background-color,transform] duration-[160ms] ease-in-out hover:border-gold-border hover:bg-[rgba(255,255,255,0.05)] active:translate-y-px motion-reduce:transition-none'

/**
 * Language toggle. On the public surface (URL-scoped language) it renders a
 * real link to the same page's URL in the other language — a crawlable,
 * visible EN↔FR cross-reference — and persists the choice for the app
 * surface. Falls back to an in-place toggle when no alternate URL exists.
 */
function LangToggle({ className, iconSize }: { className: string; iconSize: number }) {
  const { L, lang, setLang, alternateHref } = useLanding()
  const other: Lang = lang === 'en' ? 'fr' : 'en'
  const label = lang === 'en' ? 'FR' : 'EN'
  const aria = `${label} · ${L('Toggle language', 'Changer de langue')}`
  if (alternateHref) {
    return (
      <Link
        to={alternateHref}
        className={className}
        aria-label={aria}
        hrefLang={HTML_LANG[other]}
        onClick={() => writeLang(other)}
      >
        <Globe size={iconSize} />
        {label}
      </Link>
    )
  }
  return (
    <button type="button" className={className} aria-label={aria} onClick={() => setLang(other)}>
      <Globe size={iconSize} />
      {label}
    </button>
  )
}

export function Header() {
  const { lt, t, L } = useLanding()
  const { home } = usePublicPath()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-(--topbar-bg) backdrop-blur-[18px]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
          <a href={home('top')} className="flex items-center gap-2.5">
            <LeafTile size={46} radius={13} leafHeight={32} shadow />
            <span className="leading-none">
              <span className="block">
                <Wordmark />
              </span>
              <span className="mt-[3px] block font-display text-[0.5rem] font-semibold tracking-[0.36em] text-text-3">
                CANADA
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-0.5 min-[901px]:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                item={item}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-text-2 transition-opacity hover:opacity-80"
              />
            ))}
          </nav>

          <div className="hidden items-center gap-2 min-[901px]:flex">
            <LangToggle className={CTRL} iconSize={15} />
            <button
              type="button"
              className={CTRL}
              style={{ padding: 0, minWidth: 36 }}
              aria-label={t('theme_toggle_aria')}
              onClick={toggleTheme}
            >
              <ThemeIcon size={15} />
            </button>
            <Link
              to="/app/welcome"
              className="ghost-button"
              style={{ minHeight: 36, fontSize: '0.8125rem' }}
            >
              <LogIn size={15} />
              {lt('landing_signin')}
            </Link>
            <Link
              to="/app/welcome"
              className="gold-button"
              style={{ minHeight: 36, fontSize: '0.8125rem' }}
            >
              {lt('landing_start_free')}
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile: FR · theme · hamburger */}
          <div className="flex items-center gap-2.5 min-[901px]:hidden">
            <LangToggle className={PILL} iconSize={17} />
            <button
              type="button"
              className={PILL}
              aria-label={t('theme_toggle_aria')}
              onClick={toggleTheme}
            >
              <ThemeIcon size={17} />
            </button>
            <button
              type="button"
              className={PILL}
              aria-label={L('Open menu', 'Ouvrir le menu')}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer. Wrapped in a viewport-sized, click-through layer that
          clips horizontally: the panel parks just past the right edge while
          closed, so without this it would extend the page and leave a phantom
          horizontal scroll — a blank band down the right side on mobile.
          Because the wrapper is `position: fixed`, the `absolute` panel inside
          is contained (and clipped) by it rather than escaping to the viewport
          the way a `fixed` panel would. The backdrop and panel re-enable
          pointer events when the menu is open. */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-x-clip">
        <div
          aria-hidden="true"
          onClick={closeMenu}
          className={`absolute inset-0 bg-[rgba(4,6,11,0.6)] backdrop-blur-xs transition-opacity duration-200 ease-in-out motion-reduce:transition-none ${
            menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <aside
          inert={!menuOpen}
          className={`pointer-events-auto absolute top-0 right-0 bottom-0 flex w-[min(84vw,340px)] flex-col border-l border-border bg-bg-elevated p-5 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-240 ease-in-out motion-reduce:transition-none ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <LeafTile size={38} radius={11} leafHeight={26} />
              <Wordmark fontSize="1.05rem" />
            </span>
            <button
              type="button"
              className={PILL}
              style={{ minWidth: 40, height: 40, padding: 0 }}
              aria-label={L('Close menu', 'Fermer le menu')}
              onClick={closeMenu}
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                item={item}
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl border-b border-border px-3 py-[15px] text-[1.0625rem] font-semibold text-text hover:bg-[rgba(127,127,127,0.06)]"
              >
                <ChevronRight size={16} className="text-text-3" />
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2.5 pt-5">
            <Link
              to="/app/welcome"
              className="ghost-button"
              style={{ width: '100%', minHeight: 48 }}
              onClick={closeMenu}
            >
              <LogIn size={16} />
              {lt('landing_signin')}
            </Link>
            <Link
              to="/app/welcome"
              className="gold-button"
              style={{ width: '100%', minHeight: 48 }}
              onClick={closeMenu}
            >
              {lt('landing_start_free')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
