import { defineMessages } from '../core'

/**
 * Wellbeing & support view — chrome strings from the prototype's
 * `buildWellbeingView()` / `askAboutWellbeing()` (App v2.dc.html).
 * EN verbatim; FR from the prototype's inline `L(en, fr)` pairs, `buildI18n()`
 * and `frDict()`. FR strings with no source in the prototype are marked
 * [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(wellbeingMessages.key)`.
 */
export const wellbeingMessages = defineMessages({
  wellbeing_banner: {
    en: 'Support signals are for supportive follow-up and workload review only. They must not be used for discipline, termination, compensation, ranking, or performance scoring.',
    fr: 'Les signaux de soutien servent uniquement au suivi bienveillant et à l’examen de la charge de travail. Ils ne doivent pas servir à la discipline, à la cessation d’emploi, à la rémunération, au classement ou à l’évaluation du rendement.',
  },

  /* Stat tiles. */
  wellbeing_active_label: { en: 'Active support signals', fr: 'Signaux de soutien actifs' },
  wellbeing_follow_label: { en: 'Follow-ups this week', fr: 'Suivis cette semaine' },

  /* Signal card meta labels. */
  wellbeing_source: { en: 'Source', fr: 'Source' },
  wellbeing_confidence: { en: 'Confidence', fr: 'Confiance' },
  wellbeing_recommended: {
    en: 'Recommended supportive action',
    fr: 'Action de soutien recommandée',
  },

  /* Signal card actions. */
  wellbeing_open_profile: { en: 'Open profile', fr: 'Ouvrir le profil' },
  wellbeing_draft_checkin: { en: 'Draft support check-in', fr: 'Rédiger un suivi de soutien' },

  wellbeing_audit_note: {
    en: 'Access to support signals is recorded in the audit log.',
    fr: 'L’accès aux signaux de soutien est consigné au journal d’audit.',
  },

  /* Check-in rail (prototype `askAboutWellbeing`). */
  wellbeing_rail_title_suffix: { en: ' — wellbeing', fr: ' — bien-être' }, // [FR self-authored]
  wellbeing_handle_title: { en: 'Handle with care', fr: 'À traiter avec délicatesse' }, // [FR self-authored]
  wellbeing_handle_body: {
    en: 'Frame any conversation around workload and support, not medical questions. If a medical cause surfaces, it may trigger a duty to inquire about accommodation.',
    // [FR self-authored — phrasing follows the prototype's lbl.wellbeingNote FR]
    fr: 'Orientez toute conversation vers la charge de travail et le soutien, pas vers des questions médicales. Si une cause médicale émerge, cela peut déclencher une obligation de s’informer sur l’accommodement.',
  },
  wellbeing_handle_citation: {
    en: 'Human rights — duty to accommodate',
    fr: 'Droits de la personne — obligation d’accommodement', // [FR self-authored]
  },
  wellbeing_draft_message_action: {
    en: 'Draft a check-in message',
    fr: 'Rédiger un message de suivi',
  },
  wellbeing_context_topic: { en: 'Wellbeing', fr: 'Bien-être' },
})
