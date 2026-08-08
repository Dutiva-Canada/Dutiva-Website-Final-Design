import { describe, expect, it } from 'vitest'
import {
  crossCheckNoticeFigure,
  extractNoticeWeeksClaims,
  extractTenureMonths,
} from './statutoryCrossCheck'

describe('extractTenureMonths', () => {
  it('reads years, months, and combined phrasings', () => {
    expect(extractTenureMonths('an employee with 4 years of service')).toBe(48)
    expect(extractTenureMonths('employed for 18 months')).toBe(18)
    expect(extractTenureMonths('after 2 years and 6 months with us')).toBe(30)
    expect(extractTenureMonths('elle travaille ici depuis 5 ans')).toBe(60)
    expect(extractTenureMonths('en poste depuis 7 mois')).toBe(7)
  })

  it('handles decimal years', () => {
    expect(extractTenureMonths('about 2.5 years of employment')).toBe(30)
  })

  it('returns null when tenure is absent or ambiguous', () => {
    expect(extractTenureMonths('we want to terminate an employee')).toBeNull()
    /* Two different tenures — guessing between them is worse than no check. */
    expect(extractTenureMonths('one has 3 years, the other 7 years')).toBeNull()
  })
})

describe('extractNoticeWeeksClaims', () => {
  it('reads single figures and ranges in notice context', () => {
    expect(extractNoticeWeeksClaims('the ESA minimum is 4 weeks of notice')).toEqual([
      { min: 4, max: 4 },
    ])
    expect(extractNoticeWeeksClaims('expect 8 to 12 weeks of notice at common law')).toEqual([
      { min: 8, max: 12 },
    ])
  })

  it('returns nothing outside notice context', () => {
    expect(extractNoticeWeeksClaims('the project will take 6 weeks')).toEqual([])
  })
})

describe('crossCheckNoticeFigure', () => {
  it('confirms a correct Ontario figure', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'Terminating an employee with 4 years of service in Ontario.',
        reply: 'Under the ESA the statutory minimum is 4 weeks of notice.',
      }),
    ).toEqual({ verdict: 'consistent', expectedWeeks: 4 })
  })

  it('flags a wrong Ontario figure with both numbers', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'Terminating an employee with 4 years of service.',
        reply: 'The ESA requires 6 weeks of notice.',
      }),
    ).toEqual({ verdict: 'mismatch', expectedWeeks: 4, statedWeeks: 6 })
  })

  it('accepts a range that covers the statutory floor', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'An employee with 4 years of service.',
        reply: 'Statutory notice is 4 weeks; common-law notice could be 4 to 16 weeks.',
      }).verdict,
    ).toBe('consistent')
  })

  it('is unverifiable without tenure, without a claim, or on an unencoded schedule', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'How much notice do I owe?',
        reply: 'Roughly 8 weeks of notice.',
      }).verdict,
    ).toBe('unverifiable')
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'An employee with 4 years of service.',
        reply: 'Follow a fair, documented process.',
      }).verdict,
    ).toBe('unverifiable')
    /* QC bands are null pending legal review — never a guessed check. */
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'QC',
        userMessage: 'An employee with 4 years of service in Quebec.',
        reply: 'The LNT requires 2 weeks of notice.',
      }).verdict,
    ).toBe('unverifiable')
  })

  it('reads tenure from the reply when the message lacks it', () => {
    expect(
      crossCheckNoticeFigure({
        jurisdiction: 'ON',
        userMessage: 'What notice does she get?',
        reply: 'With 6 years of service, the ESA minimum is 6 weeks of notice.',
      }).verdict,
    ).toBe('consistent')
  })
})
