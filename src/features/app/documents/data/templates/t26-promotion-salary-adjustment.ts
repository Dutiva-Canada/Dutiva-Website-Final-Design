/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 1, Employment Changes (docs/FOUR_RING_FRAMEWORK.md). One of the eight
   Ring 1 tools the framework lists that had no template.

   A promotion letter is where employers most often try to slip in a new
   termination clause or restrictive covenant. That is the risk this document
   is built around: a change the employee gains from needs no fresh
   consideration, a change that restricts them does. */
import type { DocTemplate } from '../types'

export const tplT26: DocTemplate = {
  id: 'tpl_t26',
  tid: 'T26',
  key: 'promotion_salary_adjustment',
  kind: 'letter',
  category: 'changes',
  core: true,
  name: {
    en: 'Promotion & salary adjustment',
    fr: 'Promotion et ajustement salarial',
  },
  desc: {
    en: 'Confirms a new role, pay, or reporting line — and keeps the existing contract intact rather than silently rewriting it.',
    fr: 'Confirme un nouveau poste, une nouvelle rémunération ou un nouveau lien hiérarchique — en laissant le contrat existant intact plutôt qu’en le réécrivant en silence.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 6,
  usageCount: 0,
  statutory: [
    {
      en: 'Contract law — a term that restricts the employee needs fresh consideration',
      fr: 'Droit des contrats — une clause qui restreint l’employé exige une contrepartie nouvelle',
    },
    {
      en: 'Employment standards — continuous service carries across the change',
      fr: 'Normes du travail — le service continu se poursuit malgré le changement',
    },
    {
      en: 'Human rights legislation — the decision and its record must be non-discriminatory',
      fr: 'Législation sur les droits de la personne — la décision et son dossier doivent être exempts de discrimination',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Continuous employment under the Employment Standards Act, 2000 runs from the original hire date, and a promotion does not reset it for notice or severance. If this letter introduces a termination clause, it is a new restriction and needs consideration beyond the raise itself to be enforceable.',
      fr: 'L’emploi continu au sens de la Loi de 2000 sur les normes d’emploi court depuis la date d’embauche initiale, et une promotion ne le remet pas à zéro aux fins du préavis ou de l’indemnité. Si la présente lettre introduit une clause de cessation, il s’agit d’une nouvelle restriction qui exige une contrepartie distincte de l’augmentation pour être exécutoire.',
    },
    QC: {
      en: 'The Act respecting labour standards counts uninterrupted service from the original hire date. Employment documents must be available in French, and the Civil Code obligation of good faith applies to how a change in conditions is presented.',
      fr: 'La Loi sur les normes du travail calcule le service continu depuis la date d’embauche initiale. Les documents d’emploi doivent être disponibles en français, et l’obligation de bonne foi du Code civil s’applique à la façon dont un changement de conditions est présenté.',
    },
    FED: {
      en: 'Continuous employment under the Canada Labour Code, Part III runs from the original hire date. Where the new role changes hours, scheduling or overtime treatment, confirm those against Part III rather than assuming a salaried title removes them.',
      fr: 'L’emploi continu au sens du Code canadien du travail, Partie III court depuis la date d’embauche initiale. Lorsque le nouveau poste modifie les heures, l’horaire ou le traitement des heures supplémentaires, validez ces éléments avec la Partie III plutôt que de présumer qu’un titre salarié les écarte.',
    },
  },
  includes: [
    {
      en: 'New role and reporting line',
      fr: 'Nouveau poste et lien hiérarchique',
    },
    {
      en: 'New compensation and effective date',
      fr: 'Nouvelle rémunération et date d’effet',
    },
    {
      en: 'What is changing, and what is not',
      fr: 'Ce qui change et ce qui ne change pas',
    },
    {
      en: 'Continuous service confirmation',
      fr: 'Confirmation du service continu',
    },
  ],
  questions: [
    {
      id: 'employee_name',
      section: {
        en: 'Employee',
        fr: 'Employé',
      },
      label: {
        en: 'Employee full name',
        fr: 'Nom complet de l’employé(e)',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Full name',
        fr: 'Nom complet',
      },
    },
    {
      id: 'new_title',
      section: {
        en: 'The change',
        fr: 'Le changement',
      },
      label: {
        en: 'New position title',
        fr: 'Nouveau titre du poste',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Job title',
        fr: 'Titre du poste',
      },
    },
    {
      id: 'reports_to',
      section: {
        en: 'The change',
        fr: 'Le changement',
      },
      label: {
        en: 'Reports to',
        fr: 'Relève de',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'Name and role',
        fr: 'Nom et fonction',
      },
    },
    {
      id: 'new_compensation',
      section: {
        en: 'The change',
        fr: 'Le changement',
      },
      label: {
        en: 'New compensation',
        fr: 'Nouvelle rémunération',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Base pay, and any change to bonus, benefits or vacation entitlement.',
        fr: 'Salaire de base et toute modification à la prime, aux avantages ou aux vacances.',
      },
    },
    {
      id: 'effective_date',
      section: {
        en: 'The change',
        fr: 'Le changement',
      },
      label: {
        en: 'Effective date',
        fr: 'Date d’effet',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'responsibilities',
      section: {
        en: 'The change',
        fr: 'Le changement',
      },
      label: {
        en: 'What the role now covers',
        fr: 'Ce que le poste couvre désormais',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'The added scope, and anything moving off their plate.',
        fr: 'La portée ajoutée et ce qui leur est retiré.',
      },
    },
    {
      id: 'hire_date',
      section: {
        en: 'Continuity',
        fr: 'Continuité',
      },
      label: {
        en: 'Original hire date',
        fr: 'Date d’embauche initiale',
      },
      type: 'date',
      required: true,
      hint: {
        en: 'Restated here on purpose: service carries across the change, and a promotion letter is a common place for a start date to quietly move.',
        fr: 'Rappelée ici à dessein : le service se poursuit malgré le changement, et une lettre de promotion est un endroit où une date d’entrée en fonction se déplace discrètement.',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Confirmation of Promotion and Compensation Change',
        fr: 'Confirmation de promotion et de modification de la rémunération',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · {{employee_name}} · Effective {{effective_date}}',
        fr: '{{org}} · {{employee_name}} · En vigueur le {{effective_date}}',
      },
    },
    {
      type: 'para',
      text: {
        en: 'Congratulations, {{employee_name}}. Effective {{effective_date}} you move into the role of {{new_title}}, reporting to {{reports_to}}. This letter confirms what is changing and what stays as it is.',
        fr: 'Félicitations, {{employee_name}}. À compter du {{effective_date}}, vous occuperez le poste de {{new_title}} et relèverez de {{reports_to}}. La présente lettre confirme ce qui change et ce qui demeure inchangé.',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{responsibilities}}',
        fr: '{{responsibilities}}',
      },
      n: 1,
      heading: {
        en: 'Your new role',
        fr: 'Votre nouveau poste',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{new_compensation}} This takes effect on {{effective_date}}.',
        fr: '{{new_compensation}} Ces conditions prennent effet le {{effective_date}}.',
      },
      n: 2,
      heading: {
        en: 'Compensation',
        fr: 'Rémunération',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Your employment has been continuous since {{hire_date}}, and this change does not interrupt or restart it. Service accrued from that date continues to count for vacation, notice and every other entitlement under {{statute}}.',
        fr: 'Votre emploi est continu depuis le {{hire_date}}, et le présent changement ne l’interrompt ni ne le recommence. Le service accumulé depuis cette date continue de compter pour les vacances, le préavis et tout autre droit prévu par {{statute}}.',
      },
      n: 3,
      heading: {
        en: 'Continuous service',
        fr: 'Service continu',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Every other term of your employment continues unchanged. This letter varies your role, reporting line and compensation only — it does not replace your employment agreement and introduces no new restriction on you.',
        fr: 'Toutes les autres conditions de votre emploi demeurent inchangées. La présente lettre ne modifie que votre poste, votre lien hiérarchique et votre rémunération — elle ne remplace pas votre contrat de travail et n’ajoute aucune nouvelle restriction à votre égard.',
      },
      n: 4,
      heading: {
        en: 'Everything else is unchanged',
        fr: 'Le reste demeure inchangé',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'This workplace is unionized: where the position is in the bargaining unit, the collective agreement governs the posting, the rate and the seniority consequences of this move.',
        fr: 'Ce milieu de travail est syndiqué : lorsque le poste fait partie de l’unité de négociation, la convention collective régit l’affichage, le taux et les conséquences du présent changement sur l’ancienneté.',
      },
      heading: {
        en: 'Collective agreement',
        fr: 'Convention collective',
      },
      when: {
        union: true,
      },
    },
    {
      type: 'sig',
      roles: [
        {
          en: 'Employer representative',
          fr: 'Représentant de l’employeur',
        },
        {
          en: 'Employee',
          fr: 'Employé(e)',
        },
      ],
    },
    {
      type: 'note',
      text: {
        en: 'If you intend to add a term that restricts the employee — a termination clause, a non-competition or non-solicitation covenant, a change of jurisdiction — do not attach it here. A raise is not consideration for a restriction the employee did not previously carry, and a clause added this way is commonly found unenforceable. Use the restrictive covenants agreement (T08) and get it reviewed.',
        fr: 'Si vous comptez ajouter une clause restreignant l’employé(e) — clause de cessation, de non-concurrence ou de non-sollicitation, changement de for — ne l’intégrez pas ici. Une augmentation ne constitue pas une contrepartie pour une restriction que l’employé(e) n’assumait pas auparavant, et une clause ajoutée de cette façon est souvent jugée inexécutoire. Utilisez l’entente de clauses restrictives (T08) et faites-la réviser.',
      },
      tone: 'risk',
    },
    {
      type: 'note',
      text: {
        en: 'Generated from your answers as a starting point. Review before use — Dutiva provides compliance-oriented HR guidance, not legal advice.',
        fr: 'Généré à partir de vos réponses comme point de départ. À réviser avant usage — Dutiva offre un accompagnement RH axé sur la conformité, non des conseils juridiques.',
      },
      tone: 'info',
    },
  ],
  subject: 'employee',
}
