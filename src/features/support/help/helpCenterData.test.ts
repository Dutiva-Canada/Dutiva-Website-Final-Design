import { describe, expect, it } from 'vitest'
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  groupHelpBlocks,
  helpArticlesByCategory,
  helpCategory,
} from './helpCenterData'
import type { HelpBlock, HelpCategoryId } from './helpCenterData'

const CATEGORY_IDS = new Set<HelpCategoryId>(HELP_CATEGORIES.map((c) => c.id))

describe('help centre data integrity', () => {
  it('has unique English slugs and French slugs, with disjoint spaces', () => {
    const en = HELP_ARTICLES.map((a) => a.slug)
    const fr = HELP_ARTICLES.map((a) => a.frSlug)
    expect(new Set(en).size).toBe(en.length)
    expect(new Set(fr).size).toBe(fr.length)
    // Cross-locale slug fallback in HelpArticlePage depends on no collisions.
    expect(new Set([...en, ...fr]).size).toBe(en.length + fr.length)
  })

  it('lower-cases, hyphenated slugs with no spaces', () => {
    for (const article of HELP_ARTICLES) {
      for (const slug of [article.slug, article.frSlug]) {
        expect(slug, slug).toMatch(/^[a-z0-9-]+$/)
      }
    }
  })

  it('assigns every article to a known category', () => {
    for (const article of HELP_ARTICLES) {
      expect(CATEGORY_IDS.has(article.category), article.slug).toBe(true)
    }
  })

  it('gives every category at least one article', () => {
    for (const category of HELP_CATEGORIES) {
      expect(helpArticlesByCategory(category.id).length, category.id).toBeGreaterThan(0)
    }
  })

  it('ships bilingual, non-empty titles and summaries', () => {
    for (const article of HELP_ARTICLES) {
      for (const lang of ['en', 'fr'] as const) {
        expect(article.title[lang].trim().length, article.slug).toBeGreaterThan(0)
        expect(article.summary[lang].trim().length, article.slug).toBeGreaterThan(10)
      }
    }
  })

  it('helpCategory resolves known ids and throws on unknown', () => {
    expect(helpCategory('getting_started').id).toBe('getting_started')
    expect(() => helpCategory('nope' as HelpCategoryId)).toThrow()
  })
})

describe('groupHelpBlocks', () => {
  it('merges consecutive list items and keeps paragraphs standalone', () => {
    const blocks: HelpBlock[] = [
      { type: 'p', text: { en: 'intro', fr: 'intro' } },
      { type: 'li', text: { en: 'one', fr: 'un' } },
      { type: 'li', text: { en: 'two', fr: 'deux' } },
      { type: 'p', text: { en: 'outro', fr: 'fin' } },
    ]
    const groups = groupHelpBlocks(blocks)
    expect(groups.map((g) => g.kind)).toEqual(['p', 'list', 'p'])
    const list = groups[1]
    expect(list?.kind === 'list' && list.items).toHaveLength(2)
  })
})
