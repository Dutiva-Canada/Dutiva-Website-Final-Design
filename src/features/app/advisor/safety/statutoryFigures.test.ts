import { describe, expect, it } from 'vitest'
import { mentionsStatutoryFigure } from './statutoryFigures'

describe('mentionsStatutoryFigure', () => {
  it('detects a notice/severance figure in weeks or months', () => {
    expect(mentionsStatutoryFigure("that's about 8 weeks' notice")).toBe(true)
    expect(mentionsStatutoryFigure('roughly 9–12 months of pay in lieu of notice')).toBe(true)
    expect(mentionsStatutoryFigure('the statutory minimum is 2 weeks')).toBe(true)
  })

  it('detects French figures with accents', () => {
    expect(mentionsStatutoryFigure('environ 8 semaines de préavis')).toBe(true)
    expect(mentionsStatutoryFigure('une indemnité de 4 semaines')).toBe(true)
  })

  it('does not fire on a duration without statutory context', () => {
    expect(mentionsStatutoryFigure('she started 3 months ago')).toBe(false)
    expect(mentionsStatutoryFigure('the project ran for 6 weeks')).toBe(false)
  })

  it('does not fire on statutory context without a figure', () => {
    expect(mentionsStatutoryFigure('here is some general guidance on notice')).toBe(false)
    expect(mentionsStatutoryFigure('termination must follow a fair process')).toBe(false)
  })
})
