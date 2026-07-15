import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LangContext } from './context'
import type { LangContextValue } from './context'
import type { Lang } from './core'
import { HTML_LANG, buildLangContextValue, readLang, writeLang } from './lang'

/**
 * Preference-scoped language provider for the app surface (/app…): language
 * follows the persisted `dutiva-lang` preference and toggles in place.
 * Public marketing routes instead use ForcedLangProvider, where the URL is
 * the source of truth (/fr… → French).
 */
export function LangProvider({ children }: { readonly children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.setAttribute('lang', HTML_LANG[lang])
  }, [lang])

  const updateLang = useCallback((next: Lang) => {
    writeLang(next)
    setLang(next)
  }, [])

  const value = useMemo<LangContextValue>(
    () => buildLangContextValue(lang, updateLang),
    [lang, updateLang],
  )

  return <LangContext value={value}>{children}</LangContext>
}
