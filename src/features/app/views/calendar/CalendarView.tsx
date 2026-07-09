import { useI18n } from '@/i18n/context'
import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { calendarMessages as M } from '@/i18n/messages/calendar'
import { calendarEvents, calendarMonth } from '@/data'
import type { CalendarEvent } from '@/data'
import { chipToneClass } from '@/components/chips'
import { useRail } from '@/features/app/rail/railContext'

/**
 * Calendar view — the July 2026 month grid with event chips plus the
 * Upcoming list (prototype `buildCalendarView()` + calendar markup,
 * App v2.dc.html lines 1154–1202). The grid is desktop/tablet only
 * (`isDesktopOrTabletFrame`); phones get just the Upcoming list. Clicking an
 * event (chip or upcoming row) opens the Advisor rail with the event detail.
 */

/* ---------------------------------------------------------- month grid */

type DayCell = number | null

const firstDow = new Date(calendarMonth.year, calendarMonth.monthIndex, 1).getDay()
const daysInMonth = new Date(calendarMonth.year, calendarMonth.monthIndex + 1, 0).getDate()

const cells: DayCell[] = []
for (let i = 0; i < firstDow; i++) cells.push(null)
for (let d = 1; d <= daysInMonth; d++) cells.push(d)
while (cells.length % 7 !== 0) cells.push(null)

const weeks: DayCell[][] = []
for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

const eventsByDay = new Map<number, CalendarEvent[]>()
for (const ev of calendarEvents) {
  const list = eventsByDay.get(ev.day)
  if (list) list.push(ev)
  else eventsByDay.set(ev.day, [ev])
}

const dayLabels: Bi[] = [
  M.calendar_d_sun,
  M.calendar_d_mon,
  M.calendar_d_tue,
  M.calendar_d_wed,
  M.calendar_d_thu,
  M.calendar_d_fri,
  M.calendar_d_sat,
]

/** Rail card body — "Scheduled for July {day}, 2026." as a live-Bi pair. */
function scheduledFor(day: number): Bi {
  return bi(
    M.calendar_rail_body.en.replace('{day}', String(day)),
    M.calendar_rail_body.fr.replace('{day}', String(day)),
  )
}

export function CalendarView() {
  const { x } = useI18n()
  const { openRail } = useRail()

  const openEvent = (ev: CalendarEvent) => {
    openRail(ev.label, {
      text: M.calendar_rail_text,
      cards: [{ tone: ev.tone, title: ev.label, body: scheduledFor(ev.day), actions: [] }],
    })
  }

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-[18px] flex items-baseline justify-between">
          <div className="font-display text-[22px] font-semibold text-text">
            {x(calendarMonth.monthLabel)}
          </div>
        </div>

        {/* Month grid — desktop/tablet only (prototype isDesktopOrTabletFrame). */}
        <div className="hidden md:block">
          <div className="mb-[6px] grid grid-cols-7 gap-[8px]">
            {dayLabels.map((label) => (
              <div key={label.en} className="text-center text-[11px] font-bold text-text-muted">
                {x(label)}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="mb-[8px] grid grid-cols-7 gap-[8px]">
              {week.map((day, di) =>
                day === null ? (
                  <div key={`e${di}`} />
                ) : (
                  <div
                    key={day}
                    className={`flex min-h-[76px] min-w-0 flex-col gap-[4px] overflow-hidden rounded-[9px] border px-[7px] py-[6px] ${
                      day === calendarMonth.todayDay
                        ? 'border-[var(--accent-soft-border)] bg-accent-soft'
                        : 'border-border-soft bg-surface'
                    }`}
                  >
                    <div
                      className={`text-[12px] ${
                        day === calendarMonth.todayDay
                          ? 'font-bold text-accent'
                          : 'font-semibold text-text-2'
                      }`}
                    >
                      {day}
                    </div>
                    {(eventsByDay.get(day) ?? []).map((ev, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openEvent(ev)}
                        className={`inline-flex w-full cursor-pointer overflow-hidden rounded-[100px] border-none px-[10px] py-[3px] text-left font-sans text-[12px] leading-[1.25] font-semibold text-ellipsis whitespace-nowrap ${chipToneClass(ev.tone)}`}
                      >
                        {x(ev.label)}
                      </button>
                    ))}
                  </div>
                ),
              )}
            </div>
          ))}
        </div>

        {/* Upcoming list */}
        <div className="mt-[24px]">
          <div className="mb-[10px] text-[13px] font-bold text-text-3">
            {x(M.calendar_upcoming)}
          </div>
          <div className="flex flex-col gap-[8px]">
            {calendarEvents.map((ev) => (
              <button
                key={ev.day}
                type="button"
                onClick={() => openEvent(ev)}
                className="flex cursor-pointer items-center gap-[12px] rounded-[10px] border border-border bg-surface px-[15px] py-[11px] text-left font-sans"
              >
                <span className="w-[44px] shrink-0 text-[12.5px] font-bold text-text-muted">
                  {x(ev.dateLabel)}
                </span>
                <span className="flex-1 text-[13.5px] text-text">{x(ev.label)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
