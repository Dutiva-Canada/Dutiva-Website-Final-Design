import { defineMessages } from '../core'

/**
 * Compensation view — chrome strings from the prototype's
 * `buildCompensationView()` / `askAboutComp()` (App v2.dc.html) plus the
 * `lbl` entries it renders (annualPayroll, belowMidpoint, people, table
 * headers). EN verbatim; FR from the prototype's inline `L(en, fr)` pairs,
 * `buildI18n()` and `frDict()`. FR strings with no source in the prototype
 * are marked [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(compensationMessages.key)`.
 */
export const compensationMessages = defineMessages({
  comp_banner: {
    en: 'Restricted module — visible to Owner/Admin, HR Manager, and Finance roles. Access and changes are recorded in the audit log.',
    fr: 'Module restreint — visible pour les rôles Propriétaire/Admin, Responsable RH et Finances. Les accès et les changements sont consignés au journal d’audit.',
  },

  /* Stat tiles. */
  comp_annual_payroll: { en: 'Annual base payroll', fr: 'Masse salariale de base annuelle' },
  comp_below_midpoint: { en: 'Below market midpoint', fr: 'Sous le point milieu du marché' },
  comp_people: { en: 'People', fr: 'Personnes' },

  /* Section labels. */
  comp_changes_label: { en: 'Changes & approvals', fr: 'Changements et approbations' },
  comp_overview_label: { en: 'Compensation overview', fr: 'Aperçu de la rémunération' },
  comp_requested_by: { en: 'Requested by', fr: 'Demandé par' },
  comp_review_with_advisor: { en: 'Review with Advisor', fr: 'Réviser avec le Conseiller' },
  comp_separation_note: {
    en: 'Compensation data is never used for wellbeing, discipline, or performance inferences.',
    fr: 'Les données de rémunération ne servent jamais à des inférences sur le bien-être, la discipline ou le rendement.',
  },

  /* Overview table headers. */
  comp_th_name: { en: 'Name', fr: 'Nom' },
  comp_th_role: { en: 'Role', fr: 'Poste' },
  comp_th_band: { en: 'Band', fr: 'Échelle' },
  comp_th_base: { en: 'Base', fr: 'Base' },
  comp_th_vs_market: { en: 'vs market', fr: 'c. marché' },

  /* Change-review rail turn (prototype `ch.onReview`). */
  comp_change_review_intro: {
    en: 'Here’s where this change stands and what it needs before it can move.',
    fr: 'Voici où en est ce changement et ce qu’il lui faut pour avancer.',
  },
  comp_change_review_suffix: {
    en: 'Legal/pay-equity review may be required if a gap is confirmed.',
    fr: 'Une révision juridique ou d’équité salariale peut être requise si un écart est confirmé.',
  },

  /* Per-employee pay rail (prototype `askAboutComp`). */
  comp_rail_title_suffix: { en: ' — pay', fr: ' — rémunération' }, // [FR self-authored]
  comp_below_title: { en: 'Below market midpoint', fr: 'Sous le point milieu du marché' },
  comp_within_title: { en: 'Within market band', fr: 'Dans la fourchette du marché' }, // [FR self-authored]
  comp_pay_equity_citation: {
    en: 'Pay Equity Act (federal / ON)',
    fr: 'Loi sur l’équité salariale (fédéral / Ont.)', // [FR self-authored]
  },
  comp_open_comp_tab: { en: 'Open compensation tab', fr: 'Ouvrir l’onglet Rémunération' },
  comp_context_topic: { en: 'Compensation review', fr: 'Examen de la rémunération' }, // [FR self-authored]

  /* A11y labels. */
  comp_open_aria: { en: 'Open compensation for', fr: 'Ouvrir la rémunération de' }, // [FR self-authored]
  comp_ask_aria: {
    en: 'Ask Advisor about pay',
    fr: 'Demander au Conseiller à propos de la rémunération', // [FR self-authored]
  },
})
