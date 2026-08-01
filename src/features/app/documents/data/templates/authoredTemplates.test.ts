import { describe, expect, it } from 'vitest'
import { allTemplates } from '../../catalogue'
import { computedTokens, mergeSegments, resolveBlocks } from '../../engine'
import { templateCategories } from '../meta'
import type { DocTemplate, Jurisdiction } from '../types'

/**
 * Guards for every template authored in-repo — T21 up, the ones under
 * `data/templates/` that did not come from the handoff
 * (docs/FOUR_RING_FRAMEWORK.md).
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

/* Derived from the catalogue rather than listed, so a template authored
   without a matching test entry cannot slip through ungoverned. */
const AUTHORED_FROM = 21
const AUTHORED = allTemplates.filter((t) => Number(t.tid.slice(1)) >= AUTHORED_FROM)
const TIDS = AUTHORED.map((t) => t.tid)
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
  it('covers all three jurisdictions, each with a note behind it', () => {
    const tpl = template(tid)
    expect([...tpl.jurisdictions].sort()).toEqual([...JURISDICTIONS].sort())
    /* A jurisdiction claimed in `jurisdictions` with no note behind it is the
       "implied coverage that doesn't exist" CANONICAL_FACTS §3 bars. */
    expect(Object.keys(tpl.jurisdictionNotes).sort()).toEqual([...JURISDICTIONS].sort())
  })

  it('sits in a category the catalogue actually defines', () => {
    expect(templateCategories.map((c) => c.id)).toContain(template(tid).category)
  })

  it('routes to lawyer review when it is marked high risk', () => {
    /* The three fields are read in different places — a card chip, the
       wizard's review gate, the repository filter — and a template that is
       high risk in one and routine in another sends mixed signals about the
       document a customer is about to send. */
    const tpl = template(tid)
    if (tpl.risk !== 'high') return
    expect(tpl.requiresLawyerReview, tid).toBe(true)
    expect(tpl.review, tid).toBe('lawyer_review_recommended')
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

  it('marks the two refusal-bearing documents high risk', () => {
    /* T22 (the answer the employee receives) and T24 (the record behind it)
       are the two an employer is asked to produce when a refusal is
       challenged. The lawyer-review routing that follows from `high` is
       asserted for every authored template above. */
    for (const tid of ['T22', 'T24']) {
      expect(template(tid).risk, tid).toBe('high')
    }
  })
})

describe('jurisdiction-specific rules stay in jurisdiction notes', () => {
  /* The failure this guards is the one the review on #122 found twice and a
     later audit found again: a rule that holds in one jurisdiction, written
     into copy that renders for all three.
     `jurisdictionNotes` are the only place the reader sees a rule attributed
     to a jurisdiction, so anything jurisdictional has to live there. */
  const universalProse = (tid: string): string => {
    const tpl = template(tid)
    return [
      ...tpl.preview.flatMap((b) => [b.text?.en ?? '', b.heading?.en ?? '']),
      ...tpl.questions.flatMap((q) => [q.label.en, q.placeholder?.en ?? '', q.hint?.en ?? '']),
      ...tpl.includes.map((i) => i.en),
      ...tpl.statutory.map((s) => s.en),
    ].join('\n')
  }

  it('does not state Ontario’s closed list of hardship factors as universal', () => {
    /* Ontario's Code confines undue hardship to cost, outside funding, and
       health and safety, so employee morale is out. Québec names no list and
       weighs the whole of the circumstances, where disruption to the operation
       or the team can count. Saying "morale is not undue hardship" to every
       reader is therefore wrong for a Québec one. */
    expect(universalProse('T24')).not.toMatch(/morale/i)
    expect(template('T24').jurisdictionNotes.ON?.en).toMatch(/morale/i)
  })

  it('keeps the rules that do hold everywhere', () => {
    /* The opposite failure — hedging a claim that is actually universal until
       it says nothing. Business inconvenience and customer preference carry a
       refusal nowhere, and the document should still say so plainly. */
    const prose = universalProse('T24')
    expect(prose).toMatch(/inconvenience/i)
    expect(prose).toMatch(/preference/i)
  })
})

describe('medical privacy across every authored template', () => {
  it('never asks for a diagnosis', () => {
    /* The constraint the framework puts on Pillar B, and it does not stop
       there — the attendance policy and the return-from-leave letter reach
       for the same information. Asking for a diagnosis is a privacy failure
       rather than a wording preference, so every mention anywhere in the
       authored set must be a prohibition. */
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

describe('T31 investigation report — the federal de-identification rule', () => {
  /* The Work Place Harassment and Violence Prevention Regulations require an
     investigator's report not to reveal, directly or indirectly, anyone
     involved. ON and QC have no such rule and naming the parties there is
     normal, so the report is jurisdiction-split rather than de-identified
     everywhere — which is exactly the kind of split that decays silently. */
  const blocksFor = (jurisdiction: Jurisdiction) =>
    resolveBlocks(template('T31'), { jurisdiction, headcount: 38, unionized: false })
      .map((b) => b.text?.en ?? '')
      .join('\n')

  it('states the requirement on the face of the federal report', () => {
    expect(blocksFor('FED')).toMatch(/de-identified/i)
  })

  it('does not impose it on ON or QC, where no such rule applies', () => {
    expect(blocksFor('ON')).not.toMatch(/de-identified/i)
    expect(blocksFor('QC')).not.toMatch(/de-identified/i)
  })

  it('renders exactly one parties clause per jurisdiction', () => {
    /* Two gated ON/QC variants plus a FED one — a copy-paste slip that leaves
       two matching the same jurisdiction shows up as a duplicated clause in a
       customer's document, not as a type error. */
    for (const jurisdiction of JURISDICTIONS) {
      const parties = resolveBlocks(template('T31'), {
        jurisdiction,
        headcount: 38,
        unionized: false,
      }).filter((b) => b.heading?.en === 'Parties')
      expect(parties, jurisdiction).toHaveLength(1)
    }
  })
})

describe('the Ring 1 gaps the framework listed', () => {
  it('are all closed', () => {
    /* docs/FOUR_RING_FRAMEWORK.md recorded eight Ring 1 tools from the April
       framework with no template, plus the accommodation response. If one of
       these keys disappears, the framework doc's Ring 1 section is wrong and
       needs updating with it. */
    const keys = new Set(allTemplates.map((t) => t.key))
    for (const key of [
      'accommodation_response',
      'probationary_period_review',
      'promotion_salary_adjustment',
      'return_from_leave_confirmation',
      'attendance_policy',
      'roe_preparation_guide',
      'reference_letter',
      'investigation_report',
      'layoff_notice',
    ]) {
      expect(keys, key).toContain(key)
    }
  })
})
