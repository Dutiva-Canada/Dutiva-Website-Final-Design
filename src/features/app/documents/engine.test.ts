import { describe, expect, it } from 'vitest'
import {
  applicability,
  can,
  computedTokens,
  docActionsFor,
  fillProgress,
  gatePasses,
  mergeSegments,
  resolveBlocks,
} from './engine'
import { defaultOrgProfile, sampleDocuments, templateByTid } from './data'
import type { DocTemplate, GeneratedDoc, OrgProfile } from './data'

const tpl = (tid: string): DocTemplate => {
  const t = templateByTid.get(tid)
  if (!t) throw new Error(`missing template ${tid}`)
  return t
}
const org = (over: Partial<OrgProfile>): OrgProfile => ({ ...defaultOrgProfile, ...over })

describe('conditional clauses (template × jurisdiction × headcount × union)', () => {
  it('T01 injects the ON disconnecting-from-work clause only at ON with 25+ staff', () => {
    const t = tpl('T01')
    const base = { unionized: false }
    const on25 = resolveBlocks(t, { ...base, jurisdiction: 'ON', headcount: 25 })
    const on24 = resolveBlocks(t, { ...base, jurisdiction: 'ON', headcount: 24 })
    const qc100 = resolveBlocks(t, { ...base, jurisdiction: 'QC', headcount: 100 })
    expect(on25.length).toBe(t.preview.length)
    expect(on24.length).toBe(t.preview.length - 1)
    expect(qc100.length).toBe(t.preview.length - 1)
    const gated = t.preview.find((b) => b.when)
    expect(gated?.when).toEqual({ juris: 'ON', min_headcount: 25 })
  })

  it.each(['T03', 'T06', 'T15', 'T16'])(
    '%s injects the collective-agreement clause only for unionized orgs',
    (tid) => {
      const t = tpl(tid)
      const ctx = { jurisdiction: 'ON' as const, headcount: 38 }
      const union = resolveBlocks(t, { ...ctx, unionized: true })
      const nonUnion = resolveBlocks(t, { ...ctx, unionized: false })
      expect(union.length).toBe(nonUnion.length + 1)
    },
  )

  it('resolved T03 clause text is stable per context (snapshot matrix)', () => {
    const t = tpl('T03')
    const texts = (unionized: boolean) =>
      resolveBlocks(t, { jurisdiction: 'ON', headcount: 38, unionized })
        .map((b) => b.text?.en ?? `[sig: ${b.roles?.map((r) => r.en).join(', ')}]`)
        .join('\n')
    expect(texts(false)).toMatchSnapshot('T03 ON non-union')
    expect(texts(true)).toMatchSnapshot('T03 ON unionized')
  })

  it('gatePasses evaluates every present test conjunctively', () => {
    const ctx = { jurisdiction: 'ON' as const, headcount: 30, unionized: true }
    expect(gatePasses(undefined, ctx)).toBe(true)
    expect(gatePasses({ juris: 'ON', min_headcount: 25, union: true }, ctx)).toBe(true)
    expect(gatePasses({ juris: 'QC' }, ctx)).toBe(false)
    expect(gatePasses({ min_headcount: 31 }, ctx)).toBe(false)
    expect(gatePasses({ union: false }, ctx)).toBe(false)
  })
})

describe('applicability engine', () => {
  it('Northgate defaults: 38 staff, non-union (guard for the cases below)', () => {
    expect(defaultOrgProfile.headcount).toBeLessThan(50)
    expect(defaultOrgProfile.headcount).toBeGreaterThanOrEqual(25)
    expect(defaultOrgProfile.unionized).toBe(false)
  })

  it('T15 (group termination) is size-triggered at 50+', () => {
    expect(applicability(tpl('T15'), defaultOrgProfile).kind).toBe('below')
    expect(applicability(tpl('T15'), org({ headcount: 50 })).kind).toBe('required')
    expect(applicability(tpl('T15'), org({ headcount: 49 })).kind).toBe('below')
  })

  it('collective agreement takes precedence for unionized orgs', () => {
    expect(applicability(tpl('T15'), org({ unionized: true, headcount: 60 })).kind).toBe('union')
    expect(applicability(tpl('T03'), org({ unionized: true })).kind).toBe('union')
    expect(applicability(tpl('T03'), defaultOrgProfile).kind).toBe('applies')
  })

  it('clause-level size gates surface as "required" once the org crosses them', () => {
    expect(applicability(tpl('T01'), org({ headcount: 30 })).kind).toBe('required')
    expect(applicability(tpl('T01'), org({ headcount: 10 })).kind).toBe('applies')
  })

  it('ungated templates simply apply', () => {
    expect(applicability(tpl('T05'), defaultOrgProfile).kind).toBe('applies')
  })
})

describe('merge fields', () => {
  it('splits filled vs unfilled tokens for the live preview', () => {
    const segs = mergeSegments('Dear {{candidate_name}}, start {{start_date}}.', {
      candidate_name: 'Gabriel Dubois',
    })
    expect(segs).toEqual([
      { kind: 'text', text: 'Dear ' },
      { kind: 'filled', text: 'Gabriel Dubois' },
      { kind: 'text', text: ', start ' },
      { kind: 'unfilled', text: 'start date' },
      { kind: 'text', text: '.' },
    ])
  })

  it('computed tokens localize jurisdiction and statute', () => {
    expect(computedTokens('QC', 'fr', '2026-07-10').statute).toBe(
      'Loi sur les normes du travail (LNT)',
    )
    expect(computedTokens('ON', 'en', '2026-07-10').jurisdiction).toBe('Ontario')
  })

  it('fillProgress counts answer-backed tokens only', () => {
    const t = tpl('T01')
    const empty = fillProgress(t, {})
    expect(empty.total).toBeGreaterThan(5)
    expect(empty.filled).toBe(0)
    expect(fillProgress(t, { candidate_name: 'A' }).filled).toBe(1)
  })
})

describe('role & status action gating', () => {
  const docBy = (status: GeneratedDoc['status'], archived = false): GeneratedDoc => {
    const base = sampleDocuments[0]
    if (!base) throw new Error('no sample documents')
    return { ...base, status, archived }
  }

  it('viewers and external signers get no actions', () => {
    expect(docActionsFor(docBy('draft'), 'viewer')).toEqual([])
    expect(docActionsFor(docBy('approved'), 'external')).toEqual([])
  })

  it('owner on an archived document can only restore', () => {
    expect(docActionsFor(docBy('archived', true), 'owner')).toEqual(['restore'])
  })

  it('hr on in_review can approve but not request review or restore', () => {
    const actions = docActionsFor(docBy('in_review'), 'hr')
    expect(actions).toContain('approve')
    expect(actions).not.toContain('request_review')
    expect(actions).not.toContain('restore')
    expect(actions).not.toContain('void')
  })

  it('send for signature requires an approved document', () => {
    expect(docActionsFor(docBy('approved'), 'hr')).toContain('send_for_signature')
    expect(docActionsFor(docBy('draft'), 'hr')).not.toContain('send_for_signature')
  })

  it('manager can generate and export but not edit or approve', () => {
    expect(can('manager', 'generate')).toBe(true)
    expect(can('manager', 'export')).toBe(true)
    expect(can('manager', 'edit')).toBe(false)
    expect(can('manager', 'approve_review')).toBe(false)
  })
})
