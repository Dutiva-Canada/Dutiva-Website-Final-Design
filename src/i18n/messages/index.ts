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
 * `advisor_`, `landing_`, `shell_`) to avoid collisions.
 *
 * ## Why the modules are grouped by surface
 *
 * The catalogue is one eager chunk on every page, including marketing landings
 * that can reach only a tenth of it (TODO.md **EF6a**). Splitting it is not a
 * chunking problem — the provider seam already exists — it is a *typing*
 * problem: `t()` is called with computed keys read out of data structures, so
 * "what can this surface reach" was not a set anyone could enumerate, and
 * `t()` on a missing key throws rather than degrading, which makes a wrong
 * split a runtime crash.
 *
 * The three groups below make that constraint a type. The unions are derived
 * from the groupings — never hand-listed — so adding a module to a group is the
 * only edit needed, and the compiler re-checks every call site.
 *
 * **The grouping is empirical.** It was derived by matching every key in every
 * module against every non-test source file and classifying the consumers by
 * path. Two rules decide placement:
 *
 * - A module read from `src/features/app/**` only is workspace.
 * - A module read from `src/features/marketing/**` only is marketing.
 * - Anything genuinely read from both is shared — and the bar for "genuinely"
 *   is a real consumer, not a guess.
 *
 * **Adding a key to the wrong group is a type error at the call site, not a
 * blank string at runtime.** That is the whole point.
 *
 * ## What is NOT here yet, and why
 *
 * These types do not split the catalogue. `messages` below is still the merged
 * object and every provider still receives all of it, so behaviour is
 * unchanged. The remaining blocker is `src/seo/routes.ts`, which imports the
 * whole catalogue to build SEO descriptions and is reached eagerly from
 * `src/app/routes.tsx` — so no provider change reduces the eager graph until
 * that import is addressed. See TODO.md EF6a for the narrowed scope.
 */

/**
 * Read only from `src/features/app/**` (plus the workspace-only helpers under
 * `src/components/advisor/` and `src/lib/exportProtection/`). Marketing cannot
 * reach these, and the compiler now enforces it.
 */
const workspaceOnlyMessages = {
  ...shellMessages,
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
  ...doclibMessages,
  ...guidanceMessages,
  ...authMessages,
  ...memoryMessages,
  ...workspaceModeMessages,
  ...exportProtectionMessages,
} as const

/**
 * Read only from `src/features/marketing/**` (and, for the `*_intro` keys,
 * from `src/seo/routes.ts` — see the blocker note above).
 */
const marketingOnlyMessages = {
  ...pricingMessages,
  ...templatesPreviewMessages,
  ...guidesIndexMessages,
  ...aboutMessages,
  ...faqMessages,
  ...blogMessages,
  ...tmplGuideMessages,
  ...limitsMessages,
  ...legalHubMessages,
} as const

/**
 * Genuinely read from both surfaces. Each one earns its place:
 *
 * - `common` — the standing legal disclaimer and shared chrome, used by the
 *   marketing legal pages, the workspace, and `src/components/Disclaimer.tsx`.
 * - `landing` — **the one that makes a naive split crash.** Plan copy in
 *   `src/config/plans.ts` points at `landing_*` keys, and the workspace's
 *   `PlanGate` resolves `requiredPlan.descKey` through `t()`
 *   (`src/features/app/billing/PlanGate.tsx`). Dropping `landing` from the
 *   workspace catalogue breaks a workspace component, not a marketing page.
 * - `support` — the support feature is deliberately dual-surface: the same
 *   modules back the signed-out `/contact` intake and the in-app request form.
 * - `helpCenter` — same shape; the Help Centre is a marketing surface whose
 *   widgets live under `src/features/support/`.
 */
const sharedMessages = {
  ...common,
  ...landing,
  ...supportMessages,
  ...helpCenterMessages,
} as const

export const messages = {
  ...workspaceOnlyMessages,
  ...marketingOnlyMessages,
  ...sharedMessages,
} as const

/** Every key in the catalogue. Prefer a surface-scoped type where one applies. */
export type MessageKey = keyof typeof messages

/** Keys reachable from both surfaces. Always safe. */
export type SharedMessageKey = keyof typeof sharedMessages

/**
 * Keys a workspace call site may use: workspace-only plus shared. Using this on
 * a structure the workspace reads is what stops a marketing-only key being
 * referenced from `src/features/app/**`.
 */
export type WorkspaceMessageKey = keyof typeof workspaceOnlyMessages | SharedMessageKey

/** Keys a marketing call site may use: marketing-only plus shared. */
export type MarketingMessageKey = keyof typeof marketingOnlyMessages | SharedMessageKey
