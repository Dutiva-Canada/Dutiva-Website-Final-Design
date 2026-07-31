import { bi } from '@/i18n/core'
import { li, p } from './articleModel'
import type { Article } from './articleModel'

/**
 * `/blog/<slug>` (EN) and `/fr/blogue/<frSlug>` (FR).
 *
 * These topics are deliberately distinct from `guideArticles.ts`: the guides
 * cover the employment-law fundamentals (notice, probation, contracts,
 * accommodation, documentation), while the blog covers jurisdiction scope,
 * policy and record-keeping obligations, leaves, and harassment prevention.
 * Keeping the two sets disjoint is an SEO requirement, not a preference —
 * before this split both indexes listed the same six topics, and giving each
 * a URL would have shipped duplicate pages competing with one another.
 *
 * Same editorial rules as the guides (see `articleModel.ts`): concepts and
 * decision points, no published statutory figures, never legal advice.
 */
export const BLOG_ARTICLES: readonly Article[] = [
  {
    slug: 'quebec-employment-standards',
    frSlug: 'normes-du-travail-quebec',
    collection: 'blog',
    topic: bi('Jurisdictions', 'Compétences'),
    readingMinutes: 6,
    title: bi(
      'Quebec employment standards: what differs from Ontario',
      'Normes du travail au Québec : ce qui diffère de l’Ontario',
    ),
    summary: bi(
      'Quebec’s employment regime is not Ontario’s with different vocabulary. The differences that most often catch employers expanding into Quebec, and where to look them up.',
      'Le régime d’emploi québécois n’est pas celui de l’Ontario avec un autre vocabulaire. Les différences qui surprennent le plus souvent les employeurs qui s’implantent au Québec, et où les vérifier.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Employers expanding from Ontario into Quebec often assume the two provinces differ mainly in language of service. They differ in legal architecture. Quebec is a civil-law jurisdiction; its employment rules sit in the Act respecting labour standards alongside the Civil Code of Québec, and several of them have no Ontario equivalent at all. Treating a Quebec hire as an Ontario hire with translated paperwork is a reliable way to end up out of compliance.',
            'Les employeurs qui étendent leurs activités de l’Ontario au Québec présument souvent que les deux provinces diffèrent surtout par la langue de service. Elles diffèrent par l’architecture juridique. Le Québec est une compétence de droit civil; ses règles d’emploi se trouvent dans la Loi sur les normes du travail, en parallèle du Code civil du Québec, et plusieurs d’entre elles n’ont aucun équivalent ontarien. Traiter une embauche québécoise comme une embauche ontarienne avec des documents traduits est un moyen sûr de se retrouver en situation de non-conformité.',
          ),
        ],
      },
      {
        heading: bi(
          'Protection against dismissal without good and sufficient cause',
          'Protection contre le congédiement sans cause juste et suffisante',
        ),
        blocks: [
          p(
            'This is the largest structural difference. Once an employee has accumulated enough continuous service, Quebec provides a recourse against dismissal made without good and sufficient cause — a remedy that can include reinstatement. Ontario has no general equivalent for non-union employees, where the usual question is how much notice is owed rather than whether the dismissal may stand. An employer used to thinking in notice alone will misjudge Quebec risk substantially.',
            'C’est la plus grande différence structurelle. Une fois qu’un employé a accumulé suffisamment de service continu, le Québec offre un recours contre le congédiement fait sans cause juste et suffisante — un recours qui peut inclure la réintégration. L’Ontario n’a aucun équivalent général pour les employés non syndiqués, où la question habituelle est le montant du préavis dû plutôt que le maintien du congédiement. Un employeur habitué à raisonner uniquement en préavis évaluera très mal le risque québécois.',
          ),
        ],
      },
      {
        heading: bi('Language of work', 'Langue du travail'),
        blocks: [
          p(
            'Quebec regulates the language of the workplace itself, not just the language of consumer-facing material. Employment documents, internal communications, and the conditions under which another language may be required of a position are all governed. Requirements have been tightened in recent years and are tied to business size, so verify the current thresholds and obligations that apply to you rather than relying on what a colleague did some years ago.',
            'Le Québec encadre la langue du travail elle-même, et pas seulement celle des documents destinés aux consommateurs. Les documents d’emploi, les communications internes et les conditions permettant d’exiger une autre langue pour un poste sont tous visés. Les exigences ont été resserrées ces dernières années et varient selon la taille de l’entreprise; vérifiez donc les seuils et obligations en vigueur qui s’appliquent à vous plutôt que de vous fier à ce qu’un collègue a fait il y a quelques années.',
          ),
        ],
      },
      {
        heading: bi('Other differences worth checking', 'Autres différences à vérifier'),
        blocks: [
          li(
            'Statutory holidays are not the same list as Ontario’s, and the calculation of holiday pay differs.',
            'La liste des jours fériés n’est pas celle de l’Ontario, et le calcul de l’indemnité afférente diffère.',
          ),
          li(
            'Annual leave entitlements accrue on a different structure and reference period.',
            'Les droits au congé annuel s’accumulent selon une structure et une période de référence différentes.',
          ),
          li(
            'Psychological harassment obligations are expressly framed in the labour standards legislation, with a required policy.',
            'Les obligations en matière de harcèlement psychologique sont expressément prévues dans la législation sur les normes du travail, avec une politique obligatoire.',
          ),
          li(
            'Quebec has its own private-sector privacy regime, distinct from PIPEDA, with its own obligations for employee data.',
            'Le Québec a son propre régime de protection des renseignements personnels dans le secteur privé, distinct de la LPRPDE, avec ses propres obligations à l’égard des données des employés.',
          ),
          li(
            'Payroll deductions and provincial programs differ, including parental insurance.',
            'Les retenues à la source et les programmes provinciaux diffèrent, notamment l’assurance parentale.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Dutiva treats Quebec as its own jurisdiction rather than an Ontario variant, alongside Ontario and the federal regime. Jurisdiction-specific guidance narrows the questions worth asking; it does not answer them for your particular situation, and Quebec questions in particular reward advice from counsel practising there.',
            'Dutiva traite le Québec comme une compétence à part entière plutôt que comme une variante de l’Ontario, aux côtés de l’Ontario et du régime fédéral. Un accompagnement propre à la compétence resserre les questions à se poser; il n’y répond pas pour votre situation particulière, et les questions québécoises en particulier gagnent à être soumises à un conseiller qui y pratique.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'federally-regulated-workplaces',
    frSlug: 'entreprises-de-competence-federale',
    collection: 'blog',
    topic: bi('Jurisdictions', 'Compétences'),
    readingMinutes: 5,
    title: bi(
      'Is your workplace federally regulated?',
      'Votre entreprise est-elle de compétence fédérale?',
    ),
    summary: bi(
      'A small share of Canadian employers fall under the Canada Labour Code instead of provincial standards — and applying the wrong regime affects nearly every HR obligation you have.',
      'Une petite proportion d’employeurs canadiens relèvent du Code canadien du travail plutôt que des normes provinciales — et appliquer le mauvais régime touche presque toutes vos obligations RH.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Most Canadian employers are provincially regulated. A minority are federally regulated, and for them the Canada Labour Code — not the provincial employment standards statute — governs hours, leaves, termination, and much else. Because the two regimes differ meaningfully, an employer applying the wrong one is not slightly off; it is applying an entire body of rules that does not govern it.',
            'La plupart des employeurs canadiens relèvent de la compétence provinciale. Une minorité relèvent de la compétence fédérale, et pour eux, c’est le Code canadien du travail — et non la loi provinciale sur les normes d’emploi — qui régit les heures, les congés, la cessation d’emploi et bien d’autres aspects. Comme les deux régimes diffèrent sensiblement, l’employeur qui applique le mauvais n’est pas légèrement à côté : il applique tout un corpus de règles qui ne le régit pas.',
          ),
        ],
      },
      {
        heading: bi('It turns on the nature of the work', 'Tout dépend de la nature de l’activité'),
        blocks: [
          p(
            'Federal jurisdiction follows the type of undertaking, not the size of the company or where it is incorporated. It generally covers work that is interprovincial or international in nature, or that falls within specific federal heads of power. Sectors commonly captured include:',
            'La compétence fédérale suit le type d’entreprise, et non la taille de la société ni son lieu de constitution. Elle vise généralement les activités de nature interprovinciale ou internationale, ou qui relèvent de chefs de compétence fédéraux précis. Parmi les secteurs habituellement visés :',
          ),
          li(
            'Banking; interprovincial and international transportation; telecommunications and broadcasting.',
            'Les banques; le transport interprovincial et international; les télécommunications et la radiodiffusion.',
          ),
          li(
            'Air transport, shipping and navigation, and interprovincial pipelines.',
            'Le transport aérien, la navigation maritime et les pipelines interprovinciaux.',
          ),
          li(
            'Certain Crown corporations and undertakings declared to be for the general advantage of Canada.',
            'Certaines sociétés d’État et entreprises déclarées à l’avantage général du Canada.',
          ),
          p(
            'The hard cases are businesses that serve a federally regulated undertaking without obviously being one — a contractor whose work is essential and integral to a federal operation may be pulled into federal jurisdiction on that basis. This is a legal determination, and where it is genuinely unclear it is worth getting an opinion rather than choosing the answer that is administratively easier.',
            'Les cas difficiles sont les entreprises qui desservent une entreprise fédérale sans en être une de façon évidente — un sous-traitant dont le travail est essentiel et fait partie intégrante d’une exploitation fédérale peut, à ce titre, être assujetti à la compétence fédérale. Il s’agit d’une qualification juridique et, lorsqu’elle est réellement incertaine, mieux vaut obtenir un avis que de retenir la réponse administrativement plus commode.',
          ),
        ],
      },
      {
        heading: bi('Why the answer matters so much', 'Pourquoi la réponse compte autant'),
        blocks: [
          p(
            'The Canada Labour Code contains an unjust-dismissal recourse for eligible non-managerial employees that has no counterpart in most provincial standards legislation, and it can lead to reinstatement. Leave entitlements, hours-of-work rules, and the harassment and violence prevention framework are federal as well, and privacy for federally regulated employers falls under PIPEDA with respect to employee personal information. Getting the jurisdiction wrong therefore misroutes not one obligation but nearly all of them.',
            'Le Code canadien du travail prévoit pour les employés non cadres admissibles un recours en cas de congédiement injuste qui n’a pas d’équivalent dans la plupart des lois provinciales sur les normes, et qui peut mener à la réintégration. Les droits aux congés, les règles sur la durée du travail et le cadre de prévention du harcèlement et de la violence sont eux aussi fédéraux, et la protection de la vie privée pour les employeurs de compétence fédérale relève de la LPRPDE en ce qui concerne les renseignements personnels des employés. Se tromper de compétence achemine donc mal non pas une obligation, mais presque toutes.',
          ),
        ],
      },
      {
        heading: bi('Remote workers do not change it', 'Le télétravail n’y change rien'),
        blocks: [
          p(
            'An employee working from home in another province does not convert a federally regulated employer into a provincially regulated one, or the reverse. Jurisdiction follows the undertaking. Remote arrangements can still raise practical questions about which provincial rules touch the employee in other respects, so treat the jurisdictional question and the location question as separate.',
            'Un employé qui travaille depuis son domicile dans une autre province ne transforme pas un employeur de compétence fédérale en employeur de compétence provinciale, ni l’inverse. La compétence suit l’entreprise. Le télétravail peut tout de même soulever des questions pratiques sur les règles provinciales qui touchent l’employé à d’autres égards; traitez donc la question de la compétence et celle du lieu comme distinctes.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'If you have never confirmed which regime governs you, confirm it now rather than at the point of a dispute. Dutiva supports Ontario, Quebec, and the federal regime, and asks you to set the jurisdiction explicitly for exactly this reason — but the determination itself is a legal question about your business.',
            'Si vous n’avez jamais confirmé quel régime vous régit, faites-le maintenant plutôt qu’au moment d’un litige. Dutiva prend en charge l’Ontario, le Québec et le régime fédéral, et vous demande de préciser explicitement la compétence pour cette raison même — mais la qualification elle-même est une question juridique portant sur votre entreprise.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'workplace-policies-canada',
    frSlug: 'politiques-en-milieu-de-travail',
    collection: 'blog',
    topic: bi('Policies', 'Politiques'),
    readingMinutes: 5,
    title: bi(
      'Workplace policies Canadian employers are expected to maintain',
      'Politiques que les employeurs canadiens doivent tenir à jour',
    ),
    summary: bi(
      'Which written policies are actually required rather than merely advisable, and why an unmaintained policy can be worse for an employer than none at all.',
      'Quelles politiques écrites sont réellement obligatoires plutôt que simplement souhaitables, et pourquoi une politique non tenue à jour peut nuire davantage à un employeur que l’absence de politique.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Employers tend to treat policies as a compliance chore — write them once, file them, move on. Regulators and adjudicators treat them as evidence of how a workplace actually operates. That gap is where the risk lives, because a policy you have not followed can be used to establish the standard you set for yourself and then failed to meet.',
            'Les employeurs tendent à considérer les politiques comme une corvée de conformité : les rédiger une fois, les classer, passer à autre chose. Les organismes de réglementation et les décideurs y voient une preuve du fonctionnement réel du milieu de travail. C’est dans cet écart que réside le risque, car une politique que vous n’avez pas suivie peut servir à établir la norme que vous vous êtes vous-même fixée sans la respecter.',
          ),
        ],
      },
      {
        heading: bi('Commonly required in writing', 'Fréquemment obligatoires par écrit'),
        blocks: [
          p(
            'The exact list depends on your jurisdiction, your sector, and often your headcount, but these recur across Canadian regimes:',
            'La liste exacte dépend de votre compétence, de votre secteur et souvent de votre effectif, mais celles-ci reviennent d’un régime canadien à l’autre :',
          ),
          li(
            'Workplace harassment and violence prevention, including a stated complaint and investigation procedure.',
            'Prévention du harcèlement et de la violence en milieu de travail, incluant une procédure énoncée de plainte et d’enquête.',
          ),
          li(
            'Occupational health and safety, matched to the real hazards of the work performed.',
            'Santé et sécurité au travail, adaptée aux risques réels du travail effectué.',
          ),
          li(
            'Accessibility and accommodation, including how an employee asks for one.',
            'Accessibilité et accommodement, y compris la façon dont un employé en fait la demande.',
          ),
          li(
            'Privacy governing employee personal information, under the regime that applies to you.',
            'Protection des renseignements personnels des employés, selon le régime qui vous est applicable.',
          ),
          li(
            'Disconnecting from work and electronic monitoring, where your jurisdiction requires them at your size.',
            'Déconnexion du travail et surveillance électronique, lorsque votre compétence les exige pour votre taille d’entreprise.',
          ),
        ],
      },
      {
        heading: bi(
          'A stale policy is a liability, not a formality',
          'Une politique périmée est un risque, non une formalité',
        ),
        blocks: [
          p(
            'Three failure modes account for most of the trouble. The policy names a role or a person who no longer exists, so a complaint has nowhere to go. The policy describes a process the organization has quietly stopped following, so every departure from it looks deliberate. Or the policy was updated but never redistributed, so the version employees hold is the old one — and that is generally the version that governs their expectations.',
            'Trois modes de défaillance expliquent l’essentiel des problèmes. La politique nomme un rôle ou une personne qui n’existe plus, de sorte qu’une plainte n’a nulle part où aller. La politique décrit un processus que l’organisation a discrètement cessé de suivre, de sorte que chaque écart paraît délibéré. Ou encore la politique a été mise à jour sans être rediffusée, de sorte que la version détenue par les employés est l’ancienne — et c’est généralement celle qui régit leurs attentes.',
          ),
        ],
      },
      {
        heading: bi('Make the maintenance routine', 'Faites de l’entretien une routine'),
        blocks: [
          li(
            'Review policies on a set schedule and record the date of each review, even when nothing changes.',
            'Révisez les politiques selon un calendrier établi et consignez la date de chaque révision, même sans modification.',
          ),
          li(
            'Redistribute after any substantive change and keep dated acknowledgements.',
            'Rediffusez après toute modification de fond et conservez des accusés de réception datés.',
          ),
          li(
            'Name roles rather than individuals, so ordinary turnover does not invalidate the document.',
            'Nommez des rôles plutôt que des personnes, afin qu’un roulement normal n’invalide pas le document.',
          ),
          li(
            'Keep superseded versions — you may need to show what applied at a particular time.',
            'Conservez les versions antérieures — vous pourriez devoir démontrer ce qui s’appliquait à un moment donné.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Confirm which policies are mandatory for your jurisdiction, sector, and size — the thresholds change and several were added in recent years. Dutiva can hold your policy set and track when each was last reviewed; deciding which ones the law requires of you remains a question for counsel.',
            'Confirmez quelles politiques sont obligatoires selon votre compétence, votre secteur et votre taille — les seuils évoluent et plusieurs ont été ajoutés ces dernières années. Dutiva peut héberger votre corpus de politiques et suivre la date de la dernière révision de chacune; déterminer lesquelles la loi vous impose demeure une question pour un conseiller juridique.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'employment-record-keeping',
    frSlug: 'conservation-des-dossiers-demploi',
    collection: 'blog',
    topic: bi('Records', 'Dossiers'),
    readingMinutes: 5,
    title: bi(
      'Employment record-keeping and retention in Canada',
      'Tenue et conservation des dossiers d’emploi au Canada',
    ),
    summary: bi(
      'Employers are required to keep certain employment records — and separately required not to keep personal information longer than they need it. Reconciling the two.',
      'Les employeurs doivent conserver certains dossiers d’emploi — et doivent par ailleurs ne pas conserver de renseignements personnels plus longtemps que nécessaire. Comment concilier les deux.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Record-keeping pulls in two directions at once. Employment standards legislation requires employers to keep specified records for a set period. Privacy law requires that personal information not be retained beyond the purpose it was collected for. Employers who notice only the first obligation accumulate everything forever; employers who notice only the second delete material they were required to hold. Both are compliance failures.',
            'La tenue de dossiers tire dans deux directions à la fois. La législation sur les normes d’emploi oblige les employeurs à conserver des documents précis pendant une période déterminée. Les lois sur la protection de la vie privée exigent que les renseignements personnels ne soient pas conservés au-delà de la fin pour laquelle ils ont été recueillis. L’employeur qui ne voit que la première obligation accumule tout indéfiniment; celui qui ne voit que la seconde supprime des documents qu’il devait conserver. Les deux constituent des manquements.',
          ),
        ],
      },
      {
        heading: bi('What generally has to be kept', 'Ce qui doit généralement être conservé'),
        blocks: [
          li(
            'Identifying and start-date information for each employee.',
            'Les renseignements d’identification et la date d’entrée en fonction de chaque employé.',
          ),
          li(
            'Hours worked, wages paid, and the deductions applied.',
            'Les heures travaillées, les salaires versés et les retenues appliquées.',
          ),
          li(
            'Vacation and holiday entitlements taken and owing.',
            'Les droits aux vacances et aux jours fériés pris et à payer.',
          ),
          li(
            'Leaves taken, and any agreements about hours or overtime arrangements.',
            'Les congés pris, ainsi que toute entente sur les heures ou les modalités de temps supplémentaire.',
          ),
          li(
            'Records relating to the end of employment, including what was paid and when.',
            'Les documents relatifs à la fin d’emploi, y compris ce qui a été payé et à quel moment.',
          ),
          p(
            'Retention periods and the precise list vary by jurisdiction, and payroll and tax records carry their own separate requirements. Look up the periods that apply to you rather than adopting a single number for everything.',
            'Les périodes de conservation et la liste exacte varient selon la compétence, et les documents de paie et fiscaux comportent leurs propres exigences distinctes. Vérifiez les périodes qui vous sont applicables plutôt que d’adopter un chiffre unique pour tout.',
          ),
        ],
      },
      {
        heading: bi(
          'Keep the record findable, not just stored',
          'Rendez le dossier repérable, pas seulement stocké',
        ),
        blocks: [
          p(
            'A retained record you cannot locate provides no protection. Inspections and claims arrive with deadlines, and an employer who cannot produce the relevant file within them is in much the same position as one who never kept it. Structure matters more than volume: one place per employee, consistent naming, and a clear rule about what belongs in the personnel file versus a manager’s own notes.',
            'Un dossier conservé mais introuvable n’offre aucune protection. Les inspections et les réclamations arrivent avec des délais, et l’employeur incapable de produire le dossier pertinent dans ces délais se trouve à peu près dans la même position que celui qui ne l’a jamais conservé. La structure compte plus que le volume : un seul emplacement par employé, une nomenclature uniforme et une règle claire sur ce qui appartient au dossier du personnel par opposition aux notes personnelles d’un gestionnaire.',
          ),
        ],
      },
      {
        heading: bi(
          'Sensitive categories need tighter handling',
          'Les catégories sensibles exigent un traitement plus strict',
        ),
        blocks: [
          p(
            'Medical and accommodation information should be held separately from the general personnel file, with access limited to those who genuinely need it. The same applies to investigation material about harassment or misconduct. Over-broad internal access to these categories is a common finding against employers and is straightforward to avoid at the point where the file is set up.',
            'Les renseignements médicaux et d’accommodement devraient être conservés à part du dossier du personnel général, avec un accès limité aux personnes qui en ont véritablement besoin. Il en va de même du matériel d’enquête portant sur le harcèlement ou l’inconduite. Un accès interne trop large à ces catégories est un reproche fréquemment formulé aux employeurs et se prévient aisément au moment de la création du dossier.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Write down a retention schedule that reflects both obligations, apply it consistently, and suspend deletion for anything touched by a live or reasonably anticipated dispute. Dutiva keeps generated documents and their history in one place; the retention decisions themselves stay yours.',
            'Établissez par écrit un calendrier de conservation qui reflète les deux obligations, appliquez-le de façon uniforme et suspendez toute suppression visant un élément touché par un litige en cours ou raisonnablement prévisible. Dutiva regroupe en un seul endroit les documents générés et leur historique; les décisions de conservation, elles, vous appartiennent.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'job-protected-leaves',
    frSlug: 'conges-proteges',
    collection: 'blog',
    topic: bi('Leaves', 'Congés'),
    readingMinutes: 5,
    title: bi(
      'Job-protected leaves across Canadian jurisdictions',
      'Congés protégés dans les compétences canadiennes',
    ),
    summary: bi(
      'Job protection, income replacement, and benefit continuation are three separate questions. Employers get into trouble by answering only one of them.',
      'La protection de l’emploi, le remplacement du revenu et le maintien des avantages sociaux sont trois questions distinctes. Les employeurs s’exposent en n’en traitant qu’une seule.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Every Canadian jurisdiction provides a set of job-protected leaves — parental, medical, family caregiving, bereavement, domestic violence, and others. The names, durations, and eligibility rules differ between provinces and under the federal regime, and the list has grown in most jurisdictions over the past several years.',
            'Chaque compétence canadienne prévoit un ensemble de congés protégés — parentaux, médicaux, pour proche aidant, de deuil, en cas de violence conjugale, et autres. Les appellations, les durées et les critères d’admissibilité varient d’une province à l’autre et sous le régime fédéral, et la liste s’est allongée dans la plupart des compétences ces dernières années.',
          ),
        ],
      },
      {
        heading: bi('Three questions, not one', 'Trois questions, pas une'),
        blocks: [
          p(
            'Employers routinely collapse these into a single "is this leave paid?" conversation. Separate them:',
            'Les employeurs réduisent régulièrement ces enjeux à une seule question : « ce congé est-il payé? ». Distinguez-les :',
          ),
          li(
            'Job protection — the employee’s right to take the leave and return to their position. This comes from employment standards legislation.',
            'La protection de l’emploi — le droit de l’employé de prendre le congé et de revenir à son poste. Elle découle de la législation sur les normes d’emploi.',
          ),
          li(
            'Income replacement — usually a separate government program rather than an employer obligation, with its own eligibility rules.',
            'Le remplacement du revenu — habituellement un programme gouvernemental distinct plutôt qu’une obligation de l’employeur, avec ses propres critères d’admissibilité.',
          ),
          li(
            'Benefit continuation — whether coverage carries on during the leave, which is often required and is frequently overlooked.',
            'Le maintien des avantages sociaux — la poursuite ou non de la couverture pendant le congé, souvent obligatoire et fréquemment négligée.',
          ),
          p(
            'A leave being unpaid by the employer does not mean the employee is unprotected, and it does not suspend the employer’s other obligations.',
            'Le fait qu’un congé ne soit pas payé par l’employeur ne signifie pas que l’employé n’est pas protégé, ni que les autres obligations de l’employeur sont suspendues.',
          ),
        ],
      },
      {
        heading: bi(
          'Return to work is part of the leave',
          'Le retour au travail fait partie du congé',
        ),
        blocks: [
          p(
            'The right to reinstatement is the substance of job protection. An employee returning from a protected leave is generally entitled to their former position, or a comparable one, at no less than their former rate. Reorganizing around someone’s absence and presenting a diminished role on their return is a well-worn path to a constructive dismissal or reprisal claim, and the timing alone invites scrutiny.',
            'Le droit à la réintégration est le cœur de la protection de l’emploi. L’employé qui revient d’un congé protégé a généralement droit à son ancien poste, ou à un poste comparable, à un taux au moins équivalent. Réorganiser le travail autour de l’absence d’une personne et lui présenter un rôle diminué à son retour est un chemin bien connu vers une réclamation pour congédiement déguisé ou représailles, et le seul moment choisi appelle l’examen.',
          ),
        ],
      },
      {
        heading: bi(
          'Where leave meets the duty to accommodate',
          'Quand le congé rencontre l’obligation d’accommodement',
        ),
        blocks: [
          p(
            'Statutory leave and the duty to accommodate are separate obligations that frequently apply to the same absence, and exhausting one does not discharge the other. An employee who reaches the end of a medical leave entitlement may still be owed accommodation on human-rights grounds — a graduated return, modified duties, or further time — assessed on its own footing up to undue hardship.',
            'Le congé prévu par la loi et l’obligation d’accommodement sont des obligations distinctes qui s’appliquent souvent à la même absence, et épuiser l’une ne libère pas de l’autre. L’employé qui atteint la fin de son droit à un congé médical peut encore avoir droit à un accommodement fondé sur les droits de la personne — un retour progressif, des tâches modifiées ou du temps additionnel — évalué pour lui-même jusqu’au point de contrainte excessive.',
          ),
          p(
            'Treating the end of a statutory leave as an automatic decision point about continued employment is one of the more consequential mistakes in this area, because it converts a leave question into a termination question without the analysis the second one requires.',
            'Considérer la fin d’un congé légal comme un point de décision automatique sur le maintien de l’emploi est l’une des erreurs les plus lourdes de conséquences dans ce domaine, car elle transforme une question de congé en question de cessation d’emploi sans l’analyse qu’exige la seconde.',
          ),
        ],
      },
      {
        heading: bi('Practical handling', 'Gestion pratique'),
        blocks: [
          li(
            'Confirm which jurisdiction’s leave rules apply before quoting any entitlement to an employee.',
            'Confirmez quelles règles de congé s’appliquent avant d’annoncer un droit quelconque à un employé.',
          ),
          li(
            'Request only the documentation the statute permits — many leaves limit what you may ask for.',
            'N’exigez que les documents permis par la loi — de nombreux congés limitent ce que vous pouvez demander.',
          ),
          li(
            'Record the dates, the basis of the leave, and what was communicated about the return.',
            'Consignez les dates, le fondement du congé et ce qui a été communiqué au sujet du retour.',
          ),
          li(
            'Keep benefit administration aligned with the leave rather than defaulting to suspension.',
            'Alignez l’administration des avantages sociaux sur le congé plutôt que de les suspendre par défaut.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Because leave entitlements change often and vary by jurisdiction, verify the current rules for the specific leave and jurisdiction in front of you rather than relying on internal precedent. This article is orientation, not entitlement advice.',
            'Comme les droits aux congés évoluent souvent et varient selon la compétence, vérifiez les règles en vigueur pour le congé et la compétence en cause plutôt que de vous fier à un précédent interne. Ce texte sert de repère, non d’avis sur vos obligations.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'harassment-prevention-obligations',
    frSlug: 'prevention-du-harcelement',
    collection: 'blog',
    topic: bi('Workplace safety', 'Sécurité au travail'),
    readingMinutes: 6,
    title: bi(
      'Workplace harassment and violence prevention obligations',
      'Obligations de prévention du harcèlement et de la violence au travail',
    ),
    summary: bi(
      'Prevention obligations are procedural: a written policy, an assessment, training, and an investigation process you actually run when a complaint arrives.',
      'Les obligations de prévention sont de nature procédurale : une politique écrite, une évaluation, de la formation et un processus d’enquête réellement appliqué lorsqu’une plainte survient.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Every Canadian jurisdiction imposes harassment and violence prevention obligations on employers, though they are framed differently — in occupational health and safety legislation in some places, in labour standards in Quebec, and in dedicated regulations for federally regulated workplaces. What they share is that the obligations are largely procedural. You are required to have a process and to follow it.',
            'Chaque compétence canadienne impose aux employeurs des obligations de prévention du harcèlement et de la violence, bien qu’elles soient formulées différemment — dans la législation sur la santé et la sécurité au travail à certains endroits, dans les normes du travail au Québec, et dans des règlements dédiés pour les milieux de travail de compétence fédérale. Leur point commun est que ces obligations sont largement procédurales. Vous devez avoir un processus et le suivre.',
          ),
        ],
      },
      {
        heading: bi('The common building blocks', 'Les composantes communes'),
        blocks: [
          li(
            'A written policy that defines the conduct covered and is communicated to workers.',
            'Une politique écrite qui définit les comportements visés et qui est communiquée aux travailleurs.',
          ),
          li(
            'An assessment of the risks specific to your workplace, revisited as conditions change.',
            'Une évaluation des risques propres à votre milieu de travail, revue lorsque les conditions changent.',
          ),
          li(
            'Training so that workers and managers know what the policy requires of them.',
            'De la formation pour que les travailleurs et les gestionnaires sachent ce que la politique exige d’eux.',
          ),
          li(
            'A reporting route that does not require going through the person complained about.',
            'Une voie de signalement qui n’oblige pas à passer par la personne visée par la plainte.',
          ),
          li(
            'An investigation process, and a way to communicate outcomes to those involved.',
            'Un processus d’enquête, et un moyen de communiquer les résultats aux personnes concernées.',
          ),
        ],
      },
      {
        heading: bi(
          'Investigation is where employers most often fall short',
          'C’est à l’étape de l’enquête que les employeurs faillissent le plus souvent',
        ),
        blocks: [
          p(
            'The duty to investigate is generally triggered by awareness of a possible incident, not by a formal written complaint. An employer who hears about conduct informally and waits for paperwork has often already failed the obligation. Investigations must also be conducted by someone without a stake in the outcome — which frequently means someone outside the reporting line of the person complained about, and sometimes someone outside the organization.',
            'L’obligation d’enquêter naît généralement de la connaissance d’un incident possible, et non d’une plainte écrite formelle. L’employeur qui entend parler d’un comportement de manière informelle et attend un document a souvent déjà manqué à son obligation. Les enquêtes doivent aussi être menées par une personne sans intérêt dans l’issue — ce qui signifie fréquemment une personne hors de la ligne hiérarchique du mis en cause, et parfois une personne de l’extérieur de l’organisation.',
          ),
          p(
            'Findings can be adverse to an employer even where the underlying conduct is never substantiated, purely because the response was inadequate. The process is assessed on its own terms.',
            'Des conclusions peuvent être défavorables à l’employeur même si le comportement allégué n’est jamais établi, uniquement parce que la réponse a été inadéquate. Le processus est évalué pour lui-même.',
          ),
        ],
      },
      {
        heading: bi('Confidentiality and reprisal', 'Confidentialité et représailles'),
        blocks: [
          p(
            'Keep investigation material confidential and limited to those who need it, while recognizing that participants are generally entitled to know enough about the outcome as it affects them. Reprisal against someone who reports or participates is separately prohibited, and post-complaint changes to schedules, duties, or reporting lines will be read in that light — so document the independent business reason before making one, or wait.',
            'Gardez le matériel d’enquête confidentiel et limité aux personnes qui en ont besoin, tout en reconnaissant que les participants ont généralement le droit d’en savoir assez sur l’issue dans la mesure où elle les touche. Les représailles contre une personne qui signale ou participe sont interdites séparément, et les changements d’horaire, de tâches ou de lien hiérarchique survenant après une plainte seront interprétés sous cet angle — documentez donc le motif d’affaires indépendant avant d’en faire un, ou attendez.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Confirm the specific requirements for your jurisdiction and sector, and review your policy against them rather than against a generic template. Serious complaints warrant advice early — the decisions made in the first days of an investigation are the ones most often scrutinized later.',
            'Confirmez les exigences précises applicables à votre compétence et à votre secteur, et révisez votre politique en fonction de celles-ci plutôt que d’un modèle générique. Les plaintes graves justifient un avis dès le départ — les décisions prises dans les premiers jours d’une enquête sont celles qui font le plus souvent l’objet d’un examen ultérieur.',
          ),
        ],
      },
    ],
  },
] as const
