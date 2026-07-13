import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import type { MemoryFact } from './types'

/**
 * Advisor Memory seed fixtures — typed transcription of the Advisor Memory
 * prototype's `seedMemories()` / `people()` / `cases()`. Entity ids map onto
 * the existing app fixtures (Jordan Mensah `e1` / `case1` / chat `c1`,
 * Amara Okafor `e6` / `case3`, Devon Clarke `e5`) so memory surfaces link to
 * real routes. EN verbatim from the prototype; FR [self-authored].
 */

/* People with a memory profile (memory nav "People" group). */
export interface MemoryPersonChip {
  tone: 'ok' | 'warn' | 'risk' | 'neutral'
  label: Bi
}

export interface MemoryPerson {
  /** Employee id (routes /app/memory/people/:personId, /app/employees/:id). */
  id: string
  firstName: Bi
  navSub: Bi
  /** Profile-header status chips (prototype `people()[].chips`). */
  chips: MemoryPersonChip[]
  /** Case with memory for this person, if any (memory case view id). */
  memoryCaseId: string | null
  /** Real case-detail route target, if any (/app/cases/:caseId). */
  caseId: string | null
  /** Recall conversation for this person, if any (chat id). */
  threadId: string | null
}

export const memoryPeople: MemoryPerson[] = [
  {
    id: 'e1',
    firstName: bi('Jordan', 'Jordan'),
    navSub: bi('Termination', 'Cessation d’emploi'),
    chips: [
      { tone: 'risk', label: bi('Case open · high risk', 'Dossier ouvert · risque élevé') },
      { tone: 'ok', label: bi('Active employee', 'Employé actif') },
    ],
    memoryCaseId: 'case1',
    caseId: 'case1',
    threadId: 'c1',
  },
  {
    id: 'e6',
    firstName: bi('Amara', 'Amara'),
    navSub: bi('Accommodation', 'Accommodement'),
    chips: [
      { tone: 'warn', label: bi('Accommodation', 'Accommodement') },
      { tone: 'ok', label: bi('Active employee', 'Employée active') },
    ],
    memoryCaseId: 'case3',
    caseId: 'case3',
    threadId: null,
  },
  {
    id: 'e5',
    firstName: bi('Devon', 'Devon'),
    navSub: bi('Performance', 'Rendement'),
    chips: [
      { tone: 'warn', label: bi('Performance', 'Rendement') },
      { tone: 'ok', label: bi('Active employee', 'Employé actif') },
    ],
    memoryCaseId: null,
    caseId: 'case2',
    threadId: null,
  },
]

/* Cases with a memory picture (memory nav "Cases" group). */
export interface MemoryCase {
  /** Case id (routes /app/memory/cases/:caseId, /app/cases/:caseId). */
  id: string
  personId: string
  navLabel: Bi
  navSub: Bi
  code: string
  opened: Bi
  owner: string
}

export const memoryCases: MemoryCase[] = [
  {
    id: 'case1',
    personId: 'e1',
    navLabel: bi('Jordan · Termination', 'Jordan · Cessation'),
    navSub: bi('Awaiting counsel', 'En attente du conseiller juridique'),
    code: 'CASE-2026-0142',
    opened: bi('Jul 2, 2026', '2 juill. 2026'),
    owner: 'Riley Summers',
  },
  {
    id: 'case3',
    personId: 'e6',
    navLabel: bi('Amara · Accommodation', 'Amara · Accommodement'),
    navSub: bi('Review Jul 14', 'Révision le 14 juill.'),
    code: 'CASE-2026-0138',
    opened: bi('Apr 3, 2026', '3 avr. 2026'),
    owner: 'Riley Summers',
  },
]

/* Recall conversations (memory nav "Conversations" group). */
export interface MemoryThread {
  /** Chat id (routes /app/memory/conversations/:threadId). */
  id: string
  personId: string
  caseId: string
  navLabel: Bi
  navSub: Bi
}

export const memoryThreads: MemoryThread[] = [
  {
    id: 'c1',
    personId: 'e1',
    caseId: 'case1',
    navLabel: bi('Jordan termination', 'Cessation de Jordan'),
    navSub: bi('Resumed today', 'Repris aujourd’hui'),
  },
]

/* ------------------------------------------------------------ seed facts */

const M = (
  id: string,
  scope: MemoryFact['scope'],
  entityId: string,
  category: MemoryFact['category'],
  statement: Bi,
  confidence: MemoryFact['confidence'],
  sourceType: MemoryFact['source']['type'],
  sourceDetail: Bi,
  learned: Bi,
  confirmed: Bi | null,
  visibility: MemoryFact['visibility'],
  sensitive = false,
): MemoryFact => ({
  id,
  scope,
  entityId,
  category,
  statement,
  confidence,
  source: { type: sourceType, detail: sourceDetail },
  learned,
  confirmed,
  visibility,
  sensitive,
})

const peopleRecord = bi('People record', 'Dossier du personnel')
const today = bi('Today', 'Aujourd’hui')
const jul2 = bi('Jul 2', '2 juill.')
const jul5 = bi('Jul 5', '5 juill.')

export const seedMemoryFacts: MemoryFact[] = [
  /* Jordan — person */
  M(
    'p1',
    'person',
    'e1',
    'employment',
    bi(
      'Senior Operations Manager on the Operations team',
      'Gestionnaire principal des opérations, équipe Opérations',
    ),
    'confirmed',
    'hris',
    peopleRecord,
    bi('Mar 2018', 'Mars 2018'),
    today,
    'hr',
  ),
  M(
    'p2',
    'person',
    'e1',
    'employment',
    bi(
      '7 years’ continuous service — started March 2018',
      '7 ans de service continu — entrée en mars 2018',
    ),
    'confirmed',
    'hris',
    peopleRecord,
    bi('Mar 2018', 'Mars 2018'),
    today,
    'hr',
  ),
  M(
    'p3',
    'person',
    'e1',
    'employment',
    bi(
      'Employed in Ontario — provincially regulated (ESA, 2000)',
      'Employé en Ontario — réglementation provinciale (LNE, 2000)',
    ),
    'confirmed',
    'chat',
    bi('Confirmed in chat · Jul 2', 'Confirmé en clavardage · 2 juill.'),
    jul2,
    jul2,
    'hr',
  ),
  M(
    'p4',
    'person',
    'e1',
    'employment',
    bi(
      'Employment contract has no enforceable termination clause',
      'Le contrat de travail ne comporte aucune clause de cessation exécutoire',
    ),
    'confirmed',
    'document',
    bi('Employment Agreement.pdf', 'Employment Agreement.pdf'),
    jul2,
    jul2,
    'case',
    true,
  ),
  M(
    'p5',
    'person',
    'e1',
    'compensation',
    bi(
      'Base salary $95,000 + variable commission',
      'Salaire de base de 95 000 $ + commission variable',
    ),
    'confirmed',
    'hris',
    peopleRecord,
    today,
    today,
    'restricted',
    true,
  ),
  M(
    'p6',
    'person',
    'e1',
    'record',
    bi('No prior formal discipline on file', 'Aucune mesure disciplinaire formelle au dossier'),
    'confirmed',
    'hris',
    peopleRecord,
    jul2,
    jul2,
    'hr',
  ),
  M(
    'p8',
    'person',
    'e1',
    'record',
    bi('Reports to Morgan Chen', 'Relève de Morgan Chen'),
    'confirmed',
    'hris',
    peopleRecord,
    bi('Mar 2018', 'Mars 2018'),
    today,
    'hr',
  ),
  M(
    'p7',
    'person',
    'e1',
    'matter',
    bi(
      'Preliminary common-law notice estimate: 9–12 months',
      'Estimation préliminaire du préavis de common law : 9 à 12 mois',
    ),
    'inferred',
    'inference',
    bi('Advisor analysis · Jul 5', 'Analyse du Conseiller · 5 juill.'),
    jul5,
    null,
    'case',
    true,
  ),
  M(
    'p9',
    'person',
    'e1',
    'note',
    bi('Booked vacation Jul 14–18', 'Vacances réservées du 14 au 18 juill.'),
    'inferred',
    'chat',
    bi('Mentioned in chat · Jul 5', 'Mentionné en clavardage · 5 juill.'),
    jul5,
    null,
    'hr',
  ),
  /* Jordan — case (termination) */
  M(
    'c1',
    'case',
    'case1',
    'case',
    bi(
      'Terminating without cause — no offer issued yet',
      'Cessation sans motif — aucune offre émise',
    ),
    'confirmed',
    'manual',
    bi('Case note · Riley Summers', 'Note de dossier · Riley Summers'),
    jul2,
    today,
    'case',
  ),
  M(
    'c2',
    'case',
    'case1',
    'case',
    bi(
      'Counsel review requested Jul 5 — still outstanding',
      'Révision juridique demandée le 5 juill. — toujours en attente',
    ),
    'confirmed',
    'chat',
    bi('Advisor · Jul 5', 'Conseiller · 5 juill.'),
    jul5,
    today,
    'case',
  ),
  M(
    'c3',
    'case',
    'case1',
    'case',
    bi(
      'Termination letter drafted Jul 5 — held, not sent',
      'Lettre de cessation rédigée le 5 juill. — retenue, non envoyée',
    ),
    'confirmed',
    'document',
    bi('Termination Letter (draft)', 'Lettre de cessation (ébauche)'),
    jul5,
    jul5,
    'case',
  ),
  M(
    'c4',
    'case',
    'case1',
    'case',
    bi(
      'ESA statutory floor ≈ 7 weeks’ notice + severance',
      'Plancher légal LNE ≈ 7 semaines de préavis + indemnité',
    ),
    'confirmed',
    'inference',
    bi('Advisor analysis · Jul 2', 'Analyse du Conseiller · 2 juill.'),
    jul2,
    jul2,
    'case',
  ),
  /* Jordan — thread */
  M(
    't1',
    'thread',
    'c1',
    'conversation',
    bi(
      'This conversation is about Jordan Mensah’s termination',
      'Cette conversation porte sur la cessation d’emploi de Jordan Mensah',
    ),
    'confirmed',
    'chat',
    bi('Conversation · opened Jul 2', 'Conversation · ouverte le 2 juill.'),
    jul2,
    today,
    'case',
  ),
  M(
    't2',
    'thread',
    'c1',
    'conversation',
    bi(
      'You want notice exposure and next steps before contacting Jordan',
      'Vous voulez l’exposition au préavis et les prochaines étapes avant de contacter Jordan',
    ),
    'inferred',
    'inference',
    bi('Conversation summary', 'Résumé de la conversation'),
    jul5,
    null,
    'case',
  ),
  /* Amara / Devon */
  M(
    'a1',
    'person',
    'e6',
    'employment',
    bi(
      'Operations Analyst, 3 years’ service — British Columbia',
      'Analyste des opérations, 3 ans de service — Colombie-Britannique',
    ),
    'confirmed',
    'hris',
    peopleRecord,
    bi('Aug 2022', 'Août 2022'),
    today,
    'hr',
  ),
  M(
    'a2',
    'person',
    'e6',
    'matter',
    bi(
      'Modified-duties accommodation active; 90-day review due Jul 14',
      'Accommodement en tâches modifiées actif; révision de 90 jours le 14 juill.',
    ),
    'confirmed',
    'case',
    bi('CASE-2026-0138', 'CASE-2026-0138'),
    bi('Apr 2026', 'Avr. 2026'),
    today,
    'case',
    true,
  ),
  M(
    'd1',
    'person',
    'e5',
    'matter',
    bi(
      'On a performance improvement plan; 30-day check-in Jul 22',
      'Sous plan d’amélioration du rendement; suivi de 30 jours le 22 juill.',
    ),
    'confirmed',
    'case',
    bi('Case note', 'Note de dossier'),
    bi('Jun 22', '22 juin'),
    today,
    'hr',
  ),
]
