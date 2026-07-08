import { common } from './common'
import { shellMessages } from './shell'
import { landing } from './landing'
import { advisorCore } from './advisorCore'
import { searchMessages } from './search'
import { docstudioMessages } from './docstudio'

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
} as const

export type MessageKey = keyof typeof messages
