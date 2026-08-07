import { defineMessages } from '../core'

/**
 * Analytics view (formerly Reports) — UI-chrome strings for the rebuilt
 * dashboard: compliance score card, needs-attention list, headcount by
 * jurisdiction, open-case aging and policy acknowledgments. The rebuild has
 * no design-handoff string source, so FR is [FR self-authored] throughout,
 * reusing the vocabulary already established in the workspace catalogue
 * ('juridiction' per doclib, 'accusé de réception' per template t39).
 *
 * Registered in src/i18n/messages/workspace.ts.
 */
export const analyticsMessages = defineMessages({
  analytics_subtitle: {
    en: 'Workforce and compliance overview.',
    fr: 'Aperçu de l’effectif et de la conformité.',
  },

  /* ── Compliance score card ─────────────────────────────────────────────── */
  analytics_score_title: { en: 'Compliance score', fr: 'Score de conformité' },
  analytics_score_delta: { en: '{delta} vs {month}', fr: '{delta} c. {month}' },
  analytics_score_delta_flat: { en: 'No change vs {month}', fr: 'Aucun changement c. {month}' },
  analytics_score_chart_aria: {
    en: 'Compliance score by month: {points}.',
    fr: 'Score de conformité par mois : {points}.',
  },
  analytics_score_table_month: { en: 'Month', fr: 'Mois' },
  analytics_score_table_score: { en: 'Score', fr: 'Score' },
  analytics_score_breakdown_title: { en: 'Score breakdown', fr: 'Répartition du score' },
  analytics_score_lowest_flag: { en: 'Lowest', fr: 'Le plus bas' },
  analytics_score_empty: {
    en: 'No score data yet.',
    fr: 'Aucune donnée de score pour l’instant.',
  },
  analytics_score_first_point: {
    en: 'Score history starts here — this month is your first data point.',
    fr: 'L’historique du score commence ici — ce mois-ci est votre premier point de données.',
  },
  analytics_comp_policies: { en: 'Policies current', fr: 'Politiques à jour' },
  analytics_comp_tasks: { en: 'Tasks complete', fr: 'Tâches terminées' },
  analytics_comp_findings: { en: 'Findings resolved', fr: 'Constats résolus' },
  analytics_comp_value: { en: '{done} of {total}', fr: '{done} sur {total}' },

  /* ── Needs attention card ──────────────────────────────────────────────── */
  analytics_attention_title: { en: 'Needs attention', fr: 'Attention requise' },
  analytics_attention_sub: {
    en: 'Overdue and upcoming compliance items.',
    fr: 'Éléments de conformité en retard et à venir.',
  },
  analytics_attention_overdue: { en: 'Overdue', fr: 'En retard' },
  analytics_attention_due_today: { en: 'Due today', fr: 'Échéance aujourd’hui' },
  analytics_attention_due_tomorrow: { en: 'Due tomorrow', fr: 'Échéance demain' },
  analytics_attention_due_days: { en: 'Due in {n} days', fr: 'Échéance dans {n} jours' },
  analytics_attention_due_date: { en: 'Due {date}', fr: 'Échéance {date}' },
  analytics_attention_affected_one: { en: '1 employee', fr: '1 employé' },
  analytics_attention_affected: { en: '{n} employees', fr: '{n} employés' },
  analytics_attention_view_all: { en: 'View all ({n})', fr: 'Tout voir ({n})' },
  analytics_attention_task_kind: { en: 'Compliance task', fr: 'Tâche de conformité' },
  analytics_attention_empty: {
    en: 'Nothing needs attention right now.',
    fr: 'Rien ne requiert votre attention pour le moment.',
  },

  /* ── Headcount card ────────────────────────────────────────────────────── */
  analytics_headcount_title: { en: 'Headcount by jurisdiction', fr: 'Effectif par juridiction' },
  analytics_headcount_total: { en: '{n} employees total', fr: '{n} employés au total' },
  analytics_headcount_footnote: {
    en: 'Federal = federally regulated roles under the Canada Labour Code.',
    fr: 'Fédéral = postes sous réglementation fédérale régis par le Code canadien du travail.',
  },
  analytics_headcount_chart_aria: {
    en: 'Headcount by jurisdiction: {points}.',
    fr: 'Effectif par juridiction : {points}.',
  },
  analytics_headcount_table_jurisdiction: { en: 'Jurisdiction', fr: 'Juridiction' },
  analytics_headcount_table_employees: { en: 'Employees', fr: 'Employés' },
  analytics_headcount_empty: { en: 'No employees yet.', fr: 'Aucun employé pour l’instant.' },

  /* ── Open cases card ───────────────────────────────────────────────────── */
  analytics_cases_title: { en: 'Open cases', fr: 'Dossiers ouverts' },
  analytics_cases_open_now: { en: 'Open now', fr: 'Ouverts actuellement' },
  analytics_cases_avg_age: { en: 'Avg. age (days)', fr: 'Âge moyen (jours)' },
  analytics_cases_oldest: { en: 'Oldest (days)', fr: 'Le plus ancien (jours)' },
  analytics_cases_day_one: { en: '1 day', fr: '1 jour' },
  analytics_cases_days: { en: '{n} days', fr: '{n} jours' },
  analytics_cases_opened: { en: 'Opened {date}', fr: 'Ouvert le {date}' },
  analytics_cases_empty: { en: 'No open cases.', fr: 'Aucun dossier ouvert.' },

  /* ── Policy acknowledgments card ───────────────────────────────────────── */
  analytics_ack_title: {
    en: 'Policy acknowledgments',
    fr: 'Accusés de réception des politiques',
  },
  analytics_ack_signed: { en: '{signed} / {total} signed', fr: '{signed} / {total} signés' },
  analytics_ack_meter_aria: {
    en: '{signed} of {total} acknowledgments signed',
    fr: '{signed} accusés de réception signés sur {total}',
  },
  analytics_ack_action: {
    en: 'Send a reminder to the {n} employees with outstanding signatures.',
    fr: 'Envoyez un rappel aux {n} employés dont la signature est en attente.',
  },
  analytics_ack_action_one: {
    en: 'Send a reminder to the employee with an outstanding signature.',
    fr: 'Envoyez un rappel à l’employé dont la signature est en attente.',
  },
  analytics_ack_complete: {
    en: 'All acknowledgments are signed.',
    fr: 'Tous les accusés de réception sont signés.',
  },
  analytics_ack_empty: {
    en: 'No acknowledgment campaigns yet.',
    fr: 'Aucune campagne d’accusé de réception pour l’instant.',
  },

  /* ── Card chrome (loading / error / empty) ─────────────────────────────── */
  analytics_loading: { en: 'Loading…', fr: 'Chargement…' },
  analytics_error: { en: 'Couldn’t load this card.', fr: 'Impossible de charger cette carte.' },
  analytics_retry: { en: 'Retry', fr: 'Réessayer' },

  /* ── Production mode ───────────────────────────────────────────────────── */
  analytics_live_note: {
    en: 'Computed live from your workspace records.',
    fr: 'Calculé en direct à partir des enregistrements de votre espace de travail.',
  },
  analytics_prod_empty_title: {
    en: 'Nothing to report yet',
    fr: 'Rien à rapporter pour l’instant',
  },
  analytics_prod_empty_body: {
    en: 'Analytics builds itself from your real workspace — add employees, cases, tasks, findings, or policies and the numbers appear here.',
    fr: 'La page Analytique se construit à partir de votre espace de travail réel — ajoutez des employés, des dossiers, des tâches, des constats ou des politiques et les chiffres apparaîtront ici.',
  },
})
