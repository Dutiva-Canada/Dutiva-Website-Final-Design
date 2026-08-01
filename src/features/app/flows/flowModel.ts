import type { Bi } from '@/i18n/core'
import type { Jurisdiction } from '@/features/app/documents/data/types'

/**
 * Content model for guided flows — the surface Ring 2's interactive tools
 * needed and the product did not have (docs/FOUR_RING_FRAMEWORK.md).
 *
 * Document Studio renders a linear question set into merge-field blocks. That
 * covers a document you already know you are writing; it cannot express
 * "receive disclosure → assess → explore options → implement → document",
 * where what you are asked next depends on what you just said. `ClauseGate`
 * gates a block on jurisdiction, headcount and union — never on an answer —
 * so branching had nowhere to live.
 *
 * A flow is a graph of steps. Three shapes fall out of the same structure,
 * which is why this is one engine rather than three:
 *
 *   - a **checklist** is a chain of `task` steps with one exit each;
 *   - a **decision tree** is `choice` steps whose options name the next step;
 *   - a **guided worksheet** mixes the two and ends at an `outcome`.
 *
 * What a flow deliberately is **not**: a scored assessment. The framework's
 * CSA Z1003-13 self-assessment needs weighted answers summed into a band, and
 * nothing here does arithmetic on answers. That is a real extension of this
 * model, not a use of it — see the framework doc before building it.
 *
 * Flows produce a record, not a document. A completed run summarises the path
 * taken and hands off to the Document Studio template that makes it official
 * (`outcome.documents`). Keeping the two separate is deliberate: the flow is
 * how you decide, the template is what you send.
 */

export type FlowStepId = string

/** A step's outgoing edge. `to` is the id of the next step, or null to end. */
export interface FlowOption {
  id: string
  label: Bi
  /** Shown under the label when the choice needs a reason to pick it. */
  detail?: Bi
  to: FlowStepId | null
}

interface FlowStepBase {
  id: FlowStepId
  title: Bi
  /** The step's explanation — what this stage is for, and what to watch. */
  body: Bi
  /**
   * A caution rendered with the step. Use for the thing that goes wrong here,
   * not for general encouragement.
   *
   * Every step shows in every jurisdiction. There is deliberately no
   * per-jurisdiction gate here: a run has no jurisdiction to gate on — the
   * runner never asks for one — so a gate would have silently no-opped and
   * shown Québec-specific content to an Ontario reader. Where the law differs,
   * say so in the copy and point at the Document Studio template, whose
   * `jurisdictionNotes` the reader can actually see resolved.
   */
  caution?: Bi
}

/**
 * A step that branches. The chosen option decides what comes next, which is
 * the whole reason this model exists.
 */
export interface FlowChoiceStep extends FlowStepBase {
  kind: 'choice'
  options: FlowOption[]
}

/**
 * A step that instructs rather than asks. It has exactly one exit, and the
 * points are what the user is doing before they continue.
 */
export interface FlowTaskStep extends FlowStepBase {
  kind: 'task'
  points: Bi[]
  to: FlowStepId | null
}

/** A terminal step. Reaching one ends the run. */
export interface FlowOutcomeStep extends FlowStepBase {
  kind: 'outcome'
  /** How the outcome reads — a settled result, or a stop-and-get-help. */
  tone: 'ok' | 'caution'
  /** Document Studio tids this outcome hands off to, in the order to use them. */
  documents?: string[]
}

export type FlowStep = FlowChoiceStep | FlowTaskStep | FlowOutcomeStep

export interface Flow {
  /** Stable URL slug — `/app/workflows/<slug>`. */
  slug: string
  title: Bi
  summary: Bi
  /** Which ring and pillar this belongs to, for the framework doc's tables. */
  ring: 1 | 2 | 3 | 4
  jurisdictions: Jurisdiction[]
  /** Roughly how long a run takes, shown before starting. */
  estMinutes: number
  /** The step a run begins at. */
  start: FlowStepId
  steps: FlowStep[]
}

export const isOutcome = (step: FlowStep): step is FlowOutcomeStep => step.kind === 'outcome'
