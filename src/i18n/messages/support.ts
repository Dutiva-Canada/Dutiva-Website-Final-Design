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
  support_disclaimer: {
    en: 'Dutiva provides practical HR workflow support and compliance-oriented guidance. It does not provide legal advice.',
    fr: 'Dutiva offre un soutien pratique aux processus RH et des conseils axés sur la conformité. Elle ne fournit pas de conseils juridiques.',
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
})
