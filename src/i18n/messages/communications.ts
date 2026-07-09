import { defineMessages } from '../core'

/**
 * Communications view — chrome strings from the prototype's
 * `buildCommunicationsView()` / `sendCommunication()` / `markCommSent()`
 * (App v2.dc.html) plus the `lbl` entries it renders (commsSubtitle,
 * reviewWithAdvisor). EN verbatim; FR from the prototype's inline `L(en, fr)`
 * pairs and `buildI18n()`.
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(communicationsMessages.key)`.
 */
export const communicationsMessages = defineMessages({
  comms_subtitle: {
    en: 'Advisor reviews every announcement for jurisdiction and tone before it goes out.',
    fr: 'Le Conseiller examine chaque annonce pour la compétence et le ton avant l’envoi.',
  },
  comms_review_with_advisor: { en: 'Review with Advisor', fr: 'Réviser avec le Conseiller' },

  /* Status labels (prototype `statusLabel` map — view-level wording). */
  comms_status_draft: { en: 'Draft', fr: 'Ébauche' },
  comms_status_scheduled: { en: 'Scheduled', fr: 'Planifié' },
  comms_status_sent: { en: 'Sent', fr: 'Envoyé' },
  comms_just_now: { en: 'Just now', fr: 'À l’instant' },

  /* Send buttons. */
  comms_send: { en: 'Send', fr: 'Envoyer' },
  comms_send_now: { en: 'Send now', fr: 'Envoyer maintenant' },

  /* Advisor review dimensions (prototype `dims(...)`). */
  comms_dim_tone: { en: 'Tone', fr: 'Ton' },
  comms_dim_legal: { en: 'Legal', fr: 'Juridique' },
  comms_dim_clarity: { en: 'Clarity', fr: 'Clarté' },
  comms_dim_policy: { en: 'Policy', fr: 'Politiques' },
  comms_dim_ok_suffix: { en: ' · OK', fr: ' · OK' },
  comms_dim_review_suffix: { en: ' · Review', fr: ' · À revoir' },

  /* Sensitive-send review gate (prototype `sendCommunication`). */
  comms_sensitive_intro: {
    en: 'This is a sensitive communication — review before sending.',
    fr: 'Communication sensible — vérifiez avant l’envoi.',
  },
  comms_gate_title: { en: 'Review before sending', fr: 'Vérification avant l’envoi' },
  comms_gate_confirm: {
    en: 'Mark reviewed & send',
    fr: 'Marquer comme vérifié et envoyer',
  },
  comms_sent_toast: {
    en: 'Sent — recorded in the communication history',
    fr: 'Envoyé — consigné dans l’historique des communications',
  },

  /* "Review with Advisor" rail turn (prototype `onReview` per comm). */
  comms_review_intro: {
    en: 'Here’s my read on this message before it goes out.',
    fr: 'Voici mon évaluation de ce message avant l’envoi.',
  },
  comms_review_card_title: { en: 'Advisor review', fr: 'Examen du Conseiller' },
  comms_open_in_documents: { en: 'Open in Documents', fr: 'Ouvrir dans Documents' },
})
