import { useCallback } from 'react'
import { useI18n } from '@/i18n/context'
import { pick } from '@/i18n/core'
import { landing } from '@/i18n/messages/landing'

export type LandingMessageKey = keyof typeof landing

/**
 * `lt()` resolves `landing_*` keys straight from the landing message module,
 * narrowed to `LandingMessageKey` so a typo is a type error rather than a
 * blank string; the rest of the i18n context (`t`, `L`, `lang`, `setLang`) is
 * passed through.
 *
 * It is a convenience, **not an isolation boundary**. `landing` is spread into
 * the global catalogue like every other module, and it has to be: plan copy in
 * `src/config/plans.ts` is typed `MessageKey` and points at `landing_*` keys
 * (`landing_free_desc`, `landing_starter_desc`, …), which the app-side
 * `PlanGate` resolves through `t()`. Dropping it from the catalogue would
 * break a workspace component, not just this page — so the landing module is
 * shared copy that happens to have a typed accessor, and any plan to split the
 * catalogue by surface has to account for it.
 */
export function useLanding() {
  const i18n = useI18n()
  const { lang } = i18n
  const lt = useCallback((key: LandingMessageKey) => pick(landing[key], lang), [lang])
  return { ...i18n, lt }
}
