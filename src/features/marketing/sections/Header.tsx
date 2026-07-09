import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Globe, LogIn, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/lib/themeContext'
import { LeafTile, Wordmark } from '../Brand'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'

const NAV_ITEMS: { href: string; key: LandingMessageKey }[] = [
  { href: '#how', key: 'landing_nav_how' },
  { href: '#workflows', key: 'landing_nav_workflows' },
  { href: '#product', key: 'landing_nav_docs' },
  { href: '#coverage', key: 'landing_nav_coverage' },
  { href: '#pricing', key: 'landing_nav_pricing' },
  { href: '#guides', key: 'landing_nav_guides' },
]

/* Compact desktop control pill (lang / theme) — prototype `.hdr-ctrl`. */
const CTRL =
  'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-border-strong bg-bg-elevated px-3 font-sans text-[0.8125rem] font-semibold text-text transition-[border-color,background-color,color] duration-[160ms] ease-in-out hover:border-gold-border hover:bg-[rgba(127,127,127,0.06)] motion-reduce:transition-none'

/* Large mobile pill (lang · theme · hamburger) — prototype `.hdr-pill`. */
const PILL =
  'inline-flex h-[46px] min-w-[46px] cursor-pointer items-center justify-center gap-[7px] rounded-2xl border border-border-strong bg-bg-elevated px-4 font-sans text-[0.9375rem] font-semibold text-text transition-[border-color,background-color,transform] duration-[160ms] ease-in-out hover:border-gold-border hover:bg-[rgba(255,255,255,0.05)] active:translate-y-px motion-reduce:transition-none'

export function Header() {
  const { lt, t, L, lang, setLang } = useLanding()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const langLabel = lang === 'en' ? 'FR' : 'EN'
  const toggleLang = () => setLang(lang === 'en' ? 'fr' : 'en')
  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-(--topbar-bg) backdrop-blur-[18px]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
          <a href="#top" className="flex items-center gap-2.5">
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
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-text-2 transition-opacity hover:opacity-80"
              >
                {lt(item.key)}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 min-[901px]:flex">
            <button
              type="button"
              className={CTRL}
              aria-label={L('Toggle language', 'Changer de langue')}
              onClick={toggleLang}
            >
              <Globe size={15} />
              {langLabel}
            </button>
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
            <button
              type="button"
              className={PILL}
              aria-label={L('Toggle language', 'Changer de langue')}
              onClick={toggleLang}
            >
              <Globe size={17} />
              {langLabel}
            </button>
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

      {/* Mobile drawer */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-[rgba(4,6,11,0.6)] backdrop-blur-xs transition-opacity duration-200 ease-in-out motion-reduce:transition-none ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        inert={!menuOpen}
        className={`fixed top-0 right-0 bottom-0 z-41 flex w-[min(84vw,340px)] flex-col border-l border-border bg-bg-elevated p-5 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-240 ease-in-out motion-reduce:transition-none ${
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
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="flex items-center justify-between rounded-xl border-b border-border px-3 py-[15px] text-[1.0625rem] font-semibold text-text hover:bg-[rgba(127,127,127,0.06)]"
            >
              {lt(item.key)}
              <ChevronRight size={16} className="text-text-3" />
            </a>
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
    </>
  )
}
