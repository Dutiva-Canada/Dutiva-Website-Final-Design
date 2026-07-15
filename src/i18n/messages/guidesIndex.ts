import { defineMessages } from '../core'

/**
 * /guides — index of HR guides, linked from the landing page's Guides
 * section ("Browse all guides"). Card copy reuses the landing section's
 * `landing_g1_t` … `landing_g6_t` keys; this module only carries the page
 * hero and CTA framing.
 */
export const guidesIndexMessages = defineMessages({
  guidesIdx_eyebrow: {
    en: 'Guides & Resources',
    fr: 'Guides et ressources',
  },
  guidesIdx_h1: {
    en: 'Practical guidance for Canadian employers.',
    fr: 'Des conseils pratiques pour les employeurs canadiens.',
  },
  guidesIdx_intro: {
    en: 'Plain-language explainers on the HR situations Canadian employers run into most — written to complement the AI Advisor and document templates, not replace legal counsel.',
    fr: 'Des explications en langage clair sur les situations RH les plus courantes pour les employeurs canadiens — pensées pour compléter le Conseiller IA et les modèles de documents, sans remplacer un avocat.',
  },
  guidesIdx_section_title: {
    en: 'All guides',
    fr: 'Tous les guides',
  },
  guidesIdx_cta_t: {
    en: 'Have a question a guide doesn’t answer?',
    fr: 'Une question sans réponse dans nos guides?',
  },
  guidesIdx_cta_p: {
    en: 'Ask the AI Advisor inside the workspace, or reach out directly.',
    fr: 'Posez la question au Conseiller IA dans l’espace de travail, ou contactez-nous directement.',
  },
  guidesIdx_cta_btn: {
    en: 'Start free',
    fr: 'Commencer',
  },
})
