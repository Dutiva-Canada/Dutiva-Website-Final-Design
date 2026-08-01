import { describe, expect, it } from 'vitest'
import { editorialFigureIn, mentionsEditorialFigure } from './editorialFigures'

/**
 * Detector tests for the editorial no-figures rule.
 *
 * These exist because the first version of this guard reused the Advisor's
 * runtime detector, which requires a digit and only recognises weeks and
 * months — so "eight weeks' notice" and "file within 30 days" both passed a
 * check whose stated purpose was to reject exactly those. A detector is only
 * worth what its negative cases prove.
 */

describe('duration figures', () => {
  it.each([
    ['8 weeks of notice', 'digits'],
    ["eight weeks' notice", 'written cardinal'],
    ['file within 30 days', 'a deadline in days'],
    ['retain records for seven years', 'written cardinal + years'],
    ['a 2-week entitlement', 'hyphenated'],
    ['huit semaines de préavis', 'French written cardinal'],
    ['dans les 30 jours', 'French deadline in days'],
    ['trois mois de service continu', 'French months'],
  ])('flags %j (%s)', (text) => {
    expect(mentionsEditorialFigure(text)).toBe(true)
  })

  it.each([
    ['Notice scales with length of service — check the current schedule.'],
    ['Confirm the deadline against the statute before you rely on it.'],
    ["Le préavis varie selon l'ancienneté; vérifiez le barème applicable."],
    ['Document the decision the same day you make it.'],
  ])('leaves figure-free guidance alone: %j', (text) => {
    expect(mentionsEditorialFigure(text)).toBe(false)
  })

  it('does not treat French "un/une" as a count', () => {
    /* Indefinite article before numeral: "des conditions un jour contestées"
       is "someday disputed", not a one-day deadline. This exact phrase is in
       the live corpus. */
    expect(mentionsEditorialFigure('des conditions un jour contestées')).toBe(false)
    expect(mentionsEditorialFigure('une semaine')).toBe(false)
  })
})

describe('monetary figures', () => {
  it.each([
    ['$10,000 per violation', 'symbol prefix'],
    ['jusqu’à 10 000 $ par infraction', 'French symbol suffix'],
    ['10,000 CAD in penalties', 'currency code'],
    ['ten thousand dollars', 'spelled out, no symbol'],
    ['une amende de mille dollars', 'French spelled out'],
  ])('flags %j (%s)', (text) => {
    expect(mentionsEditorialFigure(text)).toBe(true)
  })

  it('leaves unquantified cost language alone', () => {
    expect(mentionsEditorialFigure('Penalties can be significant — see the statute.')).toBe(false)
  })
})

describe('editorialFigureIn', () => {
  it('returns the matched text so a failure can quote it', () => {
    expect(editorialFigureIn('you must give 8 weeks of notice')).toBe('8 weeks')
    expect(editorialFigureIn('nothing quantified here')).toBeNull()
  })
})
