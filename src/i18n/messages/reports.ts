import { defineMessages } from '../core'

/**
 * Reports view — UI-chrome strings ported from `App v2.dc.html`
 * (`buildI18n()` lbl.headcountByProvince / lbl.totalEmployees /
 * lbl.complianceTrend). The view subtitle comes from the shell module
 * (`shell_sub_reports`). FR strings with no source in the prototype are
 * marked [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(reportsMessages.key)`.
 */
export const reportsMessages = defineMessages({
  reports_headcount_title: { en: 'Headcount by province', fr: 'Effectif par province' },
  reports_total_employees: { en: 'total employees', fr: 'employés au total' },
  reports_trend_title: { en: 'Compliance score trend', fr: 'Tendance du score de conformité' },
  /* Raw EN sentence in the prototype markup (line 1223) — no FR source. */
  reports_trend_sub: {
    en: 'Now at {score}/100, up from 74 six months ago',
    fr: 'Maintenant à {score}/100, en hausse par rapport à 74 il y a six mois', // [FR self-authored]
  },
})
