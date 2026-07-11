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
    en: 'Sign-in is limited to @dutiva.ca team accounts.',
    fr: 'La connexion est réservée aux comptes de l’équipe @dutiva.ca.',
  },
  auth_menu_title: {
    en: 'Account',
    fr: 'Compte',
  },
  auth_menu_description: {
    en: 'Sign in to unlock real AI Advisor replies and live legal sources.',
    fr: 'Connectez-vous pour activer les réponses réelles de l’Advisor IA et les sources juridiques en direct.',
  },
})
