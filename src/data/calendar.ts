import { bi } from '@/i18n/core'
import type { CalendarEvent, CalendarMonth } from './types'

/**
 * Calendar fixtures, transcribed from the prototype's `buildCalendarView()`
 * (July 2026 grid; "today" is July 5).
 */

export const calendarMonth: CalendarMonth = {
  year: 2026,
  monthIndex: 6,
  monthLabel: bi('July 2026', 'Juillet 2026'),
  todayDay: 5,
}

export const calendarEvents: CalendarEvent[] = [
  {
    day: 8,
    dateLabel: bi('Jul 8', '8 juil.'),
    label: bi('Probation ends — Priya Nair', 'Fin de probation — Priya Nair'),
    tone: 'info',
  },
  {
    day: 10,
    dateLabel: bi('Jul 10', '10 juil.'),
    label: bi(
      'Counsel response due — Termination case',
      'Réponse du conseiller attendue — dossier de cessation d’emploi',
    ),
    tone: 'warning',
  },
  {
    day: 14,
    dateLabel: bi('Jul 14', '14 juil.'),
    label: bi('Accommodation review — Amara Okafor', 'Examen d’accommodement — Amara Okafor'),
    tone: 'warning',
  },
  {
    day: 17,
    dateLabel: bi('Jul 17', '17 juil.'),
    label: bi('Remote Work Policy review due', 'Révision de la politique de télétravail due'),
    tone: 'warning',
  },
  {
    day: 19,
    dateLabel: bi('Jul 19', '19 juil.'),
    label: bi('Offboarding — Jordan Mensah (last day)', 'Départ — Jordan Mensah (dernier jour)'),
    tone: 'warning',
  },
  {
    day: 22,
    dateLabel: bi('Jul 22', '22 juil.'),
    label: bi('PIP check-in — Devon Clarke', 'Suivi du PAR — Devon Clarke'),
    tone: 'warning',
  },
  {
    day: 25,
    dateLabel: bi('Jul 25', '25 juil.'),
    label: bi('AODA training due — 3 new hires', 'Formation LAPHO due — 3 nouveaux employés'),
    tone: 'info',
  },
  {
    day: 28,
    dateLabel: bi('Jul 28', '28 juil.'),
    label: bi('Quarterly compliance report due', 'Rapport trimestriel de conformité dû'),
    tone: 'info',
  },
  {
    day: 31,
    dateLabel: bi('Jul 31', '31 juil.'),
    label: bi('Law 25 PIA due — HRIS vendor', 'ÉFVP Loi 25 due — fournisseur SIRH'),
    tone: 'warning',
  },
]
