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

export function LangProvider({ children }: { readonly children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const updateLang = useCallback((next: Lang) => {
    writePref(LANG_KEY, next)
    setLang(next)
  }, [])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang: updateLang,
      t: (key) => pick(messages[key], lang),
      L: (en, fr) => (lang === 'fr' ? fr : en),
      x: (v) => pick(v, lang),
    }),
    [lang, updateLang],
  )

  return <LangContext value={value}>{children}</LangContext>
}
