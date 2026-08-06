import { describe, expect, it } from 'vitest'
import { assessOntarioActVersions, looksLikeCurrencyDate, ontarioFingerprintPayload } from './ontarioApi'

/**
 * A trimmed but real-shaped response, matching a live fetch of
 * https://www.ontario.ca/laws/api/v2/legislation/en/act-versions/statute/00e41
 * on 2026-08-05 — current version plus one historical version.
 */
const ESA_RESPONSE = JSON.stringify({
  aggregations: {
    all: {
      versions: {
        hits: {
          hits: [
            {
              _index: 'statute_202405',
              _id: 'UlA6XIYBOKnGi1ssbkFk',
              _source: {
                act: { en: 'Employment Standards Act, 2000' },
                alias: { en: 'statute/00e41' },
                state: { en: 'current' },
                title: { en: 'Employment Standards Act, 2000, S.O. 2000, c. 41' },
                dateFrom: { en: '2026-01-01T05:00:00.000Z' },
                version: 0,
              },
            },
            {
              _index: 'statute_202405',
              _id: 'm_f-jpsBbzy_QHiqmMJG',
              _source: {
                act: { en: 'Employment Standards Act, 2000' },
                dateTo: { en: '2025-12-31T05:00:00.000Z' },
                alias: { en: 'statute/00e41/v83' },
                state: { en: 'historical' },
                title: { en: 'Employment Standards Act, 2000, S.O. 2000, c. 41' },
                dateFrom: { en: '2025-11-27T05:00:00.000Z' },
                version: 83,
              },
            },
          ],
        },
      },
    },
  },
})

describe('assessOntarioActVersions', () => {
  it('accepts a real response and identifies the current version', () => {
    const verdict = assessOntarioActVersions(ESA_RESPONSE, 'Employment Standards Act')
    expect(verdict.ok).toBe(true)
    if (!verdict.ok) throw new Error('expected acceptance')
    expect(verdict.facts.current?.dateFrom).toBe('2026-01-01T05:00:00.000Z')
    expect(verdict.facts.versionCount).toBe(2)
  })

  it('sorts the normalized versions by version number, oldest first', () => {
    const verdict = assessOntarioActVersions(ESA_RESPONSE, 'Employment Standards Act')
    if (!verdict.ok) throw new Error('expected acceptance')
    expect(verdict.facts.normalizedVersions.map((v) => v.version)).toEqual([0, 83])
  })

  it('refuses invalid JSON', () => {
    const verdict = assessOntarioActVersions('Just a moment...', 'Employment Standards Act')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('invalid-json')
  })

  it('treats a zero-version result as an outage, not "no change"', () => {
    const empty = JSON.stringify({ aggregations: { all: { versions: { hits: { hits: [] } } } } })
    const verdict = assessOntarioActVersions(empty, 'Employment Standards Act')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('no-versions')
  })

  it('refuses a response with no state=current version', () => {
    const noCurrent = JSON.stringify({
      aggregations: {
        all: {
          versions: {
            hits: {
              hits: [
                {
                  _source: {
                    act: { en: 'Employment Standards Act, 2000' },
                    state: { en: 'historical' },
                    version: 0,
                  },
                },
              ],
            },
          },
        },
      },
    })
    const verdict = assessOntarioActVersions(noCurrent, 'Employment Standards Act')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('no-current-version')
  })

  it('refuses a different Act served from the expected statute id', () => {
    /* The same identity discipline justiceXml.ts applies to ConsolidatedNumber —
       a URL that starts answering for the wrong statute must be reported. */
    const verdict = assessOntarioActVersions(ESA_RESPONSE, 'Human Rights Code')
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected refusal')
    expect(verdict.reason).toBe('wrong-act')
    expect(verdict.detail).toContain('Human Rights Code')
    expect(verdict.detail).toContain('Employment Standards Act, 2000')
  })

  it('compares act names case-insensitively', () => {
    expect(assessOntarioActVersions(ESA_RESPONSE, 'employment standards act').ok).toBe(true)
  })
})

describe('ontarioFingerprintPayload', () => {
  it('changes when a version is added', () => {
    const before = assessOntarioActVersions(ESA_RESPONSE, 'Employment Standards Act')
    if (!before.ok) throw new Error('expected acceptance')

    const withNewVersion = JSON.parse(ESA_RESPONSE)
    withNewVersion.aggregations.all.versions.hits.hits[0]._source.dateFrom.en = '2027-01-01T05:00:00.000Z'
    const after = assessOntarioActVersions(JSON.stringify(withNewVersion), 'Employment Standards Act')
    if (!after.ok) throw new Error('expected acceptance')

    expect(ontarioFingerprintPayload(before.facts)).not.toBe(ontarioFingerprintPayload(after.facts))
  })

  it('is stable for identical input', () => {
    const verdict = assessOntarioActVersions(ESA_RESPONSE, 'Employment Standards Act')
    if (!verdict.ok) throw new Error('expected acceptance')
    expect(ontarioFingerprintPayload(verdict.facts)).toBe(ontarioFingerprintPayload(verdict.facts))
  })
})

describe('looksLikeCurrencyDate', () => {
  it('accepts the plain-text date the currency-date endpoint returns', () => {
    expect(looksLikeCurrencyDate('August 3, 2026')).toBe(true)
  })

  it('rejects a JSON or HTML error page', () => {
    expect(looksLikeCurrencyDate('{"error":"not found"}')).toBe(false)
    expect(looksLikeCurrencyDate('<html>404</html>')).toBe(false)
  })
})
