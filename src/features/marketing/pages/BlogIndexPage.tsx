import { useI18n } from '@/i18n/context'
import type { MessageKey } from '@/i18n/messages'
import { MarketingPageShell, PageCta, PageHero } from './MarketingPage'

const POSTS: { metaKey: MessageKey; titleKey: MessageKey; excerptKey: MessageKey }[] = [
  { metaKey: 'blog_p1_meta', titleKey: 'blog_p1_t', excerptKey: 'blog_p1_x' },
  { metaKey: 'blog_p2_meta', titleKey: 'blog_p2_t', excerptKey: 'blog_p2_x' },
  { metaKey: 'blog_p3_meta', titleKey: 'blog_p3_t', excerptKey: 'blog_p3_x' },
  { metaKey: 'blog_p4_meta', titleKey: 'blog_p4_t', excerptKey: 'blog_p4_x' },
  { metaKey: 'blog_p5_meta', titleKey: 'blog_p5_t', excerptKey: 'blog_p5_x' },
  { metaKey: 'blog_p6_meta', titleKey: 'blog_p6_t', excerptKey: 'blog_p6_x' },
]

/** /blog — article index cards (blog_* strings). */
export function BlogIndexPage() {
  const { t } = useI18n()
  return (
    <MarketingPageShell>
      <PageHero eyebrow={t('blog_eyebrow')} title={t('blog_h1')} intro={t('blog_intro')} />

      <section className="mx-auto max-w-[1200px] px-6 py-8">
        {/* Article detail pages don't exist yet (the prototype's cards link to
            '#'), so these are plain cards — article routes are a future addition. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {POSTS.map((post) => (
            <article key={post.titleKey} className="premium-card-soft p-[22px]">
              <div className="text-xs font-medium text-gold-strong">{t(post.metaKey)}</div>
              <h2 className="mt-2.5 text-[0.9375rem] font-semibold text-text">
                {t(post.titleKey)}
              </h2>
              <p className="mt-1.5 text-sm leading-[1.55] text-text-2">{t(post.excerptKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        title={t('blog_cta_t')}
        body={t('blog_cta_p')}
        action={t('blog_cta_btn')}
        to="/app/welcome"
      />
    </MarketingPageShell>
  )
}
