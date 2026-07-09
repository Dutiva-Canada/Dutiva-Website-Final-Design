import { Link } from 'react-router-dom'
import { LeafTile, Wordmark } from '../Brand'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'

interface FooterLink {
  key: LandingMessageKey
  href: string
  /** In-app destinations render as router links. */
  app?: boolean
}

const PRODUCT_LINKS: FooterLink[] = [
  { key: 'landing_fp_advisor', href: '/advisor' },
  { key: 'landing_fp_workflows', href: '#workflows' },
  { key: 'landing_fp_templates', href: '#product' },
  { key: 'landing_nav_pricing', href: '#pricing' },
  { key: 'landing_fp_beta', href: '#start' },
]

const RESOURCE_LINKS: FooterLink[] = [
  { key: 'landing_nav_guides', href: '#guides' },
  { key: 'landing_fr_getstarted', href: '#how' },
  { key: 'landing_fr_faq', href: '/faq' },
  { key: 'landing_fr_tmplusage', href: '/template-usage' },
  { key: 'landing_fr_limits', href: '/known-limitations' },
  { key: 'landing_fr_blog', href: '/blog' },
]

const COMPANY_LINKS: FooterLink[] = [
  { key: 'landing_fc_about', href: '/about' },
  { key: 'landing_fc_contact', href: '/contact' },
  { key: 'landing_fc_openapp', href: '/app/welcome', app: true },
  { key: 'landing_signin', href: '/app/welcome', app: true },
]

const LEGAL_LINKS: FooterLink[] = [
  { key: 'landing_fl_privacy', href: '/privacy' },
  { key: 'landing_fl_terms', href: '/terms' },
  { key: 'landing_fl_cookie', href: '/cookie-policy' },
  { key: 'landing_fl_disclaimer', href: '/legal-disclaimer' },
  { key: 'landing_fl_access', href: '/accessibility' },
  { key: 'landing_fl_ai', href: '/ai-policy' },
  { key: 'landing_fl_dpa', href: '/data-processing-agreement' },
  { key: 'landing_fl_retention', href: '/data-retention' },
  { key: 'landing_fl_pipeda', href: '/pipeda' },
  { key: 'landing_fl_law25', href: '/quebec-law-25' },
  { key: 'landing_fl_casl', href: '/casl' },
]

const LINK_CLASS = 'text-sm text-text-2 transition-opacity hover:opacity-80'

export function Footer() {
  const { lt } = useLanding()

  const renderLinks = (links: FooterLink[]) => (
    <div className="grid gap-2.5">
      {links.map((link) =>
        link.app ? (
          <Link key={link.key} to={link.href} className={LINK_CLASS}>
            {lt(link.key)}
          </Link>
        ) : (
          <a key={link.key} href={link.href} className={LINK_CLASS}>
            {lt(link.key)}
          </a>
        ),
      )}
    </div>
  )

  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 px-6 py-12">
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2.5">
            <LeafTile size={40} radius={11} leafHeight={28} />
            <Wordmark />
          </div>
          <p className="mt-3 max-w-[42ch] text-sm leading-[1.6] text-text-2">
            {lt('landing_foot_desc')}
          </p>
          {/* Standing disclaimer — prototype's footer variant, verbatim */}
          <p className="mt-2.5 max-w-[42ch] text-xs leading-[1.55] text-text-3">
            {lt('landing_foot_disclaimer')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5 text-xs text-text-3">
            <span>{lt('landing_trust_ottawa')}</span>
            <span>·</span>
            <span>{lt('landing_trust_pipeda')}</span>
            <span>·</span>
            <span>EN/FR</span>
          </div>
          <a
            href="mailto:support@dutiva.ca"
            className="mt-3.5 inline-block text-sm font-medium text-text-2 transition-opacity hover:opacity-80"
          >
            support@dutiva.ca
          </a>
        </div>

        <div>
          <FooterHeading>{lt('landing_foot_product')}</FooterHeading>
          {renderLinks(PRODUCT_LINKS)}
        </div>
        <div>
          <FooterHeading>{lt('landing_foot_resources')}</FooterHeading>
          {renderLinks(RESOURCE_LINKS)}
        </div>
        <div>
          <FooterHeading>{lt('landing_foot_company')}</FooterHeading>
          {renderLinks(COMPANY_LINKS)}
        </div>
        <div>
          <FooterHeading>{lt('landing_foot_legal')}</FooterHeading>
          {renderLinks(LEGAL_LINKS)}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-4 text-xs text-text-3">
          {lt('landing_foot_copyright')}
        </div>
      </div>
    </footer>
  )
}

function FooterHeading({ children }: { readonly children: string }) {
  return (
    <div className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-text-3">
      {children}
    </div>
  )
}
