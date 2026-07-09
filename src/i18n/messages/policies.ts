import { defineMessages } from '../core'

/**
 * Policies view chrome — transcribed from the App v2 prototype
 * (`buildPoliciesView()`, `str.sub_policies`, the policies markup and the
 * `lbl.reviewWithAdvisor` / `'Draft it now'` action labels).
 *
 * EN verbatim from the prototype; FR from its `buildI18n()` / `frDict()` /
 * `lbl` map. FR strings with no source in the prototype are marked
 * [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(policiesMessages.key)`.
 */
export const policiesMessages = defineMessages({
  policies_subtitle: {
    en: 'Review status across your policy library.',
    fr: 'État de révision de votre bibliothèque de politiques.',
  },
  /* The prototype markup hardcodes "Last reviewed {updated}" in EN only. */
  policies_last_reviewed_prefix: { en: 'Last reviewed ', fr: 'Dernière révision : ' }, // [FR self-authored]
  policies_review_advisor: { en: 'Review with Advisor', fr: 'Réviser avec le Conseiller' },
  policies_draft_now: { en: 'Draft it now', fr: 'La rédiger maintenant' },

  /* Advisor rail openers (prototype `buildPoliciesView().onReview`). */
  policies_rail_missing_text: {
    en: 'This policy hasn’t been generated yet. I can draft a first version now.',
    // [FR self-authored]
    fr: 'Cette politique n’a pas encore été générée. Je peux en rédiger une première version dès maintenant.',
  },
  policies_rail_take_text: {
    en: 'Here’s a quick take on this policy.',
    // [FR self-authored]
    fr: 'Voici un aperçu rapide de cette politique.',
  },
})
