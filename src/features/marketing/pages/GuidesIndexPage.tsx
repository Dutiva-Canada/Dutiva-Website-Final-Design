import { BookOpen } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { MessageKey } from '@/i18n/messages'
import { Seo } from '@/seo/Seo'
import { MarketingPageShell, PageCta, PageHero, PageSection } from './MarketingPage'

/** Reuses the landing page's Guides section copy (landing_g1_t … landing_g6_t/p). */
const GUIDES: { title: MessageKey; body: MessageKey }[] = [
  { title: 'landing_g1_t', body: 'landing_g1_p' },
  { title: 'landing_g2_t', body: 'landing_g2_p' },
  { title: 'landing_g3_t', body: 'landing_g3_p' },
  { title: 'landing_g4_t', body: 'landing_g4_p' },
  { title: 'landing_g5_t', body: 'landing_g5_p' },
  { title: 'landing_g6_t', body: 'landing_g6_p' },
]

/**
 * /guides — index of HR guides linked from the landing page's Guides
 * section ("Browse all guides"). Card copy is the same landing_g* strings
 * shown in the teaser; this page just gives them a permanent home.
 */
export function GuidesIndexPage() {
  const { t } = useI18n()

  return (
    <MarketingPageShell>
      <Seo route="guides" pageType="CollectionPage" />
      <PageHero
        eyebrow={t('guidesIdx_eyebrow')}
        title={t('guidesIdx_h1')}
        intro={t('guidesIdx_intro')}
      />

      <PageSection title={t('guidesIdx_section_title')}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {GUIDES.map((guide) => (
            <div key={guide.title} className="premium-card-soft p-[22px]">
              <div className="flex items-start gap-3">
                <BookOpen size={16} className="mt-0.5 flex-none text-gold-strong" />
                <div>
                  <div className="text-[0.9375rem] font-semibold text-text">{t(guide.title)}</div>
                  <p className="mt-1.5 text-sm leading-[1.55] text-text-2">{t(guide.body)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageCta
        title={t('guidesIdx_cta_t')}
        body={t('guidesIdx_cta_p')}
        action={t('guidesIdx_cta_btn')}
        to="/app/welcome"
      />
    </MarketingPageShell>
  )
}
