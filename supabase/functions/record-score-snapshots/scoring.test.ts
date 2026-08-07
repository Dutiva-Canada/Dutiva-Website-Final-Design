import { describe, expect, it } from 'vitest'
import {
  CRITICAL_SCORE_CEILING as appCeiling,
  FINDING_SEVERITY_WEIGHTS as appWeights,
  SCORE_FORMULA_VERSION as appVersion,
  applyCriticalCeiling as appApplyCeiling,
  blendScore as appBlend,
  scoreComponent as appScoreComponent,
  weightedComponent as appWeightedComponent,
} from '@/features/app/views/analytics/aggregation'
import {
  CRITICAL_SCORE_CEILING,
  FINDING_SEVERITY_WEIGHTS,
  SCORE_FORMULA_VERSION,
  applyCriticalCeiling,
  blendScore,
  computeOrgScore,
  scoreComponent,
  weightedComponent,
} from './scoring'

/**
 * Drift test: the scheduled job's scoring copy (this folder) must compute
 * exactly what the app's aggregation.ts computes — same discipline as the
 * crisis-phrase mirror (crisisSignalsDrift.test.ts). A formula change that
 * lands on one side only fails here before it can ship a snapshot the
 * Analytics view would disagree with.
 */

describe('scoring drift — edge function copy vs app copy', () => {
  it('pins the formula constants to each other', () => {
    expect(SCORE_FORMULA_VERSION).toBe(appVersion)
    expect(CRITICAL_SCORE_CEILING).toBe(appCeiling)
    expect(FINDING_SEVERITY_WEIGHTS).toEqual(appWeights)
  })

  it('computes identical components and blends across scenarios', () => {
    const scenarios: { done: boolean; weight: number }[][] = [
      [],
      [{ done: true, weight: 8 }],
      [
        { done: false, weight: 8 },
        { done: true, weight: 1 },
      ],
      [
        { done: true, weight: 3 },
        { done: false, weight: 5 },
        { done: true, weight: 2 },
        { done: false, weight: 1 },
      ],
    ]
    for (const items of scenarios) {
      expect(weightedComponent('findings', items)).toEqual(appWeightedComponent('findings', items))
    }

    const counts = [
      [0, 0],
      [3, 4],
      [1, 3],
      [10, 10],
    ] as const
    for (const [done, total] of counts) {
      expect(scoreComponent('policies', done, total)).toEqual(
        appScoreComponent('policies', done, total),
      )
    }

    const componentSets = [
      [appScoreComponent('policies', 3, 4), appScoreComponent('tasks', 8, 10)],
      [appScoreComponent('policies', 0, 0), appScoreComponent('tasks', 0, 0)],
      [
        appScoreComponent('policies', 3, 4),
        appScoreComponent('tasks', 8, 10),
        appWeightedComponent('findings', [{ done: false, weight: 8 }]),
      ],
    ]
    for (const set of componentSets) {
      expect(blendScore(set)).toBe(appBlend(set))
    }

    for (const [score, open] of [
      [90, 1],
      [90, 0],
      [69, 3],
      [50, 2],
      [null, 1],
    ] as const) {
      expect(applyCriticalCeiling(score, open)).toEqual(appApplyCeiling(score, open))
    }
  })
})

describe('computeOrgScore — the job-side row mapping', () => {
  it('mirrors the view: up_to_date policies, completed tasks minus cancelled, closed findings', () => {
    const { score, components } = computeOrgScore({
      policyStatuses: ['up_to_date', 'up_to_date', 'up_to_date', 'needs_review'],
      /* 8 completed + 2 open + 1 cancelled → 8/10 once cancelled is excluded. */
      taskStatuses: [...Array(8).fill('completed'), 'open', 'in_progress', 'cancelled'],
      /* medium resolved (3) + high dismissed (5) + info open (1) → 8/9 ≈ 89. */
      findings: [
        { severity: 'medium', status: 'resolved' },
        { severity: 'high', status: 'dismissed' },
        { severity: 'info', status: 'open' },
      ],
    })
    expect(components.map((c) => c.pct)).toEqual([75, 80, 89])
    /* (75 + 80 + 89) / 3 = 81.33 → 81; no open critical, no ceiling. */
    expect(score).toBe(81)
  })

  it('caps the blend while a critical finding is open, and lifts on dismissal', () => {
    const openCritical = {
      policyStatuses: ['up_to_date'],
      taskStatuses: ['completed'],
      findings: [
        { severity: 'critical', status: 'open' },
        { severity: 'low', status: 'resolved' },
      ],
    }
    expect(computeOrgScore(openCritical).score).toBe(CRITICAL_SCORE_CEILING)
    expect(
      computeOrgScore({
        ...openCritical,
        findings: [
          { severity: 'critical', status: 'dismissed' },
          { severity: 'low', status: 'resolved' },
        ],
      }).score,
    ).toBe(100)
  })

  it('returns null for an org with no scoreable rows', () => {
    expect(
      computeOrgScore({ policyStatuses: [], taskStatuses: [], findings: [] }).score,
    ).toBeNull()
  })

  it('weights an unknown severity as 1 rather than dropping the finding', () => {
    const { components } = computeOrgScore({
      policyStatuses: [],
      taskStatuses: [],
      findings: [
        { severity: 'unexpected', status: 'open' },
        { severity: 'critical', status: 'resolved' },
      ],
    })
    /* 8 of 9 weight closed → 89. */
    expect(components[2]!.pct).toBe(89)
  })
})
