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
    readingMinutes: 4,
    updated: '2026-08-01',
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
        heading: bi(
          'Psychological harassment carries a standing obligation',
          'Le harcèlement psychologique impose une obligation permanente',
        ),
        blocks: [
          p(
            'Quebec was early to legislate expressly on psychological harassment, and the obligation sits in the labour standards regime rather than only in occupational health and safety. Employers are required to take reasonable steps to prevent it and, when it is brought to their attention, to make it stop. A written prevention and complaint-handling policy is required, and the framework expressly reaches conduct of a sexual nature.',
            'Le Québec a légiféré tôt et expressément sur le harcèlement psychologique, et l’obligation se trouve dans le régime des normes du travail plutôt que seulement en santé et sécurité du travail. Les employeurs doivent prendre les moyens raisonnables pour le prévenir et, lorsqu’il est porté à leur connaissance, le faire cesser. Une politique écrite de prévention et de traitement des plaintes est obligatoire, et le cadre vise expressément les conduites à caractère sexuel.',
          ),
          p(
            'An Ontario employer extending its existing harassment policy into Quebec usually needs more than a translation. The definitions, the recourse available to the employee, and the body that hears a complaint all differ, and a policy that describes an Ontario process to a Quebec employee is describing the wrong one.',
            'L’employeur ontarien qui étend sa politique de harcèlement existante au Québec a généralement besoin de plus qu’une traduction. Les définitions, le recours offert à l’employé et l’instance qui entend une plainte diffèrent tous, et une politique décrivant un processus ontarien à un employé québécois décrit le mauvais processus.',
          ),
        ],
      },
      {
        heading: bi(
          'Employee privacy is governed provincially',
          'La vie privée des employés relève du provincial',
        ),
        blocks: [
          p(
            'Quebec has its own private-sector privacy statute governing personal information, and it applies to employee data held by Quebec employers rather than leaving that field to the federal regime. Recent reform has strengthened it considerably, adding obligations around governance, transparency about how information is used, incident reporting, and individual rights.',
            'Le Québec dispose de sa propre loi sur la protection des renseignements personnels dans le secteur privé, et elle s’applique aux données des employés détenues par les employeurs québécois plutôt que de laisser ce champ au régime fédéral. Une réforme récente l’a considérablement renforcée, ajoutant des obligations de gouvernance, de transparence sur l’utilisation des renseignements, de déclaration des incidents et de droits individuels.',
          ),
          p(
            'For an employer running HR processes across provinces, the practical consequence is that Quebec employee records may be subject to requirements the same records would not attract elsewhere — including around how information is collected, how long it is kept, and what has to happen when confidentiality is breached. Confirm your obligations against the current statute rather than assuming a national privacy policy covers it.',
            'Pour un employeur qui exploite des processus RH dans plusieurs provinces, la conséquence pratique est que les dossiers d’employés québécois peuvent être assujettis à des exigences que les mêmes dossiers n’attireraient pas ailleurs — notamment quant à la collecte des renseignements, à leur durée de conservation et à ce qui doit survenir en cas d’atteinte à la confidentialité. Validez vos obligations au regard de la loi en vigueur plutôt que de présumer qu’une politique nationale de confidentialité y répond.',
          ),
        ],
      },
      {
        heading: bi('Before your first Quebec hire', 'Avant votre première embauche au Québec'),
        blocks: [
          li(
            'Have the employment documents prepared for Quebec rather than adapted from an Ontario set, and confirm the language in which they must be provided.',
            'Faites préparer les documents d’emploi pour le Québec plutôt que de les adapter d’un ensemble ontarien, et confirmez la langue dans laquelle ils doivent être remis.',
          ),
          li(
            'Register with the applicable provincial payroll and workplace programs before the first pay run rather than after it.',
            'Inscrivez-vous aux programmes provinciaux de paie et de milieu de travail applicables avant la première paie plutôt qu’après.',
          ),
          li(
            'Put the required psychological harassment policy in place and distribute it, keeping proof of distribution.',
            'Mettez en place la politique obligatoire contre le harcèlement psychologique et diffusez-la, en conservant la preuve de la diffusion.',
          ),
          li(
            "Review how you handle employee personal information against Quebec's privacy requirements specifically.",
            'Révisez votre traitement des renseignements personnels des employés au regard des exigences québécoises en matière de vie privée en particulier.',
          ),
          li(
            'Budget for advice from counsel practising in Quebec before the relationship starts, not at the point it ends.',
            'Prévoyez un budget pour l’avis d’un conseiller qui pratique au Québec avant le début de la relation, et non au moment où elle se termine.',
          ),
        ],
      },
      {
        heading: bi(
          'Ending employment under a civil-law contract',
          'Mettre fin à un emploi sous un contrat de droit civil',
        ),
        blocks: [
          p(
            "Quebec's employment contract is governed by the Civil Code, and the vocabulary that Ontario employers rely on does not map cleanly onto it. The Code frames the obligation as reasonable notice of termination, alongside the labour standards minimums, and it recognizes a serious reason as the basis for ending a contract without notice. An employer thinking in terms of common-law reasonable notice and just cause is reasoning about adjacent but distinct concepts.",
            'Le contrat de travail québécois est régi par le Code civil, et le vocabulaire sur lequel s’appuient les employeurs ontariens ne s’y transpose pas proprement. Le Code formule l’obligation comme un délai de congé raisonnable, en parallèle des minimums prévus par les normes du travail, et il reconnaît le motif sérieux comme fondement d’une résiliation sans délai de congé. L’employeur qui raisonne en préavis raisonnable de common law et en motif valable réfléchit à des concepts voisins mais distincts.',
          ),
          p(
            'The recourse against dismissal without good and sufficient cause sits on top of that and changes what is actually at stake. In Ontario the practical question at the end of most non-union relationships is how much notice is owed; in Quebec, for an employee with enough continuous service, the question can be whether the dismissal stands at all. Reinstatement is a live remedy rather than a theoretical one, which means the analysis has to happen before the decision rather than during a negotiation about its cost.',
            'Le recours contre le congédiement sans cause juste et suffisante s’y superpose et modifie ce qui est réellement en jeu. En Ontario, la question pratique à la fin de la plupart des relations non syndiquées est le montant du préavis dû; au Québec, pour un employé comptant suffisamment de service continu, la question peut être le maintien même du congédiement. La réintégration est un remède bien réel plutôt que théorique, ce qui signifie que l’analyse doit précéder la décision plutôt que d’accompagner une négociation sur son coût.',
          ),
          p(
            'The practical consequence for a multi-province employer is that a single national termination playbook will misprice Quebec departures. Build the Quebec path separately, and involve counsel practising there before the conversation happens rather than after a contestation is filed.',
            'La conséquence pratique pour un employeur multiprovincial est qu’un guide national unique de cessation d’emploi évaluera mal les départs québécois. Construisez le parcours québécois séparément, et faites intervenir un conseiller qui y pratique avant la conversation plutôt qu’après le dépôt d’une contestation.',
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
    readingMinutes: 4,
    updated: '2026-08-01',
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
        heading: bi(
          'What changes in practice if you are federal',
          'Ce qui change en pratique si vous êtes de compétence fédérale',
        ),
        blocks: [
          p(
            'The differences are not confined to termination. Nearly every recurring HR process has a federal counterpart that differs from the provincial one you may have built around:',
            'Les différences ne se limitent pas à la cessation d’emploi. Presque tous les processus RH récurrents ont un pendant fédéral qui diffère de celui, provincial, autour duquel vous avez peut-être bâti vos façons de faire :',
          ),
          li(
            'Hours of work, scheduling, breaks, and overtime follow federal rules, including notice requirements around schedule changes that have no provincial equivalent.',
            'La durée du travail, les horaires, les pauses et le temps supplémentaire suivent les règles fédérales, y compris des exigences d’avis en cas de modification d’horaire qui n’ont pas d’équivalent provincial.',
          ),
          li(
            'The leave catalogue is federal, with its own eligibility conditions and documentation limits.',
            'Le catalogue des congés est fédéral, avec ses propres conditions d’admissibilité et limites documentaires.',
          ),
          li(
            'Harassment and violence prevention runs under dedicated federal regulations, with prescribed steps for assessment, training, and resolution.',
            'La prévention du harcèlement et de la violence relève de règlements fédéraux dédiés, avec des étapes prescrites d’évaluation, de formation et de résolution.',
          ),
          li(
            'Employee personal information falls under PIPEDA, rather than under a provincial private-sector privacy statute.',
            'Les renseignements personnels des employés relèvent de la LPRPDE plutôt que d’une loi provinciale sur la protection des renseignements personnels dans le secteur privé.',
          ),
          li(
            'Pay-equity and employment-equity style obligations apply to federally regulated employers on their own terms and thresholds.',
            'Les obligations de type équité salariale et équité en matière d’emploi s’appliquent aux employeurs de compétence fédérale selon leurs propres modalités et seuils.',
          ),
        ],
      },
      {
        heading: bi(
          'Confirming your status, and mixed operations',
          'Confirmer votre statut, et les exploitations mixtes',
        ),
        blocks: [
          p(
            'Most employers can settle the question by describing what the business actually does and comparing it against the federal heads of power — but a surprising number sit near a line. A business can also have federally regulated and provincially regulated parts, where a distinct division carries on an activity that is federal in nature while the rest is not. Where that is the case, the two parts follow different rules, and treating the whole organization as one regime will be wrong for part of it.',
            'La plupart des employeurs peuvent trancher la question en décrivant ce que fait réellement l’entreprise et en la comparant aux chefs de compétence fédéraux — mais un nombre étonnant se trouvent près d’une frontière. Une entreprise peut aussi comporter des parties de compétence fédérale et d’autres de compétence provinciale, lorsqu’une division distincte exerce une activité de nature fédérale alors que le reste ne l’est pas. Dans ce cas, les deux parties suivent des règles différentes, et traiter toute l’organisation comme un seul régime sera erroné pour une partie d’entre elles.',
          ),
          p(
            'Corporate structure is not the answer either. Being federally incorporated does not make an employer federally regulated, and a great many federally incorporated businesses are provincially regulated for employment purposes. The determination follows the nature of the undertaking, and it is worth recording the reasoning in writing once it is made so it does not get relitigated informally each time a question arises.',
            'La structure corporative n’est pas non plus la réponse. Être constituée en société fédérale ne rend pas un employeur de compétence fédérale, et un très grand nombre d’entreprises à charte fédérale relèvent du provincial en matière d’emploi. La qualification suit la nature de l’entreprise, et il vaut la peine de consigner le raisonnement par écrit une fois la question tranchée, afin qu’elle ne soit pas réexaminée de façon informelle chaque fois qu’elle refait surface.',
          ),
        ],
      },
      {
        heading: bi(
          'The unjust-dismissal recourse in practice',
          'Le recours pour congédiement injuste en pratique',
        ),
        blocks: [
          p(
            'This is the difference that most changes how a federally regulated employer should think about ending employment. Eligible non-managerial employees with sufficient continuous service can bring a complaint that the dismissal was unjust, and the available remedies include reinstatement with compensation — an outcome most provincially regulated employers never have to contemplate for non-union staff.',
            'C’est la différence qui modifie le plus la façon dont un employeur de compétence fédérale devrait envisager la fin d’un emploi. Les employés non cadres admissibles comptant suffisamment de service continu peuvent déposer une plainte alléguant que le congédiement était injuste, et les remèdes offerts incluent la réintégration avec indemnisation — une issue que la plupart des employeurs de compétence provinciale n’ont jamais à envisager pour du personnel non syndiqué.',
          ),
          p(
            'Two consequences follow. First, paying notice does not necessarily resolve the exposure the way it typically would provincially: an employer that offers a generous package may still face a complaint seeking the job back. Second, the quality of the underlying record matters more, because the question being asked is whether the dismissal was justified rather than what it should cost. Performance documentation, progressive discipline, and a consistent stated reason carry more weight here than in a jurisdiction where the argument is about quantum.',
            'Deux conséquences en découlent. D’abord, verser un préavis ne règle pas nécessairement l’exposition comme ce serait généralement le cas au provincial : l’employeur qui offre une indemnité généreuse peut tout de même faire face à une plainte visant la reprise de l’emploi. Ensuite, la qualité du dossier sous-jacent compte davantage, car la question posée est de savoir si le congédiement était justifié plutôt que ce qu’il devrait coûter. La documentation du rendement, la discipline progressive et un motif invoqué constant y pèsent plus lourd que dans une compétence où le débat porte sur le montant.',
          ),
          p(
            'Genuine discontinuance of a function is treated differently from dismissal for cause or performance, which is why an accurate characterization of the reason — settled before the meeting and reflected consistently in the letter and the Record of Employment — matters as much here as anywhere.',
            'La suppression véritable d’une fonction est traitée différemment d’un congédiement pour motif ou pour rendement, d’où l’importance d’une qualification exacte du motif — arrêtée avant la rencontre et reflétée de façon cohérente dans la lettre et le relevé d’emploi — tout autant ici qu’ailleurs.',
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
    readingMinutes: 4,
    updated: '2026-08-01',
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
        heading: bi(
          'Write it so it can actually be followed',
          'Rédigez-la pour qu’elle puisse réellement être suivie',
        ),
        blocks: [
          p(
            'The most common drafting error is promising more process than the organization will deliver. A policy that commits to an investigation completed on a fixed timetable, an appeal to a committee that has never met, or a review cycle nobody owns creates a standard the employer will be measured against and will miss. Write what you will do, then do it.',
            'L’erreur de rédaction la plus courante consiste à promettre plus de processus que l’organisation n’en livrera. Une politique qui s’engage à une enquête terminée selon un échéancier fixe, à un appel devant un comité qui ne s’est jamais réuni ou à un cycle de révision dont personne n’est responsable crée une norme à l’aune de laquelle l’employeur sera évalué et à laquelle il faillira. Écrivez ce que vous ferez, puis faites-le.',
          ),
          p(
            'A workable policy states who it applies to, what conduct or situation it governs, what the employee is expected to do, what the employer will do in response, and who owns it by role. Anything beyond that tends to be either aspiration or legal text copied from a source that did not have your workplace in mind — and both dilute the parts that matter.',
            'Une politique viable indique à qui elle s’applique, quels comportements ou situations elle régit, ce qu’on attend de l’employé, ce que l’employeur fera en réponse, et qui en est responsable par fonction. Ce qui dépasse cela relève généralement soit de l’aspiration, soit d’un texte juridique copié d’une source qui n’avait pas votre milieu de travail en tête — et les deux diluent l’essentiel.',
          ),
        ],
      },
      {
        heading: bi(
          'Training and acknowledgement are part of the obligation',
          'La formation et l’accusé de réception font partie de l’obligation',
        ),
        blocks: [
          p(
            'For several of these policies the legislation requires not just a document but that workers be informed and, in some cases, trained. Distribution alone may not discharge that. Keep a record of who was trained, on what version, and when — and repeat it for new hires and after substantive revisions rather than treating it as a one-time exercise at launch.',
            'Pour plusieurs de ces politiques, la loi exige non seulement un document, mais aussi que les travailleurs soient informés et, dans certains cas, formés. La seule diffusion peut ne pas y satisfaire. Conservez un registre des personnes formées, sur quelle version et à quel moment — et répétez l’exercice pour les nouvelles embauches et après toute révision de fond plutôt que de le traiter comme une opération unique au lancement.',
          ),
          p(
            'Acknowledgements are worth collecting even where they are not strictly required, because they answer the question that comes up first in any dispute: did this person know? An unsigned acknowledgement is not fatal, but a documented distribution list with dates is considerably better than a recollection that the policy was on the intranet.',
            'Les accusés de réception valent la peine d’être recueillis même lorsqu’ils ne sont pas strictement exigés, car ils répondent à la question qui surgit en premier dans tout litige : cette personne le savait-elle? Un accusé non signé n’est pas fatal, mais une liste de diffusion documentée et datée vaut considérablement mieux que le souvenir que la politique se trouvait sur l’intranet.',
          ),
        ],
      },
      {
        heading: bi('Where policy meets discipline', 'Quand la politique rencontre la discipline'),
        blocks: [
          p(
            'Policies become consequential at the moment an employer relies on one to justify a decision. Two things determine whether that reliance holds: whether the employee knew the rule, and whether the employer has applied it consistently to others. Selective enforcement is one of the most reliable ways to convert a defensible decision into an indefensible one, because it supports the argument that the policy was a pretext rather than the reason.',
            'Les politiques deviennent déterminantes au moment où un employeur en invoque une pour justifier une décision. Deux éléments déterminent la solidité de cet appui : l’employé connaissait-il la règle, et l’employeur l’a-t-il appliquée de façon uniforme aux autres. L’application sélective est l’un des moyens les plus sûrs de transformer une décision défendable en décision indéfendable, car elle appuie l’argument que la politique servait de prétexte plutôt que de motif.',
          ),
          p(
            'Before relying on a policy breach, check that the version in force at the time said what you think it said, that the employee received it, and that comparable conduct by others was handled the same way. Where it was not, that is worth knowing before the decision rather than during a hearing about it.',
            'Avant d’invoquer un manquement à une politique, vérifiez que la version en vigueur à l’époque disait bien ce que vous croyez, que l’employé l’a reçue, et qu’une conduite comparable d’autres personnes a été traitée de la même manière. Si ce n’est pas le cas, mieux vaut le savoir avant la décision que pendant une audience à son sujet.',
          ),
        ],
      },
      {
        heading: bi(
          'A starting set for a growing employer',
          'Un ensemble de départ pour un employeur en croissance',
        ),
        blocks: [
          p(
            'Employers who are behind on this rarely benefit from trying to adopt everything at once. A more reliable approach is to put the required items in place first, in the order that exposure actually accrues, and to add the discretionary ones as the organization grows into them.',
            'Les employeurs en retard sur ce plan gagnent rarement à vouloir tout adopter d’un coup. Une approche plus fiable consiste à mettre d’abord en place les éléments obligatoires, dans l’ordre où l’exposition s’accumule réellement, puis à ajouter les éléments facultatifs à mesure que l’organisation y arrive.',
          ),
          li(
            'Start with harassment and violence prevention and with health and safety, because these are the most widely mandated and the most likely to be examined after an incident.',
            'Commencez par la prévention du harcèlement et de la violence et par la santé et sécurité, car ce sont les plus largement obligatoires et les plus susceptibles d’être examinées après un incident.',
          ),
          li(
            'Add accommodation and privacy next, since both govern processes you are already running whether or not they are written down.',
            'Ajoutez ensuite l’accommodement et la protection de la vie privée, puisque les deux régissent des processus que vous appliquez déjà, qu’ils soient consignés ou non.',
          ),
          li(
            'Then technology use and remote work, which mostly prevent disputes rather than satisfying a requirement — though some jurisdictions now mandate elements of both above a headcount threshold.',
            'Puis l’utilisation des technologies et le télétravail, qui préviennent surtout des différends plutôt que de satisfaire une exigence — bien que certaines compétences en imposent maintenant des éléments au-delà d’un seuil d’effectif.',
          ),
          li(
            'Re-run the exercise whenever headcount crosses a threshold that attaches new obligations, and whenever you begin employing someone in a new jurisdiction.',
            'Refaites l’exercice chaque fois que l’effectif franchit un seuil qui fait naître de nouvelles obligations, et chaque fois que vous commencez à employer quelqu’un dans une nouvelle compétence.',
          ),
          p(
            'Resist adopting a large borrowed handbook to close the gap quickly. It will describe processes you do not run, name roles you do not have, and reference legislation that may not govern you — and every one of those becomes a standard you have set for yourself in writing.',
            'Évitez d’adopter un vaste manuel emprunté pour combler rapidement l’écart. Il décrira des processus que vous n’appliquez pas, nommera des fonctions que vous n’avez pas et renverra à des lois qui ne vous régissent peut-être pas — et chacun de ces éléments devient une norme que vous vous êtes fixée par écrit.',
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
    readingMinutes: 4,
    updated: '2026-08-01',
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
        heading: bi(
          'Building a retention schedule that resolves the conflict',
          'Bâtir un calendrier de conservation qui règle le conflit',
        ),
        blocks: [
          p(
            'The way to reconcile the two obligations is to stop treating "the employee file" as a single object with a single lifespan. Break it into categories, and give each one a retention period derived from the rule that governs it:',
            'Pour concilier les deux obligations, il faut cesser de traiter « le dossier de l’employé » comme un objet unique doté d’une seule durée de vie. Découpez-le en catégories et attribuez à chacune une période de conservation issue de la règle qui la régit :',
          ),
          li(
            'Payroll and hours records, governed by employment standards and tax requirements, which typically run from the end of the employment or the tax year rather than from the date each entry was made.',
            'Les registres de paie et d’heures, régis par les normes d’emploi et les exigences fiscales, dont le décompte part généralement de la fin de l’emploi ou de l’année d’imposition plutôt que de la date de chaque inscription.',
          ),
          li(
            'Contractual documents, kept while any claim arising from them remains possible.',
            'Les documents contractuels, conservés tant qu’une réclamation en découlant demeure possible.',
          ),
          li(
            'Medical and accommodation material, held only as long as the accommodation and any related obligation continues, then disposed of on schedule.',
            'Le matériel médical et d’accommodement, conservé seulement tant que l’accommodement et toute obligation connexe se poursuivent, puis éliminé selon le calendrier.',
          ),
          li(
            'Investigation records, retained on their own basis given the possibility of later proceedings.',
            'Les dossiers d’enquête, conservés selon leur propre logique compte tenu de la possibilité de procédures ultérieures.',
          ),
          li(
            'Recruitment material for candidates who were not hired, which usually has the shortest justified life of anything on this list.',
            'Le matériel de recrutement des personnes candidates non retenues, dont la durée de vie justifiée est habituellement la plus courte de cette liste.',
          ),
          p(
            'Write the schedule down, assign an owner by role, and make disposal something that happens on a cycle rather than when storage runs short. A schedule that is applied inconsistently is harder to defend than a generous one applied uniformly, because the exceptions are what get examined.',
            'Consignez le calendrier par écrit, désignez un responsable par fonction, et faites de l’élimination une opération cyclique plutôt qu’une réaction au manque d’espace. Un calendrier appliqué de façon inégale est plus difficile à défendre qu’un calendrier généreux appliqué uniformément, car ce sont les exceptions qui sont examinées.',
          ),
        ],
      },
      {
        heading: bi(
          'Two things that override the schedule',
          'Deux éléments qui priment le calendrier',
        ),
        blocks: [
          p(
            'The first is a legal hold. Once a dispute is live or reasonably anticipated, routine disposal of anything touching it has to stop, even where the retention period has expired. Destroying relevant material after a claim is foreseeable is a materially worse problem than having kept it, and the fact that a scheduled process did it automatically is not much of an answer. Make sure whoever runs the disposal cycle can suspend it, and that someone is responsible for telling them to.',
            'Le premier est la suspension pour litige. Dès qu’un différend est en cours ou raisonnablement prévisible, l’élimination courante de tout élément s’y rapportant doit cesser, même si la période de conservation est expirée. Détruire du matériel pertinent alors qu’une réclamation est prévisible constitue un problème nettement plus grave que de l’avoir conservé, et le fait qu’un processus planifié l’ait fait automatiquement n’est guère une réponse. Assurez-vous que la personne qui exécute le cycle d’élimination puisse le suspendre, et que quelqu’un ait la responsabilité de le lui demander.',
          ),
          p(
            "The second is an employee's right to access their own information, which exists in some form under the privacy regime that applies to you. Requests tend to arrive at the least convenient moment, often alongside a dispute, and the response is easier when records are organized by person and category than when they are scattered across mailboxes and shared drives. Structuring the file well is what makes both obligations manageable at once.",
            'Le second est le droit de l’employé d’accéder à ses propres renseignements, qui existe sous une forme ou une autre dans le régime de protection de la vie privée qui vous est applicable. Les demandes arrivent souvent au moment le moins commode, fréquemment en parallèle d’un litige, et la réponse est plus simple lorsque les dossiers sont organisés par personne et par catégorie que lorsqu’ils sont éparpillés dans des boîtes de courriel et des lecteurs partagés. C’est la bonne structuration du dossier qui rend les deux obligations gérables en même temps.',
          ),
        ],
      },
      {
        heading: bi(
          'Records held in systems you do not own',
          'Des dossiers hébergés dans des systèmes qui ne vous appartiennent pas',
        ),
        blocks: [
          p(
            'Most employment records now live in software — payroll platforms, applicant tracking systems, shared drives, messaging tools. That does not move the obligation anywhere. The employer remains accountable for information it collects about its employees regardless of which vendor stores it, and a retention schedule that only governs the filing cabinet governs almost nothing.',
            'La plupart des dossiers d’emploi résident aujourd’hui dans des logiciels — plateformes de paie, systèmes de suivi des candidatures, lecteurs partagés, outils de messagerie. Cela ne déplace l’obligation nulle part. L’employeur demeure responsable des renseignements qu’il recueille sur ses employés, quel que soit le fournisseur qui les stocke, et un calendrier de conservation qui ne régit que le classeur ne régit à peu près rien.',
          ),
          li(
            'Know where each category of record actually lives, including copies that accumulate in mailboxes and chat history.',
            'Sachez où réside réellement chaque catégorie de dossier, y compris les copies qui s’accumulent dans les boîtes de courriel et les historiques de clavardage.',
          ),
          li(
            'Check what your agreement with each vendor says about retention, deletion, and what happens to the data if the relationship ends.',
            'Vérifiez ce que votre entente avec chaque fournisseur prévoit quant à la conservation, à la suppression et au sort des données si la relation prend fin.',
          ),
          li(
            'Confirm whether the applicable privacy regime constrains where information may be stored or processed, and whether you have to disclose that to employees.',
            'Confirmez si le régime de protection de la vie privée applicable encadre l’endroit où les renseignements peuvent être conservés ou traités, et si vous devez en informer les employés.',
          ),
          li(
            'Review access permissions on the same cycle as the retention schedule — access granted for a project and never revoked is the most common quiet exposure.',
            'Révisez les autorisations d’accès selon le même cycle que le calendrier de conservation — un accès accordé pour un projet et jamais révoqué est l’exposition discrète la plus courante.',
          ),
          li(
            "Make sure departing managers' files and notes are captured, rather than leaving the only record of a performance history in an individual's personal storage.",
            'Assurez-vous que les fichiers et notes des gestionnaires qui partent sont récupérés, plutôt que de laisser l’unique trace d’un historique de rendement dans l’espace personnel d’une personne.',
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
    readingMinutes: 4,
    updated: '2026-08-01',
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
        heading: bi(
          'Covering the work without eroding the job',
          'Assurer le travail sans éroder le poste',
        ),
        blocks: [
          p(
            "The operational problem is real: work has to continue while someone is away. The legal constraint is that the arrangements you make to cover it cannot quietly become permanent. Where a replacement is hired, engage them on terms that reflect the temporary nature of the assignment, and be explicit internally that the absent employee's position continues to exist.",
            'Le problème opérationnel est réel : le travail doit se poursuivre pendant l’absence d’une personne. La contrainte juridique est que les arrangements pris pour l’assurer ne peuvent devenir discrètement permanents. Lorsqu’un remplaçant est embauché, engagez-le à des conditions qui reflètent le caractère temporaire de l’affectation, et soyez explicite à l’interne sur le fait que le poste de l’employé absent continue d’exister.',
          ),
          p(
            'Where duties are redistributed to the existing team instead, keep a note of what moved and on what understanding. Responsibilities absorbed informally over a long absence have a way of never coming back, and the returning employee who finds their scope diminished has the makings of a claim that nobody intended to create.',
            'Lorsque les tâches sont plutôt redistribuées à l’équipe en place, notez ce qui a été déplacé et sur quelle base. Les responsabilités absorbées de façon informelle au cours d’une longue absence ont tendance à ne jamais revenir, et l’employé qui constate à son retour que son champ d’action est réduit détient les éléments d’une réclamation que personne n’a voulu créer.',
          ),
          p(
            'Restructuring during a leave is not prohibited, but it carries a heavy evidentiary burden. If a genuine business reorganization would have affected the position regardless of the absence, document that reasoning at the time the decision is made rather than assembling it afterwards.',
            'Une restructuration pendant un congé n’est pas interdite, mais elle comporte un lourd fardeau de preuve. Si une réorganisation d’affaires véritable aurait touché le poste indépendamment de l’absence, consignez ce raisonnement au moment de la décision plutôt que de le reconstituer par la suite.',
          ),
        ],
      },
      {
        heading: bi('Mistakes that recur', 'Des erreurs qui reviennent'),
        blocks: [
          li(
            'Requiring a diagnosis where the statute permits only confirmation of the need for leave.',
            'Exiger un diagnostic là où la loi ne permet que la confirmation du besoin de congé.',
          ),
          li(
            'Suspending benefit coverage automatically at the start of an unpaid leave without checking whether continuation is required.',
            'Suspendre automatiquement la couverture des avantages sociaux au début d’un congé non payé sans vérifier si le maintien est obligatoire.',
          ),
          li(
            'Counting a protected absence against an attendance-management program as though it were ordinary absenteeism.',
            'Comptabiliser une absence protégée dans un programme de gestion de l’assiduité comme s’il s’agissait d’absentéisme ordinaire.',
          ),
          li(
            "Applying one province's entitlement to an employee governed by another's, or by the federal regime.",
            'Appliquer le droit d’une province à un employé régi par celui d’une autre, ou par le régime fédéral.',
          ),
          li(
            'Treating a leave request as a performance signal, or letting it influence a review written during the absence.',
            'Traiter une demande de congé comme un signal de rendement, ou la laisser influencer une évaluation rédigée pendant l’absence.',
          ),
          li(
            'Losing track of the return date, so the employee comes back to no plan, no access, and no assigned work.',
            'Perdre de vue la date de retour, de sorte que l’employé revient sans plan, sans accès et sans travail assigné.',
          ),
        ],
      },
      {
        heading: bi(
          'Documenting a leave from request to return',
          'Documenter un congé, de la demande au retour',
        ),
        blocks: [
          p(
            'Leaves generate disputes long after they end, usually about what was agreed and when. The record that resolves them is built while the leave is running, and it is inexpensive to keep if someone owns it.',
            'Les congés engendrent des litiges bien après leur fin, généralement sur ce qui a été convenu et à quel moment. Le dossier qui les règle se constitue pendant le congé, et il coûte peu à tenir lorsque quelqu’un en est responsable.',
          ),
          p(
            'Record the request as it was made, including the date and the basis given, and confirm back in writing what leave is being taken, what documentation was requested, what happens to benefits and any top-up, and the expected return date. That single confirmation resolves most of what is later argued about, and it protects the employee as much as the employer.',
            'Consignez la demande telle qu’elle a été formulée, avec la date et le fondement invoqué, et confirmez par écrit quel congé est pris, quels documents ont été demandés, ce qu’il advient des avantages sociaux et de tout complément, ainsi que la date de retour prévue. Cette seule confirmation règle l’essentiel de ce qui sera plus tard contesté, et elle protège l’employé autant que l’employeur.',
          ),
          p(
            'Keep contact during the absence proportionate and purposeful. Operational updates and confirmation of return logistics are appropriate; pressure to return, requests for work, or repeated enquiries about progress are not, and they read badly afterwards. Diarize the return date, plan for it before it arrives, and confirm the arrangements in writing before the employee walks back in.',
            'Gardez un contact proportionné et utile pendant l’absence. Les mises à jour opérationnelles et la confirmation de la logistique du retour sont appropriées; les pressions pour revenir, les demandes de travail ou les questions répétées sur l’évolution de la situation ne le sont pas, et se lisent mal par la suite. Inscrivez la date de retour à l’agenda, préparez-la avant qu’elle n’arrive, et confirmez les modalités par écrit avant que l’employé ne revienne.',
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
    readingMinutes: 4,
    updated: '2026-08-01',
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
        heading: bi(
          'Running an investigation that stands up',
          'Mener une enquête qui tient la route',
        ),
        blocks: [
          p(
            'Most of what makes an investigation defensible is decided in its first stage, before any evidence is weighed. Settle the scope — what specific allegations are being examined — and put it in writing, because an investigation that drifts into unrelated territory becomes difficult to defend for everyone involved.',
            'L’essentiel de ce qui rend une enquête défendable se décide à sa première étape, avant toute appréciation de la preuve. Arrêtez la portée — quelles allégations précises sont examinées — et consignez-la, car une enquête qui dérive vers des sujets sans lien devient difficile à défendre pour toutes les personnes concernées.',
          ),
          li(
            'Choose an investigator with no stake in the outcome and no reporting relationship to either party, and consider an external investigator where seniority or complexity makes internal neutrality doubtful.',
            'Choisissez un enquêteur sans intérêt dans l’issue et sans lien hiérarchique avec l’une ou l’autre partie, et envisagez un enquêteur externe lorsque l’ancienneté ou la complexité rend la neutralité interne douteuse.',
          ),
          li(
            'Tell the respondent what is alleged in enough detail to answer it, and give them a genuine opportunity to respond.',
            'Informez la personne mise en cause de ce qui est allégué avec assez de détails pour y répondre, et donnez-lui une véritable occasion de le faire.',
          ),
          li(
            'Interview the people identified by both parties, not only those the complainant named.',
            'Interrogez les personnes désignées par les deux parties, et non seulement celles nommées par la personne plaignante.',
          ),
          li(
            'Take contemporaneous notes and keep the evidence you relied on, rather than only the conclusion you reached.',
            'Prenez des notes au fur et à mesure et conservez la preuve sur laquelle vous vous êtes appuyé, et non seulement la conclusion retenue.',
          ),
          li(
            'Apply a balance-of-probabilities standard and state findings as findings, without editorializing about either party.',
            'Appliquez la norme de la prépondérance des probabilités et énoncez les conclusions comme telles, sans commentaire éditorial sur l’une ou l’autre partie.',
          ),
          li(
            'Consider interim measures while the process runs — separation of duties or schedules — chosen so they do not penalize the complainant.',
            'Envisagez des mesures provisoires pendant le processus — séparation des tâches ou des horaires — choisies de manière à ne pas pénaliser la personne plaignante.',
          ),
        ],
      },
      {
        heading: bi('After the findings', 'Après les conclusions'),
        blocks: [
          p(
            'An investigation that concludes and then produces nothing is a familiar failure. Where conduct is substantiated, the response has to be proportionate and actually implemented, and where it is not substantiated, that outcome still needs to be communicated and the working relationship still needs attention. Both parties are generally entitled to know the outcome as it affects them, even where the full report is not shared.',
            'Une enquête qui se conclut sans rien produire est un échec bien connu. Lorsque la conduite est établie, la réponse doit être proportionnée et réellement mise en œuvre; lorsqu’elle ne l’est pas, cette issue doit tout de même être communiquée et la relation de travail requiert quand même de l’attention. Les deux parties ont généralement le droit de connaître l’issue dans la mesure où elle les touche, même si le rapport complet n’est pas communiqué.',
          ),
          p(
            'Close the loop on the systemic side as well. If the process surfaced a gap — a reporting route nobody knew about, a manager who did not escalate, a risk the assessment missed — record it and fix it. Prevention obligations are continuing rather than one-time, and a pattern of complaints handled individually without any change to the conditions that produced them is itself a finding waiting to be made.',
            'Bouclez également la boucle sur le plan systémique. Si le processus a révélé une lacune — une voie de signalement que personne ne connaissait, un gestionnaire qui n’a pas fait remonter l’information, un risque que l’évaluation a manqué — consignez-la et corrigez-la. Les obligations de prévention sont continues plutôt que ponctuelles, et une succession de plaintes traitées individuellement sans aucun changement aux conditions qui les ont engendrées constitue en soi une conclusion en attente d’être tirée.',
          ),
        ],
      },
      {
        heading: bi('Who and what the obligations reach', 'Qui et quoi les obligations visent'),
        blocks: [
          p(
            'Employers frequently scope these obligations too narrowly, applying them to direct employees during working hours at a company site. The frameworks generally reach further than that, and the gap is where incidents fall through.',
            'Les employeurs délimitent fréquemment ces obligations de façon trop étroite, en les appliquant aux employés directs, pendant les heures de travail, sur un site de l’entreprise. Les cadres vont généralement plus loin, et c’est dans cet écart que les incidents passent entre les mailles.',
          ),
          li(
            "Conduct by clients, customers, patients, contractors, and members of the public can engage the employer's prevention obligations toward its own workers.",
            'La conduite de clients, de patients, de sous-traitants et de membres du public peut engager les obligations de prévention de l’employeur envers ses propres travailleurs.',
          ),
          li(
            'Work-related conduct away from the workplace — travel, conferences, work social events — is commonly captured where there is a sufficient connection to the employment.',
            'La conduite liée au travail à l’extérieur du lieu de travail — déplacements, congrès, activités sociales professionnelles — est couramment visée lorsqu’il existe un lien suffisant avec l’emploi.',
          ),
          li(
            'Online conduct counts. Messaging platforms, email, and video calls are workplaces for this purpose, and remote arrangements do not narrow the obligation.',
            'La conduite en ligne compte. Les plateformes de messagerie, le courriel et les appels vidéo sont des milieux de travail à cette fin, et le télétravail ne restreint pas l’obligation.',
          ),
          li(
            'Domestic violence that follows an employee into the workplace triggers duties in several jurisdictions once the employer is aware of a risk.',
            'La violence conjugale qui suit un employé jusqu’au travail déclenche des obligations dans plusieurs compétences dès que l’employeur a connaissance d’un risque.',
          ),
          p(
            'Scope your risk assessment against how your people actually work rather than against an office floorplan, and make sure the reporting route is available to someone who is remote, on a client site, or working outside ordinary hours.',
            'Délimitez votre évaluation des risques en fonction de la façon dont vos gens travaillent réellement plutôt qu’en fonction d’un plan de bureau, et assurez-vous que la voie de signalement est accessible à une personne en télétravail, chez un client ou en dehors des heures habituelles.',
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
