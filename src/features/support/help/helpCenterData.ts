import { bi, pick } from '@/i18n/core'
import type { Bi, Lang } from '@/i18n/core'

/**
 * Help Centre content — the self-service layer of Dutiva's digital-first
 * support model (see src/config/support.ts and the public support policy).
 * Articles are short, product-accurate, and bilingual; they never give legal
 * advice and defer compliance specifics to the legal documents.
 *
 * This module is pure data (no React), so search and the SEO registry can
 * consume it directly. Categories and articles are `Bi` pairs rendered with
 * `x()`; article bodies use a small block model grouped into semantic lists by
 * `groupHelpBlocks`. Slugs are stable — they are public URLs
 * (`/help/<slug>`, `/fr/aide/<frSlug>`) and must not collide across locales.
 */

export type HelpCategoryId =
  | 'getting_started'
  | 'documents'
  | 'advisor'
  | 'account_billing'
  | 'privacy_security'
  | 'support_contact'

/** Lucide icon name; mapped to a component in the page (keeps this module pure). */
export type HelpIcon =
  | 'rocket'
  | 'file-text'
  | 'sparkles'
  | 'credit-card'
  | 'shield-check'
  | 'life-buoy'

export interface HelpCategory {
  id: HelpCategoryId
  icon: HelpIcon
  title: Bi
  description: Bi
}

export const HELP_CATEGORIES: readonly HelpCategory[] = [
  {
    id: 'getting_started',
    icon: 'rocket',
    title: bi('Getting started', 'Prise en main'),
    description: bi(
      'Signing in, finding your way around, and setting your language.',
      'Se connecter, s’orienter et choisir sa langue.',
    ),
  },
  {
    id: 'documents',
    icon: 'file-text',
    title: bi('HR documents & templates', 'Documents et modèles RH'),
    description: bi(
      'Generating documents from templates and understanding how they work.',
      'Générer des documents à partir de modèles et comprendre leur fonctionnement.',
    ),
  },
  {
    id: 'advisor',
    icon: 'sparkles',
    title: bi('AI Advisor', 'Conseiller IA'),
    description: bi(
      'Getting useful, grounded answers — and knowing the Advisor’s limits.',
      'Obtenir des réponses utiles et fondées — et connaître les limites du Conseiller.',
    ),
  },
  {
    id: 'account_billing',
    icon: 'credit-card',
    title: bi('Account & billing', 'Compte et facturation'),
    description: bi(
      'Plans, invoices, and recovering access to your account.',
      'Forfaits, factures et récupération de l’accès à votre compte.',
    ),
  },
  {
    id: 'privacy_security',
    icon: 'shield-check',
    title: bi('Privacy & security', 'Confidentialité et sécurité'),
    description: bi(
      'How your data is protected and how to make a privacy request.',
      'Comment vos données sont protégées et comment faire une demande de confidentialité.',
    ),
  },
  {
    id: 'support_contact',
    icon: 'life-buoy',
    title: bi('Support & contact', 'Soutien et contact'),
    description: bi(
      'How Dutiva support works and how to write an effective request.',
      'Le fonctionnement du soutien Dutiva et comment rédiger une demande efficace.',
    ),
  },
] as const

export function helpCategory(id: HelpCategoryId): HelpCategory {
  const category = HELP_CATEGORIES.find((c) => c.id === id)
  if (!category) throw new Error(`Unknown help category: ${id}`)
  return category
}

// ── Article content model ──────────────────────────────────────────────────

export type HelpBlock = { type: 'p'; text: Bi } | { type: 'li'; text: Bi }

export interface HelpSection {
  /** Optional H2 within the article. */
  heading?: Bi
  blocks: HelpBlock[]
}

export interface HelpArticle {
  /** `/help/<slug>` — English slug (also the article's stable id). */
  slug: string
  /** `/fr/aide/<frSlug>` — localized French slug; unique across both spaces. */
  frSlug: string
  category: HelpCategoryId
  title: Bi
  /** One-line blurb shown on cards and used in search + the SEO description. */
  summary: Bi
  /** Extra search terms (space-separated), never rendered. */
  keywords?: Bi
  sections: HelpSection[]
}

const p = (en: string, fr: string): HelpBlock => ({ type: 'p', text: bi(en, fr) })
const li = (en: string, fr: string): HelpBlock => ({ type: 'li', text: bi(en, fr) })

export const HELP_ARTICLES: readonly HelpArticle[] = [
  // ── Getting started ───────────────────────────────────────────────────────
  {
    slug: 'signing-in',
    frSlug: 'se-connecter',
    category: 'getting_started',
    title: bi('Signing in with a magic link', 'Se connecter avec un lien magique'),
    summary: bi(
      'Dutiva sends a one-time sign-in link to your email — no password to remember.',
      'Dutiva envoie un lien de connexion à usage unique à votre courriel — aucun mot de passe à retenir.',
    ),
    keywords: bi(
      'login log in email magic link password reset access invite',
      'connexion ouvrir session courriel lien magique mot de passe accès invitation',
    ),
    sections: [
      {
        blocks: [
          p(
            'Dutiva uses passwordless sign-in. Enter the email address on your account and we email you a secure, one-time link. Opening that link signs you in and takes you into the app.',
            'Dutiva utilise une connexion sans mot de passe. Saisissez l’adresse courriel de votre compte et nous vous envoyons un lien sécurisé à usage unique. Ouvrir ce lien vous connecte et vous mène à l’application.',
          ),
        ],
      },
      {
        heading: bi('If the link doesn’t work', 'Si le lien ne fonctionne pas'),
        blocks: [
          li(
            'Each link can be used once and expires after a short time. Request a new one if it has been a while.',
            'Chaque lien ne peut être utilisé qu’une fois et expire après un court délai. Demandez-en un nouveau s’il s’est écoulé du temps.',
          ),
          li(
            'Open the most recent email — an older link is no longer valid.',
            'Ouvrez le courriel le plus récent — un lien plus ancien n’est plus valide.',
          ),
          li(
            'You can open the link on any device; you don’t have to use the same browser that requested it.',
            'Vous pouvez ouvrir le lien sur n’importe quel appareil; vous n’êtes pas obligé d’utiliser le même navigateur que celui qui l’a demandé.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Dutiva is currently invite-only. If your email isn’t recognized, ask the person who set up your workspace to invite you, or contact support.',
            'Dutiva est actuellement accessible sur invitation seulement. Si votre courriel n’est pas reconnu, demandez à la personne qui a configuré votre espace de travail de vous inviter, ou communiquez avec le soutien.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'switching-language',
    frSlug: 'changer-de-langue',
    category: 'getting_started',
    title: bi('Switching between English and French', 'Passer de l’anglais au français'),
    summary: bi(
      'Dutiva is fully bilingual — switch the interface language at any time.',
      'Dutiva est entièrement bilingue — changez la langue de l’interface en tout temps.',
    ),
    keywords: bi(
      'language english french bilingual translate toggle EN FR locale',
      'langue anglais français bilingue traduire bascule EN FR paramètres régionaux',
    ),
    sections: [
      {
        blocks: [
          p(
            'Every part of Dutiva — the app, this Help Centre, and our public pages — is available in English and French. Use the language toggle in the header to switch. Your choice is remembered on your device.',
            'Chaque partie de Dutiva — l’application, ce centre d’aide et nos pages publiques — est offerte en anglais et en français. Utilisez le sélecteur de langue dans l’en-tête pour changer. Votre choix est mémorisé sur votre appareil.',
          ),
          p(
            'When you send a support request, you can also tell us which language you’d prefer for our reply.',
            'Lorsque vous envoyez une demande de soutien, vous pouvez aussi nous indiquer la langue que vous préférez pour notre réponse.',
          ),
        ],
      },
    ],
  },
  // ── HR documents & templates ──────────────────────────────────────────────
  {
    slug: 'generate-a-document',
    frSlug: 'generer-un-document',
    category: 'documents',
    title: bi('Generating a document from a template', 'Générer un document à partir d’un modèle'),
    summary: bi(
      'Start from a Canadian HR template, answer a few prompts, and generate a draft.',
      'Partez d’un modèle RH canadien, répondez à quelques questions et générez une ébauche.',
    ),
    keywords: bi(
      'template document studio generate create letter offer contract draft download',
      'modèle document studio générer créer lettre offre contrat ébauche télécharger',
    ),
    sections: [
      {
        blocks: [
          p(
            'The HR Documents Library holds Dutiva’s templates. Open Document Studio, pick a template that fits your situation, and follow the prompts — Dutiva assembles a draft you can review, edit, and save to your workspace.',
            'La bibliothèque de documents RH contient les modèles de Dutiva. Ouvrez le Studio de documents, choisissez un modèle adapté à votre situation et suivez les questions — Dutiva assemble une ébauche que vous pouvez relire, modifier et enregistrer dans votre espace de travail.',
          ),
        ],
      },
      {
        heading: bi('Before you rely on a draft', 'Avant de vous fier à une ébauche'),
        blocks: [
          li(
            'Read the whole document and adjust it to your workplace, contracts, and current facts.',
            'Lisez le document en entier et adaptez-le à votre milieu de travail, à vos contrats et aux faits actuels.',
          ),
          li(
            'Templates are a starting point, not legal advice. For terminations, accommodations, or other high-risk matters, obtain qualified review.',
            'Les modèles sont un point de départ, et non un avis juridique. Pour les congédiements, les mesures d’adaptation ou d’autres situations à risque élevé, obtenez une révision qualifiée.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'how-templates-work',
    frSlug: 'fonctionnement-des-modeles',
    category: 'documents',
    title: bi('How Dutiva’s HR templates work', 'Comment fonctionnent les modèles RH de Dutiva'),
    summary: bi(
      'Templates are practical starting points tailored to Canadian jurisdictions — not legal advice.',
      'Les modèles sont des points de départ pratiques adaptés aux régimes canadiens — pas un avis juridique.',
    ),
    keywords: bi(
      'template jurisdiction ontario quebec federal province customize legal advice',
      'modèle régime ontario québec fédéral province personnaliser avis juridique',
    ),
    sections: [
      {
        blocks: [
          p(
            'Dutiva’s templates are written to reflect common Canadian employment practices and are organized by jurisdiction where that matters. They give you a structured, professional draft to build on.',
            'Les modèles de Dutiva sont rédigés pour refléter les pratiques d’emploi canadiennes courantes et sont organisés par régime lorsque cela est pertinent. Ils vous donnent une ébauche structurée et professionnelle sur laquelle bâtir.',
          ),
          p(
            'They do not replace advice from a qualified HR professional or lawyer, and they can’t account for every workplace policy, collective agreement, or fact. You stay responsible for the final document and the decision behind it.',
            'Ils ne remplacent pas les conseils d’un professionnel des RH ou d’un avocat qualifié, et ne peuvent tenir compte de chaque politique de travail, convention collective ou fait. Vous demeurez responsable du document final et de la décision qui le sous-tend.',
          ),
        ],
      },
    ],
  },
  // ── AI Advisor ────────────────────────────────────────────────────────────
  {
    slug: 'using-the-advisor',
    frSlug: 'utiliser-le-conseiller',
    category: 'advisor',
    title: bi('Getting useful answers from the AI Advisor', 'Obtenir des réponses utiles du Conseiller IA'),
    summary: bi(
      'Ask clear questions, set your jurisdiction, and the Advisor grounds answers in HR guidance.',
      'Posez des questions claires, précisez votre régime, et le Conseiller fonde ses réponses sur des directives RH.',
    ),
    keywords: bi(
      'advisor ai chat question jurisdiction province guidance grounded citation prompt',
      'conseiller ia clavardage question régime province directives fondé citation invite',
    ),
    sections: [
      {
        blocks: [
          p(
            'The Dutiva Advisor is an AI assistant for HR workflow questions. It works best when you set the relevant province, territory, or federal regime and describe your situation plainly. It draws on Dutiva’s HR guidance to ground its answers and flags where a matter should go to a professional.',
            'Le Conseiller Dutiva est un assistant IA pour les questions de flux de travail RH. Il fonctionne mieux lorsque vous précisez la province, le territoire ou le régime fédéral pertinent et décrivez votre situation simplement. Il s’appuie sur les directives RH de Dutiva pour fonder ses réponses et signale les situations à confier à un professionnel.',
          ),
        ],
      },
      {
        heading: bi('Tips for better answers', 'Conseils pour de meilleures réponses'),
        blocks: [
          li(
            'Set your jurisdiction — employment rules differ across Canada.',
            'Précisez votre régime — les règles d’emploi diffèrent partout au Canada.',
          ),
          li(
            'Give the relevant facts, but don’t paste sensitive employee records, medical details, or identifiers you don’t need to share.',
            'Donnez les faits pertinents, mais ne collez pas de dossiers d’employés sensibles, de renseignements médicaux ni d’identifiants que vous n’avez pas besoin de partager.',
          ),
          li(
            'Treat answers as a starting point and confirm them against current law and your own context.',
            'Considérez les réponses comme un point de départ et vérifiez-les au regard du droit en vigueur et de votre propre contexte.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'advisor-limits-and-review',
    frSlug: 'limites-du-conseiller',
    category: 'advisor',
    title: bi('Why the Advisor asks you to get human review', 'Pourquoi le Conseiller vous invite à obtenir une révision humaine'),
    summary: bi(
      'AI can be wrong. Dutiva flags high-risk matters for qualified review and never makes decisions for you.',
      'L’IA peut se tromper. Dutiva signale les situations à risque élevé pour révision qualifiée et ne décide jamais à votre place.',
    ),
    keywords: bi(
      'ai limits accuracy human review escalation termination accommodation risk not legal advice',
      'limites ia exactitude révision humaine escalade congédiement adaptation risque pas avis juridique',
    ),
    sections: [
      {
        blocks: [
          p(
            'AI systems can produce inaccurate, incomplete, or outdated content. Dutiva provides HR workflow support and compliance-oriented guidance — not legal advice — and it does not make final workplace decisions for you.',
            'Les systèmes d’IA peuvent produire du contenu inexact, incomplet ou périmé. Dutiva offre un soutien aux flux de travail RH et des directives axées sur la conformité — pas un avis juridique — et ne prend pas de décisions finales en milieu de travail à votre place.',
          ),
          p(
            'For higher-risk matters — terminations, layoffs, accommodations, investigations, privacy incidents, pay equity, or unionized-workplace issues — the Advisor will point you toward qualified legal or professional review. That’s by design: you remain responsible for reviewing outputs, confirming facts, and applying current law.',
            'Pour les situations à risque plus élevé — congédiements, mises à pied, mesures d’adaptation, enquêtes, incidents de confidentialité, équité salariale ou questions liées à un milieu syndiqué — le Conseiller vous orientera vers une révision juridique ou professionnelle qualifiée. C’est voulu : vous demeurez responsable de relire les résultats, de confirmer les faits et d’appliquer le droit en vigueur.',
          ),
        ],
      },
    ],
  },
  // ── Account & billing ─────────────────────────────────────────────────────
  {
    slug: 'plans-and-invoices',
    frSlug: 'forfaits-et-factures',
    category: 'account_billing',
    title: bi('Managing your plan and invoices', 'Gérer votre forfait et vos factures'),
    summary: bi(
      'View your plan, update payment details, and find invoices from the billing portal.',
      'Consultez votre forfait, mettez à jour vos renseignements de paiement et trouvez vos factures dans le portail de facturation.',
    ),
    keywords: bi(
      'billing invoice subscription plan payment card upgrade downgrade cancel refund stripe',
      'facturation facture abonnement forfait paiement carte améliorer réduire annuler remboursement stripe',
    ),
    sections: [
      {
        blocks: [
          p(
            'Dutiva plans are billed in Canadian dollars with no long-term contract. From the billing portal you can see your current plan, update your payment method, download invoices, and change or cancel your subscription.',
            'Les forfaits Dutiva sont facturés en dollars canadiens sans contrat à long terme. Depuis le portail de facturation, vous pouvez voir votre forfait actuel, mettre à jour votre mode de paiement, télécharger vos factures et modifier ou annuler votre abonnement.',
          ),
          p(
            'Annual plans include a 14-day money-back guarantee; monthly plans are non-refundable after the billing date, apart from documented billing errors or an outage over 24 consecutive hours. See the Refund and Cancellation Policy for full terms. For a billing question or dispute, send a request under “Billing” and include the invoice or subscription reference — please don’t email full card numbers.',
            'Les forfaits annuels comprennent une garantie de remboursement de 14 jours; les forfaits mensuels ne sont pas remboursables après la date de facturation, sauf erreur de facturation documentée ou panne de plus de 24 heures consécutives. Consultez la Politique de remboursement et d’annulation pour les conditions complètes. Pour une question ou un différend de facturation, envoyez une demande sous « Facturation » et incluez la référence de facture ou d’abonnement — veuillez ne pas envoyer de numéros de carte complets par courriel.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'recover-account-access',
    frSlug: 'recuperer-l-acces-au-compte',
    category: 'account_billing',
    title: bi('Recovering access to your account', 'Récupérer l’accès à votre compte'),
    summary: bi(
      'Locked out? Request a new sign-in link, or contact support if your email has changed.',
      'Bloqué? Demandez un nouveau lien de connexion, ou communiquez avec le soutien si votre courriel a changé.',
    ),
    keywords: bi(
      'locked out account access recovery cannot sign in email changed reset support',
      'bloqué accès compte récupération impossible connexion courriel changé réinitialiser soutien',
    ),
    sections: [
      {
        blocks: [
          p(
            'If you can’t get in, first request a fresh sign-in link and check your most recent email. If you no longer have access to the email on file, or your address has changed, send a support request under “Account access” and tell us whether you can still sign in.',
            'Si vous n’arrivez pas à vous connecter, demandez d’abord un nouveau lien de connexion et vérifiez votre courriel le plus récent. Si vous n’avez plus accès au courriel enregistré, ou si votre adresse a changé, envoyez une demande de soutien sous « Accès au compte » et indiquez-nous si vous pouvez encore vous connecter.',
          ),
          p(
            'To protect your account, we may need to verify your identity before changing the email address associated with it. Complex account recovery is one of the situations where we may arrange a scheduled call.',
            'Pour protéger votre compte, nous pourrions devoir vérifier votre identité avant de modifier l’adresse courriel qui y est associée. La récupération de compte complexe est l’une des situations où nous pouvons organiser un appel planifié.',
          ),
        ],
      },
    ],
  },
  // ── Privacy & security ────────────────────────────────────────────────────
  {
    slug: 'how-your-data-is-protected',
    frSlug: 'protection-de-vos-donnees',
    category: 'privacy_security',
    title: bi('How your data is protected', 'Comment vos données sont protégées'),
    summary: bi(
      'Data is encrypted in transit and at rest, with database-level access controls.',
      'Les données sont chiffrées en transit et au repos, avec des contrôles d’accès au niveau de la base de données.',
    ),
    keywords: bi(
      'security encryption tls aes access control rls canada hosting data protection',
      'sécurité chiffrement tls aes contrôle accès rls canada hébergement protection données',
    ),
    sections: [
      {
        blocks: [
          p(
            'Traffic between you and Dutiva is encrypted with TLS, and your data is encrypted at rest. Access to workspace data is enforced at the database level, so accounts only reach data that belongs to them, and internal access to production is restricted.',
            'Le trafic entre vous et Dutiva est chiffré au moyen de TLS, et vos données sont chiffrées au repos. L’accès aux données d’espace de travail est appliqué au niveau de la base de données, de sorte que les comptes n’atteignent que les données qui leur appartiennent, et l’accès interne à la production est restreint.',
          ),
          p(
            'For the full picture — infrastructure, encryption, access management, vulnerability handling, and incident response — see the Security Overview in our legal documents. To report a vulnerability, use the “Security concern” category or email security@dutiva.ca.',
            'Pour le portrait complet — infrastructure, chiffrement, gestion des accès, traitement des vulnérabilités et intervention en cas d’incident — consultez l’Aperçu de la sécurité dans nos documents juridiques. Pour signaler une vulnérabilité, utilisez la catégorie « Préoccupation de sécurité » ou écrivez à security@dutiva.ca.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'making-a-privacy-request',
    frSlug: 'faire-une-demande-de-confidentialite',
    category: 'privacy_security',
    title: bi('Making a privacy request', 'Faire une demande de confidentialité'),
    summary: bi(
      'Access, correction, and deletion requests under PIPEDA and Quebec Law 25 go to privacy@dutiva.ca.',
      'Les demandes d’accès, de correction et de suppression en vertu de la LPRPDE et de la Loi 25 vont à privacy@dutiva.ca.',
    ),
    keywords: bi(
      'privacy request access correction deletion pipeda law 25 quebec personal information identity',
      'confidentialité demande accès correction suppression lprpde loi 25 québec renseignements personnels identité',
    ),
    sections: [
      {
        blocks: [
          p(
            'You can ask about the personal information Dutiva holds and, where applicable, request access, correction, or deletion under PIPEDA and Quebec’s Law 25. Send these through the “Privacy request” category or to privacy@dutiva.ca — they’re handled separately from ordinary support.',
            'Vous pouvez vous renseigner sur les renseignements personnels que détient Dutiva et, s’il y a lieu, demander l’accès, la correction ou la suppression en vertu de la LPRPDE et de la Loi 25 du Québec. Envoyez ces demandes au moyen de la catégorie « Demande de confidentialité » ou à privacy@dutiva.ca — elles sont traitées séparément du soutien ordinaire.',
          ),
          p(
            'We may need to verify your identity before acting on a request. Please don’t attach identity documents to your first message — we’ll provide secure instructions if they’re needed.',
            'Nous pourrions devoir vérifier votre identité avant de donner suite à une demande. Veuillez ne pas joindre de pièces d’identité à votre premier message — nous fournirons des instructions sécurisées au besoin.',
          ),
        ],
      },
    ],
  },
  // ── Support & contact ─────────────────────────────────────────────────────
  {
    slug: 'how-support-works',
    frSlug: 'fonctionnement-du-soutien',
    category: 'support_contact',
    title: bi('How Dutiva support works', 'Comment fonctionne le soutien Dutiva'),
    summary: bi(
      'Support is digital-first: self-service, then written requests, with calls arranged only when needed.',
      'Le soutien est d’abord numérique : libre-service, puis demandes écrites, avec des appels organisés seulement au besoin.',
    ),
    keywords: bi(
      'support model digital first email phone call response time hours help centre ticket',
      'modèle soutien numérique courriel téléphone appel délai réponse heures centre aide billet',
    ),
    sections: [
      {
        blocks: [
          p(
            'Dutiva provides support through this Help Centre, secure support requests, and email. General inbound telephone support isn’t offered. When an issue can’t reasonably be resolved in writing — including certain accessibility, security, account-recovery, or exceptional matters — we may arrange a telephone or video appointment.',
            'Dutiva offre du soutien par l’intermédiaire de ce centre d’aide, de demandes de soutien sécurisées et du courriel. Le soutien téléphonique entrant général n’est pas offert. Lorsqu’une situation ne peut raisonnablement être réglée par écrit — notamment certaines questions d’accessibilité, de sécurité, de récupération de compte ou exceptionnelles — nous pouvons organiser un rendez-vous téléphonique ou vidéo.',
          ),
        ],
      },
      {
        heading: bi('When to expect a reply', 'Quand attendre une réponse'),
        blocks: [
          p(
            'When you submit a request you get an automatic acknowledgement with a reference number, and we reply in writing to the same ticket. Response targets depend on priority and are measured in business hours or days — they’re initial-response targets, not guaranteed resolution times. Business days exclude weekends and Ontario statutory holidays.',
            'Lorsque vous soumettez une demande, vous recevez un accusé de réception automatique avec un numéro de référence, et nous répondons par écrit dans le même billet. Les cibles de réponse dépendent de la priorité et se mesurent en heures ou en jours ouvrables — ce sont des cibles de première réponse, et non des délais de résolution garantis. Les jours ouvrables excluent les fins de semaine et les jours fériés légaux de l’Ontario.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'writing-a-good-request',
    frSlug: 'rediger-une-bonne-demande',
    category: 'support_contact',
    title: bi('What to include in a support request', 'Quoi inclure dans une demande de soutien'),
    summary: bi(
      'A clear subject, what you expected versus what happened, and no unnecessary sensitive data.',
      'Un sujet clair, ce que vous attendiez par rapport à ce qui s’est produit, et aucune donnée sensible inutile.',
    ),
    keywords: bi(
      'support request tips subject description impact urgency sensitive information attachment diagnostics',
      'demande soutien conseils sujet description impact urgence renseignements sensibles pièce jointe diagnostics',
    ),
    sections: [
      {
        heading: bi('Help us help you faster', 'Aidez-nous à vous aider plus vite'),
        blocks: [
          li(
            'A short, specific subject and a clear description of what you expected versus what happened.',
            'Un sujet court et précis et une description claire de ce que vous attendiez par rapport à ce qui s’est produit.',
          ),
          li(
            'Steps to reproduce the problem, the page or feature involved, and any error message.',
            'Les étapes pour reproduire le problème, la page ou la fonctionnalité concernée et tout message d’erreur.',
          ),
          li(
            'How much it’s affecting you and how time-sensitive it is — this helps us set priority.',
            'L’ampleur de l’impact et le degré d’urgence — cela nous aide à établir la priorité.',
          ),
        ],
      },
      {
        heading: bi('Please leave out', 'À ne pas inclure'),
        blocks: [
          p(
            'Don’t include unnecessary employee personal information, medical information, investigation evidence, passwords, or authentication codes. Dutiva will provide secure instructions if additional information is required. When you send a request from inside the app, we attach limited, non-sensitive technical context (like your current page and app version) that you can review and remove before submitting.',
            'N’incluez pas inutilement de renseignements personnels sur des employés, de renseignements médicaux, de preuves d’enquête, de mots de passe ni de codes d’authentification. Dutiva fournira des instructions sécurisées si des renseignements supplémentaires sont nécessaires. Lorsque vous envoyez une demande depuis l’application, nous joignons un contexte technique limité et non sensible (comme votre page actuelle et la version de l’application) que vous pouvez examiner et retirer avant de soumettre.',
          ),
        ],
      },
    ],
  },
] as const

export function helpArticlesByCategory(id: HelpCategoryId): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === id)
}

/** Flatten an article to plain text (headings + blocks) — used as grounding
    context for the first-line answer helper. */
export function articlePlainText(article: HelpArticle, lang: Lang): string {
  return article.sections
    .flatMap((s) => [
      ...(s.heading ? [pick(s.heading, lang)] : []),
      ...s.blocks.map((b) => pick(b.text, lang)),
    ])
    .join(' ')
}

export function helpArticleBySlug(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug)
}

export function helpArticleByFrSlug(frSlug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.frSlug === frSlug)
}

// ── Block grouping (consecutive `li` → one semantic list) ───────────────────

export type HelpBlockGroup = { kind: 'p'; text: Bi } | { kind: 'list'; items: Bi[] }

export function groupHelpBlocks(blocks: HelpBlock[]): HelpBlockGroup[] {
  const groups: HelpBlockGroup[] = []
  for (const block of blocks) {
    const last = groups.at(-1)
    if (block.type === 'li') {
      if (last?.kind === 'list') last.items.push(block.text)
      else groups.push({ kind: 'list', items: [block.text] })
    } else {
      groups.push({ kind: 'p', text: block.text })
    }
  }
  return groups
}
