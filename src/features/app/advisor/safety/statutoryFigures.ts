import { normalizeText } from './text'

/**
 * §5.2 (detection half) — a best-effort, recall-oriented check for whether a
 * reply appears to state a *statutory figure* (a notice/severance quantity in
 * weeks or months). The jurisdiction/figure gate in `safetyBackstop.ts` uses
 * it to decide whether to harden the legal-basis gate and warn the operator
 * when a figure surfaces before jurisdiction is confirmed.
 *
 * Honest limitation: this inspects the model's *prose*, and a client cannot
 * un-say prose. The definitive control is server-side — the engine withholds
 * figures until jurisdiction is confirmed (AGENT.md §3). This function powers a
 * defense-in-depth layer: gate the structured legal-basis surface off and raise
 * a visible warning, not rewrite the sentence.
 *
 * Precision guard: a duration alone ("started 3 months ago") is not a statutory
 * figure, so a duration must co-occur with a statutory-context term.
 */

/** A number (or numeric range) immediately qualifying a duration unit. */
const DURATION = /\b\d{1,2}(?:\s*(?:-|–|to)\s*\d{1,2})?\s*(?:weeks?|months?|semaines?|mois)\b/

/** Normalized statutory-context terms (accents/apostrophes already stripped). */
const STATUTORY_CONTEXT: readonly string[] = [
  'notice',
  'severance',
  'pay in lieu',
  'termination',
  'statutory',
  'entitlement',
  'minimum',
  'reasonable notice',
  // French
  'preavis',
  'indemnite',
  'cessation',
  'licenciement',
  'delai de conge',
  'norme',
]

/** True when `text` appears to state a statutory notice/severance figure. */
export function mentionsStatutoryFigure(text: string): boolean {
  const normalized = normalizeText(text)
  if (!DURATION.test(normalized)) return false
  return STATUTORY_CONTEXT.some((term) => normalized.includes(term))
}
