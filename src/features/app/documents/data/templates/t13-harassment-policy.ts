/* GENERATED from the HR Documents Library handoff (dutiva-data.js) — do not
   hand-edit. Regenerate with scripts/generate-doclib.mjs (see repo docs). */
import type { DocTemplate } from '../types'

export const tplT13: DocTemplate = {
  id: 'tpl_t13',
  tid: 'T13',
  key: 'harassment_policy',
  kind: 'policy',
  category: 'policies',
  core: true,
  name: {
    en: 'Harassment, discrimination & violence policy',
    fr: 'Politique sur le harcèlement, la discrimination et la violence',
  },
  desc: {
    en: 'A legally required policy in every Canadian jurisdiction. Defines prohibited conduct, reporting, and investigation.',
    fr: 'Une politique exigée par la loi dans toutes les juridictions. Définit la conduite interdite, le signalement et l’enquête.',
  },
  jurisdictions: ['ON', 'QC', 'FED'],
  risk: 'medium',
  review: 'hr_review_required',
  requiresLawyerReview: false,
  version: 'v4',
  versionNumber: 4,
  effectiveDate: '2026-02-01',
  updatedAt: '2026-06-16',
  estMinutes: 9,
  usageCount: 88,
  statutory: [
    {
      en: 'OHSA — Bill 168 duties',
      fr: 'LSST — obligations (projet 168)',
    },
    {
      en: 'LSA — psychological harassment',
      fr: 'LNT — harcèlement psychologique',
    },
    {
      en: 'Work Place Harassment and Violence Prevention Regulations (federal)',
      fr: 'Règlement fédéral sur le harcèlement et la violence',
    },
  ],
  jurisdictionNotes: {
    ON: {
      en: 'A written program, worker training, and a defined complaint procedure are mandatory under OHSA.',
      fr: 'Un programme écrit, la formation et une procédure de plainte sont obligatoires (LSST).',
    },
    QC: {
      en: 'Employers must adopt and make available a psychological-harassment prevention policy under the LSA.',
      fr: 'Les employeurs doivent adopter et rendre disponible une politique de prévention du harcèlement psychologique (LNT).',
    },
    FED: {
      en: 'The federal Regulations require risk assessments, training, and a resolution process with set timelines.',
      fr: 'Le Règlement fédéral exige des évaluations, de la formation et un processus de résolution avec délais.',
    },
  },
  includes: [
    {
      en: 'Definitions',
      fr: 'Définitions',
    },
    {
      en: 'Prohibited conduct',
      fr: 'Conduite interdite',
    },
    {
      en: 'How to report',
      fr: 'Comment signaler',
    },
    {
      en: 'Confidentiality',
      fr: 'Confidentialité',
    },
    {
      en: 'Investigation process',
      fr: 'Processus d’enquête',
    },
    {
      en: 'No reprisal',
      fr: 'Aucune représailles',
    },
    {
      en: 'Support resources',
      fr: 'Ressources de soutien',
    },
  ],
  questions: [
    {
      id: 'effective_date',
      section: {
        en: 'Basics',
        fr: 'Bases',
      },
      label: {
        en: 'Effective date',
        fr: 'Date d’entrée en vigueur',
      },
      type: 'date',
      required: true,
    },
    {
      id: 'report_to',
      section: {
        en: 'Reporting',
        fr: 'Signalement',
      },
      label: {
        en: 'Report incidents to',
        fr: 'Signaler les incidents à',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'e.g. HR lead',
        fr: 'p. ex. responsable RH',
      },
    },
    {
      id: 'alt_contact',
      section: {
        en: 'Reporting',
        fr: 'Signalement',
      },
      label: {
        en: 'Alternate contact (if respondent is the manager)',
        fr: 'Contact alternatif (si le mis en cause est le gestionnaire)',
      },
      type: 'text',
      required: true,
      placeholder: {
        en: 'e.g. Owner / external ombud',
        fr: 'p. ex. propriétaire / ombudsman',
      },
    },
  ],
  preview: [
    {
      type: 'title',
      text: {
        en: 'Harassment, Discrimination & Violence Policy',
        fr: 'Politique sur le harcèlement, la discrimination et la violence',
      },
    },
    {
      type: 'meta',
      text: {
        en: '{{org}} · Effective {{effective_date}} · {{jurisdiction}}',
        fr: '{{org}} · En vigueur le {{effective_date}} · {{jurisdiction}}',
      },
    },
    {
      type: 'clause',
      text: {
        en: '{{org}} is committed to a workplace free from harassment, discrimination, and violence, as required for {{jurisdiction}}.',
        fr: '{{org}} s’engage à offrir un milieu exempt de harcèlement, de discrimination et de violence, conformément aux exigences pour {{jurisdiction}}.',
      },
      n: 1,
      heading: {
        en: 'Commitment',
        fr: 'Engagement',
      },
    },
    {
      type: 'clause',
      text: {
        en: 'Report incidents to {{report_to}}. If the report concerns that person, contact {{alt_contact}} instead. Reports are handled confidentially and investigated promptly. Reprisal is prohibited.',
        fr: 'Signalez à {{report_to}}. Si le signalement concerne cette personne, contactez plutôt {{alt_contact}}. Les signalements sont confidentiels et font l’objet d’une enquête rapide. Les représailles sont interdites.',
      },
      n: 2,
      heading: {
        en: 'How to report',
        fr: 'Comment signaler',
      },
    },
    {
      type: 'ack',
      text: {
        en: 'I acknowledge I have read and understood this document.',
        fr: 'Je reconnais avoir lu et compris le présent document.',
      },
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
  subject: 'org',
  bodyHtmlEn:
    '<h1 class="center">Workplace Harassment, Discrimination and Violence Prevention Policy</h1>\n<p class="center"><strong>Effective:</strong> <span class="mf">{{policy_effective_date}}</span></p>\n<h2>Our commitment</h2>\n<p>Every person at <span class="mf">{{employer_legal_name}}</span> has the right to a workplace that is safe, respectful, and free from harassment, discrimination and violence. This is required by the Occupational Health and Safety Act, R.S.O. 1990, c. O.1, ss. 32.0.1–32.0.8 and the Human Rights Code, R.S.O. 1990, c. H.19.</p>\n<h2>1. Who this applies to</h2>\n<p>This policy applies to everyone who works for or with the Company, in any location where Company business is conducted, including remote workspaces and Company-related digital spaces.</p>\n<h2>2. What we don\'t allow</h2>\n<p>The Company does not tolerate harassment, sexual harassment, discrimination on any protected ground, workplace violence, or retaliation against anyone who reports in good faith.</p>\n<h2>3. How to report</h2>\n<p>Contact <span class="mf">{{hr_contact_name}}</span> at <span class="mf">{{hr_contact_email}}</span> or <span class="mf">{{hr_contact_phone}}</span>, or use the confidential reporting channel at <span class="mf">{{confidential_reporting_channel}}</span>, which accepts anonymous reports. If you are in immediate danger, contact emergency services (911) first.</p>\n<h2>4. How we investigate</h2>\n<p>Reports are acknowledged promptly (normally within <span class="mf">{{ack_period}}</span>), investigated fairly and impartially, and both parties are informed of the outcome, normally within <span class="mf">{{results_period}}</span> of the conclusion of the investigation.</p>\n<h2>5. Corrective actions</h2>\n<p>Where a complaint is substantiated, corrective action proportionate to the conduct will follow, consistent with <em>McKinley v. BC Tel</em>, 2001 SCC 38 where termination is considered.</p>\n<h2>6. Domestic violence</h2>\n<p>If you are experiencing domestic violence, we will take reasonable steps to keep you safe at work and help you access support, including statutory domestic-violence leave where applicable. Contact <span class="mf">{{hr_contact_name}}</span> confidentially.</p>\n<h2>7. Training and prevention</h2>\n<p>All employees and managers receive training on this policy at onboarding and annually thereafter. Workplace violence risks are assessed at least annually.</p>\n<h2>8. Third-party and client harassment</h2>\n<p>Harassment can come from clients, customers, contractors, or other third parties. Report it to your manager or <span class="mf">{{hr_contact_name}}</span>; you will not be penalized for refusing to tolerate abusive conduct.</p>\n<h2>9. Your statutory rights</h2>\n<p>Nothing in this policy limits your right to file a complaint with the human rights commission, the labour standards regulator, or the OHS regulator. For employees in Québec, a psychological harassment complaint may be filed with the CNESST within 2 years of the last incident.</p>\n<h2>10. Program review</h2>\n<p>This policy is reviewed at least annually and updated to reflect changes in the law. The current version is posted at <span class="mf">{{policy_url}}</span>.</p>',
}
