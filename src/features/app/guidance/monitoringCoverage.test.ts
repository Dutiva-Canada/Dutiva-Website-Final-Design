import { describe, expect, it } from 'vitest'
import {
  COVERAGE_AUDITED_ON,
  COVERAGE_STATUS_LABEL,
  MONITORING_COVERAGE,
  coverageTone,
  noSupportedJurisdictionCovered,
} from './monitoringCoverage'
import type { CoverageStatus, JurisdictionCoverage } from './monitoringCoverage'

/**
 * These guard a *claim*, not a computation. The risk is that the table drifts
 * back toward reassurance — an entry quietly flipped to "active" without a
 * fresh audit, or a supported jurisdiction dropped so it stops being mentioned
 * at all. Both would recreate the overclaim this module exists to prevent.
 */
describe('MONITORING_COVERAGE', () => {
  it('covers every supported jurisdiction and nothing else', () => {
    /* Exactly ON/QC/FED — docs/CANONICAL_FACTS.md. A jurisdiction Dutiva does
       not support must not appear in a coverage claim, working or not. */
    expect(MONITORING_COVERAGE.map((c) => c.jurisdiction).sort()).toEqual(['FED', 'ON', 'QC'])
  })

  it('lists each jurisdiction once', () => {
    const seen = new Set(MONITORING_COVERAGE.map((c) => c.jurisdiction))
    expect(seen.size).toBe(MONITORING_COVERAGE.length)
  })

  it('ships both languages for every label and detail', () => {
    for (const entry of MONITORING_COVERAGE) {
      expect(entry.label.en.length).toBeGreaterThan(0)
      expect(entry.label.fr.length).toBeGreaterThan(0)
      expect(entry.detail.en.length).toBeGreaterThan(0)
      expect(entry.detail.fr.length).toBeGreaterThan(0)
    }
  })

  it('explains every non-active status, so a bare status never stands alone', () => {
    for (const entry of MONITORING_COVERAGE) {
      if (entry.status === 'active') continue
      /* Long enough to actually say why and what the reader should do. */
      expect(entry.detail.en.length).toBeGreaterThan(40)
      expect(entry.detail.fr.length).toBeGreaterThan(40)
    }
  })

  it('records the audit date it describes, as a plain YYYY-MM-DD', () => {
    expect(COVERAGE_AUDITED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('reflects the 2026-07-30 audit: nothing confirmed working', () => {
    /* Ontario and Québec sources are unusable and Federal is unconfirmed. If a
       source strategy lands and this test starts failing, that is the signal to
       update the table and the audit date together — not to delete the test. */
    expect(noSupportedJurisdictionCovered()).toBe(true)
  })
})

describe('coverage presentation', () => {
  it('labels all three statuses in both languages', () => {
    const statuses: CoverageStatus[] = ['active', 'unavailable', 'unverified']
    for (const status of statuses) {
      expect(COVERAGE_STATUS_LABEL[status].en.length).toBeGreaterThan(0)
      expect(COVERAGE_STATUS_LABEL[status].fr.length).toBeGreaterThan(0)
    }
  })

  it('never renders a problem status in a reassuring colour', () => {
    expect(coverageTone('active')).toBe('success')
    expect(coverageTone('unavailable')).toBe('risk')
    expect(coverageTone('unverified')).toBe('warning')
  })
})

describe('noSupportedJurisdictionCovered', () => {
  const entry = (status: CoverageStatus): JurisdictionCoverage => ({
    jurisdiction: 'ON',
    label: { en: 'Ontario', fr: 'Ontario' },
    status,
    detail: { en: 'detail', fr: 'détail' },
  })

  it('is false as soon as one jurisdiction is genuinely active', () => {
    expect(noSupportedJurisdictionCovered([entry('active'), entry('unavailable')])).toBe(false)
  })

  it('is true when everything is unavailable or unconfirmed', () => {
    expect(noSupportedJurisdictionCovered([entry('unavailable'), entry('unverified')])).toBe(true)
  })

  it('does not count "unverified" as coverage', () => {
    /* Unconfirmed is not working. Treating it as coverage is exactly the
       optimism that let a dead monitor look healthy for 52 days. */
    expect(noSupportedJurisdictionCovered([entry('unverified')])).toBe(true)
  })
})
