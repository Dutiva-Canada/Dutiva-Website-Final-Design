import { createContext, useContext } from 'react'
import type { Bi, Lang } from './core'
import type { MessageKey } from './messages'

export interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Look up a UI-chrome string by key. */
  t: (key: MessageKey) => string
  /** Inline bilingual pair — mirrors the prototype's `L(en, fr)`. */
  L: (en: string, fr: string) => string
  /** Resolve a bilingual data field ({ en, fr }). */
  x: (value: Bi) => string
}

export const LangContext = createContext<LangContextValue | null>(null)

export function useI18n(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useI18n must be used within a LangProvider')
  return ctx
}
