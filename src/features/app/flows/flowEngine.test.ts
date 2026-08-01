import { describe, expect, it } from 'vitest'
import {
  advance,
  back,
  currentStep,
  flowRecord,
  isComplete,
  longestPath,
  nextStepId,
  outgoing,
  progress,
  startRun,
  stepById,
  unreachableSteps,
} from './flowEngine'
import { isOutcome } from './flowModel'
import type { Flow } from './flowModel'
import { flows } from './data'
import { bi } from '@/i18n/core'

/**
 * Two kinds of test here, deliberately separated.
 *
 * The engine tests run against a small fixture flow, so a change to shipped
 * content cannot make them fail for reasons that have nothing to do with the
 * engine. The graph tests run against every real flow and assert the
 * structural invariants that make a flow safe to publish — reachable steps,
 * no route that ends anywhere but an outcome, bilingual copy throughout.
 */

const fixture: Flow = {
  slug: 'fixture',
  ring: 2,
  jurisdictions: ['ON', 'QC', 'FED'],
  estMinutes: 1,
  title: bi('Fixture', 'Exemple'),
  summary: bi('A tiny flow.', 'Un petit parcours.'),
  start: 'ask',
  steps: [
    {
      id: 'ask',
      kind: 'choice',
      title: bi('Ask', 'Demander'),
      body: bi('Pick one.', 'Choisissez.'),
      options: [
        { id: 'left', label: bi('Left', 'Gauche'), to: 'doLeft' },
        { id: 'right', label: bi('Right', 'Droite'), to: 'endRight' },
      ],
    },
    {
      id: 'doLeft',
      kind: 'task',
      title: bi('Do', 'Faire'),
      body: bi('Do the thing.', 'Faites la chose.'),
      points: [bi('A point.', 'Un point.')],
      to: 'endLeft',
    },
    {
      id: 'endLeft',
      kind: 'outcome',
      tone: 'ok',
      title: bi('Left end', 'Fin gauche'),
      body: bi('Done.', 'Terminé.'),
    },
    {
      id: 'endRight',
      kind: 'outcome',
      tone: 'caution',
      title: bi('Right end', 'Fin droite'),
      body: bi('Also done.', 'Aussi terminé.'),
    },
  ],
}

describe('flow engine', () => {
  it('starts on the flow’s start step and is not complete', () => {
    const run = startRun(fixture)
    expect(currentStep(fixture, run).id).toBe('ask')
    expect(isComplete(fixture, run)).toBe(false)
  })

  it('advances along the option that was chosen', () => {
    const run = advance(fixture, startRun(fixture), 'right')
    expect(currentStep(fixture, run).id).toBe('endRight')
    expect(isComplete(fixture, run)).toBe(true)
  })

  it('records the chosen option on the step it was chosen at', () => {
    const run = advance(fixture, startRun(fixture), 'left')
    expect(run.path[0]).toEqual({ step: 'ask', option: 'left' })
    expect(run.path[1]).toEqual({ step: 'doLeft' })
  })

  it('ignores an option that does not belong to the step', () => {
    const run = startRun(fixture)
    /* A stale option id — from a double click, or a re-render mid-answer —
       must not move the run somewhere arbitrary. */
    expect(advance(fixture, run, 'nonsense')).toEqual(run)
    expect(advance(fixture, run)).toEqual(run)
  })

  it('cannot advance past an outcome', () => {
    const done = advance(fixture, startRun(fixture), 'right')
    expect(advance(fixture, done, 'left')).toEqual(done)
  })

  it('steps back and forgets the answer that led forward', () => {
    const forward = advance(fixture, startRun(fixture), 'left')
    const backAgain = back(forward)
    expect(currentStep(fixture, backAgain).id).toBe('ask')
    /* The point of the test: re-answering must be a clean choice. A retained
       option would render the branch as already taken. */
    expect(backAgain.path).toEqual([{ step: 'ask' }])
  })

  it('stays put when stepping back from the first step', () => {
    const run = startRun(fixture)
    expect(back(run)).toEqual(run)
  })

  it('reports progress that reaches 1 only at an outcome', () => {
    const start = startRun(fixture)
    expect(progress(fixture, start)).toBeLessThan(1)
    expect(progress(fixture, advance(fixture, start, 'right'))).toBe(1)
    expect(progress(fixture, advance(fixture, start, 'left'))).toBeGreaterThan(0)
  })

  it('measures the longest route, so a short branch does not read as behind', () => {
    /* ask → doLeft → endLeft is the long one. */
    expect(longestPath(fixture)).toBe(3)
  })

  it('builds a record of the path with the labels chosen', () => {
    const run = advance(fixture, advance(fixture, startRun(fixture), 'left'))
    const record = flowRecord(fixture, run)
    expect(record.entries.map((e) => e.step.id)).toEqual(['ask', 'doLeft', 'endLeft'])
    expect(record.entries[0]?.chosen?.label.en).toBe('Left')
    expect(record.outcome?.id).toBe('endLeft')
  })

  it('reports no outcome while the run is unfinished', () => {
    expect(flowRecord(fixture, startRun(fixture)).outcome).toBeNull()
  })

  it('throws on a step id the flow does not define', () => {
    expect(() => stepById(fixture, 'ghost')).toThrow(/no step ghost/)
  })

  it('distinguishes "ends the run" from "no such option"', () => {
    const ask = stepById(fixture, 'ask')
    const end = stepById(fixture, 'endLeft')
    expect(nextStepId(ask, 'left')).toBe('doLeft')
    expect(nextStepId(ask, 'ghost')).toBeUndefined()
    expect(nextStepId(end)).toBeNull()
  })

  it('terminates on a flow that loops', () => {
    /* Real flows loop — "check funding, then re-test". longestPath walks with
       a visited set, so a cycle must not hang it. */
    const looping: Flow = {
      ...fixture,
      steps: [
        {
          id: 'ask',
          kind: 'choice',
          title: bi('Ask', 'Demander'),
          body: bi('Pick.', 'Choisissez.'),
          options: [
            { id: 'loop', label: bi('Loop', 'Boucle'), to: 'doLeft' },
            { id: 'out', label: bi('Out', 'Sortir'), to: 'endRight' },
          ],
        },
        {
          id: 'doLeft',
          kind: 'task',
          title: bi('Do', 'Faire'),
          body: bi('Back we go.', 'On y retourne.'),
          points: [bi('A point.', 'Un point.')],
          to: 'ask',
        },
        ...fixture.steps.filter((s) => s.id === 'endRight'),
      ],
    }
    expect(longestPath(looping)).toBeGreaterThan(0)
    expect(unreachableSteps(looping)).toEqual([])
  })
})

describe.each(flows.map((f) => [f.slug, f] as const))('flow: %s', (_slug, flow) => {
  it('has no unreachable steps', () => {
    /* Content nobody can reach reads as shipped and is not. */
    expect(unreachableSteps(flow)).toEqual([])
  })

  it('points every exit at a step that exists', () => {
    for (const step of flow.steps) {
      for (const next of outgoing(step)) {
        if (next === null) continue
        expect(() => stepById(flow, next), `${step.id} → ${next}`).not.toThrow()
      }
    }
  })

  it('ends every route at an outcome, never at nothing', () => {
    /* A `to: null` on a task or choice would end a run with no result and no
       document to hand off to — the user is left mid-process with a blank. */
    for (const step of flow.steps) {
      if (isOutcome(step)) continue
      for (const next of outgoing(step)) {
        expect(next, `${step.id} ends the run without an outcome`).not.toBeNull()
      }
    }
  })

  it('reaches at least one outcome', () => {
    expect(flow.steps.some(isOutcome)).toBe(true)
  })

  it('has a start step that exists', () => {
    expect(() => stepById(flow, flow.start)).not.toThrow()
  })

  it('ships every string in both languages', () => {
    const strings: [string, { en: string; fr: string }][] = [
      ['title', flow.title],
      ['summary', flow.summary],
    ]
    for (const step of flow.steps) {
      strings.push([`${step.id}.title`, step.title], [`${step.id}.body`, step.body])
      if (step.caution) strings.push([`${step.id}.caution`, step.caution])
      if (step.kind === 'task') {
        step.points.forEach((p, i) => strings.push([`${step.id}.points[${i}]`, p]))
      }
      if (step.kind === 'choice') {
        for (const option of step.options) {
          strings.push([`${step.id}.${option.id}`, option.label])
          if (option.detail) strings.push([`${step.id}.${option.id}.detail`, option.detail])
        }
      }
    }
    for (const [path, value] of strings) {
      expect(value.en.trim(), path).not.toBe('')
      expect(value.fr.trim(), path).not.toBe('')
      if (value.en.split(/\s+/).length > 3) {
        expect(value.fr, `${path} is untranslated`).not.toBe(value.en)
      }
    }
  })

  it('hands every outcome off to at least one document', () => {
    /* A flow that ends in advice leaves nothing on the file, and the file is
       what an employer is asked to produce. */
    for (const step of flow.steps) {
      if (!isOutcome(step)) continue
      expect(step.documents?.length ?? 0, `${step.id} names no document`).toBeGreaterThan(0)
    }
  })
})
