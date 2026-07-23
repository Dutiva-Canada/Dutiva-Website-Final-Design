import { defineMessages } from '../core'

/**
 * Generic real-auth UI strings (magic-link sign-in, account status) shared
 * across every surface that embeds AuthSignInForm/AuthMenuButton — the
 * topbar account menu and the Knowledge view's guidance panel. No
 * prototype counterpart. Self-authored EN + FR throughout.
 */
export const authMessages = defineMessages({
  auth_sign_in: {
    en: 'Sign in',
    fr: 'Se connecter',
  },
  auth_signed_in: {
    en: 'Signed in',
    fr: 'Connecté',
  },
  auth_sign_out: {
    en: 'Sign out',
    fr: 'Se déconnecter',
  },
  auth_email_label: {
    en: 'Work email',
    fr: 'Courriel professionnel',
  },
  auth_email_placeholder: {
    en: 'you@company.com',
    fr: 'vous@entreprise.com',
  },
  auth_send_link: {
    en: 'Send magic link',
    fr: 'Envoyer le lien magique',
  },
  auth_sending: {
    en: 'Sending…',
    fr: 'Envoi en cours…',
  },
  auth_link_sent: {
    en: 'Check your email for a sign-in link.',
    fr: 'Consultez votre courriel pour le lien de connexion.',
  },
  auth_domain_restricted: {
    en: 'Sign-in for this workspace is currently invite-only.',
    fr: 'La connexion à cet espace de travail est actuellement sur invitation seulement.',
  },
  auth_menu_title: {
    en: 'Account',
    fr: 'Compte',
  },
  auth_menu_description: {
    en: 'Sign in to unlock real AI Advisor replies and live legal sources.',
    fr: 'Connectez-vous pour activer les réponses réelles de l’Advisor IA et les sources juridiques en direct.',
  },
  auth_entry_description: {
    en: 'This workspace is invite-only. Enter your email and we’ll send a sign-in link.',
    fr: 'Cet espace de travail est sur invitation seulement. Entrez votre courriel et nous vous enverrons un lien de connexion.',
  },
  auth_not_authorized: {
    en: 'This workspace isn’t available on that account.',
    fr: 'Cet espace de travail n’est pas accessible avec ce compte.',
  },
  auth_confirm_verifying: {
    en: 'Signing you in…',
    fr: 'Connexion en cours…',
  },
  auth_confirm_error_title: {
    en: 'Sign-in link problem',
    fr: 'Problème avec le lien de connexion',
  },
  auth_confirm_error_body: {
    en: 'This sign-in link is invalid or has expired. Request a new one to continue.',
    fr: 'Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau pour continuer.',
  },
  auth_confirm_retry: {
    en: 'Back to sign in',
    fr: 'Retour à la connexion',
  },

  /* ── Dedicated sign in / sign up page (EntryStage / AuthPanel) ──────────────
     Self-authored EN + FR. The mechanism stays passwordless magic-link: both
     the sign-in and sign-up tabs email a secure link. "Sign up" additionally
     captures a display name, carried as user metadata on the same OTP call. */
  auth_tab_signup: { en: 'Sign up', fr: 'S’inscrire' },
  auth_signin_title: { en: 'Welcome back', fr: 'Content de vous revoir' },
  auth_signin_sub: {
    en: 'Sign in to your Dutiva workspace.',
    fr: 'Connectez-vous à votre espace de travail Dutiva.',
  },
  auth_signup_title: { en: 'Create your account', fr: 'Créez votre compte' },
  auth_signup_sub: {
    en: 'Get started with Dutiva — your AI advisor for Canadian HR.',
    fr: 'Commencez avec Dutiva — votre conseiller IA pour les RH canadiennes.',
  },
  auth_name_label: { en: 'Full name', fr: 'Nom complet' },
  auth_name_placeholder: { en: 'Jordan Mensah', fr: 'Jordan Mensah' },
  auth_submit_signin: { en: 'Send sign-in link', fr: 'Envoyer le lien de connexion' },
  auth_submit_signup: { en: 'Create account', fr: 'Créer mon compte' },
  auth_passwordless_note: {
    en: 'No password needed — we’ll email you a secure sign-in link.',
    fr: 'Aucun mot de passe requis — nous vous enverrons un lien de connexion sécurisé par courriel.',
  },
  auth_terms_prefix: {
    en: 'By continuing, you agree to Dutiva’s ',
    fr: 'En continuant, vous acceptez les ',
  },
  auth_terms_link: { en: 'Terms', fr: 'Conditions' },
  auth_terms_and: { en: ' and ', fr: ' et la ' },
  auth_privacy_link: { en: 'Privacy Policy', fr: 'Politique de confidentialité' },
  auth_terms_suffix: { en: '.', fr: ' de Dutiva.' },
  auth_sent_title: { en: 'Check your inbox', fr: 'Consultez votre boîte de réception' },
  auth_sent_body_prefix: {
    en: 'We sent a secure sign-in link to',
    fr: 'Nous avons envoyé un lien de connexion sécurisé à',
  },
  auth_sent_body_suffix: {
    en: 'Open it on this device to continue.',
    fr: 'Ouvrez-le sur cet appareil pour continuer.',
  },
  auth_sent_spam: {
    en: 'It can take a minute to arrive. Check your spam folder if it’s not there.',
    fr: 'La réception peut prendre une minute. Vérifiez vos indésirables s’il n’y est pas.',
  },
  auth_resend: { en: 'Resend link', fr: 'Renvoyer le lien' },
  auth_use_different_email: { en: 'Use a different email', fr: 'Utiliser une autre adresse' },
  auth_brand_badge: {
    en: 'Built for Canadian employment law — all provinces & federal',
    fr: 'Conçu pour le droit du travail canadien — toutes les provinces et le fédéral',
  },
  auth_brand_headline: {
    en: 'Canadian HR compliance, handled.',
    fr: 'La conformité RH canadienne, maîtrisée.',
  },
  auth_brand_sub: {
    en: 'One intelligent workspace across every conversation, employee record, document, and compliance deadline.',
    fr: 'Un espace de travail intelligent réunissant chaque conversation, dossier d’employé, document et échéance de conformité.',
  },
  auth_brand_point_1: {
    en: 'AI Advisor across every case, document, and deadline',
    fr: 'Conseiller IA pour chaque dossier, document et échéance',
  },
  auth_brand_point_2: {
    en: 'Federal and all-province coverage, in English and French',
    fr: 'Couverture fédérale et de toutes les provinces, en français et en anglais',
  },
  auth_brand_point_3: {
    en: 'Compliance guardrails and risk flags on every answer',
    fr: 'Garde-fous de conformité et alertes de risque sur chaque réponse',
  },
  auth_brand_footer: {
    en: 'Bilingual EN / FR · Made for Canadian employers',
    fr: 'Bilingue FR / EN · Conçu pour les employeurs canadiens',
  },
  auth_welcome_title: { en: 'Welcome to Dutiva', fr: 'Bienvenue chez Dutiva' },
  auth_welcome_sub: {
    en: 'Your AI operating system for Canadian HR compliance.',
    fr: 'Votre système d’exploitation IA pour la conformité RH canadienne.',
  },
  auth_enter_workspace: { en: 'Enter workspace', fr: 'Accéder à l’espace de travail' },
})
