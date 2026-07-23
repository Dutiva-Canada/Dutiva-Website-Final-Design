import type { MessageKey } from '@/i18n/messages'
import type { PlanId } from './plans'

/**
 * A comparison cell:
 *   - `true`  → included (rendered as a check),
 *   - `false` → not included (rendered as a dash),
 *   - a `MessageKey` → a short qualifier ("Core", "Priority", "1 document", …).
 */
export type ComparisonCell = boolean | MessageKey

export interface ComparisonRow {
  labelKey: MessageKey
  cells: Record<PlanId, ComparisonCell>
}

export interface ComparisonGroup {
  headingKey: MessageKey
  rows: ComparisonRow[]
}

/**
 * Feature-by-feature plan comparison, grounded in the four tiers' headline
 * features (src/config/plans.ts + the landing_* copy). Qualitative by design —
 * exact limits are being finalized during beta (surfaced under the table via
 * pricing_compare_note), so values stay directional rather than numeric.
 */
export const PLAN_COMPARISON: ComparisonGroup[] = [
  {
    headingKey: 'pricing_grp_advisor',
    rows: [
      {
        labelKey: 'pricing_row_advisor_access',
        cells: {
          free: 'pricing_v_limited',
          starter: 'pricing_v_core',
          growth: 'pricing_v_expanded',
          pro: 'pricing_v_higher',
        },
      },
      {
        labelKey: 'pricing_row_ask',
        cells: { free: true, starter: true, growth: true, pro: true },
      },
      {
        labelKey: 'pricing_row_riskflags',
        cells: { free: true, starter: true, growth: true, pro: 'pricing_v_priority' },
      },
      {
        labelKey: 'pricing_row_jurisdiction',
        cells: { free: true, starter: true, growth: true, pro: true },
      },
    ],
  },
  {
    headingKey: 'pricing_grp_documents',
    rows: [
      {
        labelKey: 'pricing_row_docgen',
        cells: { free: 'pricing_v_one', starter: 'pricing_v_limited', growth: true, pro: true },
      },
      {
        labelKey: 'pricing_row_templates',
        cells: {
          free: 'pricing_v_basic',
          starter: 'pricing_v_core',
          growth: 'pricing_v_core',
          pro: 'pricing_v_full',
        },
      },
      {
        labelKey: 'pricing_row_export',
        cells: { free: false, starter: false, growth: true, pro: true },
      },
      {
        labelKey: 'pricing_row_advworkflows',
        cells: { free: false, starter: false, growth: false, pro: true },
      },
    ],
  },
  {
    headingKey: 'pricing_grp_workspace',
    rows: [
      {
        labelKey: 'pricing_row_preview',
        cells: { free: false, starter: false, growth: true, pro: true },
      },
      {
        labelKey: 'pricing_row_support',
        cells: {
          free: 'pricing_v_email',
          starter: 'pricing_v_email',
          growth: 'pricing_v_email',
          pro: 'pricing_v_priority',
        },
      },
    ],
  },
  {
    headingKey: 'pricing_grp_billing',
    rows: [
      {
        labelKey: 'pricing_row_contract',
        cells: { free: true, starter: true, growth: true, pro: true },
      },
      {
        labelKey: 'pricing_row_refund',
        cells: { free: false, starter: true, growth: true, pro: true },
      },
    ],
  },
]
