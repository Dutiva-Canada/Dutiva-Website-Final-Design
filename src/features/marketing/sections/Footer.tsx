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

/* Anchor targets carry a leading '/' so they resolve from the subpages
   (/about, /legal/…) as well as from the landing page itself. */
const PRODUCT_LINKS: FooterLink[] = [
  { key: 'landing_fp_advisor', href: '/#top' },
  { key: 'landing_fp_workflows', href: '/#workflows' },
  { key: 'landing_fp_templates', href: '/#product' },
  { key: 'landing_nav_pricing', href: '/#pricing' },
  { key: 'landing_fp_beta', href: '/#start' },
]

const RESOURCE_LINKS: FooterLink[] = [
  { key: 'landing_nav_guides', href: '/#guides' },
  { key: 'landing_fr_getstarted', href: '/#how' },
  { key: 'landing_fr_faq', href: '/faq', app: true },
  { key: 'landing_fr_tmplusage', href: '/guides/template-usage', app: true },
  { key: 'landing_fr_limits', href: '/known-limitations', app: true },
  { key: 'landing_fr_blog', href: '/blog', app: true },
]

const COMPANY_LINKS: FooterLink[] = [
  { key: 'landing_fc_about', href: '/about', app: true },
  { key: 'landing_fc_contact', href: 'mailto:support@dutiva.ca' },
  { key: 'landing_fc_openapp', href: '/app/welcome', app: true },
  { key: 'landing_signin', href: '/app/welcome', app: true },
]

/* Every entry routes to the policy reader at /legal/<slug> (content migration). */
const LEGAL_LINKS: FooterLink[] = [
  { key: 'landing_fl_privacy', href: '/legal/privacy', app: true },
  { key: 'landing_fl_terms', href: '/legal/terms', app: true },
  { key: 'landing_fl_cookie', href: '/legal/cookies', app: true },
  { key: 'landing_fl_disclaimer', href: '/legal/disclaimer', app: true },
  { key: 'landing_fl_access', href: '/legal/accessibility', app: true },
  { key: 'landing_fl_ai', href: '/legal/ai-technology', app: true },
  { key: 'landing_fl_dpa', href: '/legal/data-processing-agreement', app: true },
  { key: 'landing_fl_retention', href: '/legal/data-retention', app: true },
  { key: 'landing_fl_pipeda', href: '/legal/pipeda-compliance', app: true },
  { key: 'landing_fl_law25', href: '/legal/quebec-law-25', app: true },
  { key: 'landing_fl_casl', href: '/legal/casl-compliance', app: true },
]

const LINK_CLASS = 'text-sm text-text-2 transition-opacity hover:opacity-80'

export function Footer() {
  const { lt, t } = useLanding()

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
      {/* Two flex regions (brand, link columns) rather than one 5-column auto-fit
          grid: the brand block's min-w-[220px] could exceed an auto-fit track's
          computed width at in-between viewport sizes, overflowing text into the
          neighboring column. Splitting them lets the whole link-column group
          wrap onto its own row instead. */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap gap-8 px-6 py-12">
        <div className="min-w-[220px] flex-1 basis-[260px]">
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

        <div className="grid flex-[3] basis-[480px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-8">
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
            {/* Index of all 26 policy documents — the column above is a selection. */}
            <Link to="/legal" className={`${LINK_CLASS} mt-2.5 block font-semibold`}>
              {t('legalHub_eyebrow')}
            </Link>
          </div>
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
