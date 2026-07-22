/**
 * The client error reporter: builds a privacy-scrubbed payload, dedupes and
 * rate-limits it, and fires it at the reporting endpoint as a beacon. It never
 * throws, never blocks paint, and sends nothing beyond the fields below.
 *
 * Transport is `navigator.sendBeacon` with a plain-string body, which the
 * browser sends as `text/plain;charset=UTF-8` — a CORS-safelisted content type,
 * so there is no preflight and no headers to set (sendBeacon can't set any).
 * A `fetch(..., { keepalive: true })` fallback covers browsers/paths where
 * sendBeacon is unavailable or refuses the payload.
 *
 * See ./scrubRoute (route patterns), ./coarseUserAgent (UA reduction), and
 * docs/ERROR_REPORTING.md for the full privacy rationale.
 */
import { coarseUserAgent } from './coarseUserAgent'
import { scrubRoutePattern } from './scrubRoute'

export type ReportKind = 'route-boundary' | 'window-error' | 'unhandled-rejection'

export interface ReportInput {
  /** The thrown value (Error, string, rejection reason, …). */
  error: unknown
  kind: ReportKind
  /** Defaults to `window.location.pathname`. */
  pathname?: string
}

/** The exact wire payload. Nothing is added to this without justification. */
export interface ReportPayload {
  env: string
  release: string
  route: string
  locale: string
  kind: ReportKind
  message: string
  stack: string
  ua: string
}

export interface ReporterConfig {
  endpoint: string
  /** 'production' | 'preview'. */
  env: string
  /** Commit SHA, or '' when unknown. */
  release: string
  /** Transport. Defaults to sendBeacon-then-fetch. Injectable for tests. */
  send?: (endpoint: string, body: string) => boolean
  /** Clock. Injectable for tests. */
  now?: () => number
}

export interface Reporter {
  report: (input: ReportInput) => void
}

const MAX_MESSAGE = 1000
const MAX_STACK = 4000

/* One broken render loop can throw thousands of times a second. These bound
   both a single repeated error (per-fingerprint dedupe) and the endpoint as a
   whole (rolling window + hard session cap), so nothing can flood it. */
const DEDUPE_WINDOW_MS = 60_000
const RATE_WINDOW_MS = 10_000
const MAX_PER_WINDOW = 5
const MAX_TOTAL = 25

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || 'Error'
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const maybe = (error as { message?: unknown }).message
    if (typeof maybe === 'string') return maybe
  }
  try {
    return String(error)
  } catch {
    return 'Unknown error'
  }
}

function stackOf(error: unknown): string {
  return error instanceof Error && typeof error.stack === 'string' ? error.stack : ''
}

/** First meaningful stack frame, for the dedupe fingerprint. */
function firstFrame(stack: string): string {
  for (const line of stack.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('at ')) return trimmed
  }
  return ''
}

/** Locale from the live `<html lang>` (kept as en-CA / fr-CA by the app). */
function localeOf(): string {
  if (typeof document === 'undefined') return 'en-CA'
  return document.documentElement.getAttribute('lang') === 'fr-CA' ? 'fr-CA' : 'en-CA'
}

/**
 * Send a report body via sendBeacon, falling back to a keepalive fetch. Returns
 * whether the report was handed off to the browser; swallows every error so a
 * transport failure never surfaces.
 */
export function beaconOrFetch(endpoint: string, body: string): boolean {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      // String body → text/plain;charset=UTF-8 → CORS-safelisted, no preflight.
      if (navigator.sendBeacon(endpoint, body)) return true
    }
  } catch {
    /* Fall through to fetch. */
  }
  try {
    if (typeof fetch === 'function') {
      void fetch(endpoint, {
        method: 'POST',
        body,
        keepalive: true,
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      }).catch(() => {
        /* Best effort — a failed report is never retried or surfaced. */
      })
      return true
    }
  } catch {
    /* Nothing more to try. */
  }
  return false
}

export function createReporter(config: ReporterConfig): Reporter {
  const send = config.send ?? beaconOrFetch
  const clock = config.now ?? (() => Date.now())

  const seen = new Map<string, number>()
  const windowHits: number[] = []
  let totalSent = 0

  function report(input: ReportInput): void {
    try {
      const pathname =
        input.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
      const route = scrubRoutePattern(pathname)
      const message = truncate(messageOf(input.error), MAX_MESSAGE)
      const stack = truncate(stackOf(input.error), MAX_STACK)
      const fingerprint = `${input.kind}|${route}|${message}|${firstFrame(stack)}`
      const now = clock()

      const last = seen.get(fingerprint)
      if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return

      while (windowHits.length > 0 && now - windowHits[0]! > RATE_WINDOW_MS) windowHits.shift()
      if (windowHits.length >= MAX_PER_WINDOW) return
      if (totalSent >= MAX_TOTAL) return

      const payload: ReportPayload = {
        env: config.env,
        release: config.release,
        route,
        locale: localeOf(),
        kind: input.kind,
        message,
        stack,
        ua: coarseUserAgent(),
      }

      if (send(config.endpoint, JSON.stringify(payload))) {
        seen.set(fingerprint, now)
        windowHits.push(now)
        totalSent += 1
      }
    } catch {
      /* Reporting must never surface its own failure to the user. */
    }
  }

  return { report }
}
