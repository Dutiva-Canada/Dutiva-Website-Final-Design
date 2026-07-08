import { bi } from '@/i18n/core'
import type { KnowledgeItem } from './types'

/**
 * Knowledge base articles, transcribed from the prototype's
 * `buildKnowledgeItems()`. The prototype has no ids — stable `k1`–`k8` ids
 * added here.
 */

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k1',
    title: bi(
      'Ontario ESA: Notice of termination & severance pay',
      'LNE de l’Ontario : préavis de cessation et indemnité de licenciement',
    ),
    tag: bi('Termination · Ontario', 'Cessation · Ontario'),
  },
  {
    id: 'k2',
    title: bi(
      'BC Employment Standards: written offer requirements',
      'Normes d’emploi de la C.-B. : exigences d’offre écrite',
    ),
    tag: bi('Hiring · British Columbia', 'Embauche · Colombie-Britannique'),
  },
  {
    id: 'k3',
    title: bi(
      'Quebec Bill 96: French-language workplace documents',
      'Loi 96 du Québec : documents de travail en français',
    ),
    tag: bi('Onboarding · Quebec', 'Intégration · Québec'),
  },
  {
    id: 'k4',
    title: bi(
      'Duty to accommodate: functional limitations vs. diagnosis',
      'Obligation d’accommodement : limitations fonctionnelles c. diagnostic',
    ),
    tag: bi('Accommodation · All provinces', 'Accommodement · Toutes les provinces'),
  },
  {
    id: 'k5',
    title: bi(
      'Culpable vs. innocent absenteeism: what’s disciplinable',
      'Absentéisme coupable c. non coupable : ce qui est sanctionnable',
    ),
    tag: bi('Performance · All provinces', 'Rendement · Toutes les provinces'),
  },
  {
    id: 'k6',
    title: bi(
      'Federally regulated employers: Canada Labour Code notice',
      'Employeurs sous réglementation fédérale : préavis du Code canadien du travail',
    ),
    tag: bi('Termination · Federal', 'Cessation · Fédéral'),
  },
  {
    id: 'k7',
    title: bi(
      'Remote work: OHS obligations for home offices',
      'Télétravail : obligations SST pour les bureaux à domicile',
    ),
    tag: bi('Policy · All provinces', 'Politique · Toutes les provinces'),
  },
  {
    id: 'k8',
    title: bi(
      'Probationary periods: what employers can and can’t do',
      'Périodes de probation : ce que les employeurs peuvent et ne peuvent pas faire',
    ),
    tag: bi('Hiring · All provinces', 'Embauche · Toutes les provinces'),
  },
]
