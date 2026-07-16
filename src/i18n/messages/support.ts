import { defineMessages } from '../core'

/**
 * Reusable support prose shared across the public support page, Help Centre,
 * request form, automated acknowledgements, and email templates. Category /
 * status / priority *labels* live as `Bi` pairs in `src/config/support.ts`
 * (rendered with `x()`); this module holds the longer approved copy. Keep the
 * approved policy and sensitive-information wording verbatim — it is reviewed
 * legal/CX text (EN Canadian spelling, professional Québec French).
 */
export const supportMessages = defineMessages({
  support_digital_first: {
    en: 'Digital-first customer support, with phone or video assistance arranged when necessary.',
    fr: 'Soutien à la clientèle d’abord numérique, avec une assistance téléphonique ou vidéo organisée au besoin.',
  },
  /* Approved public support-policy statement (verbatim). */
  support_policy_statement: {
    en: 'Dutiva provides customer support through our Help Centre, secure support requests and email. General inbound telephone support is not currently available. Where an issue cannot reasonably be resolved through digital support—including certain accessibility, security, account-recovery or exceptional service matters—we may arrange a telephone or video appointment.',
    fr: 'Dutiva offre du soutien à la clientèle par l’intermédiaire de son centre d’aide, de demandes de soutien sécurisées et du courriel. Le soutien téléphonique entrant général n’est pas offert pour le moment. Lorsqu’une situation ne peut raisonnablement être réglée au moyen du soutien numérique, notamment certaines questions liées à l’accessibilité, à la sécurité, à la récupération d’un compte ou à une situation de service exceptionnelle, nous pouvons organiser un rendez-vous téléphonique ou vidéo.',
  },
  /* Approved sensitive-information warning (verbatim) — shown near the
     description and attachment fields, not only linked in a policy. */
  support_sensitive_warning: {
    en: 'Do not include unnecessary employee personal information, medical information, investigation evidence or other confidential workplace records. Dutiva will provide secure instructions if additional information is required.',
    fr: 'N’incluez pas inutilement de renseignements personnels sur des employés, de renseignements médicaux, de preuves liées à une enquête ou d’autres dossiers confidentiels du milieu de travail. Dutiva fournira des instructions sécurisées si des renseignements supplémentaires sont nécessaires.',
  },
  support_targets_note: {
    en: 'These are initial-response targets, not guaranteed resolution times. Business days exclude weekends and Ontario statutory holidays. Priority may be reassessed after review, and privacy and security incidents may follow separate procedures. You may submit a request at any time; Dutiva does not currently offer continuously staffed 24/7 support.',
    fr: 'Il s’agit de cibles de première réponse, et non de délais de résolution garantis. Les jours ouvrables excluent les fins de semaine et les jours fériés légaux de l’Ontario. La priorité peut être réévaluée après examen, et les incidents de confidentialité et de sécurité peuvent suivre des procédures distinctes. Vous pouvez soumettre une demande en tout temps; Dutiva n’offre pas pour le moment de soutien continu 24 heures sur 24, 7 jours sur 7.',
  },
  support_diagnostic_notice: {
    en: 'To help us respond faster, this request attaches limited technical context: your account and workspace identifiers, plan, current page, app version, browser and operating system, language, and a recent non-sensitive error code. It never includes employee records, document contents, HR case details, passwords or authentication tokens. You can review and remove the optional diagnostic details before submitting.',
    fr: 'Pour nous aider à répondre plus rapidement, cette demande joint un contexte technique limité : vos identifiants de compte et d’espace de travail, votre forfait, la page actuelle, la version de l’application, le navigateur et le système d’exploitation, la langue et un code d’erreur récent non sensible. Elle n’inclut jamais de dossiers d’employés, de contenu de documents, de détails de dossiers RH, de mots de passe ni de jetons d’authentification. Vous pouvez examiner et retirer les détails de diagnostic facultatifs avant de soumettre.',
  },
  support_ack_resolution_varies: {
    en: 'Resolution time varies with the complexity of the request. We will reply to this ticket in writing; please add any further details to the ticket rather than starting a new one.',
    fr: 'Le délai de résolution varie selon la complexité de la demande. Nous répondrons à ce billet par écrit; veuillez ajouter tout renseignement supplémentaire au billet plutôt que d’en ouvrir un nouveau.',
  },
  support_ack_no_secrets: {
    en: 'Please do not send passwords, authentication codes, or confidential workplace records by email. Dutiva will provide secure instructions if we need additional information.',
    fr: 'Veuillez ne pas envoyer de mots de passe, de codes d’authentification ni de dossiers confidentiels du milieu de travail par courriel. Dutiva vous fournira des instructions sécurisées si nous avons besoin de renseignements supplémentaires.',
  },
  support_call_not_guaranteed: {
    en: 'Scheduled calls are arranged only where digital support cannot reasonably resolve the issue, and are not guaranteed. The written ticket remains the record of your request.',
    fr: 'Les appels planifiés sont organisés uniquement lorsque le soutien numérique ne peut raisonnablement régler la situation, et ne sont pas garantis. Le billet écrit demeure le dossier de votre demande.',
  },

  /* ── Support request form ─────────────────────────────────────────────── */
  support_form_title: { en: 'Contact support', fr: 'Contacter le soutien' },
  support_form_intro: {
    en: 'Send us a support request and we’ll reply in writing. Check the Help Centre first — most questions are answered there.',
    fr: 'Envoyez-nous une demande de soutien et nous répondrons par écrit. Consultez d’abord le centre d’aide — la plupart des questions y trouvent réponse.',
  },
  support_field_category: { en: 'What is this about?', fr: 'De quoi s’agit-il?' },
  support_field_subject: { en: 'Subject', fr: 'Sujet' },
  support_field_description: { en: 'How can we help?', fr: 'Comment pouvons-nous vous aider?' },
  support_field_impact: { en: 'How much is this affecting you?', fr: 'Quelle est l’ampleur de l’impact?' },
  support_field_urgency: { en: 'How time-sensitive is it?', fr: 'Quel est le degré d’urgence?' },
  support_field_language: { en: 'Preferred language for our reply', fr: 'Langue préférée pour notre réponse' },
  support_field_response_method: { en: 'Preferred way to hear back', fr: 'Moyen préféré pour la réponse' },
  support_choose: { en: 'Select…', fr: 'Sélectionner…' },
  support_optional: { en: 'optional', fr: 'facultatif' },

  support_cond_account_signin: {
    en: 'Can you still sign in to your account?',
    fr: 'Pouvez-vous encore vous connecter à votre compte?',
  },
  support_cond_account_yes: { en: 'Yes, I can sign in', fr: 'Oui, je peux me connecter' },
  support_cond_account_no: { en: 'No, I’m locked out', fr: 'Non, je suis bloqué' },
  support_cond_billing_ref: {
    en: 'Invoice or subscription reference',
    fr: 'Référence de facture ou d’abonnement',
  },
  support_cond_accessibility: {
    en: 'What communication accommodation would help?',
    fr: 'Quelle mesure d’adaptation de communication vous aiderait?',
  },
  support_security_warning: {
    en: 'Reporting a security concern? Give a factual description, the affected URL or feature, and safe reproduction steps. Do not access other customers’ data, disrupt the service, or include exploit details. There is no bug bounty.',
    fr: 'Vous signalez une préoccupation de sécurité? Donnez une description factuelle, l’URL ou la fonctionnalité touchée et des étapes de reproduction sûres. N’accédez pas aux données d’autres clients, ne perturbez pas le service et n’incluez pas de détails d’exploitation. Il n’y a pas de prime aux bogues.',
  },
  support_privacy_notice: {
    en: 'Privacy requests are handled separately from ordinary support. Identity verification may be required. Do not attach identity documents here.',
    fr: 'Les demandes de confidentialité sont traitées séparément du soutien ordinaire. Une vérification d’identité peut être exigée. Ne joignez pas de pièces d’identité ici.',
  },

  support_diagnostics_title: { en: 'Technical details attached', fr: 'Détails techniques joints' },
  support_diagnostics_toggle: {
    en: 'Attach these technical details to help us respond faster',
    fr: 'Joindre ces détails techniques pour nous aider à répondre plus rapidement',
  },
  support_consent: {
    en: 'I understand Dutiva will use this request to respond to me, and I haven’t included unnecessary confidential workplace records.',
    fr: 'Je comprends que Dutiva utilisera cette demande pour me répondre, et je n’ai pas inclus de dossiers confidentiels du milieu de travail inutiles.',
  },
  support_submit: { en: 'Send request', fr: 'Envoyer la demande' },
  support_submitting: { en: 'Sending…', fr: 'Envoi en cours…' },

  support_err_subject: { en: 'Please add a subject.', fr: 'Veuillez ajouter un sujet.' },
  support_err_description: { en: 'Please describe how we can help.', fr: 'Veuillez décrire comment nous pouvons aider.' },
  support_err_consent: { en: 'Please confirm to continue.', fr: 'Veuillez confirmer pour continuer.' },
  support_err_generic: {
    en: 'We couldn’t send your request. Please try again, or email support@dutiva.ca.',
    fr: 'Nous n’avons pas pu envoyer votre demande. Veuillez réessayer ou écrire à support@dutiva.ca.',
  },

  support_success_title: { en: 'Request received', fr: 'Demande reçue' },
  support_success_body: {
    en: 'Your request has been logged. Keep this reference for your records — we’ll reply in writing to the email on your account.',
    fr: 'Votre demande a été enregistrée. Conservez cette référence — nous répondrons par écrit au courriel de votre compte.',
  },
  support_success_reference: { en: 'Reference', fr: 'Référence' },
  support_success_new: { en: 'Send another request', fr: 'Envoyer une autre demande' },
})
