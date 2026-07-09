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
  blog_p1_meta: { en: 'Termination · 6 min read', fr: 'Cessation d’emploi · 6 min de lecture' },
  blog_p1_t: {
    en: 'Ontario termination notice requirements',
    fr: 'Exigences de préavis de cessation d’emploi en Ontario',
  },
  blog_p1_x: {
    en: 'ESA notice periods, pay in lieu, and severance considerations for Ontario employers.',
    fr: 'Délais de préavis de la LNE, indemnité en tenant lieu et considérations d’indemnité de licenciement pour les employeurs ontariens.',
  },
  blog_p2_meta: { en: 'Hiring · 5 min read', fr: 'Embauche · 5 min de lecture' },
  blog_p2_t: { en: 'Probation clauses in Ontario', fr: 'Clauses de probation en Ontario' },
  blog_p2_x: {
    en: 'What a valid probation clause needs to do under Ontario’s ESA — and what makes one unenforceable.',
    fr: 'Ce qu’une clause de probation valide doit prévoir sous la LNE de l’Ontario — et ce qui la rend inapplicable.',
  },
  blog_p3_meta: { en: 'Documentation · 4 min read', fr: 'Documentation · 4 min de lecture' },
  blog_p3_t: {
    en: 'Canadian employer document checklist',
    fr: 'Liste de documents pour les employeurs canadiens',
  },
  blog_p3_x: {
    en: 'Core HR documents Canadian employers should have before an employee’s first day.',
    fr: 'Documents RH essentiels que les employeurs canadiens devraient avoir avant la première journée d’un employé.',
  },
  blog_p4_meta: { en: 'Contracts · 7 min read', fr: 'Contrats · 7 min de lecture' },
  blog_p4_t: {
    en: 'Employment contract clauses in Canada',
    fr: 'Clauses contractuelles d’emploi au Canada',
  },
  blog_p4_x: {
    en: 'Key clauses, enforceability considerations, and drafting risks under Canadian employment law.',
    fr: 'Clauses clés, questions d’applicabilité et risques de rédaction en droit du travail canadien.',
  },
  blog_p5_meta: { en: 'Accommodation · 6 min read', fr: 'Accommodement · 6 min de lecture' },
  blog_p5_t: { en: 'Duty to accommodate in Canada', fr: 'Obligation d’accommodement au Canada' },
  blog_p5_x: {
    en: 'Employer obligations, undue hardship, and practical accommodation workflows under federal and provincial law.',
    fr: 'Obligations de l’employeur, contrainte excessive et démarches pratiques d’accommodement selon le droit fédéral et provincial.',
  },
  blog_p6_meta: { en: 'Termination · 5 min read', fr: 'Cessation d’emploi · 5 min de lecture' },
  blog_p6_t: {
    en: 'Termination documentation in Canada',
    fr: 'Documentation de cessation d’emploi au Canada',
  },
  blog_p6_x: {
    en: 'What to prepare, what to document, and what to avoid when ending employment across Canadian jurisdictions.',
    fr: 'Ce qu’il faut préparer, documenter et éviter en mettant fin à un emploi dans les différentes compétences canadiennes.',
  },
  blog_cta_t: { en: 'Put these guides to work.', fr: 'Mettez ces guides en pratique.' },
  blog_cta_p: {
    en: 'Open Dutiva and turn guidance into review-ready documents.',
    fr: 'Ouvrez Dutiva et transformez les conseils en documents prêts à réviser.',
  },
  blog_cta_btn: { en: 'Start free', fr: 'Commencer' },
})
