import { describe, expect, it } from 'vitest'
import {
  ackProgress,
  blendScore,
  caseAging,
  daysBetweenISO,
  formatMonthISO,
  monthStartISO,
  rankAttention,
  scoreComponent,
  scoreDelta,
  windowScoreAxis,
} from './aggregation'

describe('daysBetweenISO', () => {
  it('counts whole days, crossing month and year boundaries', () => {
    expect(daysBetweenISO('2026-07-05', '2026-07-05')).toBe(0)
    expect(daysBetweenISO('2026-07-05', '2026-07-14')).toBe(9)
    expect(daysBetweenISO('2026-06-30', '2026-07-05')).toBe(5)
    expect(daysBetweenISO('2025-12-31', '2026-01-01')).toBe(1)
  })

  it('is negative when the target is in the past', () => {
    expect(daysBetweenISO('2026-07-05', '2026-06-30')).toBe(-5)
  })

  it('handles February in a non-leap year', () => {
    expect(daysBetweenISO('2026-02-10', '2026-03-01')).toBe(19)
    /* The demo's oldest case: opened Feb 10, today Jul 5. */
    expect(daysBetweenISO('2026-02-10', '2026-07-05')).toBe(145)
  })
})

describe('monthStartISO', () => {
  it('returns the first of the containing month', () => {
    expect(monthStartISO('2026-07-05')).toBe('2026-07-01')
    expect(monthStartISO('2026-12-31')).toBe('2026-12-01')
  })
})

describe('formatMonthISO', () => {
  it('formats month names per locale', () => {
    expect(formatMonthISO('2026-02-01', 'en-CA')).toMatch(/^Feb/)
    expect(formatMonthISO('2026-02-01', 'fr-CA')).toMatch(/f[ée]vr/i)
    expect(formatMonthISO('2026-02-01', 'en-CA', 'long')).toBe('February')
  })
})

describe('rankAttention', () => {
  const items = [
    { id: 'later', dueISO: '2026-07-31' },
    { id: 'overdue', dueISO: '2026-06-30' },
    { id: 'soon', dueISO: '2026-07-14' },
    { id: 'edge15', dueISO: '2026-07-20' },
  ]

  it('sorts overdue first, then soonest due', () => {
    const ranked = rankAttention(items, '2026-07-05')
    expect(ranked.map((r) => r.item.id)).toEqual(['overdue', 'soon', 'edge15', 'later'])
  })

  it('buckets: overdue / due ≤ 14 days = due_soon / later = upcoming', () => {
    const ranked = rankAttention(items, '2026-07-05')
    const byId = Object.fromEntries(ranked.map((r) => [r.item.id, r]))
    expect(byId['overdue']).toMatchObject({ status: 'overdue', daysUntilDue: -5 })
    expect(byId['soon']).toMatchObject({ status: 'due_soon', daysUntilDue: 9 })
    /* Exactly 15 days out is no longer "due soon". */
    expect(byId['edge15']).toMatchObject({ status: 'upcoming', daysUntilDue: 15 })
    expect(byId['later']).toMatchObject({ status: 'upcoming', daysUntilDue: 26 })
  })

  it('treats due-today as due_soon, not overdue', () => {
    const [today] = rankAttention([{ id: 'x', dueISO: '2026-07-05' }], '2026-07-05')
    expect(today).toMatchObject({ status: 'due_soon', daysUntilDue: 0 })
  })

  it('breaks same-day ties on id for a stable order', () => {
    const ranked = rankAttention(
      [
        { id: 'b', dueISO: '2026-07-14' },
        { id: 'a', dueISO: '2026-07-14' },
      ],
      '2026-07-05',
    )
    expect(ranked.map((r) => r.item.id)).toEqual(['a', 'b'])
  })
})

describe('windowScoreAxis', () => {
  it('windows 74–82 to 70–85 with ticks every 5 (the spec example)', () => {
    expect(windowScoreAxis([74, 76, 79, 78, 81, 82])).toEqual({
      min: 70,
      max: 85,
      ticks: [70, 75, 80, 85],
    })
  })

  it('never starts at zero for high scores', () => {
    const { min } = windowScoreAxis([88, 90, 92])
    expect(min).toBeGreaterThan(0)
  })

  it('clamps to the 0–100 score scale', () => {
    expect(windowScoreAxis([96, 99, 100]).max).toBe(100)
    expect(windowScoreAxis([1, 3]).min).toBe(0)
  })

  it('widens the step to 10 for wide ranges', () => {
    const axis = windowScoreAxis([40, 82])
    expect(axis).toEqual({ min: 30, max: 90, ticks: [30, 40, 50, 60, 70, 80, 90] })
  })

  it('produces a sane window for flat data', () => {
    const axis = windowScoreAxis([80, 80, 80])
    expect(axis.min).toBeLessThan(80)
    expect(axis.max).toBeGreaterThan(80)
    expect(axis.ticks.length).toBeGreaterThanOrEqual(2)
  })

  it('falls back to the full scale with no data', () => {
    expect(windowScoreAxis([])).toEqual({ min: 0, max: 100, ticks: [0, 25, 50, 75, 100] })
  })
})

describe('scoreDelta', () => {
  it('compares the newest point against the oldest, sorting first', () => {
    const delta = scoreDelta([
      { monthISO: '2026-07-01', score: 82 },
      { monthISO: '2026-02-01', score: 74 },
      { monthISO: '2026-05-01', score: 78 },
    ])
    expect(delta).toEqual({
      current: 82,
      baseline: 74,
      delta: 8,
      baselineMonthISO: '2026-02-01',
    })
  })

  it('supports declines', () => {
    expect(
      scoreDelta([
        { monthISO: '2026-06-01', score: 90 },
        { monthISO: '2026-07-01', score: 84 },
      ])?.delta,
    ).toBe(-6)
  })

  it('needs at least two points', () => {
    expect(scoreDelta([{ monthISO: '2026-07-01', score: 82 }])).toBeNull()
    expect(scoreDelta([])).toBeNull()
  })
})

describe('caseAging', () => {
  const open = [
    { id: 'new', openedISO: '2026-07-05' },
    { id: 'pip', openedISO: '2026-06-20' },
    { id: 'accom', openedISO: '2026-02-10' },
  ]

  it('computes days open, average and oldest for the demo cases', () => {
    const aging = caseAging(open, '2026-07-05')
    expect(aging).not.toBeNull()
    expect(aging!.openCount).toBe(3)
    /* 0 + 15 + 145 days → avg 53. */
    expect(aging!.rows.map((r) => r.daysOpen)).toEqual([145, 15, 0])
    expect(aging!.avgDays).toBe(53)
    expect(aging!.oldestDays).toBe(145)
  })

  it('sorts oldest first', () => {
    const aging = caseAging(open, '2026-07-05')
    expect(aging!.rows.map((r) => (r.caseRow as { id: string }).id)).toEqual([
      'accom',
      'pip',
      'new',
    ])
  })

  it('clamps future open dates to zero days', () => {
    const aging = caseAging([{ openedISO: '2026-08-01' }], '2026-07-05')
    expect(aging!.rows[0]!.daysOpen).toBe(0)
  })

  it('returns null with no open cases', () => {
    expect(caseAging([], '2026-07-05')).toBeNull()
  })
})

describe('ackProgress', () => {
  it('computes the demo campaign: 74/82 → 90%, 8 outstanding', () => {
    expect(ackProgress(74, 82)).toEqual({ signed: 74, total: 82, outstanding: 8, pct: 90 })
  })

  it('handles complete and empty campaigns', () => {
    expect(ackProgress(82, 82).outstanding).toBe(0)
    expect(ackProgress(82, 82).pct).toBe(100)
    expect(ackProgress(0, 0)).toEqual({ signed: 0, total: 0, outstanding: 0, pct: 0 })
  })

  it('clamps out-of-range inputs', () => {
    expect(ackProgress(90, 82).signed).toBe(82)
    expect(ackProgress(-3, 82).signed).toBe(0)
  })
})

describe('score components + blend', () => {
  it('computes per-component percentages', () => {
    expect(scoreComponent('policies', 3, 4)).toEqual({
      key: 'policies',
      done: 3,
      total: 4,
      pct: 75,
    })
  })

  it('marks empty components null instead of 0 or 100', () => {
    expect(scoreComponent('tasks', 0, 0).pct).toBeNull()
  })

  it('blends only the components that have data', () => {
    const score = blendScore([
      scoreComponent('policies', 3, 4), // 75
      scoreComponent('tasks', 9, 10), // 90
      scoreComponent('findings', 0, 0), // null — excluded
    ])
    expect(score).toBe(83)
  })

  it('is null until any component has rows', () => {
    expect(blendScore([scoreComponent('policies', 0, 0)])).toBeNull()
    expect(blendScore([])).toBeNull()
  })
})
