/**
 * Client error reporting — the public surface wired into the app.
 *
 * `installErrorReporting()` (called once from src/main.tsx) registers global
 * `error` / `unhandledrejection` handlers for crashes outside React's tree, and
 * `reportRouteError()` is called from the RouteErrorPage boundary for render
 * errors React catches. Both are **inert** unless every gate passes:
 *
 *   - running in a browser (never during SSR/prerender);
 *   - VERCEL_ENV is 'production' or 'preview' (collapses to '' in dev/tests);
 *   - VITE_SUPABASE_URL is configured (the beacon target lives there).
 *
 * When inert, install and report are no-ops — nothing is sent in dev, under
 * Vitest, or on a `development` deploy.
 */
import { VERCEL_ENV } from '@/lib/deployEnv'
import { RELEASE_SHA } from '@/lib/release'
import { createReporter } from './reporter'
import type { Reporter } from './reporter'

export type { ReportKind, ReportPayload } from './reporter'

let reporter: Reporter | null = null

/** Resolve the beacon endpoint, or null if reporting must stay off. */
export function reportingEndpoint(): string | null {
  if (typeof window === 'undefined') return null
  if (VERCEL_ENV !== 'production' && VERCEL_ENV !== 'preview') return null
  const base = import.meta.env.VITE_SUPABASE_URL
  if (!base || typeof base !== 'string') return null
  return `${base.replace(/\/+$/, '')}/functions/v1/report-error`
}

function currentPath(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/'
}

/** Global handler pair, factored out so it can be unit-tested directly. */
export function makeGlobalErrorHandlers(target: Reporter): {
  onError: (event: { error?: unknown; message?: unknown }) => void
  onRejection: (event: { reason?: unknown }) => void
} {
  return {
    onError: (event) =>
      target.report({
        error: event.error ?? event.message,
        kind: 'window-error',
        pathname: currentPath(),
      }),
    onRejection: (event) =>
      target.report({ error: event.reason, kind: 'unhandled-rejection', pathname: currentPath() }),
  }
}

/**
 * Install global error reporting. Safe to call more than once (idempotent) and
 * a no-op when any gate fails. Registering the listeners is instant, so this
 * never competes with first paint.
 */
export function installErrorReporting(): void {
  if (reporter) return
  const endpoint = reportingEndpoint()
  if (!endpoint) return

  reporter = createReporter({ endpoint, env: VERCEL_ENV, release: RELEASE_SHA })
  const { onError, onRejection } = makeGlobalErrorHandlers(reporter)
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
}

/**
 * Report a render error caught by the RouteErrorPage boundary. No-op unless
 * reporting was installed (i.e. all gates passed).
 */
export function reportRouteError(error: unknown): void {
  reporter?.report({ error, kind: 'route-boundary', pathname: currentPath() })
}

/** Test-only reset of the module singleton. */
export function __resetErrorReportingForTest(): void {
  reporter = null
}
