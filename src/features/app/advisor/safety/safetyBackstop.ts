import type { Bi } from '@/i18n/core'
import type { AdvisorResponse, JurisdictionStatus } from '../contract'
import { detectCrisisSignal } from './crisisSignals'
import { mentionsStatutoryFigure } from './statutoryFigures'

/**
 * The deterministic safety backstop (docs/AI_USAGE_STRATEGY.md §5) — a rule
 * layer that hardens the engine's structured `AdvisorResponse` on the client,
 * as defense-in-depth. The rules are **monotonic: they can only ever tighten**
 * a gate, never loosen one. So the worst case is an over-cautious turn, never a
 * leaked figure or a dropped crisis intercept.
 *
 * It runs after the engine and before the Compliance Workspace reads the
 * payload (wired in `advisor/chatApi.ts`). It does not replace the engine's own
 * routing/gating — the engine remains the primary control; this is the belt to
 * its braces ("the client gates too").
 */

export type SafetyAction = 'crisis-intercept' | 'legal-basis-withheld'

export interface SafetyBackstopInput {
  /** The user's message this turn — the crisis pre-classifier reads it. */
  userMessage: string
  /** The Advisor's conversational reply — the figure gate inspects it. */
  reply: string
  /** The engine's structured response for this turn. */
  response: AdvisorResponse
}

export interface SafetyBackstopResult {
  /** The hardened response (same object when no rule fired). */
  response: AdvisorResponse
  /** Which rules fired — for telemetry/tests; empty when the input passed. */
  actions: SafetyAction[]
}

/** Jurisdiction is "settled enough" to allow statutory figures. */
const JURISDICTION_CONFIRMED: ReadonlySet<JurisdictionStatus> = new Set<JurisdictionStatus>([
  'known',
  'assumed',
  'not_applicable',
])

const WITHHELD_REASON: Bi = {
  en: 'Legal basis withheld — jurisdiction is not confirmed.',
  fr: 'Fondement juridique retenu — la compétence n’est pas confirmée.',
}

const WITHHELD_WARNING: Bi = {
  en: 'Statutory figures were withheld: jurisdiction is not confirmed.',
  fr: 'Des chiffres prévus par la loi ont été retenus : la compétence n’est pas confirmée.',
}

/**
 * Apply the safety backstop to one turn. Pure: it returns a new response only
 * when a rule fires, and returns the input object untouched otherwise.
 */
export function applySafetyBackstop(input: SafetyBackstopInput): SafetyBackstopResult {
  const { userMessage, reply, response } = input
  const actions: SafetyAction[] = []
  let next = response

  // §5.1 Crisis intercept — OR the maintained signal with the engine's flag.
  // Monotonic: can only raise `isCrisis`, never clear it. Crisis gates every
  // structured surface off via `allowedSurfaces`, so it takes precedence.
  const crisis = detectCrisisSignal(userMessage) || response.isCrisis
  if (crisis && !response.isCrisis) {
    actions.push('crisis-intercept')
    next = { ...next, isCrisis: true }
  }

  // §5.2 Jurisdiction / statutory-figure gate — fail-safe-closed. Skipped under
  // crisis (everything is already gated off). If a figure surfaces before
  // jurisdiction is confirmed, force the legal-basis gate off and warn the
  // operator.
  const jurisdictionConfirmed = JURISDICTION_CONFIRMED.has(response.jurisdiction.status)
  if (!crisis && !jurisdictionConfirmed && mentionsStatutoryFigure(reply)) {
    actions.push('legal-basis-withheld')
    next = {
      ...next,
      route: { ...next.route, legalBasisAllowed: false },
      legalBasis: {
        ...next.legalBasis,
        withheldReason: next.legalBasis.withheldReason ?? WITHHELD_REASON,
      },
      warnings: [...next.warnings, WITHHELD_WARNING],
    }
  }

  return { response: next, actions }
}
