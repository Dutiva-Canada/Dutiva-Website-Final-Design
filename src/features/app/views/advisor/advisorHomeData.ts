import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { cases, complianceItems, complianceScore, employeeDetails, employees, tasks } from '@/data'

/**
 * Advisor home (empty state) widgets — the port of the prototype's
 * `buildAdvisorHomeWidgets()` and `buildPriorities()`. Counts are derived
 * from the fixtures the same way the prototype derives them from its state.
 *
 * EN verbatim; FR from the prototype's inline `L(en, fr)` pairs and the
 * `fr ? … : …` branches of `buildPriorities()`.
 */

export type MetricTone = 'risk' | 'warning' | 'info' | 'success'
export type TrendTone = 'risk' | 'success' | 'muted'

export interface HomeMetric {
  value: string
  suffix: string
  tone: MetricTone
  trend: Bi
  trendTone: TrendTone
  /** Workspace view the tile deep-links to (route segment under /app). */
  view: 'compliance' | 'cases' | 'wellbeing'
  /** Message key resolved by the view (advisorViewMessages). */
  labelKey: 'compliance' | 'risk' | 'cases' | 'signals'
}

const DEFAULT_SENTIMENT = 78

/** Prototype `buildWellbeingView().attention` — sentiment < 55 head-count. */
export function supportAttentionCount(): number {
  return employees.filter((e) => (employeeDetails[e.id]?.sentiment ?? DEFAULT_SENTIMENT) < 55)
    .length
}

export function buildHomeMetrics(): HomeMetric[] {
  const openCases = cases.filter((c) => c.status.en !== 'Resolved').length
  const openTasks = tasks.filter((t) => !t.done).length
  const openRisk = complianceItems.filter((c) => c.severity !== 'Resolved').length
  const highRisk = complianceItems.filter((c) => c.severity === 'High').length
  const attention = supportAttentionCount()
  return [
    {
      labelKey: 'compliance',
      value: String(complianceScore),
      suffix: '/100',
      tone: 'warning',
      trend: bi('+8 in 6 mo', '+8 en 6 mois'),
      trendTone: 'success',
      view: 'compliance',
    },
    {
      labelKey: 'risk',
      value: String(openRisk),
      suffix: '',
      tone: 'risk',
      trend: bi(`${highRisk} high`, `${highRisk} élevés`),
      trendTone: 'risk',
      view: 'compliance',
    },
    {
      labelKey: 'cases',
      value: String(openCases),
      suffix: '',
      tone: 'info',
      trend: bi(`${openTasks} open tasks`, `${openTasks} tâches ouvertes`),
      trendTone: 'muted',
      view: 'cases',
    },
    {
      labelKey: 'signals',
      value: String(attention),
      suffix: '',
      tone: attention ? 'warning' : 'success',
      trend: bi('supportive follow-up only', 'suivi de soutien seulement'),
      trendTone: 'muted',
      view: 'wellbeing',
    },
  ]
}

/* -------------------------------------------------------------- priorities */

export type PrioritySeverity = 'High' | 'Medium' | 'Low'
export type PriorityTone = 'risk' | 'warning' | 'info'

/** Declarative priority action — the view wires these to navigation/rail/doc-studio. */
export type PriorityAction =
  | { kind: 'open-case'; caseId: string }
  | { kind: 'draft-doc'; docKey: string }
  | { kind: 'comp-rail'; employeeId: string }
  | { kind: 'wellbeing-rail'; employeeId: string }

export interface HomePriority {
  id: string
  severity: PrioritySeverity
  tone: PriorityTone
  title: Bi
  meta: Bi
  why: Bi
  actionLabel: Bi
  action: PriorityAction
}

export const severityLabels: Record<PrioritySeverity, Bi> = {
  High: bi('High', 'Élevé'),
  Medium: bi('Medium', 'Moyen'),
  Low: bi('Low', 'Faible'),
}

/** Prototype `buildPriorities()` — already sorted High → Low. */
export const homePriorities: HomePriority[] = [
  {
    id: 'pr1',
    severity: 'High',
    tone: 'risk',
    title: bi(
      'Jordan Mensah — counsel response outstanding',
      'Jordan Mensah — réponse du conseiller juridique en attente',
    ),
    meta: bi(
      'Termination · Ontario · Due today · Owner: Riley Summers',
      'Cessation d’emploi · Ontario · Échéance : aujourd’hui · Resp. : Riley Summers',
    ),
    why: bi(
      'A legal-review request has been open since Jul 5. The preliminary notice estimate (9–12 months) remains unreviewed until counsel replies.',
      'Une demande d’examen juridique est ouverte depuis le 5 juillet. L’estimation préliminaire du préavis (9 à 12 mois) reste non révisée tant que le conseiller n’a pas répondu.',
    ),
    actionLabel: bi('Open case', 'Ouvrir le dossier'),
    action: { kind: 'open-case', caseId: 'case1' },
  },
  {
    id: 'pr2',
    severity: 'High',
    tone: 'risk',
    title: bi(
      'Remote Work Policy overdue by 14 months',
      'Politique de télétravail en retard de 14 mois',
    ),
    meta: bi(
      'Policy · Multi-province · Due Jul 11 · Owner: Riley Summers',
      'Politique · Multiprovincial · Échéance : 11 juillet · Resp. : Riley Summers',
    ),
    why: bi(
      'OHS and expense obligations changed as you added provinces. An overdue policy is the largest single drag on your compliance score.',
      'Les obligations en SST et en dépenses ont changé à mesure que vous ajoutiez des provinces. Une politique en retard est le plus grand frein à votre score de conformité.',
    ),
    actionLabel: bi('Draft refresh', 'Rédiger une mise à jour'),
    action: { kind: 'draft-doc', docKey: 'Remote Work Policy' },
  },
  {
    id: 'pr3',
    severity: 'Medium',
    tone: 'warning',
    title: bi(
      'Amara Okafor — accommodation review due Jul 14',
      'Amara Okafor — examen d’accommodement dû le 14 juillet',
    ),
    meta: bi(
      'Accommodation · British Columbia · Due Jul 14 · Owner: Morgan Chen',
      'Accommodement · Colombie-Britannique · Échéance : 14 juillet · Resp. : Morgan Chen',
    ),
    why: bi(
      'The 90-day modified-duties review is approaching. Confirm functional limitations are unchanged before the date.',
      'L’examen des tâches modifiées à 90 jours approche. Confirmez que les limitations fonctionnelles sont inchangées avant la date.',
    ),
    actionLabel: bi('Open case', 'Ouvrir le dossier'),
    action: { kind: 'open-case', caseId: 'case3' },
  },
  {
    id: 'pr4',
    severity: 'Medium',
    tone: 'warning',
    title: bi(
      'Devon Clarke — PIP 30-day check-in Jul 22',
      'Devon Clarke — suivi du PAR à 30 jours le 22 juillet',
    ),
    meta: bi(
      'Performance · Ontario · Due Jul 22 · Owner: Riley Summers',
      'Rendement · Ontario · Échéance : 22 juillet · Resp. : Riley Summers',
    ),
    why: bi(
      'The documented check-in must be held against measurable attendance expectations to stay defensible.',
      'Le suivi documenté doit être tenu par rapport à des attentes d’assiduité mesurables pour rester défendable.',
    ),
    actionLabel: bi('Open case', 'Ouvrir le dossier'),
    action: { kind: 'open-case', caseId: 'case2' },
  },
  {
    id: 'pr5',
    severity: 'Medium',
    tone: 'warning',
    title: bi(
      'Théo Lavoie — pay 10% below market midpoint',
      'Théo Lavoie — salaire 10 % sous le point milieu du marché',
    ),
    meta: bi(
      'Compensation · Quebec · Next comp cycle · Owner: Finance + HR',
      'Rémunération · Québec · Prochain cycle · Resp. : Finances + RH',
    ),
    why: bi(
      'Sustained below-midpoint pay for a comparable role is a retention and pay-equity risk. Model an adjustment at the next cycle.',
      'Un salaire soutenu sous le point milieu pour un poste comparable présente un risque de rétention et d’équité salariale. Modélisez un ajustement au prochain cycle.',
    ),
    actionLabel: bi('Review pay', 'Réviser le salaire'),
    action: { kind: 'comp-rail', employeeId: 'e10' },
  },
  {
    id: 'pr6',
    severity: 'Low',
    tone: 'info',
    title: bi('Grace Osei — wellbeing trending down', 'Grace Osei — bien-être en baisse'),
    meta: bi(
      'Support · Alberta · Follow-up this month · Owner: Morgan Chen',
      'Soutien · Alberta · Suivi ce mois-ci · Resp. : Morgan Chen',
    ),
    why: bi(
      'Two consecutive check-ins mention sustained overtime. A workload conversation now can prevent burnout later.',
      'Deux suivis consécutifs mentionnent des heures supplémentaires soutenues. Une conversation sur la charge de travail dès maintenant peut prévenir l’épuisement.',
    ),
    actionLabel: bi('Support', 'Soutenir'),
    action: { kind: 'wellbeing-rail', employeeId: 'e11' },
  },
]

/* ------------------------------------------------------------- daily brief */

/** Prototype `buildAdvisorHomeWidgets()` brief sentence, both languages. */
export function buildDailyBrief(): Bi {
  const highCount = homePriorities.filter((p) => p.severity === 'High').length
  const total = homePriorities.length
  const en =
    highCount > 0
      ? `${highCount}${highCount === 1 ? ' item needs' : ' items need'} action today, and ${total} signals are on my radar. Compliance is holding at 82 — the biggest lever is the overdue Remote Work Policy.`
      : `${total} signals are on my radar today. Nothing is high-risk right now — compliance is holding at 82.`
  const fr =
    highCount > 0
      ? `${highCount}${highCount === 1 ? ' élément requiert' : ' éléments requièrent'} une action aujourd’hui, et ${total} signaux sont sur mon radar. La conformité se maintient à 82 — le plus grand levier est la politique de télétravail en retard.`
      : `${total} signaux sont sur mon radar aujourd’hui. Rien n’est à risque élevé pour l’instant — la conformité se maintient à 82.`
  return bi(en, fr)
}
