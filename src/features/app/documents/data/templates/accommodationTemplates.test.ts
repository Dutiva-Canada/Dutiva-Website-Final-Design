import { describe, expect, it } from 'vitest'
import { allTemplates } from '../../catalogue'
import { computedTokens, mergeSegments, resolveBlocks } from '../../engine'
import type { DocTemplate, Jurisdiction } from '../types'

/**
 * Guards for the accommodation templates authored in-repo (T21–T24, Ring 2
 * Pillar B — docs/FOUR_RING_FRAMEWORK.md).
 *
 * The handoff-derived templates were machine-generated from validated JSON,
 * so their bilingual completeness and token hygiene were guaranteed by the
 * generator. These were typed by hand, and the generator that would have
 * caught a missing `fr` or a merge field with no question behind it no longer
 * runs — so the checks it performed are asserted here instead.
 *
 * These are structural, not editorial: no test can tell you the French reads
 * well or the statute is named correctly. What they catch is a token that
 * renders as a literal `{{placeholder}}` in a customer's document, and copy
 * that silently ships English to a French workspace.
 */

const TIDS = ['T21', 'T22', 'T23', 'T24'] as const
const JURISDICTIONS: Jurisdiction[] = ['ON', 'QC', 'FED']

const template = (tid: string): DocTemplate => {
  const found = allTemplates.find((t) => t.tid === tid)
  if (!found) throw new Error(`missing template ${tid}`)
  return found
}

/** Every `Bi` reachable from a template, as [path, value] pairs. */
function biStrings(tpl: DocTemplate): [string, { en: string; fr: string }][] {
  const out: [string, { en: string; fr: string }][] = [
    ['name', tpl.name],
    ['desc', tpl.desc],
    ...tpl.statutory.map((s, i): [string, typeof s] => [`statutory[${i}]`, s]),
    ...Object.entries(tpl.jurisdictionNotes).map(([k, v]): [string, typeof v] => [
      `jurisdictionNotes.${k}`,
      v,
    ]),
    ...tpl.includes.map((s, i): [string, typeof s] => [`includes[${i}]`, s]),
  ]
  for (const [i, q] of tpl.questions.entries()) {
    out.push([`questions[${i}].section`, q.section], [`questions[${i}].label`, q.label])
    if (q.placeholder) out.push([`questions[${i}].placeholder`, q.placeholder])
    if (q.hint) out.push([`questions[${i}].hint`, q.hint])
    for (const [j, o] of (q.options ?? []).entries()) {
      out.push([`questions[${i}].options[${j}].label`, o.label])
    }
  }
  for (const [i, b] of tpl.preview.entries()) {
    if (b.text) out.push([`preview[${i}].text`, b.text])
    if (b.heading) out.push([`preview[${i}].heading`, b.heading])
    for (const [j, r] of (b.roles ?? []).entries()) {
      out.push([`preview[${i}].roles[${j}]`, r])
    }
  }
  return out
}

const TOKEN_RE = /\{\{([a-z0-9_]+)\}\}/g
const tokensIn = (text: string): string[] => [...text.matchAll(TOKEN_RE)].map((m) => m[1] ?? '')

describe.each(TIDS)('%s', (tid) => {
  it('is in the accommodation category and covers all three jurisdictions', () => {
    const tpl = template(tid)
    expect(tpl.category).toBe('accommodation')
    expect([...tpl.jurisdictions].sort()).toEqual([...JURISDICTIONS].sort())
    /* A jurisdiction claimed in `jurisdictions` with no note behind it is the
       "implied coverage that doesn't exist" CANONICAL_FACTS §3 bars. */
    expect(Object.keys(tpl.jurisdictionNotes).sort()).toEqual([...JURISDICTIONS].sort())
  })

  it('ships every string in both languages, with no untranslated FR', () => {
    for (const [path, bi] of biStrings(template(tid))) {
      expect(bi.en.trim(), `${tid} ${path}.en`).not.toBe('')
      expect(bi.fr.trim(), `${tid} ${path}.fr`).not.toBe('')
      /* Prose copied verbatim into `fr` means it was never translated. Merge
         fields and short shared tokens legitimately match, so only sentences
         are compared. */
      if (bi.en.split(/\s+/).length > 3 && !bi.en.startsWith('{{')) {
        expect(bi.fr, `${tid} ${path} is untranslated`).not.toBe(bi.en)
      }
    }
  })

  it('resolves every merge field from a question or a computed token', () => {
    const tpl = template(tid)
    const answerable = new Set(tpl.questions.map((q) => q.id))
    const computed = new Set(Object.keys(computedTokens('ON', 'en', '2026-08-01')))

    for (const block of tpl.preview) {
      for (const lang of ['en', 'fr'] as const) {
        for (const token of tokensIn(block.text?.[lang] ?? '')) {
          expect(
            answerable.has(token) || computed.has(token),
            `${tid} renders {{${token}}} (${lang}) with nothing to fill it`,
          ).toBe(true)
        }
      }
    }
  })

  it('leaves no unfilled merge field once every question is answered', () => {
    const tpl = template(tid)
    const answers = Object.fromEntries(tpl.questions.map((q) => [q.id, 'x']))

    for (const jurisdiction of JURISDICTIONS) {
      const blocks = resolveBlocks(tpl, { jurisdiction, headcount: 38, unionized: true })
      for (const block of blocks) {
        const text = block.text?.en
        if (text === undefined) continue
        const filled = { ...answers, ...computedTokens(jurisdiction, 'en', '2026-08-01') }
        const unfilled = mergeSegments(text, filled).filter((s) => s.kind === 'unfilled')
        expect(unfilled, `${tid} ${jurisdiction}`).toEqual([])
      }
    }
  })

  it('carries the not-legal-advice note', () => {
    const notes = template(tid)
      .preview.filter((b) => b.type === 'note')
      .map((b) => `${b.text?.en ?? ''} ${b.text?.fr ?? ''}`.toLowerCase())
    expect(notes.length).toBeGreaterThan(0)
    expect(notes.some((n) => n.includes('legal advice') && n.includes('conseils juridiques'))).toBe(
      true,
    )
  })
})

describe('the accommodation category', () => {
  it('holds the whole workflow, including the two recategorized legacy documents', () => {
    const tids = allTemplates.filter((t) => t.category === 'accommodation').map((t) => t.tid)
    /* T19/T20 moved here from `discipline` — filing an accommodation record
       under discipline misstates what the document is. */
    expect(tids).toEqual(['T19', 'T20', 'T21', 'T22', 'T23', 'T24'])
  })

  it('routes the two refusal-bearing documents to lawyer review', () => {
    /* T22 (the answer the employee receives) and T24 (the record behind it)
       are the two an employer is asked to produce when a refusal is
       challenged. */
    for (const tid of ['T22', 'T24']) {
      const tpl = template(tid)
      expect(tpl.risk, tid).toBe('high')
      expect(tpl.requiresLawyerReview, tid).toBe(true)
      expect(tpl.review, tid).toBe('lawyer_review_recommended')
    }
  })

  it('never asks for a diagnosis', () => {
    /* The constraint the framework puts on Pillar B, and the one thing in
       these documents that would be a privacy failure rather than a wording
       preference. Every mention must be a prohibition. */
    for (const tid of TIDS) {
      const tpl = template(tid)
      const prose = [
        ...tpl.questions.flatMap((q) => [q.label.en, q.placeholder?.en ?? '', q.hint?.en ?? '']),
        ...tpl.preview.map((b) => b.text?.en ?? ''),
      ]
      for (const line of prose) {
        if (!/diagnosis/i.test(line)) continue
        expect(line, `${tid}: "${line}"`).toMatch(/\b(not|never|no|without)\b/i)
      }
    }
  })
})
