import { describe, expect, it } from 'vitest'
import { mentionsStatutoryFigure } from '@/features/app/advisor/safety/statutoryFigures'
import { ALL_ARTICLES } from './index'
import type { Article } from './articleModel'

/**
 * Enforcement for the editorial rule stated at the top of `articleModel.ts`:
 * articles explain concepts, decision points and what to document, and
 * deliberately **do not publish statutory figures** — notice-week tables,
 * dollar thresholds, deadline counts — because those go stale, vary by
 * jurisdiction and fact pattern, and become compliance representations the
 * moment they are wrong.
 *
 * The rule held by hand, but it lived only in a doc comment, so an article
 * containing "eight weeks' notice" would have shipped green. These pages are
 * prerendered, indexed and GEO-targeted at answer engines (docs/
 * SEO_GEO_IMPLEMENTATION.md), which means a wrong figure here does not stay
 * here — it gets quoted onward, by machines, without the disclaimer that sits
 * next to it on the page.
 *
 * The detector is the same one the Advisor already runs against model prose
 * (`advisor/safety/statutoryFigures.ts`), pointed at the editorial corpus:
 * one definition of "this looks like a statutory figure", enforced in both
 * the generated and the authored halves of the product.
 *
 * If a future article genuinely needs a figure, that is a decision to make
 * deliberately — change the rule in `articleModel.ts` and this test together,
 * rather than letting one article quietly become the exception.
 */

/** Every authored string in an article, labelled for a readable failure. */
function strings(article: Article): { where: string; text: string }[] {
  const out = [
    { where: 'title', text: article.title },
    { where: 'summary', text: article.summary },
    { where: 'topic', text: article.topic },
  ].flatMap(({ where, text }) => [
    { where: `${where} (en)`, text: text.en },
    { where: `${where} (fr)`, text: text.fr },
  ])

  article.sections.forEach((section, s) => {
    if (section.heading) {
      out.push({ where: `section ${s} heading (en)`, text: section.heading.en })
      out.push({ where: `section ${s} heading (fr)`, text: section.heading.fr })
    }
    section.blocks.forEach((block, b) => {
      out.push({ where: `section ${s} block ${b} (en)`, text: block.text.en })
      out.push({ where: `section ${s} block ${b} (fr)`, text: block.text.fr })
    })
  })

  return out
}

/** A currency amount — a threshold, penalty or wage figure. */
const CURRENCY = /\$\s?\d/

describe('editorial rule: articles publish no statutory figures', () => {
  it('has articles to check', () => {
    /* Guards the suite itself: an empty corpus would pass every assertion
       below while checking nothing. */
    expect(ALL_ARTICLES.length).toBeGreaterThan(0)
  })

  it.each(ALL_ARTICLES.map((article) => [article.slug, article] as const))(
    '%s states no notice/severance quantity',
    (_slug, article) => {
      const offenders = strings(article)
        .filter(({ text }) => mentionsStatutoryFigure(text))
        .map(({ where, text }) => `${where}: ${text}`)

      expect(offenders).toEqual([])
    },
  )

  it.each(ALL_ARTICLES.map((article) => [article.slug, article] as const))(
    '%s quotes no dollar figure',
    (_slug, article) => {
      const offenders = strings(article)
        .filter(({ text }) => CURRENCY.test(text))
        .map(({ where, text }) => `${where}: ${text}`)

      expect(offenders).toEqual([])
    },
  )
})
