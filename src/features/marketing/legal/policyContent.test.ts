import { describe, expect, it } from 'vitest'
import { LEGAL_HUB_GROUPS } from './legalHubData'
import { groupPolicyBlocks, policyDoc, resolvePolicyEdition } from './policyContent'
import type { PolicyDoc, PolicyEdition } from './policyContent'

describe('policy content collection', () => {
  const hubSlugs = LEGAL_HUB_GROUPS.flatMap((group) => group.rows.map((row) => row.slug))

  it('lists 26 unique documents on the hub', () => {
    expect(hubSlugs).toHaveLength(26)
    expect(new Set(hubSlugs).size).toBe(26)
  })

  it('ships BOTH language editions for every hub document', () => {
    for (const slug of hubSlugs) {
      const doc = policyDoc(slug)
      expect(doc, slug).toBeDefined()
      expect(doc?.en, `${slug} is missing its EN edition`).toBeDefined()
      expect(doc?.fr, `${slug} is missing its FR edition`).toBeDefined()
    }
  })

  it('every edition has a title and at least one section', () => {
    for (const slug of hubSlugs) {
      const doc = policyDoc(slug)
      for (const edition of [doc?.en, doc?.fr]) {
        expect(edition?.title, slug).toBeTruthy()
        expect(edition?.sections.length, slug).toBeGreaterThan(0)
      }
    }
  })
})

describe('resolvePolicyEdition', () => {
  const edition = (title: string): PolicyEdition => ({ title, sections: [] })

  it('prefers the requested language', () => {
    const doc: PolicyDoc = { slug: 'x', en: edition('EN'), fr: edition('FR') }
    expect(resolvePolicyEdition(doc, 'en')).toEqual({ edition: doc.en, lang: 'en' })
    expect(resolvePolicyEdition(doc, 'fr')).toEqual({ edition: doc.fr, lang: 'fr' })
  })

  it('falls back to the other language when the requested edition is missing', () => {
    const frOnly: PolicyDoc = { slug: 'x', fr: edition('FR') }
    expect(resolvePolicyEdition(frOnly, 'en')).toEqual({ edition: frOnly.fr, lang: 'fr' })
    const enOnly: PolicyDoc = { slug: 'x', en: edition('EN') }
    expect(resolvePolicyEdition(enOnly, 'fr')).toEqual({ edition: enOnly.en, lang: 'en' })
  })

  it('returns undefined when no edition exists', () => {
    expect(resolvePolicyEdition({ slug: 'x' }, 'en')).toBeUndefined()
  })
})

describe('groupPolicyBlocks', () => {
  it('groups consecutive li runs into lists and keeps paragraphs standalone', () => {
    expect(
      groupPolicyBlocks([
        { type: 'p', text: 'a' },
        { type: 'li', text: 'b' },
        { type: 'li', text: 'c' },
        { type: 'p', text: 'd' },
        { type: 'li', text: 'e' },
      ]),
    ).toEqual([
      { kind: 'p', text: 'a' },
      { kind: 'list', items: ['b', 'c'] },
      { kind: 'p', text: 'd' },
      { kind: 'list', items: ['e'] },
    ])
  })
})
