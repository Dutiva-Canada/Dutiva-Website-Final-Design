import { defineMessages } from '../core'

/**
 * Blog index — page-specific EN + FR strings, extracted from the Dutiva marketing
 * prototype (blog.dc.html). Shared header/footer chrome already lives in landing.ts —
 * reuse those keys; do not duplicate them here. Register the spread below in
 * src/i18n/messages/index.ts. Keys are feature-prefixed per CONVENTIONS.md.
 */
export const blogMessages = defineMessages({
  blog_eyebrow: { en: 'Blog', fr: 'Blogue' },
  blog_h1: { en: 'HR compliance, in practice.', fr: 'La conformité RH, en pratique.' },
  blog_intro: {
    en: 'Practical guidance for Canadian employers — employment standards, termination, documentation, and the day-to-day of staying compliant.',
    fr: 'Des conseils pratiques pour les employeurs canadiens — normes du travail, cessation d’emploi, documentation et le quotidien de la conformité.',
  },
  blog_cta_t: { en: 'Put these guides to work.', fr: 'Mettez ces guides en pratique.' },
  blog_cta_p: {
    en: 'Open Dutiva and turn guidance into review-ready documents.',
    fr: 'Ouvrez Dutiva et transformez les conseils en documents prêts à réviser.',
  },
  blog_cta_btn: { en: 'Start free', fr: 'Commencer' },
})
