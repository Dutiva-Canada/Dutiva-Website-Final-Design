import { common } from './common'
import { shellMessages } from './shell'
import { landing } from './landing'
import { advisorCore } from './advisorCore'
import { searchMessages } from './search'
import { docstudioMessages } from './docstudio'
import { homeMessages } from './home'
import { advisorViewMessages } from './advisorView'
import { workflowsMessages } from './workflows'
import { casesMessages } from './cases'
import { employeesMessages } from './employees'
import { complianceMessages } from './compliance'
import { policiesMessages } from './policies'
import { tasksMessages } from './tasks'
import { calendarMessages } from './calendar'
import { reportsMessages } from './reports'
import { templatesMessages } from './templates'
import { knowledgeMessages } from './knowledge'
import { settingsMessages } from './settings'
import { communicationsMessages } from './communications'
import { compensationMessages } from './compensation'
import { wellbeingMessages } from './wellbeing'
import { aboutMessages } from './about'
import { faqMessages } from './faq'
import { blogMessages } from './blog'
import { tmplGuideMessages } from './templateUsage'
import { limitsMessages } from './knownLimitations'
import { legalHubMessages } from './legalHub'
import { doclibMessages } from './doclib'

/**
 * Merged message catalogue. Each feature contributes one module keyed by
 * message id with `{ en, fr }` values; prefix keys by feature (e.g. `home_`,
 * `advisor_`, `landing_`, `shell_`) to avoid collisions. Add new modules to
 * the spread below.
 */
export const messages = {
  ...common,
  ...shellMessages,
  ...landing,
  ...advisorCore,
  ...searchMessages,
  ...docstudioMessages,
  ...homeMessages,
  ...advisorViewMessages,
  ...workflowsMessages,
  ...casesMessages,
  ...employeesMessages,
  ...complianceMessages,
  ...policiesMessages,
  ...tasksMessages,
  ...calendarMessages,
  ...reportsMessages,
  ...templatesMessages,
  ...knowledgeMessages,
  ...settingsMessages,
  ...communicationsMessages,
  ...compensationMessages,
  ...wellbeingMessages,
  ...aboutMessages,
  ...faqMessages,
  ...blogMessages,
  ...tmplGuideMessages,
  ...limitsMessages,
  ...legalHubMessages,
  ...doclibMessages,
} as const

export type MessageKey = keyof typeof messages
