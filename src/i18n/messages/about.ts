import { defineMessages } from '../core'

/**
 * About page — page-specific EN + FR strings, extracted from the Dutiva marketing
 * prototype (about.dc.html). Shared header/footer chrome already lives in landing.ts —
 * reuse those keys; do not duplicate them here. Register the spread below in
 * src/i18n/messages/index.ts. Keys are feature-prefixed per CONVENTIONS.md.
 */
export const aboutMessages = defineMessages({
  about_eyebrow: { en: 'About us', fr: 'À propos' },
  about_h1: {
    en: 'HR compliance infrastructure, built in Canada.',
    fr: 'Une infrastructure de conformité RH, conçue au Canada.',
  },
  about_intro: {
    en: 'Dutiva is foundational HR infrastructure for Canadian employers — AI-assisted, compliance-oriented, and bilingual. It helps small and mid-sized Canadian businesses turn HR documentation from guesswork into structured, reviewable workflows.',
    fr: 'Dutiva est une infrastructure RH fondamentale pour les employeurs canadiens — assistée par l’IA, axée sur la conformité et bilingue. Elle aide les PME canadiennes à transformer la documentation RH, des approximations vers des processus structurés et révisables.',
  },
  about_s1: { en: 'Our mission', fr: 'Notre mission' },
  about_mission: {
    en: 'Give every Canadian employer access to jurisdiction-aware HR guidance and review-ready documents — grounded in the actual employment standards, in English or French.',
    fr: 'Donner à chaque employeur canadien accès à des conseils RH adaptés à la compétence applicable et à des documents prêts à réviser — ancrés dans les normes du travail réelles, en français ou en anglais.',
  },
  about_s2: { en: 'Why we built Dutiva', fr: 'Pourquoi nous avons créé Dutiva' },
  about_why: {
    en: 'Dutiva was built by a Canadian HR and payroll professional who has processed payroll, prepared Records of Employment, and drafted termination letters across federal and provincial standards. It names the statute, not just the province — and speaks French as fluently as English.',
    fr: 'Dutiva a été conçu par un professionnel canadien des RH et de la paie qui a traité des paies, préparé des relevés d’emploi et rédigé des lettres de cessation d’emploi selon les normes fédérales et provinciales. Il nomme la loi, pas seulement la province — et parle français aussi couramment que l’anglais.',
  },
  about_why_foot: {
    en: 'Built in Ottawa, Canada · Grounded in real HR operations, not generic research.',
    fr: 'Conçu à Ottawa, au Canada · Ancré dans de véritables opérations RH, pas dans des recherches génériques.',
  },
  about_s3: { en: 'What we believe', fr: 'Nos valeurs' },
  about_v1t: { en: 'Compliance', fr: 'Conformité' },
  about_v1p: {
    en: 'Name the statute, not just the province. That precision is the product.',
    fr: 'Nommer la loi, pas seulement la province. Cette précision, c’est le produit.',
  },
  about_v2t: { en: 'People first', fr: 'Les personnes d’abord' },
  about_v2p: {
    en: 'HR decisions affect real people. Dutiva keeps a human in the loop on anything high-risk.',
    fr: 'Les décisions RH touchent de vraies personnes. Dutiva garde un humain dans la boucle pour tout enjeu à risque élevé.',
  },
  about_v3t: { en: 'Trust & security', fr: 'Confiance et sécurité' },
  about_v3p: {
    en: 'PIPEDA-conscious and Quebec Law 25-aware, with data minimization built in.',
    fr: 'Conforme à la LPRPDE et tient compte de la Loi 25 du Québec, avec une minimisation des données intégrée.',
  },
  about_v4t: { en: 'Proudly Canadian', fr: 'Fièrement canadien' },
  about_v4p: {
    en: 'Purpose-built for Canadian employment standards — not retrofitted from U.S. software.',
    fr: 'Conçu spécifiquement pour les normes du travail canadiennes — pas adapté d’un logiciel américain.',
  },
  about_s4: { en: 'Built in Canada', fr: 'Conçu au Canada' },
  about_built: {
    en: 'Dutiva is built in Ottawa and designed for Canadian employers from the ground up — bilingual EN/FR, PIPEDA-conscious, and Quebec Law 25-aware.',
    fr: 'Dutiva est conçu à Ottawa et pensé pour les employeurs canadiens dès le départ — bilingue EN/FR, conforme à la LPRPDE et attentif à la Loi 25 du Québec.',
  },
  about_pill_bilingual: { en: 'Bilingual EN/FR', fr: 'Bilingue EN/FR' },
  about_cta_t: {
    en: 'Start building a cleaner HR foundation.',
    fr: 'Bâtissez une base RH plus solide.',
  },
  about_cta_p: {
    en: 'Join the beta free — no credit card required.',
    fr: 'Rejoignez la version bêta gratuitement — sans carte de crédit.',
  },
  about_cta_btn: { en: 'Start free', fr: 'Commencer' },
})
