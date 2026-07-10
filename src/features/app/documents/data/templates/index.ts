/* GENERATED from the HR Documents Library handoff (dutiva-data.js) — do not
   hand-edit. Regenerate with scripts/generate-doclib.mjs (see repo docs). */
import { tplT01 } from './t01-offer-letter'
import { tplT02 } from './t02-employment-agreement'
import { tplT03 } from './t03-termination-letter'
import { tplT04 } from './t04-employee-handbook'
import { tplT05 } from './t05-confidentiality-agreement'
import { tplT06 } from './t06-written-warning'
import { tplT07 } from './t07-contractor-agreement'
import { tplT08 } from './t08-restrictive-covenants'
import { tplT09 } from './t09-quebec-offer-letter'
import { tplT10 } from './t10-remote-work-policy'
import { tplT11 } from './t11-vacation-leave-policy'
import { tplT12 } from './t12-code-of-conduct'
import { tplT13 } from './t13-harassment-policy'
import { tplT14 } from './t14-resignation-acceptance'
import { tplT15 } from './t15-group-termination-notice'
import { tplT16 } from './t16-performance-improvement-plan'
import type { DocTemplate } from '../types'

export const docTemplates: DocTemplate[] = [
  tplT01,
  tplT02,
  tplT03,
  tplT04,
  tplT05,
  tplT06,
  tplT07,
  tplT08,
  tplT09,
  tplT10,
  tplT11,
  tplT12,
  tplT13,
  tplT14,
  tplT15,
  tplT16,
]

export const templateByTid = new Map(docTemplates.map((t) => [t.tid, t]))
export const templateById = new Map(docTemplates.map((t) => [t.id, t]))
