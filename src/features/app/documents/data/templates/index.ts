/* T01–T16 were GENERATED from the HR Documents Library handoff (dutiva-data.js)
   by scripts/generate-doclib.mjs. That generator is a one-shot import and can
   no longer be run (see its header), so this barrel is now maintained by hand:
   templates authored in-repo since the import are appended below.

   Catalogue order is the tid order, which is also the order the Studio and
   /templates render within a category. */
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
/* Authored in-repo — see docs/FOUR_RING_FRAMEWORK.md. Numbering resumes at
   T21 because T17–T20 are taken by customTemplates.ts, and this barrel wins
   the `templateByTid.get(k) ?? customTemplateByTid.get(k)` lookup in
   DocStudioProvider — a tid reused here would silently shadow the fixture
   documents in src/data/employees.ts and chats.ts rather than collide. */
import { tplT21 } from './t21-accommodation-request-form'
import { tplT22 } from './t22-accommodation-response'
import { tplT23 } from './t23-accommodation-plan'
import { tplT24 } from './t24-undue-hardship-assessment'
import { tplT25 } from './t25-probationary-period-review'
import { tplT26 } from './t26-promotion-salary-adjustment'
import { tplT27 } from './t27-return-from-leave-confirmation'
import { tplT28 } from './t28-attendance-policy'
import { tplT29 } from './t29-roe-preparation-guide'
import { tplT30 } from './t30-reference-letter'
import { tplT31 } from './t31-investigation-report'
import { tplT32 } from './t32-layoff-notice'
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
  tplT21,
  tplT22,
  tplT23,
  tplT24,
  tplT25,
  tplT26,
  tplT27,
  tplT28,
  tplT29,
  tplT30,
  tplT31,
  tplT32,
]

export const templateByTid = new Map(docTemplates.map((t) => [t.tid, t]))
export const templateById = new Map(docTemplates.map((t) => [t.id, t]))
