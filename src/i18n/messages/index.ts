import { common } from './common'

/**
 * Merged message catalogue. Each feature contributes one module keyed by
 * message id with `{ en, fr }` values; prefix keys by feature (e.g. `home_`,
 * `advisor_`) to avoid collisions. Add new modules to the spread below.
 */
export const messages = {
  ...common,
} as const

export type MessageKey = keyof typeof messages
