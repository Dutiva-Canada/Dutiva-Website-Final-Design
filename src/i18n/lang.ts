import { readPref, writePref } from '@/lib/prefs'
import type { LangContextValue } from './context'
import { pick } from './core'
import type { Lang } from './core'
import { messages } from './messages'

export const LANG_KEY = 'dutiva-lang'

/** BCP 47 tags for <html lang> — Canadian English / Canadian French. */
export const HTML_LANG: Record<Lang, string> = { en: 'en-CA', fr: 'fr-CA' }

export function readLang(): Lang {
  return readPref(LANG_KEY, 'en') === 'fr' ? 'fr' : 'en'
}

export function writeLang(next: Lang): void {
  writePref(LANG_KEY, next)
}

/** Shared context assembly for both providers (stored-pref and URL-forced). */
export function buildLangContextValue(
  lang: Lang,
  setLang: (next: Lang) => void,
  alternateHref?: string,
): LangContextValue {
  return {
    lang,
    setLang,
    t: (key) => pick(messages[key], lang),
    L: (en, fr) => (lang === 'fr' ? fr : en),
    x: (v) => pick(v, lang),
    alternateHref,
  }
}
