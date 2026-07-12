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

  /* ── Production dashboard (real aggregation over the wired modules — no
     design-handoff counterpart; [FR self-authored] throughout) ──────────── */
  reports_prod_loading: { en: 'Loading…', fr: 'Chargement…' },
  reports_prod_error: {
    en: 'Couldn’t load report data.',
    fr: 'Impossible de charger les données du rapport.',
  },
  reports_prod_retry: { en: 'Retry', fr: 'Réessayer' },
  reports_prod_empty_title: { en: 'Nothing to report yet', fr: 'Rien à rapporter pour l’instant' },
  reports_prod_empty_body: {
    en: 'Reports build themselves from your real workspace — add employees, cases, tasks, findings, or policies and the numbers appear here.',
    fr: 'Les rapports se construisent à partir de votre espace de travail réel — ajoutez des employés, des dossiers, des tâches, des constats ou des politiques et les chiffres apparaîtront ici.',
  },
  reports_prod_stat_employees: { en: 'Employees', fr: 'Employés' },
  reports_prod_stat_open_cases: { en: 'Open cases', fr: 'Dossiers ouverts' },
  reports_prod_stat_open_tasks: { en: 'Open tasks', fr: 'Tâches ouvertes' },
  reports_prod_stat_open_findings: { en: 'Open findings', fr: 'Constats ouverts' },
  reports_prod_headcount_title: {
    en: 'Headcount by province',
    fr: 'Effectif par province',
  },
  reports_prod_total_suffix: { en: 'total', fr: 'au total' },
  reports_prod_cases_title: { en: 'Cases by status', fr: 'Dossiers par statut' },
  reports_prod_cases_open: { en: 'Open', fr: 'Ouverts' },
  reports_prod_cases_in_review: { en: 'In review', fr: 'En révision' },
  reports_prod_cases_resolved: { en: 'Resolved', fr: 'Résolus' },
  reports_prod_policies_title: { en: 'Policy posture', fr: 'Posture des politiques' },
  reports_prod_policies_up_to_date: { en: 'Up to date', fr: 'À jour' },
  reports_prod_policies_needs_review: { en: 'Needs review', fr: 'À réviser' },
  reports_prod_policies_missing: { en: 'Missing', fr: 'Manquantes' },
  reports_prod_live_note: {
    en: 'Computed live from your workspace records.',
    fr: 'Calculé en direct à partir des enregistrements de votre espace de travail.',
  },
})
