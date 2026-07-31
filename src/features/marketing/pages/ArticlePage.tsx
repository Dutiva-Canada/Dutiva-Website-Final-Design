import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { Seo } from '@/seo/Seo'
import { articleDescription, articleTitle, seoRoute } from '@/seo/routes'
import {
  articleBySlug,
  articlePath,
  groupArticleBlocks,
  relatedArticles,
} from '@/features/marketing/articles'
import type { ArticleCollection } from '@/features/marketing/articles'
import { Breadcrumbs, MarketingPageShell } from './MarketingPage'

/**
 * One editorial article: `/guides/:slug` (EN) / `/fr/guides/:slug` (FR), or
 * `/blog/:slug` / `/fr/blogue/:slug`. Content is bundled `Bi` data, so this
 * renders synchronously — no lazy content import to await during prerender.
 *
 * Unknown slugs redirect to the collection index rather than 404ing, matching
 * PolicyPage and HelpArticlePage. `/guides/template-usage` is a separate
 * static route and is matched ahead of this one by the router's ranking.
 */
export function ArticlePage({ collection }: { readonly collection: ArticleCollection }) {
  const { slug } = useParams()
  const { t, x, lang } = useI18n()
  const article = articleBySlug(collection, slug ?? '', lang)
  const indexRoute = seoRoute(collection === 'guide' ? 'guides' : 'blog')
  const indexPath = indexRoute.path[lang]

  if (!article) return <Navigate to={indexPath} replace />

  const related = relatedArticles(article)
  const indexName = x(
    collection === 'guide' ? { en: 'Guides', fr: 'Guides' } : { en: 'Blog', fr: 'Blogue' },
  )
  /* Shared by the visible trail and the BreadcrumbList JSON-LD. */
  const trail = [
    { name: 'Dutiva', path: lang === 'fr' ? '/fr' : '/' },
    { name: indexName, path: indexPath },
    { name: articleTitle(article, lang) },
  ]

  return (
    <MarketingPageShell>
      <Seo
        page={{
          title: {
            en: `${articleTitle(article, 'en')} | Dutiva`,
            fr: `${articleTitle(article, 'fr')} | Dutiva`,
          },
          description: {
            en: articleDescription(article, 'en'),
            fr: articleDescription(article, 'fr'),
          },
          path: { en: articlePath(article, 'en'), fr: articlePath(article, 'fr') },
          indexable: true,
        }}
        breadcrumb={trail}
      />
      <Breadcrumbs items={trail} />

      <article className="mx-auto max-w-[760px] px-6 pt-8 pb-10">
        <Link
          to={indexPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gold-strong transition-opacity hover:opacity-80"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {x({ en: `Back to ${indexName}`, fr: `Retour à ${indexName}` })}
        </Link>

        <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-text-3 uppercase">
          {x(article.topic)} ·{' '}
          {x({
            en: `${article.readingMinutes} min read`,
            fr: `${article.readingMinutes} min de lecture`,
          })}
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.625rem,3vw,2.25rem)] leading-[1.14] font-semibold tracking-[-0.02em] text-text">
          {x(article.title)}
        </h1>
        <p className="mt-3.5 text-lg leading-[1.6] text-text-2">{x(article.summary)}</p>

        {article.sections.map((section, sectionIndex) => (
          <section key={section.heading ? x(section.heading) : `s${sectionIndex}`}>
            {section.heading && (
              <h2 className="mt-8 font-display text-[1.1875rem] font-semibold tracking-[-0.01em] text-text">
                {x(section.heading)}
              </h2>
            )}
            {groupArticleBlocks(section.blocks).map((group, groupIndex) =>
              group.kind === 'p' ? (
                <p
                  key={`p${groupIndex}`}
                  className="mt-3.5 text-[0.9375rem] leading-[1.7] text-text-2"
                >
                  {x(group.text)}
                </p>
              ) : (
                <ul key={`l${groupIndex}`} className="mt-3.5 grid list-disc gap-2 pl-5">
                  {group.items.map((item) => (
                    <li
                      key={x(item)}
                      className="text-[0.9375rem] leading-[1.65] text-text-2 marker:text-gold-strong"
                    >
                      {x(item)}
                    </li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold tracking-[0.14em] text-text-3 uppercase">
              {x({ en: 'Keep reading', fr: 'Poursuivre la lecture' })}
            </h2>
            <ul className="mt-3 grid gap-2.5">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    to={articlePath(a, lang)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-[18px] py-3.5 transition-colors hover:border-gold-strong"
                  >
                    <span className="text-[0.9375rem] font-semibold text-text">{x(a.title)}</span>
                    <ArrowRight
                      size={15}
                      aria-hidden="true"
                      className="flex-none text-text-3 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex items-start gap-2.5 border-t border-border pt-5">
          <Info size={14} className="mt-0.5 flex-none text-gold-strong" aria-hidden="true" />
          <span className="text-[12.5px] leading-[1.6] text-text-3">{t('disclaimer_full')}</span>
        </div>
      </article>
    </MarketingPageShell>
  )
}

export function GuideArticlePage() {
  return <ArticlePage collection="guide" />
}

export function BlogArticlePage() {
  return <ArticlePage collection="blog" />
}
