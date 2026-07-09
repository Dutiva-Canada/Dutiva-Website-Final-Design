import { defineMessages } from '../core'

/**
 * Calendar view — UI-chrome strings ported from `App v2.dc.html`
 * (`buildI18n()` lbl.dSun…dSat / lbl.upcoming + `buildCalendarView()` rail
 * spec). FR strings with no source in the prototype are marked
 * [FR self-authored].
 *
 * NOTE: registered in src/i18n/messages/index.ts by the integration owner.
 * The view resolves these via `useI18n().x(calendarMessages.key)`.
 */
export const calendarMessages = defineMessages({
  /* Weekday header (buildI18n dSun…dSat). */
  calendar_d_sun: { en: 'SUN', fr: 'DIM' },
  calendar_d_mon: { en: 'MON', fr: 'LUN' },
  calendar_d_tue: { en: 'TUE', fr: 'MAR' },
  calendar_d_wed: { en: 'WED', fr: 'MER' },
  calendar_d_thu: { en: 'THU', fr: 'JEU' },
  calendar_d_fri: { en: 'FRI', fr: 'VEN' },
  calendar_d_sat: { en: 'SAT', fr: 'SAM' },

  /* Upcoming list heading (buildI18n lbl.upcoming). */
  calendar_upcoming: { en: 'Upcoming', fr: 'À venir' },

  /* Rail spec for an event click (buildCalendarView openRail). */
  calendar_rail_text: {
    en: 'Here’s the detail behind this date.',
    fr: 'Voici le détail derrière cette date.', // [FR self-authored]
  },
  calendar_rail_body: {
    en: 'Scheduled for July {day}, 2026.',
    fr: 'Prévu pour le {day} juillet 2026.', // [FR self-authored]
  },
})
