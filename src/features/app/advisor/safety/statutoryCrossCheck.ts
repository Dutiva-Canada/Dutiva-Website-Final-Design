import { normalizeText } from './text'
import { lookupStatutoryNoticeWeeks } from './statutoryNotice'
import type { Jurisdiction } from '@/features/app/documents/data/types'

/**
 * §5.2 (verification half) — cross-check a stated statutory notice figure
 * against the encoded schedule (`statutoryNotice.ts`), closing the gap the
 * 2026-08-08 RAG review confirmed: the notice table existed but was never
 * consulted anywhere in the chat path, so the model could state a wrong
 * Ontario figure and every gate passed.
 *
 * Deterministic and deliberately narrow:
 * - It only fires when the tenure is extractable from the turn (the user's
 *   message or the reply itself), the jurisdiction's schedule is populated
 *   (Ontario today; QC/FED are null pending legal review), and the reply
 *   states a weeks figure in notice context. Anything less is
 *   'unverifiable', never a guess.
 * - A mismatch does not rewrite prose (a client cannot un-say a sentence);
 *   `safetyBackstop.ts` uses it to withhold the legal-basis surface and put
 *   an accurate warning in front of the operator.
 * - A range claim ("4 to 8 weeks") counts as consistent when the expected
 *   value falls inside it — common-law discussions legitimately give ranges
 *   above the statutory floor, and flagging those would train users to
 *   ignore the warning.
 */

export type CrossCheckVerdict = 'consistent' | 'mismatch' | 'unverifiable'

export interface NoticeCrossCheckResult {
  verdict: CrossCheckVerdict
  /** Populated on mismatch: what the schedule says vs what the reply said. */
  expectedWeeks?: number
  statedWeeks?: number
}

/**
 * Completed tenure in months extracted from prose, or null when absent or
 * ambiguous (two different tenures mentioned → null; a wrong guess is worse
 * than no check). Handles "4 years", "18 months", "4 ans", "18 mois",
 * "4 years and 3 months", decimals ("2.5 years").
 */
export function extractTenureMonths(text: string): number | null {
  const normalized = normalizeText(text)
  const tenures = new Set<number>()

  const combined =
    /\b(\d{1,2}(?:[.,]\d+)?)\s*(?:years?|ans?)(?:\s*(?:and|et)\s*(\d{1,2})\s*(?:months?|mois))?\b/g
  for (const match of normalized.matchAll(combined)) {
    const years = Number.parseFloat(match[1]!.replace(',', '.'))
    const extraMonths = match[2] ? Number.parseInt(match[2], 10) : 0
    if (Number.isFinite(years)) tenures.add(Math.floor(years * 12) + extraMonths)
  }

  /* Bare month counts, only when no year phrasing matched — "18 months of
     service". Skip small counts inside year-and-month phrases (handled
     above via the combined regex; matchAll consumed them there). */
  if (tenures.size === 0) {
    const monthsOnly = /\b(\d{1,3})\s*(?:months?|mois)\b/g
    for (const match of normalized.matchAll(monthsOnly)) {
      const months = Number.parseInt(match[1]!, 10)
      if (Number.isFinite(months)) tenures.add(months)
    }
  }

  if (tenures.size !== 1) return null
  return [...tenures][0]!
}

/** Weeks figures the reply states in statutory-notice context. */
const NOTICE_WEEKS =
  /\b(\d{1,2})(?:\s*(?:-|–|to|a)\s*(\d{1,2}))?\s*(?:weeks?|semaines?)(?:'|s)?\s*(?:of\s+)?(?:written\s+)?(?:notice|pay in lieu|termination pay|preavis|de preavis)?/g

const NOTICE_CONTEXT: readonly string[] = [
  'notice',
  'termination',
  'pay in lieu',
  'esa',
  'employment standards',
  'preavis',
  'cessation',
  'licenciement',
  'normes d emploi',
]

/**
 * Every distinct weeks claim (single values and ranges) made in notice
 * context. Empty when the text never talks about notice.
 */
export function extractNoticeWeeksClaims(text: string): { min: number; max: number }[] {
  const normalized = normalizeText(text)
  if (!NOTICE_CONTEXT.some((term) => normalized.includes(term))) return []
  const claims: { min: number; max: number }[] = []
  for (const match of normalized.matchAll(NOTICE_WEEKS)) {
    const a = Number.parseInt(match[1]!, 10)
    const b = match[2] ? Number.parseInt(match[2], 10) : a
    if (Number.isFinite(a) && Number.isFinite(b)) {
      claims.push({ min: Math.min(a, b), max: Math.max(a, b) })
    }
  }
  return claims
}

/**
 * Cross-check the reply's notice figures against the statutory schedule.
 * Tenure is read from the user's message first (the person states their own
 * facts), then from the reply.
 */
export function crossCheckNoticeFigure(input: {
  jurisdiction: Jurisdiction
  userMessage: string
  reply: string
}): NoticeCrossCheckResult {
  const claims = extractNoticeWeeksClaims(input.reply)
  if (claims.length === 0) return { verdict: 'unverifiable' }

  const tenureMonths =
    extractTenureMonths(input.userMessage) ?? extractTenureMonths(input.reply)
  if (tenureMonths === null) return { verdict: 'unverifiable' }

  const expectedWeeks = lookupStatutoryNoticeWeeks(input.jurisdiction, tenureMonths)
  if (expectedWeeks === null) return { verdict: 'unverifiable' }

  /* Consistent when ANY claim covers the expected value: replies often state
     both the statutory floor and a common-law range above it, and the floor
     being present is exactly what the table can vouch for. */
  const covered = claims.some((c) => expectedWeeks >= c.min && expectedWeeks <= c.max)
  if (covered) return { verdict: 'consistent', expectedWeeks }

  /* No claim matches the schedule — report the closest single claim. */
  return { verdict: 'mismatch', expectedWeeks, statedWeeks: claims[0]!.min }
}
