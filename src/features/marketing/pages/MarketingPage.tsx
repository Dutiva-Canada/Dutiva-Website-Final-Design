import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import '../landing.css'
import { Header } from '../sections/Header'
import { Footer } from '../sections/Footer'

/**
 * Shared chrome for the marketing subpages (/about, /faq, /legal, …): the
 * landing page's Header/Footer inside the marketing surface scope. The
 * subpages ship no prototype HTML — layout composes the landing design
 * system (badge, premium-card, gold-button) around the handoff's copy.
 */
export function MarketingPageShell({ children }: { readonly children: ReactNode }) {
  const { pathname } = useLocation()
  // Client-side navigation preserves scroll; a subpage must open at its top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="surface-marketing dutiva-surface min-h-screen text-text">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

/** Centered page hero: badge eyebrow, display h1, one-paragraph intro. */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  readonly eyebrow: string
  readonly title: string
  readonly intro: string
}) {
  return (
    <section className="mx-auto max-w-[840px] px-6 pt-16 pb-6 text-center">
      <span className="badge">{eyebrow}</span>
      <h1 className="mt-5 font-display text-[clamp(2.125rem,4vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.02em] text-text">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-[62ch] text-lg leading-[1.6] text-text-2">{intro}</p>
    </section>
  )
}

/** A titled content band on a subpage (h2 + free-form body). */
export function PageSection({
  title,
  children,
}: {
  readonly title: string
  readonly children: ReactNode
}) {
  return (
    <section className="mx-auto max-w-[960px] px-6 py-8">
      <h2 className="mb-5 font-display text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.02em] text-text">
        {title}
      </h2>
      {children}
    </section>
  )
}

interface PageCtaProps {
  readonly title: string
  readonly body: string
  readonly action: string
  /** Router destination (e.g. /app/welcome). Mutually exclusive with `href`. */
  readonly to?: string
  /** External destination (e.g. mailto:support@dutiva.ca). */
  readonly href?: string
}

/** Closing call-to-action band shared by every marketing subpage. */
export function PageCta({ title, body, action, to, href }: PageCtaProps) {
  const buttonStyle = { minHeight: 48, padding: '0 24px', fontSize: '0.9375rem' } as const
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-8 pb-[72px]">
      <div className="premium-card p-[clamp(28px,4vw,56px)] text-center">
        <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-text">
          {title}
        </h2>
        <p className="mx-auto mt-3.5 max-w-[52ch] text-base leading-[1.6] text-text-2">{body}</p>
        <div className="mt-6 flex justify-center">
          {to ? (
            <Link to={to} className="gold-button" style={buttonStyle}>
              {action}
              <ArrowRight size={16} />
            </Link>
          ) : (
            <a href={href} className="gold-button" style={buttonStyle}>
              {action}
              <ArrowRight size={16} />
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
