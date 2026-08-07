import { bi } from '@/i18n/core'
import type {
  JurisdictionHeadcount,
  PolicyAcknowledgmentCampaign,
  ScoreHistoryPoint,
} from './types'
import { calendarMonth } from './calendar'
import { complianceScore } from './compliance'

/**
 * Analytics fixtures — the workspace-level aggregates the prototype carried
 * as viewmodel constants inside `buildReportsView()` (App v2.dc.html lines
 * 1204–1231), moved here so the Analytics view imports data like every other
 * view instead of inlining it.
 */

/**
 * The demo diorama's fixed "today" (YYYY-MM-DD), derived from the calendar
 * fixture (July 2026 grid, today = 5) so the two can never disagree.
 */
export const demoTodayISO = `${calendarMonth.year}-${String(calendarMonth.monthIndex + 1).padStart(
  2,
  '0',
)}-${String(calendarMonth.todayDay).padStart(2, '0')}`

/**
 * Six-month compliance-score history ending at the current score
 * (`complianceScore`, the same number the Compliance view leads with). The
 * first five points are the prototype's `scoreTrend` constants.
 */
export const scoreHistory: ScoreHistoryPoint[] = [
  { monthISO: '2026-02-01', score: 74 },
  { monthISO: '2026-03-01', score: 76 },
  { monthISO: '2026-04-01', score: 79 },
  { monthISO: '2026-05-01', score: 78 },
  { monthISO: '2026-06-01', score: 81 },
  { monthISO: '2026-07-01', score: complianceScore },
]

/**
 * Headcount by jurisdiction (prototype viewmodel constants — the diorama
 * company is larger than the individually-modelled employee fixtures).
 * 'Federal' means federally regulated roles under the Canada Labour Code,
 * not a province — the view carries that footnote.
 */
export const headcountByJurisdiction: JurisdictionHeadcount[] = [
  { key: 'ON', label: bi('ON', 'ON'), value: 34 },
  { key: 'BC', label: bi('BC', 'BC'), value: 21 },
  { key: 'QC', label: bi('QC', 'QC'), value: 12 },
  { key: 'AB', label: bi('AB', 'AB'), value: 9 },
  { key: 'Federal', label: bi('Federal', 'Fédéral'), value: 6 },
]

export const headcountTotal = headcountByJurisdiction.reduce((sum, row) => sum + row.value, 0)

/**
 * Current policy-acknowledgment campaign: the annual Code of Conduct
 * attestation (policy p3 — up to date; the yearly re-acknowledgment run is
 * still collecting signatures across the 82-person company).
 */
export const policyAcknowledgment: PolicyAcknowledgmentCampaign = {
  policyId: 'p3',
  title: bi('Code of Conduct — annual attestation', 'Code de conduite — attestation annuelle'),
  signed: 74,
  total: headcountTotal,
}
