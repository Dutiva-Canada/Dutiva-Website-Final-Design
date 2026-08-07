import { parseISODate } from './aggregation'

/** Fill `{placeholder}` slots in a catalogue string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    template,
  )
}

/** Locale for Intl formatting from the app language. */
export function intlLocale(lang: string): string {
  return lang === 'fr' ? 'fr-CA' : 'en-CA'
}

/** Short day-of-month date off a YYYY-MM-DD string ('Jul 25' / '25 juill.'). */
export function formatDayISO(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parseISODate(iso))
}

/** Signed delta for display: +8 / −3 (typographic minus). */
export function formatSignedDelta(delta: number): string {
  return delta >= 0 ? `+${delta}` : `−${Math.abs(delta)}`
}
