import { defineMessages } from '../core'

/**
 * Live legal-sources panel (Knowledge view) — real backend data, no
 * prototype counterpart. Self-authored EN + FR throughout.
 */
export const guidanceMessages = defineMessages({
  guidance_panel_title: {
    en: 'Live legal sources',
    fr: 'Sources juridiques en direct',
  },
  guidance_panel_beta: {
    en: 'Beta — real guidance sources and law-change tracking from the Dutiva backend.',
    fr: 'Bêta — sources de référence et suivi des changements législatifs réels du système Dutiva.',
  },
  guidance_signin_prompt: {
    en: 'Sign in to see real legal guidance sources and recent law changes.',
    fr: 'Connectez-vous pour voir les sources juridiques réelles et les changements législatifs récents.',
  },
  guidance_email_label: {
    en: 'Work email',
    fr: 'Courriel professionnel',
  },
  guidance_email_placeholder: {
    en: 'you@company.com',
    fr: 'vous@entreprise.com',
  },
  guidance_send_link: {
    en: 'Send magic link',
    fr: 'Envoyer le lien magique',
  },
  guidance_sending: {
    en: 'Sending…',
    fr: 'Envoi en cours…',
  },
  guidance_link_sent: {
    en: 'Check your email for a sign-in link.',
    fr: 'Consultez votre courriel pour le lien de connexion.',
  },
  guidance_sign_out: {
    en: 'Sign out',
    fr: 'Se déconnecter',
  },
  guidance_sources_heading: {
    en: 'Guidance sources',
    fr: 'Sources de référence',
  },
  guidance_law_updates_heading: {
    en: 'Recent law changes',
    fr: 'Changements législatifs récents',
  },
  guidance_loading: {
    en: 'Loading…',
    fr: 'Chargement…',
  },
  guidance_empty_sources: {
    en: 'No guidance sources yet.',
    fr: 'Aucune source de référence pour le moment.',
  },
  guidance_empty_updates: {
    en: 'No recent law changes.',
    fr: 'Aucun changement législatif récent.',
  },
  guidance_load_error: {
    en: 'Could not load live legal sources. Try again shortly.',
    fr: 'Impossible de charger les sources juridiques. Réessayez sous peu.',
  },
})
