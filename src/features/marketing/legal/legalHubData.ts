import type { legalHubMessages } from '@/i18n/messages/legalHub'

type LegalHubKey = keyof typeof legalHubMessages

export interface LegalHubRow {
  /** `/legal/<slug>` — must match a `policyContent` document slug. */
  slug: string
  titleKey: LegalHubKey
  descKey: LegalHubKey
}

export interface LegalHubGroup {
  titleKey: LegalHubKey
  rows: LegalHubRow[]
}

/**
 * The 26 policy documents in the hub's prototype order (`legalHub_row1..26`),
 * grouped under the six `legalHub_s*` section headings.
 */
export const LEGAL_HUB_GROUPS: LegalHubGroup[] = [
  {
    titleKey: 'legalHub_s1',
    rows: [
      { slug: 'terms', titleKey: 'legalHub_row1_title', descKey: 'legalHub_row1_desc' },
      { slug: 'privacy', titleKey: 'legalHub_row2_title', descKey: 'legalHub_row2_desc' },
      { slug: 'disclaimer', titleKey: 'legalHub_row3_title', descKey: 'legalHub_row3_desc' },
      { slug: 'cookies', titleKey: 'legalHub_row4_title', descKey: 'legalHub_row4_desc' },
      { slug: 'accessibility', titleKey: 'legalHub_row5_title', descKey: 'legalHub_row5_desc' },
    ],
  },
  {
    titleKey: 'legalHub_s2',
    rows: [
      { slug: 'pipeda-compliance', titleKey: 'legalHub_row6_title', descKey: 'legalHub_row6_desc' },
      { slug: 'quebec-law-25', titleKey: 'legalHub_row7_title', descKey: 'legalHub_row7_desc' },
      { slug: 'casl-compliance', titleKey: 'legalHub_row8_title', descKey: 'legalHub_row8_desc' },
      {
        slug: 'cross-border-transfer',
        titleKey: 'legalHub_row9_title',
        descKey: 'legalHub_row9_desc',
      },
    ],
  },
  {
    titleKey: 'legalHub_s3',
    rows: [
      { slug: 'ai-technology', titleKey: 'legalHub_row10_title', descKey: 'legalHub_row10_desc' },
      {
        slug: 'ai-usage-disclosure',
        titleKey: 'legalHub_row11_title',
        descKey: 'legalHub_row11_desc',
      },
      {
        slug: 'ai-risk-disclosure',
        titleKey: 'legalHub_row12_title',
        descKey: 'legalHub_row12_desc',
      },
      {
        slug: 'human-review-escalation',
        titleKey: 'legalHub_row13_title',
        descKey: 'legalHub_row13_desc',
      },
    ],
  },
  {
    titleKey: 'legalHub_s4',
    rows: [
      {
        slug: 'data-processing-agreement',
        titleKey: 'legalHub_row14_title',
        descKey: 'legalHub_row14_desc',
      },
      { slug: 'data-retention', titleKey: 'legalHub_row15_title', descKey: 'legalHub_row15_desc' },
      { slug: 'data-deletion', titleKey: 'legalHub_row16_title', descKey: 'legalHub_row16_desc' },
      {
        slug: 'incident-response-policy',
        titleKey: 'legalHub_row17_title',
        descKey: 'legalHub_row17_desc',
      },
      { slug: 'security', titleKey: 'legalHub_row18_title', descKey: 'legalHub_row18_desc' },
      { slug: 'subprocessors', titleKey: 'legalHub_row19_title', descKey: 'legalHub_row19_desc' },
    ],
  },
  {
    titleKey: 'legalHub_s5',
    rows: [
      {
        slug: 'subscription-agreement',
        titleKey: 'legalHub_row20_title',
        descKey: 'legalHub_row20_desc',
      },
      { slug: 'refund-policy', titleKey: 'legalHub_row21_title', descKey: 'legalHub_row21_desc' },
      { slug: 'support-policy', titleKey: 'legalHub_row22_title', descKey: 'legalHub_row22_desc' },
    ],
  },
  {
    titleKey: 'legalHub_s6',
    rows: [
      { slug: 'acceptable-use', titleKey: 'legalHub_row23_title', descKey: 'legalHub_row23_desc' },
      { slug: 'copyright', titleKey: 'legalHub_row24_title', descKey: 'legalHub_row24_desc' },
      {
        slug: 'trademark-policy',
        titleKey: 'legalHub_row25_title',
        descKey: 'legalHub_row25_desc',
      },
      { slug: 'dmca-takedown', titleKey: 'legalHub_row26_title', descKey: 'legalHub_row26_desc' },
    ],
  },
]
