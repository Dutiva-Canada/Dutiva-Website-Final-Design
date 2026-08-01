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
    readingMinutes: 7,
    updated: '2026-08-01',
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
          p(
            'This guide sets out how those sources interact, what each one actually governs, and the decision points worth settling before a termination meeting rather than after it. It deliberately quotes no notice periods or thresholds: those vary by jurisdiction and fact pattern, they change, and a figure repeated out of context becomes a representation the moment it is wrong. Name the statute, understand the shape of the rule, then confirm the specifics against the current official text.',
            'Ce guide expose comment ces sources interagissent, ce que chacune régit réellement, et les points de décision qu’il vaut mieux régler avant une rencontre de cessation d’emploi plutôt qu’après. Il ne cite délibérément aucune période de préavis ni aucun seuil : ceux-ci varient selon la compétence et les faits, ils changent, et un chiffre répété hors contexte devient une affirmation dès qu’il est erroné. Nommez la loi, comprenez la logique de la règle, puis validez les détails dans le texte officiel en vigueur.',
          ),
        ],
      },
      {
        heading: bi(
          'Two sources of obligation, not one',
          'Deux sources d’obligations, et non une seule',
        ),
        blocks: [
          p(
            'The ESA is public-order legislation: it sets minimum entitlements that an employment contract cannot reduce, and an agreement purporting to do so is void to that extent. It governs written notice of termination, and in defined circumstances a separate severance entitlement, along with continuation of certain benefits during the statutory notice period.',
            'La LNE est une loi d’ordre public : elle établit des droits minimaux qu’un contrat de travail ne peut réduire, et une entente qui prétendrait le faire est nulle dans cette mesure. Elle régit le préavis écrit de cessation d’emploi et, dans des circonstances définies, une indemnité de licenciement distincte, ainsi que le maintien de certains avantages sociaux pendant la période de préavis légal.',
          ),
          p(
            'The common law sits on top of it and asks a different question: absent an enforceable agreement to the contrary, what period of reasonable notice does this particular employee deserve? That assessment weighs the character of the role, length of service, age, and the availability of comparable work. It is holistic rather than formulaic, and it commonly produces an entitlement well beyond the statutory floor — which is precisely why the enforceability of the termination clause matters so much.',
            'La common law s’y superpose et pose une question différente : en l’absence d’une entente exécutoire contraire, quel préavis raisonnable cet employé précis mérite-t-il? Cette évaluation soupèse la nature du poste, la durée du service, l’âge et la disponibilité d’un emploi comparable. Elle est globale plutôt que formulaire, et produit couramment un droit largement supérieur au plancher légal — ce qui explique précisément pourquoi le caractère exécutoire de la clause de cessation d’emploi compte autant.',
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
          'Why termination clauses fail so often',
          'Pourquoi les clauses de cessation d’emploi échouent si souvent',
        ),
        blocks: [
          p(
            'The failure modes are well worn and largely avoidable. Reviewing your standard agreement against this list is the cheapest risk reduction available to most employers:',
            'Les causes d’échec sont bien connues et largement évitables. Comparer votre entente type à cette liste est la réduction de risque la moins coûteuse dont disposent la plupart des employeurs :',
          ),
          li(
            'Language that could produce less than the statutory minimum in some scenario — even a scenario that never occurred and that the employer never invoked.',
            'Un libellé qui pourrait produire moins que le minimum légal dans un scénario donné — même un scénario qui ne s’est jamais réalisé et que l’employeur n’a jamais invoqué.',
          ),
          li(
            'A "just cause" carve-out drafted more broadly than the narrow statutory standard for disentitlement, which can invalidate the clause even where the departure had nothing to do with cause.',
            'Une exception pour « motif valable » rédigée plus largement que la norme légale étroite de privation du droit, ce qui peut invalider la clause même lorsque le départ n’avait rien à voir avec un motif.',
          ),
          li(
            'Silence on benefit continuation during the statutory notice period, or wording that appears to end coverage on the last day worked.',
            'Le silence sur le maintien des avantages sociaux pendant la période de préavis légal, ou un libellé qui semble mettre fin à la couverture le dernier jour travaillé.',
          ),
          li(
            'A clause that was valid when signed but was overtaken by a later promotion or a materially changed role, without a refreshed agreement.',
            'Une clause valide à la signature, mais dépassée par une promotion ultérieure ou une modification importante du poste, sans entente renouvelée.',
          ),
          p(
            'Courts generally do not rewrite a defective clause to make it lawful, and generally do not sever the offending words to save the rest. The clause fails and reasonable notice applies. A sentence copied from a borrowed template becomes the most expensive line in the document.',
            'Les tribunaux ne réécrivent généralement pas une clause défectueuse pour la rendre licite, et n’en retranchent généralement pas les mots fautifs pour sauver le reste. La clause échoue et le préavis raisonnable s’applique. Une phrase copiée d’un modèle emprunté devient la ligne la plus coûteuse du document.',
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
            'Working notice generally only counts once the employee has been told clearly and unambiguously when employment ends; a vague warning that change is coming does not start the clock.',
            'Le préavis travaillé ne compte généralement qu’à partir du moment où l’employé a été informé clairement et sans ambiguïté de la date de fin d’emploi; un avertissement vague annonçant des changements ne déclenche rien.',
          ),
          li(
            'A Record of Employment must still be issued on the applicable timeline regardless of the structure.',
            'Un relevé d’emploi doit tout de même être produit dans le délai applicable, peu importe la structure retenue.',
          ),
          p(
            'Where the parting is amicable and the role is genuinely still productive, working notice can reduce cost substantially. Where trust has broken down, attempting it tends to produce a worse outcome than paying — a disengaged employee in a sensitive role is a risk that rarely justifies the saving.',
            'Lorsque la séparation est à l’amiable et que le poste demeure réellement productif, le préavis travaillé peut réduire les coûts de façon appréciable. Lorsque la confiance est rompue, tenter cette avenue produit généralement un résultat pire que de payer — un employé désengagé dans un poste sensible représente un risque qui justifie rarement l’économie.',
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
          p(
            'Two details catch employers repeatedly. The payroll condition is not necessarily limited to the Ontario operation, so a business with employees elsewhere may qualify when it assumed it would not. And severance is generally payable in addition to notice rather than instead of it — an employer that pays only the larger of the two has usually underpaid.',
            'Deux détails piègent les employeurs à répétition. Le critère de masse salariale ne se limite pas nécessairement aux activités ontariennes, de sorte qu’une entreprise ayant des employés ailleurs peut y être assujettie alors qu’elle présumait le contraire. Et l’indemnité de licenciement est généralement payable en sus du préavis plutôt qu’à sa place — l’employeur qui ne verse que le plus élevé des deux a habituellement payé en deçà de ses obligations.',
          ),
        ],
      },
      {
        heading: bi(
          'What continues after the last day worked',
          'Ce qui se poursuit après le dernier jour travaillé',
        ),
        blocks: [
          p(
            'Termination is not a clean stop, and treating it as one creates avoidable liability. Confirm the position on each of these before the meeting:',
            'Une cessation d’emploi n’est pas un arrêt net, et la traiter comme tel crée une responsabilité évitable. Confirmez la position sur chacun de ces points avant la rencontre :',
          ),
          li(
            'Benefit coverage through the statutory notice period, and whether your insurer will actually continue it — some policies will not cover a terminated employee, which leaves the employer exposed for what the coverage would have paid.',
            'La couverture des avantages sociaux pendant la période de préavis légal, et la question de savoir si votre assureur la maintiendra réellement — certaines polices ne couvrent pas un employé licencié, ce qui expose l’employeur à hauteur de ce que la couverture aurait versé.',
          ),
          li(
            'Vacation pay accrued but not taken, and vacation accruing during the notice period itself.',
            'L’indemnité de vacances accumulée mais non prise, et les vacances qui s’accumulent pendant la période de préavis elle-même.',
          ),
          li(
            'Bonus, commission, and equity treatment — governed by the plan document read together with the contract, not by custom.',
            'Le traitement des primes, des commissions et des actions — régi par le document du régime lu avec le contrat, et non par l’usage.',
          ),
          li(
            'Any obligation that survives the relationship, such as confidentiality or the return of property and records.',
            'Toute obligation qui survit à la relation, comme la confidentialité ou la restitution des biens et des dossiers.',
          ),
        ],
      },
      {
        heading: bi(
          'Just cause is narrower than most employers assume',
          'Le motif valable est plus étroit que ne le présument la plupart des employeurs',
        ),
        blocks: [
          p(
            'Just cause is often described as the capital punishment of employment law, and the description is apt. The conduct must be serious enough to repudiate the employment relationship, assessed proportionally against the employee’s record and the circumstances. Poor performance, without a documented history of clear expectations, warnings, and an opportunity to improve, rarely meets it.',
            'On décrit souvent le motif valable comme la peine capitale du droit du travail, et la formule est juste. La conduite doit être suffisamment grave pour répudier la relation d’emploi, appréciée de façon proportionnelle au dossier de l’employé et aux circonstances. Le rendement insuffisant, en l’absence d’un historique documenté d’attentes claires, d’avertissements et d’une occasion de s’améliorer, y satisfait rarement.',
          ),
          p(
            'Ontario adds a further trap: the statutory standard for disentitlement to ESA notice is narrower still than the common-law standard for just cause. An employer can therefore succeed in establishing common-law cause and yet still owe the statutory minimum. An allegation that fails altogether can worsen exposure rather than limit it, by supporting a claim that the employer acted in bad faith. Treat cause as a decision to make with counsel, never as a default posture.',
            'L’Ontario ajoute un piège supplémentaire : la norme légale de privation du préavis prévu par la LNE est encore plus étroite que la norme de common law relative au motif valable. Un employeur peut donc établir un motif au sens de la common law et devoir tout de même le minimum légal. Une allégation qui échoue complètement peut aggraver l’exposition plutôt que la limiter, en appuyant une prétention de mauvaise foi. Traitez le motif comme une décision à prendre avec un conseiller juridique, jamais comme une position par défaut.',
          ),
        ],
      },
      {
        heading: bi(
          'Constructive dismissal: the ending nobody announced',
          'Le congédiement déguisé : la fin que personne n’a annoncée',
        ),
        blocks: [
          p(
            'An employer can terminate employment without ever saying so. A unilateral change to a fundamental term — compensation, reporting line, location, scope of responsibility — can amount to constructive dismissal, entitling the employee to treat the relationship as ended and claim notice. Restructurings, demotions dressed as reorganizations, and pay changes imposed without agreement are the usual sources.',
            'Un employeur peut mettre fin à un emploi sans jamais le dire. Une modification unilatérale d’une condition essentielle — rémunération, lien hiérarchique, lieu de travail, étendue des responsabilités — peut constituer un congédiement déguisé, permettant à l’employé de considérer la relation comme terminée et de réclamer un préavis. Les restructurations, les rétrogradations présentées comme des réorganisations et les changements de rémunération imposés sans entente en sont les sources habituelles.',
          ),
          p(
            'The safer path is to treat a material change as what it is: either negotiate it with genuine consideration, or give proper notice of the change so that it takes effect only after a period matching what would have been owed on termination. Imposing it and hoping nobody objects is the approach that generates claims.',
            'La voie la plus sûre consiste à traiter un changement important pour ce qu’il est : soit le négocier avec une contrepartie véritable, soit donner un préavis en bonne et due forme du changement pour qu’il ne prenne effet qu’après une période correspondant à ce qui aurait été dû en cas de cessation d’emploi. L’imposer en espérant que personne ne s’y oppose est l’approche qui engendre des réclamations.',
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
          p(
            'The definition of an establishment is not always intuitive, and remote workers attached to a location can complicate the count. Because the consequence of getting this wrong is that notice never validly started running, confirm the analysis before any communication goes out rather than after.',
            'La définition d’un établissement n’est pas toujours intuitive, et les travailleurs à distance rattachés à un lieu peuvent compliquer le décompte. Comme la conséquence d’une erreur est que le préavis n’a jamais valablement commencé à courir, validez l’analyse avant l’envoi de toute communication plutôt qu’après.',
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
            'Confirm the employee is covered by the ESA — some occupations and arrangements are treated differently, and federally regulated employers follow the Canada Labour Code instead.',
            'Confirmez que l’employé est visé par la LNE — certaines professions et situations sont traitées différemment, et les employeurs de compétence fédérale relèvent plutôt du Code canadien du travail.',
          ),
          li(
            'Check whether the reason for termination touches a protected ground or a protected activity, which raises human-rights and reprisal questions on top of notice.',
            'Vérifiez si le motif de cessation d’emploi touche un motif protégé ou une activité protégée, ce qui soulève des questions de droits de la personne et de représailles en plus du préavis.',
          ),
          li(
            'Confirm whether the employee is on a statutory leave, which can carry reinstatement protections independent of anything the contract says.',
            'Vérifiez si l’employé est en congé prévu par la loi, ce qui peut comporter des protections de réintégration indépendantes de ce que prévoit le contrat.',
          ),
          li(
            'Settle the reason you will give and make sure the letter, the meeting, and the Record of Employment all say the same thing.',
            'Arrêtez le motif que vous invoquerez et assurez-vous que la lettre, la rencontre et le relevé d’emploi disent tous la même chose.',
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
    updated: '2026-08-01',
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
          p(
            'The reality is narrower and more procedural. A probationary period is a contractual arrangement that, when properly created and properly run, gives an employer a defined window to assess suitability against a standard that is more forgiving than just cause. It does not suspend employment standards legislation, it does not suspend human-rights protections, and it does not survive being run carelessly.',
            'La réalité est plus étroite et plus procédurale. Une période de probation est un arrangement contractuel qui, lorsqu’il est créé et mené correctement, donne à l’employeur une fenêtre définie pour évaluer l’aptitude selon une norme plus souple que le motif valable. Elle ne suspend pas la législation sur les normes d’emploi, ne suspend pas les protections en matière de droits de la personne et ne survit pas à une gestion négligente.',
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
          p(
            'Timing is the detail that most often destroys the clause. An offer accepted verbally, followed by a written agreement signed after the employee has already started, raises the question of what the employee received in exchange for accepting terms they were not bound by. Get acceptance in writing before the first shift, and keep the record of when it happened.',
            'Le moment de la signature est le détail qui détruit le plus souvent la clause. Une offre acceptée verbalement, suivie d’une entente écrite signée après l’entrée en fonction, soulève la question de ce que l’employé a reçu en échange de son acceptation de conditions qui ne le liaient pas. Obtenez l’acceptation par écrit avant le premier quart de travail, et conservez la trace du moment où elle a eu lieu.',
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
          p(
            'The same is true of reprisal. An employee who raised a health-and-safety concern, asked about unpaid wages, or refused unsafe work is protected from retaliation during probation exactly as afterwards. Where a probationary dismissal follows closely on a protected activity, the timing itself invites scrutiny, and a thin assessment record will not withstand it.',
            'Il en va de même des représailles. L’employé qui a soulevé une préoccupation de santé et sécurité, posé une question sur un salaire impayé ou refusé un travail dangereux est protégé contre les représailles pendant la probation exactement comme après. Lorsqu’un congédiement en probation suit de près une activité protégée, le moment lui-même appelle un examen attentif, et un dossier d’évaluation mince n’y résistera pas.',
          ),
        ],
      },
      {
        heading: bi(
          'What "suitability" actually means',
          'Ce que signifie réellement l’« aptitude »',
        ),
        blocks: [
          p(
            'Where a probationary clause is valid, the employer is generally expected to have assessed the employee’s suitability in good faith: to have given them a fair opportunity to demonstrate they could do the job, measured against expectations they were actually told about. Suitability is broader than competence — it can take in reliability, judgement, and fit with the way the team works — but it is not a licence to dismiss for any reason or none.',
            'Lorsqu’une clause de probation est valide, on s’attend généralement à ce que l’employeur ait évalué l’aptitude de l’employé de bonne foi : qu’il lui ait donné une occasion équitable de démontrer sa capacité à faire le travail, en fonction d’attentes qui lui ont réellement été communiquées. L’aptitude est plus large que la compétence — elle peut englober la fiabilité, le jugement et l’intégration à la façon de travailler de l’équipe — mais elle n’autorise pas un congédiement pour n’importe quel motif ou sans motif.',
          ),
          p(
            'A dismissal with no evidence that any assessment occurred is a weak position even inside a well-drafted probationary period. The question a decision-maker asks is not whether the employer was entitled to be dissatisfied, but whether the employer actually turned its mind to suitability and gave the employee a genuine chance to meet a known standard.',
            'Un congédiement sans preuve qu’une évaluation a eu lieu constitue une position fragile, même à l’intérieur d’une période de probation bien rédigée. La question que se pose le décideur n’est pas de savoir si l’employeur avait le droit d’être insatisfait, mais s’il s’est réellement penché sur l’aptitude et a donné à l’employé une véritable chance de satisfaire à une norme connue.',
          ),
        ],
      },
      {
        heading: bi(
          'Running a probationary period that holds up',
          'Mener une période de probation qui tient la route',
        ),
        blocks: [
          li(
            'Write down the expectations for the role and share them at the start, not at the end.',
            'Consignez les attentes liées au poste et communiquez-les dès le départ, et non à la fin.',
          ),
          li(
            'Hold at least one documented check-in before the period closes, while there is still time to correct course.',
            'Tenez au moins une rencontre de suivi documentée avant la fin de la période, pendant qu’il est encore temps de corriger le tir.',
          ),
          li(
            'Say plainly when performance is falling short, and record that you said it — a reassuring conversation followed by a dismissal is difficult to defend.',
            'Dites clairement lorsque le rendement est insuffisant, et consignez que vous l’avez dit — une conversation rassurante suivie d’un congédiement est difficile à défendre.',
          ),
          li(
            'Record the specific, job-related reasons if you decide not to continue the relationship.',
            'Consignez les motifs précis et liés à l’emploi si vous décidez de ne pas poursuivre la relation.',
          ),
          li(
            'Diarize the end of the period — letting it lapse unnoticed removes whatever benefit the clause offered.',
            'Inscrivez la fin de la période à l’agenda — la laisser s’écouler sans s’en apercevoir supprime tout avantage qu’offrait la clause.',
          ),
          li(
            'Pay whatever statutory entitlement has accrued even where you are satisfied the probationary standard was met; the clause governs the assessment, not the statutory floor.',
            'Versez tout droit légal accumulé même si vous êtes convaincu que la norme de probation a été respectée; la clause régit l’évaluation, non le plancher légal.',
          ),
        ],
      },
      {
        heading: bi(
          'Extending, and other things that quietly go wrong',
          'La prolongation, et ce qui déraille discrètement',
        ),
        blocks: [
          p(
            'Extending a probationary period is not automatic. Unless the contract expressly permits an extension, doing so is a change to an agreed term and raises the same consideration problem as any mid-employment amendment. An extension imposed unilaterally may simply be ineffective, leaving the employer past the original end of the period with none of its benefit.',
            'La prolongation d’une période de probation n’est pas automatique. À moins que le contrat ne la permette expressément, la prolongation modifie une condition convenue et soulève le même problème de contrepartie que toute modification en cours d’emploi. Une prolongation imposée unilatéralement peut être tout simplement inopérante, laissant l’employeur au-delà de la fin initiale de la période sans aucun de ses avantages.',
          ),
          p(
            'Two more patterns cause avoidable trouble. Rehiring a former employee into a fresh probationary period ignores that prior service may count toward statutory entitlements. And applying a probationary clause to an internal promotion is usually ineffective, because the employee is already employed and the new terms need their own consideration.',
            'Deux autres pratiques causent des ennuis évitables. Réembaucher un ancien employé avec une nouvelle période de probation fait abstraction du fait que le service antérieur peut compter dans les droits légaux. Et appliquer une clause de probation à une promotion interne est généralement inopérant, puisque l’employé est déjà en poste et que les nouvelles conditions exigent leur propre contrepartie.',
          ),
        ],
      },
      {
        heading: bi('Four assumptions worth discarding', 'Quatre présomptions à écarter'),
        blocks: [
          p(
            'Most probation disputes trace back to a small set of beliefs that sound reasonable and are not correct:',
            'La plupart des litiges liés à la probation remontent à un petit nombre de croyances qui semblent raisonnables et ne le sont pas :',
          ),
          li(
            '"Probationary employees can be let go without notice." Statutory notice depends on length of service, not on what the contract calls the period. Once the service threshold is passed, notice is owed whatever the clause says.',
            '« On peut congédier un employé en probation sans préavis. » Le préavis légal dépend de la durée du service, non de l’appellation que le contrat donne à la période. Une fois le seuil de service franchi, le préavis est dû quoi qu’en dise la clause.',
          ),
          li(
            '"We don\'t need a reason during probation." You need a reason connected to suitability, assessed in good faith, and you need to be able to show you formed it. Not needing just cause is not the same as not needing anything.',
            '« Nous n’avons pas besoin de motif pendant la probation. » Il faut un motif lié à l’aptitude, apprécié de bonne foi, et il faut pouvoir démontrer que vous l’avez formé. Ne pas exiger de motif valable n’équivaut pas à n’exiger rien.',
          ),
          li(
            '"The handbook says employees are probationary, so they are." A policy document circulated after hiring generally does not create a contractual term the employee agreed to before starting.',
            '« Le manuel dit que les employés sont en probation, donc ils le sont. » Un document de politique diffusé après l’embauche ne crée généralement pas une condition contractuelle acceptée par l’employé avant son entrée en fonction.',
          ),
          li(
            '"Probation protects us from a human-rights complaint." It does not, at any point. Protected grounds and reprisal protections operate from the first day of employment onward.',
            '« La probation nous protège d’une plainte en droits de la personne. » Elle ne le fait à aucun moment. Les motifs protégés et les protections contre les représailles s’appliquent dès la première journée d’emploi.',
          ),
        ],
      },
      {
        heading: bi('If it is not working out', 'Si cela ne fonctionne pas'),
        blocks: [
          p(
            'Deciding not to continue is a legitimate outcome of a probationary period, and handling it well costs very little. Confirm the period has not already lapsed, confirm what statutory entitlement has accrued and pay it without argument, and write the reason down in job-related terms before the meeting rather than reconstructing it afterwards.',
            'Décider de ne pas poursuivre est une issue légitime d’une période de probation, et bien la gérer coûte très peu. Confirmez que la période n’est pas déjà écoulée, confirmez le droit légal accumulé et versez-le sans discuter, et consignez le motif en termes liés à l’emploi avant la rencontre plutôt que de le reconstituer après coup.',
          ),
          p(
            'Resist the temptation to soften the message into something that does not match the file. Telling a departing employee the role was eliminated, when the reason was suitability, creates an inconsistency that surfaces the moment the position is reposted. Brief, accurate, and consistent survives scrutiny; kind-but-inaccurate does not.',
            'Résistez à la tentation d’adoucir le message jusqu’à ce qu’il ne corresponde plus au dossier. Dire à un employé qui part que le poste a été aboli, alors que le motif était l’aptitude, crée une incohérence qui refait surface dès que le poste est réaffiché. Bref, exact et cohérent résiste à l’examen; bienveillant mais inexact, non.',
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
    readingMinutes: 5,
    updated: '2026-08-01',
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
          p(
            'This checklist is organized by when each item has to exist, because sequencing is where employers lose ground. Nothing here is exotic; the failure is almost never that an employer could not produce a document, but that it was produced late, distributed informally, or revised without anyone recording that it had been.',
            'Cette liste est organisée selon le moment où chaque élément doit exister, car c’est dans la séquence que les employeurs perdent du terrain. Rien ici n’est exotique; l’échec tient presque jamais à l’incapacité de produire un document, mais au fait qu’il a été produit tard, diffusé de façon informelle ou révisé sans que personne ne consigne qu’il l’avait été.',
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
          li(
            'A job description that reflects the work actually expected — it becomes the reference point for performance management and for accommodation questions later.',
            'Une description de poste qui reflète le travail réellement attendu — elle devient le point de référence pour la gestion du rendement et, plus tard, pour les questions d’accommodement.',
          ),
          p(
            'Signature timing matters as much as content. Send the agreement far enough ahead that the candidate has a real opportunity to read it and take advice, and keep evidence of when it was sent and when it was accepted. An agreement produced on the first morning, signed in a rush, is the version most likely to be challenged.',
            'Le moment de la signature compte autant que le contenu. Transmettez l’entente suffisamment à l’avance pour que la personne candidate ait une véritable occasion de la lire et de consulter, et conservez la preuve du moment de l’envoi et de l’acceptation. Une entente produite le premier matin et signée à la hâte est la version la plus susceptible d’être contestée.',
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
          li(
            'Remote and hybrid work arrangements, including which jurisdiction’s rules govern an employee who works from another province.',
            'Modalités de télétravail et de travail hybride, y compris la compétence dont les règles régissent un employé qui travaille depuis une autre province.',
          ),
          p(
            'Requirements differ by jurisdiction and often by headcount, and several of these obligations are triggered by thresholds rather than applying to everyone. Confirm which ones bind you rather than adopting a generic set, and revisit the question as the business grows past the point where new obligations attach.',
            'Les exigences varient selon la compétence et souvent selon l’effectif, et plusieurs de ces obligations sont déclenchées par des seuils plutôt que de s’appliquer à tous. Confirmez celles qui vous lient plutôt que d’adopter un ensemble générique, et réexaminez la question à mesure que l’entreprise franchit les seuils qui font naître de nouvelles obligations.',
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
          p(
            'Version control is the quiet half of this. When a policy is questioned, the useful record is not simply the current text but which text was in force at the relevant time and who had received it by then. Keep superseded versions with their dates rather than overwriting them, and note when training was delivered where training is part of the obligation.',
            'Le contrôle des versions en est la moitié discrète. Lorsqu’une politique est contestée, le registre utile n’est pas seulement le texte actuel, mais celui qui était en vigueur au moment pertinent et les personnes qui l’avaient alors reçu. Conservez les versions antérieures avec leurs dates plutôt que de les écraser, et notez le moment où la formation a été donnée lorsqu’elle fait partie de l’obligation.',
          ),
        ],
      },
      {
        heading: bi('What to keep during employment', 'Ce qu’il faut conserver pendant l’emploi'),
        blocks: [
          p(
            'The file continues after onboarding, and the entries added along the way are what a performance-based decision later rests on. Keep them contemporaneous and factual:',
            'Le dossier se poursuit après l’intégration, et les inscriptions ajoutées en cours de route sont ce sur quoi reposera plus tard une décision fondée sur le rendement. Tenez-les à jour et factuelles :',
          ),
          li(
            'Payroll and hours records for the retention period your jurisdiction sets, including overtime and any averaging or banked-time arrangements.',
            'Les registres de paie et d’heures pour la période de conservation fixée par votre compétence, y compris les heures supplémentaires et toute entente d’étalement ou de banque de temps.',
          ),
          li(
            'Performance reviews, and any written feedback given outside a formal review cycle.',
            'Les évaluations de rendement, et toute rétroaction écrite donnée en dehors d’un cycle formel d’évaluation.',
          ),
          li(
            'Records of leaves taken, accommodation requests, and what was agreed in response.',
            'Les registres des congés pris, des demandes d’accommodement et de ce qui a été convenu en réponse.',
          ),
          li(
            'Any change to terms — compensation, role, reporting, location — along with what the employee received in exchange for agreeing to it.',
            'Toute modification aux conditions — rémunération, poste, lien hiérarchique, lieu de travail — avec ce que l’employé a reçu en contrepartie de son accord.',
          ),
          li(
            'Incident, investigation, and disciplinary records, kept separately from the general personnel file where privacy obligations call for it.',
            'Les dossiers d’incidents, d’enquêtes et de mesures disciplinaires, conservés séparément du dossier du personnel lorsque les obligations de confidentialité l’exigent.',
          ),
        ],
      },
      {
        heading: bi(
          'Closing gaps on an existing team',
          'Combler les lacunes dans une équipe en place',
        ),
        blocks: [
          p(
            'Most employers reading a checklist like this discover they are missing items for people who are already employed. That is a normal position to be in, and it is fixable — but not by circulating the missing documents and asking for signatures, because a term introduced mid-employment generally needs fresh consideration to bind. Something of value has to change hands.',
            'La plupart des employeurs qui lisent une liste comme celle-ci constatent qu’il leur manque des éléments pour des personnes déjà à l’emploi. C’est une situation normale, et elle se corrige — mais pas en faisant circuler les documents manquants pour signature, car une condition introduite en cours d’emploi exige généralement une contrepartie nouvelle pour lier. Quelque chose de valeur doit être échangé.',
          ),
          p(
            'A workable sequence is to separate the items by whether they impose obligations on the employee. Policies you are required to have, and records you are required to keep, can and should be put in place immediately — distributing a harassment-prevention policy to existing staff creates no consideration problem. Contractual terms that restrict the employee, such as a termination clause or a restrictive covenant, are the ones that need a genuine exchange, and are best attached to a moment where something is already changing: a promotion, a compensation adjustment, or a role change.',
            'Une séquence viable consiste à séparer les éléments selon qu’ils imposent ou non des obligations à l’employé. Les politiques que vous devez avoir et les registres que vous devez tenir peuvent et devraient être mis en place immédiatement — diffuser une politique de prévention du harcèlement au personnel en poste ne pose aucun problème de contrepartie. Les conditions contractuelles qui restreignent l’employé, comme une clause de cessation d’emploi ou une clause restrictive, sont celles qui exigent un échange véritable, et gagnent à être rattachées à un moment où quelque chose change déjà : une promotion, un ajustement salarial ou un changement de poste.',
          ),
          p(
            'Do not backdate anything. A document signed today and dated to the hiring date is worse than no document, because it converts a gap into a credibility problem that taints the rest of the file.',
            'N’antidatez rien. Un document signé aujourd’hui et daté du jour de l’embauche est pire que l’absence de document, car il transforme une lacune en problème de crédibilité qui contamine le reste du dossier.',
          ),
        ],
      },
      {
        heading: bi(
          'Employees in more than one jurisdiction',
          'Des employés dans plus d’une compétence',
        ),
        blocks: [
          p(
            'A single set of documents stops working the moment the team crosses a provincial line, and remote hiring means many employers cross one without deciding to. Employment standards, required policies, privacy obligations, and payroll all follow the applicable jurisdiction rather than the location of the head office.',
            'Un ensemble unique de documents cesse de fonctionner dès que l’équipe franchit une frontière provinciale, et l’embauche à distance fait que bien des employeurs en franchissent une sans l’avoir décidé. Les normes d’emploi, les politiques obligatoires, les obligations en matière de vie privée et la paie suivent la compétence applicable plutôt que l’emplacement du siège social.',
          ),
          li(
            'Record where each employee actually works, not simply which office they are attached to on the org chart.',
            'Consignez l’endroit où chaque employé travaille réellement, et non seulement le bureau auquel l’organigramme le rattache.',
          ),
          li(
            'Confirm whether the operation is provincially or federally regulated before selecting any template — the choice governs nearly everything downstream.',
            'Confirmez si l’exploitation relève du provincial ou du fédéral avant de choisir un modèle — ce choix régit presque tout le reste.',
          ),
          li(
            'Check language-of-work obligations where they apply, which can govern the language the employment documents themselves are provided in.',
            'Vérifiez les obligations relatives à la langue du travail lorsqu’elles s’appliquent, car elles peuvent régir la langue dans laquelle les documents d’emploi eux-mêmes sont remis.',
          ),
          li(
            'Revisit the set when someone relocates — a move can change which rules apply without any change to the job.',
            'Réexaminez l’ensemble lorsqu’une personne déménage — un déplacement peut changer les règles applicables sans aucun changement à l’emploi.',
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
    readingMinutes: 5,
    updated: '2026-08-01',
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
          p(
            'That interpretive posture has a practical consequence worth internalizing before reading any further: a clause does not have to be unfair to fail. It only has to be capable of operating unfairly in some scenario the drafter did not consider. Most struck-down clauses were written by someone competent who simply did not imagine the fact pattern a court later applied them to.',
            'Cette approche interprétative a une conséquence pratique qu’il vaut la peine d’intégrer avant d’aller plus loin : une clause n’a pas besoin d’être inéquitable pour échouer. Il suffit qu’elle puisse produire un résultat inéquitable dans un scénario que le rédacteur n’a pas envisagé. La plupart des clauses invalidées ont été rédigées par une personne compétente qui n’avait simplement pas imaginé la situation à laquelle un tribunal les a ensuite appliquées.',
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
          p(
            'A saving provision — wording that promises the employee will always receive at least the statutory minimum — is sometimes offered as insurance. It is not reliable insurance. Where the operative language is itself defective, a general promise to comply has often been treated as insufficient to cure it, on the reasoning that an employee reading the contract would be guided by the specific term rather than the disclaimer.',
            'Une clause de sauvegarde — un libellé promettant que l’employé recevra toujours au moins le minimum légal — est parfois présentée comme une assurance. Ce n’en est pas une fiable. Lorsque le libellé opérant est lui-même défectueux, une promesse générale de conformité a souvent été jugée insuffisante pour le corriger, au motif que l’employé qui lit le contrat se fierait à la clause précise plutôt qu’à l’avertissement.',
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
          p(
            'Where a restrictive covenant is available to you, scope is what decides enforceability: the activity restrained, the geography, and the duration all have to be no wider than the legitimate interest being protected. Courts generally will not read down an overbroad covenant to a reasonable one — the usual outcome is that it fails entirely, leaving the employer with nothing where a narrower clause would have held.',
            'Lorsqu’une clause restrictive vous est ouverte, c’est la portée qui détermine son caractère exécutoire : l’activité visée, le territoire et la durée ne doivent pas dépasser l’intérêt légitime protégé. Les tribunaux ne réduisent généralement pas une clause trop large à une clause raisonnable — le résultat habituel est qu’elle échoue en entier, ne laissant rien à l’employeur là où une clause plus étroite aurait tenu.',
          ),
          p(
            'Confidentiality obligations are a different matter and are generally enforceable on their own terms, because they protect information rather than restrain employment. For many roles, a well-drafted confidentiality and non-solicitation pairing protects the real interest without the enforceability risk a non-compete carries.',
            'Les obligations de confidentialité relèvent d’une autre logique et sont généralement exécutoires selon leurs propres termes, parce qu’elles protègent de l’information plutôt que de restreindre l’emploi. Pour bien des postes, un jumelage bien rédigé de confidentialité et de non-sollicitation protège l’intérêt réel sans le risque d’inapplicabilité que comporte une non-concurrence.',
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
          p(
            'A requirement to be "actively employed" on a payment date is the wording most often litigated, and it frequently fails. The reasoning is that an employee dismissed without proper notice would have been actively employed had the notice been given, so the condition cannot defeat what the notice period would have produced. Language that clearly and unambiguously removes the entitlement during the notice period is a drafting exercise worth doing carefully rather than by habit.',
            'L’exigence d’être « activement à l’emploi » à une date de versement est le libellé le plus souvent contesté, et il échoue fréquemment. Le raisonnement est que l’employé congédié sans préavis suffisant aurait été activement à l’emploi si le préavis avait été donné; la condition ne peut donc faire échec à ce que la période de préavis aurait produit. Un libellé qui écarte clairement et sans ambiguïté le droit pendant la période de préavis est un exercice de rédaction à faire soigneusement plutôt que par habitude.',
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
          p(
            'Promotions are the moment this is most often missed. A contract signed at hiring for a junior role may not sensibly govern the same person after several advancements, and an old termination clause can be argued to have been displaced by a substantially new bargain. Refresh the agreement at each material change, with consideration attached, rather than discovering the gap at the end.',
            'Les promotions sont le moment où l’on manque le plus souvent ce point. Un contrat signé à l’embauche pour un poste subalterne peut ne plus régir sensément la même personne après plusieurs avancements, et on peut plaider qu’une ancienne clause de cessation d’emploi a été écartée par une entente substantiellement nouvelle. Renouvelez l’entente à chaque changement important, avec une contrepartie, plutôt que de découvrir la faille à la fin.',
          ),
        ],
      },
      {
        heading: bi(
          'Which law governs, and who is even an employee',
          'Quel droit s’applique, et qui est même un employé',
        ),
        blocks: [
          p(
            'Two threshold questions sit underneath every clause above. First, whether the worker is an employee at all: misclassifying an employee as an independent contractor does not remove statutory entitlements, and the label the parties used carries little weight against how the relationship actually operated. Dependent contractors — genuinely independent but economically reliant on one client — occupy a middle category that also attracts reasonable notice.',
            'Deux questions préalables sous-tendent chacune des clauses ci-dessus. D’abord, celle de savoir si le travailleur est bel et bien un employé : classer à tort un employé comme entrepreneur indépendant ne supprime pas les droits légaux, et l’étiquette utilisée par les parties pèse peu face au fonctionnement réel de la relation. Les entrepreneurs dépendants — véritablement indépendants mais économiquement tributaires d’un seul client — forment une catégorie intermédiaire qui donne aussi droit à un préavis raisonnable.',
          ),
          p(
            'Second, which jurisdiction’s standards apply. Most employers are provincially regulated, but a defined set of industries falls under the Canada Labour Code, and an employee working remotely from another province may be governed by that province’s rules rather than the one your office sits in. A governing-law clause does not settle the question, because employment standards legislation applies as public order regardless of what the contract chose.',
            'Ensuite, quelles normes s’appliquent. La plupart des employeurs relèvent du provincial, mais un ensemble défini de secteurs relève du Code canadien du travail, et un employé en télétravail depuis une autre province peut être régi par les règles de cette province plutôt que par celles où se trouve votre bureau. Une clause de droit applicable ne règle pas la question, car la législation sur les normes d’emploi s’applique d’ordre public, quel que soit le choix du contrat.',
          ),
        ],
      },
      {
        heading: bi(
          'Clauses employers most often leave out',
          'Les clauses que les employeurs omettent le plus souvent',
        ),
        blocks: [
          p(
            'Borrowed agreements tend to carry the same familiar terms and omit the same useful ones. These are worth considering deliberately rather than by default:',
            'Les ententes empruntées reprennent souvent les mêmes clauses familières et omettent les mêmes clauses utiles. Celles-ci méritent d’être envisagées délibérément plutôt que par défaut :',
          ),
          li(
            'A temporary-layoff provision. Absent an agreed right to lay off, imposing one can itself be treated as a termination — a lesson many employers learned the expensive way during business interruptions.',
            'Une clause de mise à pied temporaire. En l’absence d’un droit convenu de mise à pied, en imposer une peut être assimilé à une cessation d’emploi — une leçon que bien des employeurs ont apprise à leurs dépens lors d’interruptions d’activité.',
          ),
          li(
            'Written authorization for any permissible payroll deduction, which is generally required before an amount may be withheld.',
            'Une autorisation écrite pour toute retenue salariale permise, généralement exigée avant qu’un montant puisse être retenu.',
          ),
          li(
            'Clear intellectual-property assignment, including work created outside core hours where the role makes that foreseeable.',
            'Une cession claire de propriété intellectuelle, y compris pour les créations réalisées en dehors des heures habituelles lorsque le poste le rend prévisible.',
          ),
          li(
            'A term addressing changes to duties, location, or reporting, so ordinary evolution of the role does not become an argument about constructive dismissal.',
            'Une clause traitant des changements de tâches, de lieu de travail ou de lien hiérarchique, afin que l’évolution normale du poste ne devienne pas un argument de congédiement déguisé.',
          ),
          li(
            'Return of property and records on departure, including material held on personal devices.',
            'La restitution des biens et des dossiers au départ, y compris le matériel conservé sur des appareils personnels.',
          ),
          p(
            "Two cautions on drafting them. Anything that touches an employee's statutory entitlement has to be checked against the applicable legislation rather than assumed portable from another jurisdiction, and a clause borrowed from a United States agreement is more likely to be unenforceable here than merely unusual — at-will employment has no Canadian equivalent, and terms built on that assumption tend to fail.",
            'Deux mises en garde sur leur rédaction. Tout ce qui touche un droit légal de l’employé doit être vérifié au regard de la législation applicable plutôt que présumé transposable d’une autre compétence, et une clause tirée d’une entente américaine risque davantage d’être inapplicable ici que simplement inhabituelle — l’emploi « à volonté » n’a aucun équivalent canadien, et les clauses fondées sur cette prémisse échouent généralement.',
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
    readingMinutes: 5,
    updated: '2026-08-01',
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
          p(
            'That trigger is worth dwelling on, because it is where employers most often start from the wrong place. There is no magic word. An employee who says they are struggling since a diagnosis, or that a shift pattern conflicts with a caregiving obligation, has raised the duty just as effectively as one who files a written request. Where the need is obvious from circumstances, the obligation can arise even without the employee raising it at all.',
            'Ce déclencheur mérite qu’on s’y arrête, car c’est là que les employeurs partent le plus souvent du mauvais pied. Il n’existe aucune formule consacrée. L’employé qui dit éprouver des difficultés depuis un diagnostic, ou qu’un horaire entre en conflit avec une obligation de proche aidant, a fait naître l’obligation aussi efficacement que celui qui dépose une demande écrite. Lorsque le besoin est évident au vu des circonstances, l’obligation peut naître même sans que l’employé l’ait soulevé.',
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
          p(
            'Scale matters to the analysis: what is genuinely unaffordable for a small employer may be routine for a large one, and the same accommodation can therefore cross the line in one workplace and not another. Business inconvenience, customer preference, and morale complaints from colleagues are generally not accepted as hardship at all. If you intend to rely on cost, be prepared to show the calculation and what alternatives were priced alongside it.',
            'L’échelle compte dans l’analyse : ce qui est véritablement inabordable pour un petit employeur peut être courant pour un grand, et le même accommodement peut donc franchir le seuil dans un milieu et non dans un autre. L’inconvénient commercial, la préférence de la clientèle et les récriminations de collègues ne sont généralement pas admis comme contrainte. Si vous comptez invoquer le coût, soyez prêt à montrer le calcul et les solutions de rechange évaluées en parallèle.',
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
          p(
            'Delay is itself a form of failure. An accommodation eventually granted after months of unanswered follow-ups has often been treated as a breach regardless of the outcome, because the employee bore the consequences throughout. Acknowledge promptly, set an interim arrangement where the final answer will take time, and keep the employee informed while you work it out.',
            'Le retard constitue en soi un manquement. Un accommodement finalement accordé après des mois de relances sans réponse a souvent été considéré comme une violation quel qu’en soit le résultat, parce que l’employé en a subi les conséquences tout du long. Accusez réception rapidement, prévoyez une mesure provisoire lorsque la réponse définitive prendra du temps, et tenez l’employé informé pendant que vous cherchez la solution.',
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
          p(
            'Handle what you do collect accordingly: restrict it to those who need it to implement the accommodation, keep it apart from the general personnel file, and tell the employee’s manager what the restrictions are rather than why they exist. A manager can schedule around a lifting limit without knowing the condition behind it.',
            'Traitez en conséquence ce que vous recueillez : limitez-en l’accès aux personnes qui en ont besoin pour mettre en œuvre l’accommodement, conservez-le à l’écart du dossier général du personnel, et indiquez au gestionnaire de l’employé quelles sont les restrictions plutôt que leur cause. Un gestionnaire peut organiser l’horaire en fonction d’une limite de charge sans connaître la condition qui la motive.',
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
          p(
            'Unions carry a role as well in organized workplaces, and an accommodation that touches the collective agreement usually needs their participation rather than a private arrangement between employer and employee. A collective agreement does not override human-rights obligations, but the parties are generally expected to work the accommodation through together.',
            'Le syndicat joue également un rôle dans les milieux syndiqués, et un accommodement qui touche la convention collective exige habituellement sa participation plutôt qu’une entente privée entre l’employeur et l’employé. Une convention collective ne prime pas les obligations en matière de droits de la personne, mais on s’attend généralement à ce que les parties élaborent l’accommodement ensemble.',
          ),
        ],
      },
      {
        heading: bi('Where accommodation runs out', 'Lorsque l’accommodement atteint sa limite'),
        blocks: [
          p(
            'The duty does not require an employer to create a job that does not exist, to keep a position open indefinitely with no prospect of return, or to retain an employee who cannot perform the essential duties of any available role even with accommodation. Where an employment relationship genuinely cannot continue, ending it may be lawful — but the analysis is evidence-heavy and the record you built along the way is what carries it.',
            'L’obligation n’exige pas de l’employeur qu’il crée un poste qui n’existe pas, qu’il maintienne indéfiniment un poste vacant sans perspective de retour, ni qu’il conserve un employé incapable d’accomplir les tâches essentielles d’un poste disponible même avec accommodement. Lorsqu’une relation d’emploi ne peut véritablement pas se poursuivre, y mettre fin peut être licite — mais l’analyse repose lourdement sur la preuve, et c’est le dossier constitué en cours de route qui la soutient.',
          ),
          p(
            'Distinguish essential duties from tasks that have simply always been bundled into the role. Employers frequently assert that a function is essential when it is incidental, or that no alternative position exists without having actually canvassed the organization. Both assertions are tested on evidence, and both are commonly where the employer’s case gives way.',
            'Distinguez les tâches essentielles de celles qui ont simplement toujours été rattachées au poste. Les employeurs affirment fréquemment qu’une fonction est essentielle alors qu’elle est accessoire, ou qu’aucun autre poste n’existe sans avoir réellement sondé l’organisation. Ces deux affirmations sont éprouvées par la preuve, et c’est couramment là que la position de l’employeur cède.',
          ),
        ],
      },
      {
        heading: bi('Grounds beyond disability', 'Des motifs au-delà du handicap'),
        blocks: [
          p(
            'Disability accommodation is the most familiar, but it is not the whole obligation, and the less familiar grounds are where employers are most likely to respond badly without meaning to.',
            'L’accommodement du handicap est le plus connu, mais il ne constitue pas toute l’obligation, et c’est à l’égard des motifs moins familiers que les employeurs risquent le plus de mal réagir sans le vouloir.',
          ),
          li(
            'Family status, typically engaging childcare or eldercare obligations. The tests applied have differed across Canadian jurisdictions, so the threshold question of what an employee must show is itself jurisdiction-specific.',
            'La situation de famille, qui met généralement en jeu des obligations de garde d’enfants ou de proches aînés. Les critères appliqués ont varié d’une compétence canadienne à l’autre; la question préalable de ce que l’employé doit démontrer est donc elle-même propre à la compétence.',
          ),
          li(
            'Religion and creed, which can engage scheduling, dress and grooming standards, and time for observance.',
            'La religion et les croyances, qui peuvent toucher les horaires, les normes vestimentaires et de présentation, ainsi que le temps consacré à la pratique.',
          ),
          li(
            'Pregnancy and breastfeeding, including modified duties and facilities, and protection on return from leave.',
            'La grossesse et l’allaitement, y compris les tâches modifiées et les installations, ainsi que la protection au retour de congé.',
          ),
          li(
            'Gender identity and gender expression, including records, names, and facilities.',
            'L’identité et l’expression de genre, y compris les dossiers, les noms et les installations.',
          ),
          li(
            'Addiction, which is generally treated as a disability rather than as misconduct — a distinction that reshapes how a workplace policy breach is handled.',
            'La dépendance, généralement traitée comme un handicap plutôt que comme une inconduite — une distinction qui transforme la façon de traiter un manquement à une politique.',
          ),
          p(
            'Two grounds can also intersect in one situation, and an employee is not required to pick the most convenient label for the employer. Respond to the need described rather than to the category it seems to fall into.',
            'Deux motifs peuvent aussi se croiser dans une même situation, et l’employé n’est pas tenu de choisir l’étiquette la plus commode pour l’employeur. Répondez au besoin décrit plutôt qu’à la catégorie dans laquelle il semble entrer.',
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
    updated: '2026-08-01',
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
          p(
            'The habit worth building is separating three questions that tend to collapse into one under pressure: what happened, what you are entitled to do about it, and how you will describe it. The first is a record-keeping exercise that should already be done. The second is a legal question. The third is a communication decision that has to be consistent everywhere it appears.',
            'L’habitude à développer consiste à séparer trois questions qui tendent à se confondre sous pression : ce qui s’est passé, ce que vous avez le droit de faire, et la façon dont vous le décrirez. La première est un exercice de tenue de dossiers qui devrait déjà être fait. La deuxième est une question juridique. La troisième est une décision de communication qui doit être cohérente partout où elle apparaît.',
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
          li(
            'Check whether the employee is on or has recently requested a leave, raised a safety concern, or sought an accommodation — any of which changes the analysis before anything else does.',
            'Vérifiez si l’employé est en congé ou en a récemment demandé un, a soulevé une préoccupation de sécurité ou demandé un accommodement — chacun de ces éléments modifie l’analyse avant tout le reste.',
          ),
          li(
            'Prepare the logistics: system access, property return, and how the departure will be communicated internally.',
            'Préparez la logistique : accès aux systèmes, restitution des biens et façon dont le départ sera communiqué à l’interne.',
          ),
        ],
      },
      {
        heading: bi(
          'What the letter should and should not do',
          'Ce que la lettre doit faire et ne pas faire',
        ),
        blocks: [
          p(
            'A termination letter is a record that will be read by people who were not present. It should state the effective date, what is being provided and on what basis, the position on benefits, and what the employee needs to do next. It should be legible to someone reading it cold.',
            'Une lettre de cessation d’emploi est un document que liront des personnes qui n’étaient pas présentes. Elle doit indiquer la date d’effet, ce qui est offert et à quel titre, la position sur les avantages sociaux, et ce que l’employé doit faire ensuite. Elle doit être compréhensible pour quelqu’un qui la découvre sans contexte.',
          ),
          p(
            'What it should not do is argue. A letter that catalogues grievances, characterizes the employee’s personality, or justifies the decision at length creates material that will be examined line by line, and it rarely improves the employer’s position. Where a release is being sought in exchange for an enhanced package, keep the offer distinct from the statement of entitlements so it is clear what is owed regardless and what is conditional.',
            'Ce qu’elle ne doit pas faire, c’est plaider. Une lettre qui recense les griefs, qualifie la personnalité de l’employé ou justifie longuement la décision crée une matière qui sera examinée ligne par ligne, et elle améliore rarement la position de l’employeur. Lorsqu’une quittance est recherchée en échange d’une offre bonifiée, gardez l’offre distincte de l’énoncé des droits, afin qu’il soit clair ce qui est dû de toute façon et ce qui est conditionnel.',
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
          p(
            'The same discipline applies to what is said internally and to references given afterwards. Colleagues asking what happened, a manager explaining the change to a team, and a reference request answered later all generate statements that can be produced. Agree the internal wording at the same time as the letter, keep it brief and factual, and make sure whoever handles references knows what it is.',
            'La même discipline vaut pour ce qui est dit à l’interne et pour les références données par la suite. Les collègues qui demandent ce qui s’est passé, le gestionnaire qui explique le changement à une équipe et une demande de références traitée plus tard produisent tous des déclarations qui peuvent être mises en preuve. Convenez du libellé interne en même temps que de la lettre, gardez-le bref et factuel, et assurez-vous que la personne qui traite les références sait ce qu’il est.',
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
          li(
            'Confirm the final payment actually went out as described, and keep proof — a letter promising something the payroll run did not deliver is a familiar and avoidable problem.',
            'Confirmez que le paiement final a réellement été versé comme annoncé, et conservez-en la preuve — une lettre promettant ce que la paie n’a pas livré est un problème courant et évitable.',
          ),
        ],
      },
      {
        heading: bi(
          'Releases are not automatically binding',
          'Les quittances ne sont pas automatiquement exécutoires',
        ),
        blocks: [
          p(
            'A signed release is valuable but not invulnerable. It generally needs to be supported by consideration beyond what the employee was already owed, and it is more likely to hold where the employee had a genuine opportunity to consider it and to take independent legal advice. A release presented in the termination meeting with an expectation of immediate signature is the version most often challenged.',
            'Une quittance signée est utile, mais pas invulnérable. Elle doit généralement être appuyée par une contrepartie qui dépasse ce qui était déjà dû à l’employé, et elle tient plus solidement lorsque l’employé a eu une véritable occasion de l’examiner et d’obtenir un avis juridique indépendant. Une quittance présentée en pleine rencontre de cessation d’emploi avec une attente de signature immédiate est la version la plus souvent contestée.',
          ),
          p(
            'Note as well that a release cannot waive certain statutory entitlements, and that human-rights claims may require specific language to be covered at all. Draft it for the situation rather than reusing a general form, and keep the evidence of what the employee received in exchange filed alongside it.',
            'Notez également qu’une quittance ne peut renoncer à certains droits prévus par la loi, et que les réclamations en matière de droits de la personne peuvent exiger un libellé précis pour être visées. Rédigez-la pour la situation plutôt que de réutiliser un formulaire général, et conservez au dossier la preuve de ce que l’employé a reçu en contrepartie.',
          ),
        ],
      },
      {
        heading: bi(
          'The Record of Employment deserves its own attention',
          'Le relevé d’emploi mérite une attention distincte',
        ),
        blocks: [
          p(
            'The Record of Employment is a federal filing that follows every interruption of earnings, whatever the reason and whichever jurisdiction governs the employment. It is easy to treat as an administrative afterthought, and it is the document most likely to contradict the rest of the file — because it is often completed by payroll, days later, without sight of the termination letter.',
            'Le relevé d’emploi est une déclaration fédérale qui suit toute interruption de la rémunération, quel qu’en soit le motif et quelle que soit la compétence qui régit l’emploi. Il est facile de le traiter comme une formalité administrative, et c’est le document le plus susceptible de contredire le reste du dossier — parce qu’il est souvent rempli par la paie, quelques jours plus tard, sans avoir vu la lettre de cessation d’emploi.',
          ),
          p(
            'The reason code selected is a statement about why the employment ended, and it will be read alongside everything else you said. A code indicating dismissal where the letter described a restructuring, or the reverse, is the kind of inconsistency that is difficult to explain later. Decide the characterization once, and make sure the person completing the filing is told what it is.',
            'Le code de motif retenu constitue une déclaration sur la raison de la fin d’emploi, et il sera lu avec tout le reste de ce que vous avez dit. Un code indiquant un congédiement alors que la lettre décrivait une restructuration, ou l’inverse, est le genre d’incohérence difficile à expliquer par la suite. Arrêtez la qualification une fois, et assurez-vous que la personne qui remplit la déclaration en soit informée.',
          ),
          p(
            'Delays carry their own consequence: the filing is what a former employee needs to access benefits, and a late or incorrect one produces an avoidable grievance at exactly the moment goodwill matters most. Treat issuing it accurately and on time as part of the termination, not as cleanup afterwards.',
            'Les retards ont leur propre conséquence : cette déclaration est ce dont un ancien employé a besoin pour accéder aux prestations, et un relevé tardif ou erroné crée un grief évitable précisément au moment où la bonne volonté compte le plus. Considérez sa production exacte et dans les délais comme faisant partie de la cessation d’emploi, et non comme un nettoyage ultérieur.',
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
