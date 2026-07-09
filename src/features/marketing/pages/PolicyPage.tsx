import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { groupPolicyBlocks, policyDoc, resolvePolicyEdition } from '../legal/policyContent'
import { MarketingPageShell } from './MarketingPage'

/**
 * /legal/:slug — a single policy document from the bilingual legal content
 * collection (legalHub_* chrome strings). Unknown slugs redirect back to the
 * /legal hub. All 26 documents currently ship both editions; if a future
 * document lands French-first, the French edition renders under the EN UI
 * with a notice and `lang="fr"` on the article.
 */
export function PolicyPage() {
  const { slug } = useParams()
  const { t, L, lang } = useI18n()
  const doc = policyDoc(slug ?? '')
  const resolved = doc ? resolvePolicyEdition(doc, lang) : undefined
  if (!resolved) return <Navigate to="/legal" replace />

  const { edition, lang: editionLang } = resolved
  const colon = L(': ', ' : ')
  const metaParts: string[] = []
  if (edition.lastUpdated) {
    metaParts.push(`${t('legalHub_lastUpdated')}${colon}${edition.lastUpdated}`)
  }
  if (edition.effectiveDate) {
    metaParts.push(`${t('legalHub_effective')}${colon}${edition.effectiveDate}`)
  }

  return (
    <MarketingPageShell>
      <article
        className="mx-auto max-w-[820px] px-6 pt-12 pb-16"
        lang={editionLang !== lang ? 'fr' : undefined}
      >
        <Link
          to="/legal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gold-strong transition-opacity hover:opacity-80"
        >
          <ArrowLeft size={15} />
          {t('legalHub_back')}
        </Link>

        <h1 className="mt-6 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.12] font-semibold tracking-[-0.02em] text-text">
          {edition.title}
        </h1>

        {metaParts.length > 0 && (
          <p className="mt-3 text-sm text-text-3">{metaParts.join(' · ')}</p>
        )}

        {editionLang !== lang && (
          <div className="premium-card-soft mt-6 flex items-start gap-2.5 px-[18px] py-[14px]">
            <Info size={15} className="mt-0.5 flex-none text-gold-strong" />
            <p className="text-sm leading-[1.55] text-text-2">{t('legalHub_frOnly')}</p>
          </div>
        )}

        {edition.callout && edition.callout.length > 0 && (
          <div className="premium-card mt-6 p-[clamp(20px,3vw,28px)]">
            {edition.callout.map((entry, index) => (
              <p
                key={index}
                className={`${index > 0 ? 'mt-3 ' : ''}text-[0.9375rem] leading-[1.65] text-text-2`}
              >
                {entry}
              </p>
            ))}
          </div>
        )}

        {edition.sections.map((section, sectionIndex) => (
          <section key={sectionIndex}>
            <h2 className="mt-9 font-display text-[1.25rem] font-semibold tracking-[-0.01em] text-text">
              {section.title}
            </h2>
            {groupPolicyBlocks(section.blocks).map((group, groupIndex) =>
              group.kind === 'p' ? (
                <p key={groupIndex} className="mt-3.5 text-[0.9375rem] leading-[1.7] text-text-2">
                  {group.text}
                </p>
              ) : (
                <ul key={groupIndex} className="mt-3.5 grid list-disc gap-2 pl-5">
                  {group.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-[0.9375rem] leading-[1.65] text-text-2 marker:text-gold-strong"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}

        {/* Not the shared src/components/Disclaimer.tsx — it is styled with app-surface tokens (text-text-muted/text-text-faint) that are undefined in the .surface-marketing scope. */}
        <div className="mt-10 flex items-start gap-2.5 border-t border-border pt-5">
          <Info size={14} className="mt-0.5 flex-none text-gold-strong" />
          <span className="text-[12.5px] leading-[1.6] text-text-3">{t('disclaimer_full')}</span>
        </div>
      </article>
    </MarketingPageShell>
  )
}
