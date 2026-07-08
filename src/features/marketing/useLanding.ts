import { useCallback } from 'react'
import { useI18n } from '@/i18n/context'
import { pick } from '@/i18n/core'
import { landing } from '@/i18n/messages/landing'

export type LandingMessageKey = keyof typeof landing

/**
 * Landing-page copy lives in its own message module (kept out of the global
 * catalogue on purpose — the marketing page is the only consumer). `lt()`
 * resolves `landing_*` keys against the active language; the rest of the
 * i18n context (`t`, `L`, `lang`, `setLang`) is passed through.
 */
export function useLanding() {
  const i18n = useI18n()
  const { lang } = i18n
  const lt = useCallback((key: LandingMessageKey) => pick(landing[key], lang), [lang])
  return { ...i18n, lt }
}
