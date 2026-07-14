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
})
