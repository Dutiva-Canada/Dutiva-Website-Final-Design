import { bi } from '@/i18n/core'
import { li, p } from './articleModel'
import type { Article } from './articleModel'

/**
 * `/guides/<slug>` (EN) and `/fr/guides/<frSlug>` (FR) — evergreen reference
 * guides for Canadian employers. See `articleModel.ts` for the editorial rules
 * these follow, in particular the deliberate absence of statutory figures.
 *
 * `/guides/template-usage` is a separate registry route (a product how-to
 * rather than an employment-law guide), so `template-usage` must never appear
 * as a slug here — the static route would shadow it.
 */
export const GUIDE_ARTICLES: readonly Article[] = [
  {
    slug: 'ontario-termination-notice',
    frSlug: 'preavis-de-cessation-demploi-ontario',
    collection: 'guide',
    topic: bi('Termination', 'Cessation d’emploi'),
    readingMinutes: 6,
    title: bi(
      'Ontario termination notice requirements',
      'Exigences de préavis de cessation d’emploi en Ontario',
    ),
    summary: bi(
      'How statutory notice, pay in lieu, and severance fit together for Ontario employers — and why the Employment Standards Act is a floor rather than a ceiling.',
      'Comment s’articulent le préavis légal, l’indemnité en tenant lieu et l’indemnité de licenciement pour les employeurs ontariens — et pourquoi la Loi sur les normes d’emploi est un plancher et non un plafond.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Ending employment in Ontario engages at least two separate sources of obligation, and confusing them is the most common and most expensive mistake employers make. The Employment Standards Act, 2000 sets statutory minimums. The common law — judge-made contract law — may require considerably more unless the employment contract validly limits it.',
            'Mettre fin à un emploi en Ontario met en jeu au moins deux sources d’obligations distinctes, et les confondre est l’erreur la plus fréquente et la plus coûteuse des employeurs. La Loi de 2000 sur les normes d’emploi établit des minimums légaux. La common law — le droit des contrats élaboré par les tribunaux — peut exiger beaucoup plus, à moins que le contrat de travail ne limite validement cette obligation.',
          ),
        ],
      },
      {
        heading: bi(
          'Statutory notice is a floor, not a ceiling',
          'Le préavis légal est un plancher, pas un plafond',
        ),
        blocks: [
          p(
            'The ESA entitles most non-union employees to a minimum period of written notice of termination, scaling with length of service. That minimum is exactly that — a minimum. An employee whose contract does not clearly and enforceably limit them to the statutory floor is generally entitled to common-law reasonable notice instead, which is assessed case by case and is frequently far longer.',
            'La LNE donne à la plupart des employés non syndiqués droit à une période minimale de préavis écrit de cessation d’emploi, proportionnelle à la durée du service. Ce minimum n’est rien de plus qu’un minimum. L’employé dont le contrat ne le limite pas clairement et validement au plancher légal a généralement droit au préavis raisonnable de la common law, évalué au cas par cas et souvent bien plus long.',
          ),
          p(
            'Ontario courts have repeatedly struck down termination clauses that fall short of the ESA in any respect — including in parts of the clause the employer never sought to rely on. When a clause fails, it usually fails entirely, and the employee falls back to common-law notice. This is why the drafting of the contract, years before any termination, so often decides the cost of it.',
            'Les tribunaux ontariens ont invalidé à répétition des clauses de cessation d’emploi qui ne respectent pas la LNE sous quelque aspect que ce soit — y compris dans des parties de la clause que l’employeur n’invoquait même pas. Lorsqu’une clause échoue, elle échoue généralement en entier, et l’employé se rabat sur le préavis de common law. C’est pourquoi la rédaction du contrat, des années avant toute cessation d’emploi, en détermine si souvent le coût.',
          ),
        ],
      },
      {
        heading: bi(
          'Working notice, pay in lieu, or a combination',
          'Préavis travaillé, indemnité en tenant lieu, ou une combinaison',
        ),
        blocks: [
          p(
            'An employer can give notice and have the employee continue working through it, pay the equivalent amount instead, or combine the two. The choice is a practical one, and it has consequences beyond cash:',
            'Un employeur peut donner un préavis et laisser l’employé travailler pendant celui-ci, verser plutôt l’équivalent en argent, ou combiner les deux. Le choix est pratique, et ses conséquences dépassent la simple trésorerie :',
          ),
          li(
            'Benefit continuation through the statutory notice period is generally required, whichever route you choose.',
            'Le maintien des avantages sociaux pendant la période de préavis légal est généralement exigé, quelle que soit l’option retenue.',
          ),
          li(
            'Working notice depends on the role remaining workable — it rarely suits a departure that follows a conflict or a loss of trust.',
            'Le préavis travaillé suppose que le poste demeure viable — il convient rarement à un départ qui fait suite à un conflit ou à une perte de confiance.',
          ),
          li(
            'A Record of Employment must still be issued on the applicable timeline regardless of the structure.',
            'Un relevé d’emploi doit tout de même être produit dans le délai applicable, peu importe la structure retenue.',
          ),
        ],
      },
      {
        heading: bi(
          'Severance pay is a separate entitlement',
          'L’indemnité de licenciement est un droit distinct',
        ),
        blocks: [
          p(
            'In Ontario, statutory severance pay is not the same thing as termination notice, and it is not an alternative to it. It is a separate entitlement that arises only when specific conditions about the employee’s length of service and the employer’s payroll are met. Employers routinely treat the two as interchangeable and underpay as a result. Confirm whether severance is engaged before you calculate anything.',
            'En Ontario, l’indemnité de licenciement prévue par la loi n’est pas la même chose que le préavis de cessation d’emploi, et elle ne s’y substitue pas. Il s’agit d’un droit distinct qui ne prend naissance que lorsque des conditions précises relatives à la durée de service de l’employé et à la masse salariale de l’employeur sont réunies. Les employeurs traitent régulièrement les deux comme interchangeables et versent des montants insuffisants. Vérifiez si l’indemnité de licenciement s’applique avant de calculer quoi que ce soit.',
          ),
        ],
      },
      {
        heading: bi(
          'Terminating several people at once changes the analysis',
          'Mettre fin à plusieurs emplois à la fois change l’analyse',
        ),
        blocks: [
          p(
            'When a number of employees are terminated at one establishment within a short window, Ontario’s mass-termination rules can apply. They can enlarge the notice owed and add a filing obligation with the province, and the notice period may not begin until that filing is made. If you are contemplating more than a couple of departures in the same period, treat this as a threshold question rather than a detail to resolve later.',
            'Lorsqu’un certain nombre d’employés sont licenciés dans un même établissement à l’intérieur d’une courte période, les règles ontariennes sur les licenciements collectifs peuvent s’appliquer. Elles peuvent allonger le préavis dû et ajouter une obligation de dépôt auprès de la province, et la période de préavis peut ne commencer qu’au moment de ce dépôt. Si vous envisagez plus de quelques départs dans la même période, traitez cette question comme préalable plutôt que comme un détail à régler plus tard.',
          ),
        ],
      },
      {
        heading: bi('Before you act', 'Avant d’agir'),
        blocks: [
          li(
            'Read the actual employment contract, including any offer letter, and note whether a termination clause exists and what it says.',
            'Lisez le contrat de travail réel, y compris toute lettre d’offre, et notez si une clause de cessation d’emploi existe et ce qu’elle prévoit.',
          ),
          li(
            'Confirm the employee is covered by the ESA — some occupations and arrangements are treated differently.',
            'Confirmez que l’employé est visé par la LNE — certaines professions et situations sont traitées différemment.',
          ),
          li(
            'Check whether the reason for termination touches a protected ground or a protected activity, which raises human-rights and reprisal questions on top of notice.',
            'Vérifiez si le motif de cessation d’emploi touche un motif protégé ou une activité protégée, ce qui soulève des questions de droits de la personne et de représailles en plus du préavis.',
          ),
          li(
            'Get the numbers reviewed by an employment lawyer before the termination meeting, not after it.',
            'Faites réviser les montants par un avocat en droit du travail avant la rencontre de cessation d’emploi, et non après.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Dutiva helps you assemble and document the paperwork around a termination consistently — the letter, the record, the checklist of what was provided and when. It does not calculate your entitlements or tell you what is owed, and it is not a substitute for legal advice on a specific departure.',
            'Dutiva vous aide à réunir et à documenter les pièces entourant une cessation d’emploi de façon uniforme — la lettre, le dossier, la liste de ce qui a été remis et à quel moment. Il ne calcule pas vos obligations ni ne vous indique ce qui est dû, et il ne remplace pas un avis juridique sur un départ précis.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'probation-clauses-ontario',
    frSlug: 'clauses-de-probation-ontario',
    collection: 'guide',
    topic: bi('Hiring', 'Embauche'),
    readingMinutes: 5,
    title: bi('Probation clauses in Ontario', 'Clauses de probation en Ontario'),
    summary: bi(
      'What a probation clause actually does under Ontario law, the assumptions that make one unenforceable, and how to run a probationary period that holds up.',
      'Ce qu’une clause de probation accomplit réellement en droit ontarien, les hypothèses qui la rendent inapplicable, et comment mener une période de probation qui tient la route.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Probation is one of the most widely misunderstood terms in Canadian employment. Many employers believe a probationary period means an employee can be dismissed freely, with no notice and no exposure, for some fixed opening stretch of the relationship. That belief is wrong in several directions at once, and acting on it is how straightforward hires turn into claims.',
            'La probation est l’une des notions les plus mal comprises en emploi au Canada. Beaucoup d’employeurs croient qu’une période de probation permet de congédier librement, sans préavis ni risque, pendant une portion initiale fixe de la relation. Cette croyance est erronée sur plusieurs plans à la fois, et agir en conséquence transforme des embauches simples en réclamations.',
          ),
        ],
      },
      {
        heading: bi(
          'Probation is a contractual term, not an automatic right',
          'La probation est une clause contractuelle, non un droit automatique',
        ),
        blocks: [
          p(
            'There is no default probationary period in Ontario employment law. If your contract does not create one in writing, you do not have one. A probationary period exists only because the parties agreed to it before employment began — which means it must appear in a document the employee actually accepted before starting work, not in a handbook handed over on day one.',
            'Il n’existe aucune période de probation par défaut en droit du travail ontarien. Si votre contrat n’en crée pas une par écrit, vous n’en avez pas. Une période de probation n’existe que parce que les parties y ont consenti avant le début de l’emploi — ce qui suppose qu’elle figure dans un document que l’employé a réellement accepté avant de commencer à travailler, et non dans un manuel remis le premier jour.',
          ),
        ],
      },
      {
        heading: bi(
          'The statutory floor still applies',
          'Le plancher légal continue de s’appliquer',
        ),
        blocks: [
          p(
            'Ontario’s Employment Standards Act sets a service threshold below which statutory notice is not owed. Employers often assume their probationary period and that threshold are the same length. There is no rule that makes them the same, and a probationary period drafted to run past the statutory threshold does not suspend the entitlement that has by then accrued. A clause purporting to do so risks being unenforceable in its entirety.',
            'La Loi sur les normes d’emploi de l’Ontario prévoit un seuil de service en deçà duquel aucun préavis légal n’est dû. Les employeurs présument souvent que leur période de probation et ce seuil ont la même durée. Aucune règle ne les rend identiques, et une période de probation rédigée pour se prolonger au-delà du seuil légal ne suspend pas le droit déjà acquis à ce moment. Une clause qui prétendrait le faire risque d’être inapplicable en entier.',
          ),
          p(
            'Human-rights protections apply from the first day regardless. A probationary dismissal that is connected to a disability, a pregnancy, a request for accommodation, or any other protected ground is exposed no matter how the clause is written.',
            'Les protections en matière de droits de la personne s’appliquent dès le premier jour, peu importe. Un congédiement en probation lié à un handicap, à une grossesse, à une demande d’accommodement ou à tout autre motif protégé demeure exposé, quelle que soit la rédaction de la clause.',
          ),
        ],
      },
      {
        heading: bi(
          'Suitability still has to be assessed — and shown',
          'L’aptitude doit tout de même être évaluée — et démontrée',
        ),
        blocks: [
          p(
            'Where a probationary clause is valid, the employer is generally expected to have assessed the employee’s suitability in good faith: to have given them a fair opportunity to demonstrate they could do the job, measured against expectations they were actually told about. A dismissal with no evidence that any assessment occurred is a weak position even inside a well-drafted probationary period.',
            'Lorsqu’une clause de probation est valide, on s’attend généralement à ce que l’employeur ait évalué l’aptitude de l’employé de bonne foi : qu’il lui ait donné une occasion équitable de démontrer sa capacité à faire le travail, en fonction d’attentes qui lui ont réellement été communiquées. Un congédiement sans preuve qu’une évaluation a eu lieu constitue une position fragile, même à l’intérieur d’une période de probation bien rédigée.',
          ),
          li(
            'Write down the expectations for the role and share them at the start, not at the end.',
            'Consignez les attentes liées au poste et communiquez-les dès le départ, et non à la fin.',
          ),
          li(
            'Hold at least one documented check-in before the period closes, while there is still time to correct course.',
            'Tenez au moins une rencontre de suivi documentée avant la fin de la période, pendant qu’il est encore temps de corriger le tir.',
          ),
          li(
            'Record the specific, job-related reasons if you decide not to continue the relationship.',
            'Consignez les motifs précis et liés à l’emploi si vous décidez de ne pas poursuivre la relation.',
          ),
          li(
            'Diarize the end of the period — letting it lapse unnoticed removes whatever benefit the clause offered.',
            'Inscrivez la fin de la période à l’agenda — la laisser s’écouler sans s’en apercevoir supprime tout avantage qu’offrait la clause.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Have an employment lawyer review your standard offer and probationary language once, properly. It is the cheapest point in the entire employment relationship at which to fix this, and the clause you use is likely to be reused across every hire you make.',
            'Faites réviser une fois, sérieusement, votre offre type et votre libellé de probation par un avocat en droit du travail. C’est le moment le moins coûteux de toute la relation d’emploi pour corriger la situation, et la clause utilisée sera vraisemblablement reprise pour chaque embauche.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'employer-document-checklist',
    frSlug: 'liste-de-documents-employeur',
    collection: 'guide',
    topic: bi('Documentation', 'Documentation'),
    readingMinutes: 4,
    title: bi(
      'Canadian employer document checklist',
      'Liste de documents pour les employeurs canadiens',
    ),
    summary: bi(
      'The core HR documents to have in place before a new employee’s first day, and why assembling them late is harder than assembling them early.',
      'Les documents RH essentiels à avoir en place avant la première journée d’un nouvel employé, et pourquoi les réunir tard est plus difficile que de les réunir tôt.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Most employment disputes are decided on documents that either existed at the right moment or did not. The practical problem is that nearly every document below is dramatically easier to put in place before someone starts than afterwards — because once employment has begun, asking an employee to sign new terms raises the question of what they are receiving in exchange for agreeing.',
            'La plupart des litiges en emploi se tranchent sur des documents qui existaient au bon moment ou qui n’existaient pas. Le problème pratique est que presque tous les documents ci-dessous sont nettement plus faciles à mettre en place avant l’entrée en fonction qu’après — car une fois l’emploi commencé, demander à un employé de signer de nouvelles conditions soulève la question de ce qu’il reçoit en échange de son accord.',
          ),
        ],
      },
      {
        heading: bi('Before the first day', 'Avant la première journée'),
        blocks: [
          li(
            'A written employment agreement, accepted before work begins, covering role, compensation, and how the relationship can end.',
            'Une entente d’emploi écrite, acceptée avant le début du travail, couvrant le poste, la rémunération et les modalités de fin de la relation.',
          ),
          li(
            'The offer letter and any pre-hire correspondence that describes terms — these are read alongside the agreement if the two ever conflict.',
            'La lettre d’offre et toute correspondance préalable à l’embauche décrivant des conditions — elles seront lues avec l’entente si les deux se contredisent un jour.',
          ),
          li(
            'Confidentiality and intellectual-property terms, where the role touches either.',
            'Des clauses de confidentialité et de propriété intellectuelle, lorsque le poste touche l’une ou l’autre.',
          ),
          li(
            'Written consent for any background or reference checking you intend to do.',
            'Un consentement écrit pour toute vérification d’antécédents ou de références que vous comptez effectuer.',
          ),
          li(
            'Payroll and tax onboarding forms, and banking details for direct deposit.',
            'Les formulaires d’intégration à la paie et aux impôts, ainsi que les coordonnées bancaires pour le dépôt direct.',
          ),
        ],
      },
      {
        heading: bi('Policies to have ready', 'Politiques à avoir sous la main'),
        blocks: [
          p(
            'Several workplace policies are required outright in some jurisdictions and expected in practice in all of them. Have them written, current, and distributed in a way you can later prove:',
            'Plusieurs politiques en milieu de travail sont carrément obligatoires dans certaines compétences et attendues en pratique dans toutes. Ayez-les rédigées, à jour et diffusées d’une manière que vous pourrez démontrer plus tard :',
          ),
          li(
            'Workplace violence and harassment prevention, including how a complaint is made and investigated.',
            'Prévention de la violence et du harcèlement en milieu de travail, y compris la façon de formuler et d’enquêter sur une plainte.',
          ),
          li(
            'Health and safety, appropriate to the actual hazards of the work.',
            'Santé et sécurité, adaptée aux risques réels du travail.',
          ),
          li(
            'Accessibility and accommodation, including how an employee requests one.',
            'Accessibilité et accommodement, y compris la façon dont un employé en fait la demande.',
          ),
          li(
            'Privacy, covering what employee information you collect and why.',
            'Confidentialité, précisant les renseignements sur les employés que vous recueillez et pourquoi.',
          ),
          li(
            'Acceptable technology use, if employees will use your systems or their own devices for work.',
            'Utilisation acceptable des technologies, si les employés utilisent vos systèmes ou leurs propres appareils pour le travail.',
          ),
        ],
      },
      {
        heading: bi('Distribution is part of the document', 'La diffusion fait partie du document'),
        blocks: [
          p(
            'A policy nobody received is close to worthless when it matters. Keep a record of what was distributed, to whom, and when — acknowledgement of receipt, dated. The same applies to updates: a policy revised without redistribution is often treated as the old policy.',
            'Une politique que personne n’a reçue ne vaut à peu près rien au moment critique. Conservez un registre de ce qui a été diffusé, à qui et quand — un accusé de réception, daté. Il en va de même pour les mises à jour : une politique révisée sans nouvelle diffusion est souvent traitée comme l’ancienne politique.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Dutiva ships templates covering the common Canadian HR documents across Ontario, Quebec, and the federal regime, and keeps a record of what was generated and when. Templates are a starting point for your situation, not a legal opinion about it — have anything consequential reviewed.',
            'Dutiva propose des modèles couvrant les documents RH canadiens courants pour l’Ontario, le Québec et le régime fédéral, et conserve un registre de ce qui a été généré et à quel moment. Les modèles sont un point de départ adapté à votre situation, non un avis juridique à son sujet — faites réviser tout ce qui a des conséquences importantes.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'employment-contract-clauses',
    frSlug: 'clauses-contractuelles-demploi',
    collection: 'guide',
    topic: bi('Contracts', 'Contrats'),
    readingMinutes: 7,
    title: bi('Employment contract clauses in Canada', 'Clauses contractuelles d’emploi au Canada'),
    summary: bi(
      'The clauses that decide what an employment relationship costs to end, why Canadian courts read them strictly, and the drafting habits that get them struck down.',
      'Les clauses qui déterminent le coût de la fin d’une relation d’emploi, pourquoi les tribunaux canadiens les interprètent strictement, et les habitudes de rédaction qui les font invalider.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Canadian courts approach employment contracts differently from commercial ones. The starting assumption is that the employer drafted the document, understood it, and held the stronger bargaining position — so ambiguity tends to be resolved against the employer, and a clause that reduces a statutory entitlement is read strictly.',
            'Les tribunaux canadiens abordent les contrats de travail différemment des contrats commerciaux. On présume au départ que l’employeur a rédigé le document, qu’il le comprenait et qu’il était en position de négociation plus forte — l’ambiguïté tend donc à être tranchée contre l’employeur, et une clause qui réduit un droit prévu par la loi est interprétée strictement.',
          ),
        ],
      },
      {
        heading: bi('The termination clause', 'La clause de cessation d’emploi'),
        blocks: [
          p(
            'This is the clause that matters most, because it decides whether an ending costs the statutory minimum or common-law reasonable notice. Two habits get these clauses struck down repeatedly:',
            'C’est la clause qui compte le plus, car elle détermine si une fin d’emploi coûte le minimum légal ou le préavis raisonnable de la common law. Deux habitudes font invalider ces clauses à répétition :',
          ),
          li(
            'Language that could produce less than the statutory minimum in some scenario — even a scenario that never happened.',
            'Un libellé qui pourrait produire moins que le minimum légal dans un scénario donné — même un scénario qui ne s’est jamais réalisé.',
          ),
          li(
            'A "just cause" carve-out written more broadly than the narrow statutory standard for disentitlement.',
            'Une exception pour « motif valable » rédigée plus largement que la norme légale étroite de privation du droit.',
          ),
          p(
            'When a court finds either problem, it generally does not rewrite the clause to make it lawful or sever the offending words. The clause fails and reasonable notice applies. A clause that was cheap to copy from a template becomes the most expensive sentence in the document.',
            'Lorsqu’un tribunal constate l’un ou l’autre de ces problèmes, il ne réécrit généralement pas la clause pour la rendre licite et n’en retranche pas les mots fautifs. La clause échoue et le préavis raisonnable s’applique. Une clause bon marché à copier d’un modèle devient la phrase la plus coûteuse du document.',
          ),
        ],
      },
      {
        heading: bi('Restrictive covenants', 'Clauses restrictives'),
        blocks: [
          p(
            'Non-competition and non-solicitation clauses are treated as restraints of trade and are presumptively unenforceable unless narrowly justified. Non-solicitation clauses generally fare better than non-competition ones, because they restrain less. Some jurisdictions have gone further and restricted non-competes for most employees outright, so whether you may use one at all is a jurisdiction-specific question before it is a drafting question.',
            'Les clauses de non-concurrence et de non-sollicitation sont considérées comme des restrictions au commerce et sont présumées inapplicables à moins d’être justifiées de façon étroite. Les clauses de non-sollicitation s’en tirent généralement mieux que celles de non-concurrence, parce qu’elles restreignent moins. Certaines compétences sont allées plus loin et ont carrément restreint les non-concurrences pour la plupart des employés; savoir si vous pouvez même en utiliser une est donc une question propre à la compétence avant d’être une question de rédaction.',
          ),
        ],
      },
      {
        heading: bi(
          'Compensation, bonuses, and what survives a departure',
          'Rémunération, primes et ce qui survit à un départ',
        ),
        blocks: [
          p(
            'If a bonus or equity plan is meant to stop accruing when employment ends, the contract and the plan document have to say so clearly and consistently with each other. Where they conflict, or where the language is merely implied, employees have succeeded in claiming amounts through the notice period. Read the plan and the contract together before you rely on either.',
            'Si une prime ou un régime d’actions doit cesser de s’accumuler à la fin de l’emploi, le contrat et le document du régime doivent l’énoncer clairement et de façon cohérente entre eux. Lorsqu’ils se contredisent, ou que le libellé n’est qu’implicite, des employés ont obtenu gain de cause en réclamant des sommes pour la période de préavis. Lisez le régime et le contrat ensemble avant de vous fier à l’un ou à l’autre.',
          ),
        ],
      },
      {
        heading: bi('Changing terms later', 'Modifier les conditions plus tard'),
        blocks: [
          p(
            'A contract signed after employment has already begun generally needs fresh consideration — something of value the employee receives in exchange for accepting the new terms. Continued employment, on its own, is usually not enough. A significant unilateral change to a fundamental term can also amount to constructive dismissal, which puts the employer in the position of having ended the relationship without saying so.',
            'Un contrat signé après le début de l’emploi exige généralement une contrepartie nouvelle — quelque chose de valeur que l’employé reçoit en échange de son acceptation des nouvelles conditions. Le maintien de l’emploi, à lui seul, ne suffit habituellement pas. Une modification unilatérale importante à une condition essentielle peut aussi constituer un congédiement déguisé, ce qui place l’employeur dans la position d’avoir mis fin à la relation sans le dire.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Employment contracts are the single highest-leverage document in the relationship and the one most often assembled from borrowed text. Have your standard agreement reviewed by an employment lawyer in the jurisdiction that governs it, and re-reviewed when the law moves.',
            'Le contrat de travail est le document le plus déterminant de la relation et celui le plus souvent assemblé à partir de textes empruntés. Faites réviser votre entente type par un avocat en droit du travail de la compétence applicable, et faites-la réviser de nouveau lorsque le droit évolue.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'duty-to-accommodate',
    frSlug: 'obligation-daccommodement',
    collection: 'guide',
    topic: bi('Accommodation', 'Accommodement'),
    readingMinutes: 6,
    title: bi('Duty to accommodate in Canada', 'Obligation d’accommodement au Canada'),
    summary: bi(
      'What the duty to accommodate requires of employers, how the undue-hardship limit actually works, and the process failures that cause most findings against employers.',
      'Ce que l’obligation d’accommodement exige des employeurs, comment fonctionne réellement la limite de la contrainte excessive, et les manquements de procédure à l’origine de la plupart des décisions défavorables aux employeurs.',
    ),
    sections: [
      {
        blocks: [
          p(
            'Human-rights legislation across Canada requires employers to accommodate employees in relation to protected grounds — disability most often, but also family status, religion, pregnancy, and others — up to the point of undue hardship. The obligation is not discretionary, and it is triggered by the employer becoming aware of a need, not by a formally worded request.',
            'Les lois sur les droits de la personne partout au Canada exigent des employeurs qu’ils accommodent les employés en lien avec des motifs protégés — le handicap le plus souvent, mais aussi la situation de famille, la religion, la grossesse et d’autres — jusqu’au point de contrainte excessive. L’obligation n’est pas discrétionnaire, et elle est déclenchée par la connaissance qu’a l’employeur d’un besoin, et non par une demande formulée en bonne et due forme.',
          ),
        ],
      },
      {
        heading: bi(
          'Undue hardship is a high bar, and it must be proven',
          'La contrainte excessive est un seuil élevé, et elle doit être prouvée',
        ),
        blocks: [
          p(
            'Undue hardship is a real limit, but it is a demanding one. It is assessed on evidence about cost, health, and safety in the context of the particular employer — not on inconvenience, not on how other employees might feel about it, and not on an assumption that accommodation will be disruptive. An employer asserting undue hardship carries the burden of demonstrating it with something more than an estimate made in the moment.',
            'La contrainte excessive est une limite réelle, mais exigeante. Elle s’évalue sur la base d’une preuve portant sur les coûts, la santé et la sécurité dans le contexte de l’employeur en cause — non sur l’inconvénient, non sur la réaction possible des autres employés, et non sur la présomption que l’accommodement sera perturbateur. L’employeur qui invoque la contrainte excessive a le fardeau de la démontrer par autre chose qu’une estimation improvisée.',
          ),
        ],
      },
      {
        heading: bi(
          'The process matters as much as the outcome',
          'Le processus compte autant que le résultat',
        ),
        blocks: [
          p(
            'A large share of adverse findings against employers turn on procedural failure rather than the substance of the accommodation. The employer never asked what was needed, never explored options, or decided unilaterally that nothing could be done. An employer who engages seriously, explores alternatives, and documents that effort is in a substantially stronger position even where the accommodation ultimately fails.',
            'Une large part des décisions défavorables aux employeurs repose sur un manquement de procédure plutôt que sur le fond de l’accommodement. L’employeur n’a jamais demandé ce dont la personne avait besoin, n’a jamais exploré d’options, ou a décidé unilatéralement que rien ne pouvait être fait. L’employeur qui s’engage sérieusement, explore des solutions de rechange et documente cet effort se trouve dans une position nettement plus solide, même lorsque l’accommodement échoue en fin de compte.',
          ),
          li(
            'Respond to the need when you learn of it, in whatever form it reaches you.',
            'Réagissez au besoin dès que vous en prenez connaissance, quelle qu’en soit la forme.',
          ),
          li(
            'Ask what functional limitations exist and what would help — not for a diagnosis.',
            'Demandez quelles sont les limitations fonctionnelles et ce qui aiderait — et non un diagnostic.',
          ),
          li(
            'Consider more than one option, including ones that are imperfect but workable.',
            'Envisagez plus d’une option, y compris des solutions imparfaites mais viables.',
          ),
          li(
            'Write down what was considered, what was chosen, and why the rest was not.',
            'Consignez ce qui a été envisagé, ce qui a été retenu, et pourquoi le reste ne l’a pas été.',
          ),
          li(
            'Revisit the arrangement as circumstances change — accommodation is rarely a one-time decision.',
            'Réexaminez l’arrangement à mesure que les circonstances évoluent — l’accommodement est rarement une décision ponctuelle.',
          ),
        ],
      },
      {
        heading: bi(
          'Medical information: enough, and no more',
          'Renseignements médicaux : le nécessaire, rien de plus',
        ),
        blocks: [
          p(
            'Employers are generally entitled to the information needed to understand functional limitations and craft an accommodation. They are generally not entitled to the underlying diagnosis or an employee’s broader medical history. Collecting more than you need creates a privacy problem alongside the human-rights one, and both provincial privacy law and, for federally regulated employers, PIPEDA constrain what you may hold and how long you may hold it.',
            'Les employeurs ont généralement droit aux renseignements nécessaires pour comprendre les limitations fonctionnelles et concevoir un accommodement. Ils n’ont généralement pas droit au diagnostic sous-jacent ni à l’historique médical élargi de l’employé. Recueillir plus que nécessaire crée un problème de confidentialité en plus du problème de droits de la personne, et tant les lois provinciales sur la vie privée que, pour les employeurs de compétence fédérale, la LPRPDE encadrent ce que vous pouvez conserver et pour combien de temps.',
          ),
        ],
      },
      {
        heading: bi(
          'Accommodation is a shared process',
          'L’accommodement est un processus partagé',
        ),
        blocks: [
          p(
            'The employee participates too: providing the information reasonably requested, engaging with proposals, and accepting a reasonable accommodation even when it is not the one they preferred. That shared obligation does not reduce the employer’s duty to lead the process in good faith, and an employer should not treat an employee’s frustration as a refusal to participate.',
            'L’employé participe aussi : il fournit les renseignements raisonnablement demandés, s’engage à l’égard des propositions et accepte un accommodement raisonnable même s’il ne s’agit pas de celui qu’il privilégiait. Cette obligation partagée ne diminue en rien le devoir de l’employeur de mener le processus de bonne foi, et l’employeur ne devrait pas assimiler la frustration d’un employé à un refus de participer.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Accommodation questions are fact-specific and the consequences of getting them wrong are significant. Use this as orientation, keep a written record of your process, and involve counsel on anything contested or complex.',
            'Les questions d’accommodement dépendent des faits et les conséquences d’une erreur sont importantes. Utilisez ce texte comme repère, conservez une trace écrite de votre processus et faites intervenir un conseiller juridique dans tout dossier contesté ou complexe.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'termination-documentation',
    frSlug: 'documentation-de-cessation-demploi',
    collection: 'guide',
    topic: bi('Termination', 'Cessation d’emploi'),
    readingMinutes: 5,
    title: bi(
      'Termination documentation in Canada',
      'Documentation de cessation d’emploi au Canada',
    ),
    summary: bi(
      'What to prepare before a termination meeting, what to record during it, and the documentation habits that most often damage an employer’s position afterwards.',
      'Ce qu’il faut préparer avant une rencontre de cessation d’emploi, ce qu’il faut consigner pendant, et les habitudes de documentation qui nuisent le plus souvent à la position de l’employeur par la suite.',
    ),
    sections: [
      {
        blocks: [
          p(
            'By the time a termination is disputed, the employer’s position is largely fixed by documents created before anyone thought there would be a dispute. Terminations are also the point at which employers are most tempted to improvise — and improvised paperwork is what gets read back to them later.',
            'Au moment où une cessation d’emploi est contestée, la position de l’employeur est en grande partie déterminée par des documents créés avant que quiconque n’envisage un litige. La cessation d’emploi est aussi le moment où les employeurs sont le plus tentés d’improviser — et c’est la paperasse improvisée qu’on leur relit plus tard.',
          ),
        ],
      },
      {
        heading: bi('Before the meeting', 'Avant la rencontre'),
        blocks: [
          li(
            'Pull the employment contract and confirm what it actually says about ending the relationship.',
            'Sortez le contrat de travail et confirmez ce qu’il prévoit réellement quant à la fin de la relation.',
          ),
          li(
            'Assemble the performance or conduct record you are relying on, and note the gaps in it honestly.',
            'Réunissez le dossier de rendement ou de conduite sur lequel vous vous appuyez, et notez-en honnêtement les lacunes.',
          ),
          li(
            'Have the termination letter, the final pay calculation, and the benefits position settled in advance.',
            'Ayez la lettre de cessation d’emploi, le calcul de la paie finale et la position sur les avantages sociaux réglés à l’avance.',
          ),
          li(
            'Decide who attends, and have a second person present to witness what is said.',
            'Décidez qui assiste à la rencontre, et prévoyez une deuxième personne pour témoigner de ce qui est dit.',
          ),
        ],
      },
      {
        heading: bi(
          'Say less, and say it consistently',
          'Dites moins, et dites-le de façon constante',
        ),
        blocks: [
          p(
            'The reason given at the meeting, the reason in the letter, and the reason in the Record of Employment should be consistent with one another. Inconsistency between them is one of the most damaging patterns in an employer’s file, because it invites the inference that the stated reason is not the real one. If you have not settled on how to characterize the ending, settle it before the meeting rather than during it.',
            'Le motif donné en rencontre, celui de la lettre et celui du relevé d’emploi doivent concorder. Une incohérence entre eux constitue l’un des schémas les plus dommageables dans un dossier d’employeur, car elle invite à conclure que le motif invoqué n’est pas le véritable. Si vous n’avez pas arrêté la façon de qualifier la fin d’emploi, faites-le avant la rencontre plutôt que pendant.',
          ),
          p(
            'Alleging just cause deserves particular caution. The standard is narrow, the burden sits with the employer, and an allegation that fails can worsen the employer’s exposure rather than limit it. It is a decision to make with legal advice, not a default posture.',
            'Alléguer un motif valable mérite une prudence particulière. La norme est étroite, le fardeau incombe à l’employeur, et une allégation qui échoue peut aggraver son exposition plutôt que la limiter. C’est une décision à prendre avec un avis juridique, non une position par défaut.',
          ),
        ],
      },
      {
        heading: bi('After the meeting', 'Après la rencontre'),
        blocks: [
          li(
            'Write a dated note of what was said and by whom, while it is fresh.',
            'Rédigez une note datée de ce qui a été dit et par qui, pendant que c’est frais.',
          ),
          li(
            'Issue the Record of Employment within the applicable timeline.',
            'Produisez le relevé d’emploi dans le délai applicable.',
          ),
          li(
            'Recover property and revoke system access, and record when each occurred.',
            'Récupérez les biens et révoquez les accès aux systèmes, en notant le moment de chaque opération.',
          ),
          li(
            'Retain the file for the full period your jurisdiction requires — do not purge it because the person has left.',
            'Conservez le dossier pendant toute la période exigée par votre compétence — ne le supprimez pas parce que la personne est partie.',
          ),
          li(
            'If a release was signed, keep it with the file along with evidence of what was provided in exchange.',
            'Si une quittance a été signée, conservez-la au dossier avec la preuve de ce qui a été fourni en contrepartie.',
          ),
        ],
      },
      {
        blocks: [
          p(
            'Dutiva generates termination-related documents from Canadian templates and keeps a consistent record of what was produced and when, so the file tells one coherent story. It does not decide whether a termination is lawful or what it should cost — those are questions for an employment lawyer, ideally before the meeting happens.',
            'Dutiva génère les documents liés à la cessation d’emploi à partir de modèles canadiens et conserve un registre uniforme de ce qui a été produit et à quel moment, afin que le dossier raconte une seule histoire cohérente. Il ne détermine pas si une cessation d’emploi est licite ni ce qu’elle devrait coûter — ces questions relèvent d’un avocat en droit du travail, idéalement avant la tenue de la rencontre.',
          ),
        ],
      },
    ],
  },
] as const
