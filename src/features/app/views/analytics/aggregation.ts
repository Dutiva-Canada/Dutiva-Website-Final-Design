/**
 * Pure aggregation behind the Analytics cards — every number a customer
 * could screenshot is computed here, deterministically, from injected
 * inputs. No `Date.now()`: callers pass "today" (the demo passes the
 * diorama's fixed date, production passes the real one), so the demo stays
 * stable and every path is unit-testable.
 *
 * All dates are YYYY-MM-DD strings compared in UTC.
 */

export function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`)
}

/** Whole days from `fromISO` to `toISO` (negative when `toISO` is earlier). */
export function daysBetweenISO(fromISO: string, toISO: string): number {
  const ms = parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()
  return Math.round(ms / 86_400_000)
}

/** First-of-month (YYYY-MM-01) for the month containing `todayISO`. */
export function monthStartISO(todayISO: string): string {
  return `${todayISO.slice(0, 7)}-01`
}

/** Localized month name off a YYYY-MM-DD string ('Feb' / 'févr.' / 'February'…). */
export function formatMonthISO(
  monthISO: string,
  locale: string,
  style: 'short' | 'long' = 'short',
): string {
  return new Intl.DateTimeFormat(locale, { month: style, timeZone: 'UTC' }).format(
    parseISODate(monthISO),
  )
}

/* ------------------------------------------------------- needs attention */

export type AttentionStatus = 'overdue' | 'due_soon' | 'upcoming'

export interface RankedAttention<T> {
  item: T
  status: AttentionStatus
  /** Whole days until due — negative when overdue. */
  daysUntilDue: number
}

/**
 * Rank dated items for the "Needs attention" card: ascending by due date,
 * which puts overdue first (most overdue at the top) and then soonest-due —
 * exactly the required order. Ties break on id so the order is stable.
 */
export function rankAttention<T extends { id: string; dueISO: string }>(
  items: readonly T[],
  todayISO: string,
  dueSoonDays = 14,
): RankedAttention<T>[] {
  return [...items]
    .sort((a, b) => a.dueISO.localeCompare(b.dueISO) || a.id.localeCompare(b.id))
    .map((item) => {
      const daysUntilDue = daysBetweenISO(todayISO, item.dueISO)
      const status: AttentionStatus =
        daysUntilDue < 0 ? 'overdue' : daysUntilDue <= dueSoonDays ? 'due_soon' : 'upcoming'
      return { item, status, daysUntilDue }
    })
}

/* ------------------------------------------------------------ score axis */

export interface AxisWindow {
  min: number
  max: number
  ticks: number[]
}

/**
 * Window a score axis to the data instead of zero: pad the data range, snap
 * to clean ticks (5s for narrow ranges, 10s for wide ones) and clamp to the
 * 0–100 score scale. Data 74–82 → axis 70–85 with ticks every 5.
 */
export function windowScoreAxis(values: readonly number[], pad = 2): AxisWindow {
  if (values.length === 0) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] }
  const lo = Math.min(...values) - pad
  const hi = Math.max(...values) + pad
  const step = hi - lo <= 30 ? 5 : 10
  const min = Math.max(0, Math.floor(lo / step) * step)
  const max = Math.min(100, Math.ceil(hi / step) * step)
  const ticks: number[] = []
  for (let t = min; t <= max; t += step) ticks.push(t)
  return { min, max, ticks }
}

/* ----------------------------------------------------------- score delta */

export interface ScoreDelta {
  current: number
  baseline: number
  delta: number
  baselineMonthISO: string
}

/** Current score vs the oldest point in the window (needs ≥ 2 points). */
export function scoreDelta(
  history: readonly { monthISO: string; score: number }[],
): ScoreDelta | null {
  if (history.length < 2) return null
  const sorted = [...history].sort((a, b) => a.monthISO.localeCompare(b.monthISO))
  const first = sorted[0]!
  const last = sorted.at(-1)!
  return {
    current: last.score,
    baseline: first.score,
    delta: last.score - first.score,
    baselineMonthISO: first.monthISO,
  }
}

/* ------------------------------------------------------------ case aging */

export interface CaseAgingRow<T> {
  caseRow: T
  daysOpen: number
}

export interface CaseAging<T> {
  openCount: number
  avgDays: number
  oldestDays: number
  /** Oldest first — the row most worth looking at leads. */
  rows: CaseAgingRow<T>[]
}

export function caseAging<T extends { openedISO: string }>(
  openCases: readonly T[],
  todayISO: string,
): CaseAging<T> | null {
  if (openCases.length === 0) return null
  const rows = openCases
    .map((caseRow) => ({
      caseRow,
      daysOpen: Math.max(0, daysBetweenISO(caseRow.openedISO, todayISO)),
    }))
    .sort((a, b) => b.daysOpen - a.daysOpen)
  const total = rows.reduce((sum, r) => sum + r.daysOpen, 0)
  return {
    openCount: rows.length,
    avgDays: Math.round(total / rows.length),
    oldestDays: rows[0]!.daysOpen,
    rows,
  }
}

/* ------------------------------------------------- acknowledgment meter */

export interface AckProgress {
  signed: number
  total: number
  outstanding: number
  /** 0–100, rounded. */
  pct: number
}

export function ackProgress(signed: number, total: number): AckProgress {
  const safeTotal = Math.max(0, total)
  const safeSigned = Math.min(Math.max(0, signed), safeTotal)
  return {
    signed: safeSigned,
    total: safeTotal,
    outstanding: safeTotal - safeSigned,
    pct: safeTotal > 0 ? Math.round((safeSigned / safeTotal) * 100) : 0,
  }
}

/* ------------------------------------------- production score components */

export interface ScoreComponent {
  key: string
  done: number
  total: number
  /** 0–100, rounded — null when the component has no rows yet. */
  pct: number | null
}

export function scoreComponent(key: string, done: number, total: number): ScoreComponent {
  return {
    key,
    done,
    total,
    pct: total > 0 ? Math.round((done / total) * 100) : null,
  }
}

/**
 * Blend component percentages into one score: the unweighted mean of the
 * components that have data. Null until at least one component has rows.
 */
export function blendScore(components: readonly ScoreComponent[]): number | null {
  const present = components.filter((c): c is ScoreComponent & { pct: number } => c.pct !== null)
  if (present.length === 0) return null
  return Math.round(present.reduce((sum, c) => sum + c.pct, 0) / present.length)
}
