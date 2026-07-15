import { defineMessages } from '../core'

/**
 * Standalone /pricing page chrome. Plan names/descriptions/features reuse
 * the landing page's `landing_free_*` / `landing_starter_*` / … keys (see
 * src/config/plans.ts) — this module only carries copy specific to the
 * full comparison page: hero framing, the admin-bypass banner, and
 * checkout status messages.
 */
export const pricingMessages = defineMessages({
  pricing_eyebrow: {
    en: 'Pricing',
    fr: 'Tarifs',
  },
  pricing_h1: {
    en: 'Start structured. Upgrade as your HR workflow grows.',
    fr: 'Commencez de façon structurée. Évoluez à mesure que vos RH grandissent.',
  },
  pricing_intro: {
    en: 'No long-term contracts. No setup fees. After your first paid charge, you have 7 days to cancel for a full refund. Prices in CAD.',
    fr: "Aucun contrat à long terme. Aucuns frais d'installation. Après votre premier paiement, vous avez 7 jours pour annuler et obtenir un remboursement complet. Prix en CAD.",
  },
  pricing_mo: {
    en: '/mo',
    fr: '/mois',
  },
  pricing_admin_badge: {
    en: 'Internal Dutiva account',
    fr: 'Compte interne Dutiva',
  },
  pricing_admin_detail: {
    en: 'Your @dutiva.ca account has full plan access already — billing is bypassed automatically, on every plan.',
    fr: 'Votre compte @dutiva.ca dispose déjà d’un accès complet — la facturation est automatiquement contournée, peu importe le forfait.',
  },
  pricing_current_plan: {
    en: 'Your plan',
    fr: 'Votre forfait',
  },
  pricing_cta_processing: {
    en: 'Loading…',
    fr: 'Chargement…',
  },
  pricing_cta_signin_first: {
    en: 'Sign in to continue',
    fr: 'Connectez-vous pour continuer',
  },
  pricing_checkout_bypassed: {
    en: 'Internal account — no checkout needed. You already have full access.',
    fr: 'Compte interne — aucun paiement requis. Vous avez déjà un accès complet.',
  },
  pricing_checkout_error: {
    en: 'Could not start checkout. Please try again or contact support@dutiva.ca.',
    fr: 'Impossible de démarrer le paiement. Réessayez ou contactez support@dutiva.ca.',
  },
  pricing_checkout_unavailable: {
    en: 'Payments are not configured in this environment yet.',
    fr: 'Les paiements ne sont pas encore configurés dans cet environnement.',
  },
  pricing_manage_billing: {
    en: 'Manage billing',
    fr: 'Gérer la facturation',
  },
  pricing_portal_error: {
    en: 'Could not open the billing portal. Please try again or contact support@dutiva.ca.',
    fr: 'Impossible d’ouvrir le portail de facturation. Réessayez ou contactez support@dutiva.ca.',
  },
  pricing_compare_title: {
    en: 'Compare what each plan includes.',
    fr: 'Comparez ce que chaque forfait comprend.',
  },
  pricing_compare_sub: {
    en: 'Choose a plan below. Paid plans are billed securely through Stripe.',
    fr: 'Choisissez un forfait ci-dessous. Les forfaits payants sont facturés en toute sécurité via Stripe.',
  },
  pricing_faq_title: {
    en: 'Common questions',
    fr: 'Questions fréquentes',
  },
  pricing_faq_legal_q: {
    en: 'Is this legal advice?',
    fr: 'Est-ce un avis juridique?',
  },
  pricing_faq_legal_a: {
    en: 'No. Dutiva provides general HR compliance guidance and document templates. For specific legal situations, consult an employment lawyer.',
    fr: 'Non. Dutiva fournit des orientations générales en conformité RH et des modèles de documents. Pour une situation juridique précise, consultez un avocat en droit du travail.',
  },
  pricing_faq_jur_q: {
    en: 'Which jurisdictions are covered?',
    fr: 'Quelles juridictions sont couvertes?',
  },
  pricing_faq_jur_a: {
    en: 'Ontario, Quebec, and Federal, with Alberta and British Columbia coming soon.',
    fr: 'Ontario, Québec et fédéral, avec l’Alberta et la Colombie-Britannique à venir.',
  },
  pricing_cta_title: {
    en: 'Still deciding?',
    fr: 'Vous hésitez encore?',
  },
  pricing_cta_body: {
    en: 'Compare the plan cards above, then start free or reach out with questions.',
    fr: 'Comparez les forfaits ci-dessus, puis commencez gratuitement ou posez-nous vos questions.',
  },
  pricing_cta_ask: {
    en: 'Ask a question',
    fr: 'Poser une question',
  },
})
