/* AUTHORED IN-REPO — not from the HR Documents Library handoff, so unlike
   T01–T16 this file is maintained by hand. All FR is [FR self-authored].

   Ring 2, Pillar C (docs/FOUR_RING_FRAMEWORK.md).

   **This one belongs to the employee, and that changes how it is built.**
   Every other template in the catalogue is the employer's document about a
   person. This is a person's document about themselves, handed to a manager
   so the manager knows what helps. Getting that backwards produces a
   health questionnaire with the employer's name on it, which is both the
   wrong instrument and a privacy problem the employer created for itself.

   So: the questions ask what would help at work, never what is wrong. There
   is no field for a condition, a diagnosis or a treatment, and there is
   deliberately nowhere to put one — a template with a "nature of condition"
   box gets that box filled in. What an employer needs to act on is the
   limitation and the support, which is the same rule the functional
   limitations guide sets out for accommodation.

   It is also not an accommodation, and the copy says so twice. A plan filed
   as one asserts that the employee has a disability and requested an
   adjustment, neither of which completing this implies. Where an
   accommodation is needed, T21 starts it and this is not a substitute. */
import { DOC_DISCLAIMER_NOTE } from '../meta'
import type { DocTemplate } from '../types'

export const tplT44: DocTemplate = {
  id: 'tpl_t44',
  tid: 'T44',
  key: 'wellness_action_plan',
  kind: 'plan',
  category: 'wellbeing',
  core: false,
  name: {
    en: 'Wellness action plan',
    fr: 'Plan d’action pour le mieux-être',
  },
  desc: {
    en: 'An employee’s own plan for staying well at work — what helps, what the early signs are, and what they want their manager to do. Voluntary, and never a medical record.',
    fr: 'Le plan personnel d’une personne salariée pour rester bien au travail : ce qui aide, les signes précurseurs et ce qu’elle attend de son gestionnaire. Volontaire, et jamais un dossier médical.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v1',
  versionNumber: 1,
  effectiveDate: '2026-08-01',
  updatedAt: '2026-08-01',
  estMinutes: 5,
  usageCount: 0,
  statutory: [
    {
      en: 'Voluntary — completing one cannot be required, and declining costs nothing',
      fr: 'Volontaire — nul ne peut être tenu d’en remplir un, et refuser n’entraîne aucune conséquence',
    },
    {
      en: 'Privacy — no diagnosis is collected, and the plan is stored apart from the personnel file',
      fr: 'Vie privée — aucun diagnostic n’est recueilli et le plan est conservé hors du dossier d’employé',
    },
    {
      en: 'Not an accommodation, and not a substitute for one',
      fr: 'Ni un accommodement, ni un substitut à celui-ci',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'Nothing requires an employer to offer this, and nothing lets one require it. Two cautions. What the employee writes here can amount to notice that they may need an adjustment — once you know, or ought reasonably to know, the Human Rights Code duty to accommodate has started, whatever this document is called. And where the difficulty they describe is conduct at work, the Occupational Health and Safety Act harassment duties apply and a wellness plan is not a response to them.',
      fr: 'Rien n’oblige un employeur à offrir ce plan, et rien ne lui permet de l’imposer. Deux mises en garde. Ce que la personne y écrit peut valoir avis qu’elle pourrait avoir besoin d’un ajustement — dès que vous savez, ou devriez raisonnablement savoir, l’obligation d’accommodement du Code des droits de la personne est enclenchée, quel que soit le nom du document. Et lorsque la difficulté décrite relève de comportements au travail, les obligations de la Loi sur la santé et la sécurité au travail s’appliquent et un plan de mieux-être n’y répond pas.',
    },
    QC: {
      en: 'The same two cautions apply, through the Charter of human rights and freedoms for accommodation and the Act respecting labour standards for psychological harassment — and note that the Act obliges an employer to act on harassment once aware, so a plan describing conduct by a colleague is information you must act on rather than file. Law 25 governs the personal information collected here: collect only what is necessary, say what it will be used for, and keep it apart. The form must be available in French.',
      fr: 'Les deux mêmes mises en garde s’appliquent, par la Charte des droits et libertés de la personne pour l’accommodement et par la Loi sur les normes du travail pour le harcèlement psychologique — et notez que la Loi oblige l’employeur à agir sur le harcèlement dès qu’il en est informé : un plan décrivant les comportements d’un collègue est donc une information sur laquelle agir plutôt qu’à classer. La Loi 25 régit les renseignements personnels recueillis ici : ne recueillez que le nécessaire, indiquez l’usage prévu et conservez-les séparément. Le formulaire doit être disponible en français.',
    },
    FED: {
      en: 'The Canadian Human Rights Act carries the accommodation duty on the same "knew or ought to have known" footing. Where what the employee describes is a harassment or violence occurrence, the Work Place Harassment and Violence Prevention Regulations set a prescribed process with its own timelines — a plan is not that process and does not start it. PIPEDA governs the personal information collected.',
      fr: 'La Loi canadienne sur les droits de la personne porte l’obligation d’accommodement sur le même fondement du « savait ou aurait dû savoir ». Lorsque ce que décrit la personne constitue un incident de harcèlement ou de violence, le Règlement sur la prévention du harcèlement et de la violence dans le lieu de travail prévoit un processus assorti de ses propres délais — un plan n’est pas ce processus et ne le déclenche pas. La LPRPDE régit les renseignements personnels recueillis.',
    },
  },
  includes: [
    {
      en: 'What keeps you well at work',
      fr: 'Ce qui vous garde bien au travail',
    },
    {
      en: 'What makes work harder',
      fr: 'Ce qui rend le travail plus difficile',
    },
    {
      en: 'Early signs, and what you want done about them',
      fr: 'Signes précurseurs et ce que vous souhaitez qu’on fasse',
    },
    {
      en: 'Who else may see this',
      fr: 'Qui d’autre peut le consulter',
    },
    {
      en: 'When it is next looked at',
      fr: 'Quand il sera revu',
    },
  ],
  questions: [
    {
      id: 'employee_name',
      section: {
        en: 'You',
        fr: 'Vous',
      },
      label: {
        en: 'Your name',
        fr: 'Votre nom',
      },
      type: 'text',
      required: true,
    },
    {
      id: 'keeps_well',
      section: {
        en: 'What works',
        fr: 'Ce qui fonctionne',
      },
      label: {
        en: 'What helps you work well',
        fr: 'Ce qui vous aide à bien travailler',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Working patterns, notice before changes, a quiet space, regular one-to-ones — whatever actually helps.',
        fr: 'Rythme de travail, préavis avant les changements, un espace calme, des rencontres régulières — ce qui aide réellement.',
      },
      hint: {
        en: 'Start here rather than with problems. Most of a useful plan is a list of ordinary things that already work, which is also the part a manager can act on immediately.',
        fr: 'Commencez par là plutôt que par les problèmes. L’essentiel d’un plan utile est une liste de choses ordinaires qui fonctionnent déjà, et c’est aussi la partie sur laquelle un gestionnaire peut agir tout de suite.',
      },
    },
    {
      id: 'makes_harder',
      section: {
        en: 'What works',
        fr: 'Ce qui fonctionne',
      },
      label: {
        en: 'What makes work harder for you',
        fr: 'Ce qui rend le travail plus difficile pour vous',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Situations, patterns or demands that make things harder — described as they affect your work.',
        fr: 'Situations, habitudes ou exigences qui compliquent les choses — décrites selon leur effet sur votre travail.',
      },
      hint: {
        en: 'Describe the effect at work, not the cause. You are never asked for a diagnosis here, you do not have to give one, and nobody may ask you for one on the strength of this form.',
        fr: 'Décrivez l’effet au travail, non la cause. On ne vous demande jamais de diagnostic ici, vous n’avez pas à en fournir, et personne ne peut vous en demander un sur la foi du présent formulaire.',
      },
    },
    {
      id: 'early_signs',
      section: {
        en: 'If things slip',
        fr: 'Si les choses se dégradent',
      },
      label: {
        en: 'What others might notice first',
        fr: 'Ce que les autres pourraient remarquer en premier',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'The changes you would want someone to spot — in your work, your hours, how much you say.',
        fr: 'Les changements que vous voudriez qu’on remarque — dans votre travail, vos horaires, votre participation.',
      },
    },
    {
      id: 'what_helps_then',
      section: {
        en: 'If things slip',
        fr: 'Si les choses se dégradent',
      },
      label: {
        en: 'What you want done if that happens',
        fr: 'Ce que vous souhaitez qu’on fasse alors',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Who to speak to you, how, and what you would rather they did not do.',
        fr: 'Qui doit vous en parler, comment, et ce que vous préféreriez qu’on ne fasse pas.',
      },
      hint: {
        en: 'Written now, this is the instruction your future self would struggle to give. "Ask me directly and privately" and "do not raise it in a team meeting" are both useful answers.',
        fr: 'Rédigée maintenant, c’est la consigne que vous auriez du mal à donner le moment venu. « Parlez-m’en directement et en privé » et « n’abordez pas le sujet en réunion d’équipe » sont deux réponses utiles.',
      },
    },
    {
      id: 'shared_with',
      section: {
        en: 'Who sees this',
        fr: 'Qui le consulte',
      },
      label: {
        en: 'Who you agree may see this plan',
        fr: 'Qui vous acceptez de laisser consulter ce plan',
      },
      type: 'textarea',
      required: true,
      placeholder: {
        en: 'Name them. "My manager only" is a complete answer.',
        fr: 'Nommez-les. « Mon gestionnaire seulement » est une réponse complète.',
      },
      hint: {
        en: 'Your choice, and it is respected. If it later has to go further — to arrange cover, or because someone else has to act — you are told before that happens.',
        fr: 'C’est votre choix et il est respecté. Si le plan devait ensuite circuler davantage — pour organiser un remplacement ou parce qu’une autre personne doit agir — vous en serez informé(e) au préalable.',
      },
    },
    {
      id: 'review_on',
      section: {
        en: 'Who sees this',
        fr: 'Qui le consulte',
      },
      label: {
        en: 'When you will look at this again',
        fr: 'Quand vous le reverrez',
      },
      type: 'date',
      required: true,
      hint: {
        en: 'A plan nobody revisits describes a job that has since changed. Put a date on it.',
        fr: 'Un plan que personne ne revoit décrit un poste qui a changé depuis. Fixez-lui une date.',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Wellness action plan',
        fr: 'Plan d’action pour le mieux-être',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{employee_name}} · {{org}} · {{today}} · Confidential · To be reviewed {{review_on}}',
        fr: '{{employee_name}} · {{org}} · {{today}} · Confidentiel · À revoir le {{review_on}}',
      },
    },
    {
      type: 'para',
      text: {
        en: 'This plan belongs to {{employee_name}}. They wrote it, they decide what is in it, and they can change or withdraw it at any time. Completing one is voluntary — nobody is asked to explain why they have not.',
        fr: 'Le présent plan appartient à {{employee_name}}. Cette personne l’a rédigé, décide de son contenu et peut le modifier ou le retirer en tout temps. Le remplir est volontaire — nul n’a à justifier de ne pas l’avoir fait.',
      },
    },
    {
      type: 'clause',
      n: 1,
      heading: {
        en: 'What helps me work well',
        fr: 'Ce qui m’aide à bien travailler',
      },
      text: {
        en: '{{keeps_well}}',
        fr: '{{keeps_well}}',
      },
    },
    {
      type: 'clause',
      n: 2,
      heading: {
        en: 'What makes it harder',
        fr: 'Ce qui rend les choses plus difficiles',
      },
      text: {
        en: '{{makes_harder}}',
        fr: '{{makes_harder}}',
      },
    },
    {
      type: 'clause',
      n: 3,
      heading: {
        en: 'What you might notice first',
        fr: 'Ce que vous pourriez remarquer en premier',
      },
      text: {
        en: '{{early_signs}}',
        fr: '{{early_signs}}',
      },
    },
    {
      type: 'clause',
      n: 4,
      heading: {
        en: 'What I would like you to do',
        fr: 'Ce que je souhaite que vous fassiez',
      },
      text: {
        en: '{{what_helps_then}}',
        fr: '{{what_helps_then}}',
      },
    },
    {
      type: 'clause',
      n: 5,
      heading: {
        en: 'Who may see this',
        fr: 'Qui peut le consulter',
      },
      text: {
        en: '{{shared_with}} This plan is kept separately from the personnel file and is not part of any performance record. It is not shared further without telling {{employee_name}} first, and it is returned or destroyed on request.',
        fr: '{{shared_with}} Le présent plan est conservé séparément du dossier d’employé et ne fait partie d’aucun dossier de rendement. Il n’est pas diffusé plus largement sans en informer d’abord {{employee_name}}, et il est remis ou détruit sur demande.',
      },
    },
    {
      type: 'clause',
      n: 6,
      heading: {
        en: 'What this is not',
        fr: 'Ce que ce plan n’est pas',
      },
      text: {
        en: 'This is not a medical document, and no diagnosis was asked for or given. It is not an accommodation, and completing it does not mean {{employee_name}} has asked for one or has a disability. Where an adjustment to the work is needed, that is a separate process that starts with an accommodation request — this plan neither replaces it nor delays it.',
        fr: 'Il ne s’agit pas d’un document médical, et aucun diagnostic n’a été demandé ni fourni. Il ne s’agit pas d’un accommodement, et le fait de le remplir ne signifie pas que {{employee_name}} en a demandé un ni qu’elle a un handicap. Lorsqu’un ajustement du travail est nécessaire, il relève d’un processus distinct qui débute par une demande d’accommodement — le présent plan ne le remplace ni ne le retarde.',
      },
    },
    {
      type: 'sig',
      roles: [
        {
          en: 'Employee',
          fr: 'Employé(e)',
        },
        {
          en: 'Manager (acknowledging receipt)',
          fr: 'Gestionnaire (accusant réception)',
        },
        {
          en: 'Date',
          fr: 'Date',
        },
      ],
    },
    {
      type: 'note',
      tone: 'risk',
      text: {
        en: 'For the manager receiving this. You may not require anyone to complete one, and declining must carry no consequence. Do not ask what condition lies behind any of it — the plan is built so that question never has to be asked. And read what it says: if it describes a need for the work to change, the duty to accommodate has started whatever this document is called; if it describes conduct by a colleague, that is a harassment matter with its own obligations and timelines, and filing this instead of acting on it is the error to avoid.',
        fr: 'À l’intention du gestionnaire qui le reçoit. Vous ne pouvez exiger de quiconque qu’il en remplisse un, et un refus ne doit entraîner aucune conséquence. Ne demandez pas quel trouble se cache derrière son contenu — le plan est conçu pour que cette question n’ait jamais à être posée. Et lisez ce qui y est écrit : s’il fait état d’un besoin de modifier le travail, l’obligation d’accommodement est enclenchée quel que soit le nom du document; s’il décrit les comportements d’un collègue, il s’agit d’une question de harcèlement assortie de ses propres obligations et délais, et le classer au lieu d’agir est l’erreur à éviter.',
      },
    },
    {
      type: 'note',
      tone: 'info',
      text: DOC_DISCLAIMER_NOTE,
    },
  ],
  subject: 'employee',
}
