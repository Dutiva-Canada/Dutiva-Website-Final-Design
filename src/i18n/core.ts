export type Lang = 'en' | 'fr'

/** A bilingual string. Every user-facing string ships EN + FR (handoff rule). */
export interface Bi {
  en: string
  fr: string
}

export const bi = (en: string, fr: string): Bi => ({ en, fr })

/**
 * Identity helper that pins a message module to `Record<key, Bi>` while
 * preserving literal keys, so `t()` stays fully typed and EN/FR parity is
 * structural (a key cannot exist in one language only).
 */
export function defineMessages<T extends Record<string, Bi>>(messages: T): T {
  return messages
}

export function pick(value: Bi, lang: Lang): string {
  return lang === 'fr' ? value.fr : value.en
}
