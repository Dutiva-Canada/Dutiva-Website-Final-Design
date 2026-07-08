import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readPref, writePref } from '@/lib/prefs'
import { LangContext } from './context'
import type { LangContextValue } from './context'
import { pick } from './core'
import type { Lang } from './core'
import { messages } from './messages'

const LANG_KEY = 'dutiva-lang'

function readLang(): Lang {
  return readPref(LANG_KEY, 'en') === 'fr' ? 'fr' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    writePref(LANG_KEY, next)
    setLangState(next)
  }, [])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => pick(messages[key], lang),
      L: (en, fr) => (lang === 'fr' ? fr : en),
      x: (v) => pick(v, lang),
    }),
    [lang, setLang],
  )

  return <LangContext value={value}>{children}</LangContext>
}
