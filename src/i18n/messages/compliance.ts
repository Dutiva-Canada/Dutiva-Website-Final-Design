import { defineMessages } from '../core'

/**
 * Compliance view chrome — transcribed from the App v2 prototype
 * (`buildComplianceView()`, `markEvidence()`, `explainObligation()`,
 * `askAdvisorAboutRisk()` and the `lbl.*` map in `buildAppViewModel()`).
 *
 * EN verbatim from the prototype; FR from its inline `L(en, fr)` pairs and
 * `frDict()`. FR strings with no source in the prototype are marked
 * [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(complianceMessages.key)`.
 */
export const complianceMessages = defineMessages({
  /* ── Jurisdiction filter (prototype `jurs` + markup aria-label) ─────────── */
  compliance_jur_filter_aria: { en: 'Jurisdiction filter', fr: 'Filtre de compétence' }, // [FR self-authored]
  compliance_jur_all: { en: 'All jurisdictions', fr: 'Toutes les compétences' },
  compliance_jur_ontario: { en: 'Ontario', fr: 'Ontario' },
  compliance_jur_quebec: { en: 'Quebec', fr: 'Québec' },
  compliance_jur_bc: { en: 'British Columbia', fr: 'Colombie-Britannique' },
  compliance_jur_federal: { en: 'Federal', fr: 'Fédéral' },

  /* ── Stat cards ─────────────────────────────────────────────────────────── */
  compliance_stat_open_obligations: { en: 'Open obligations', fr: 'Obligations ouvertes' },
  compliance_stat_due_soon: { en: 'Due in 30 days', fr: 'Échéance sous 30 jours' },
  compliance_stat_open_risk: { en: 'Open risk items', fr: 'Éléments à risque ouverts' },
  compliance_stat_provinces: { en: 'Provinces covered', fr: 'Provinces couvertes' },

  /* ── Obligation register ────────────────────────────────────────────────── */
  compliance_register: { en: 'Obligation register', fr: 'Registre des obligations' },
  compliance_oriented_note: {
    en: 'Compliance-oriented tracking — Dutiva does not certify or guarantee compliance.',
    fr: 'Suivi axé sur la conformité — Dutiva ne certifie ni ne garantit la conformité.',
  },
  compliance_owner: { en: 'Owner', fr: 'Responsable' },
  compliance_due: { en: 'Due', fr: 'Échéance' },
  compliance_recurrence: { en: 'Recurrence', fr: 'Récurrence' },
  compliance_evidence_recorded: {
    en: 'Evidence recorded just now — logged in the audit trail.',
    fr: 'Preuve consignée à l’instant — inscrite au journal d’audit.',
  },
  compliance_mark_evidence: { en: 'Mark evidence on file', fr: 'Consigner la preuve' },
  compliance_explain_advisor: { en: 'Explain with Advisor', fr: 'Expliquer avec le Conseiller' },
  compliance_audit_note: {
    en: 'Status changes and evidence records are captured in the audit log.',
    fr: 'Les changements d’état et les preuves consignées sont inscrits au journal d’audit.',
  },
  compliance_toast_evidence: {
    en: 'Evidence recorded — logged in the audit trail',
    fr: 'Preuve consignée — inscrite au journal d’audit',
  },

  /* ── Posture by area ────────────────────────────────────────────────────── */
  compliance_posture: { en: 'Posture by area', fr: 'Posture par domaine' },

  /* ── Active risk flags ──────────────────────────────────────────────────── */
  compliance_flags: { en: 'Active risk flags', fr: 'Signalements de risque actifs' },
  compliance_jurisdiction: { en: 'Jurisdiction', fr: 'Compétence' },
  compliance_legislation: { en: 'Legislation', fr: 'Législation' },
  compliance_next_action: { en: 'Next action', fr: 'Prochaine action' },
  compliance_resolve_advisor: { en: 'Resolve with Advisor', fr: 'Résoudre avec le Conseiller' },

  /* ── Regulatory watchlist ───────────────────────────────────────────────── */
  compliance_watchlist: { en: 'Regulatory watchlist', fr: 'Veille réglementaire' },

  /* ── Advisor rail (prototype `explainObligation` / `askAdvisorAboutRisk`) ─ */
  compliance_explain_text: {
    en: 'Here’s what this obligation covers and why it’s tracked.',
    fr: 'Voici ce que couvre cette obligation et pourquoi elle est suivie.',
  },
  compliance_not_legal_advice: { en: 'Not legal advice', fr: 'Pas un avis juridique' },
  compliance_flag_rail_text: {
    en: 'Here’s the detail behind this flag, and what I’d do next.',
    // [FR self-authored]
    fr: 'Voici le détail derrière ce signalement, et ce que je ferais ensuite.',
  },
  compliance_open_full_case: { en: 'Open full case', fr: 'Ouvrir le dossier complet' },
})
