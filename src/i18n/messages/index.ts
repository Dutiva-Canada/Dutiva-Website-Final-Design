import { common } from './common'
import { shellMessages } from './shell'
import { landing } from './landing'
import { pricingMessages } from './pricing'
import { templatesPreviewMessages } from './templatesPreview'
import { guidesIndexMessages } from './guidesIndex'
import { advisorCore } from './advisorCore'
import { searchMessages } from './search'
import { docstudioMessages } from './docstudio'
import { homeMessages } from './home'
import { advisorViewMessages } from './advisorView'
import { advisorWorkspaceMessages } from './advisorWorkspace'
import { workflowsMessages } from './workflows'
import { flowsMessages } from './flows'
import { casesMessages } from './cases'
import { employeesMessages } from './employees'
import { complianceMessages } from './compliance'
import { policiesMessages } from './policies'
import { tasksMessages } from './tasks'
import { calendarMessages } from './calendar'
import { reportsMessages } from './reports'
import { templatesMessages } from './templates'
import { knowledgeMessages } from './knowledge'
import { referenceMessages } from './reference'
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
import { guidanceMessages } from './guidance'
import { authMessages } from './auth'
import { memoryMessages } from './memory'
import { workspaceModeMessages } from './workspaceMode'
import { supportMessages } from './support'
import { helpCenterMessages } from './helpCenter'
import { exportProtectionMessages } from './exportProtection'

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
  ...pricingMessages,
  ...templatesPreviewMessages,
  ...guidesIndexMessages,
  ...advisorCore,
  ...searchMessages,
  ...docstudioMessages,
  ...homeMessages,
  ...advisorViewMessages,
  ...advisorWorkspaceMessages,
  ...workflowsMessages,
  ...flowsMessages,
  ...casesMessages,
  ...employeesMessages,
  ...complianceMessages,
  ...policiesMessages,
  ...tasksMessages,
  ...calendarMessages,
  ...reportsMessages,
  ...templatesMessages,
  ...knowledgeMessages,
  ...referenceMessages,
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
  ...guidanceMessages,
  ...authMessages,
  ...memoryMessages,
  ...workspaceModeMessages,
  ...supportMessages,
  ...helpCenterMessages,
  ...exportProtectionMessages,
} as const

export type MessageKey = keyof typeof messages
