/**
 * Consent state for optional analytics (Google Analytics 4). Quebec Law 25
 * and the Cookie Policy both require consent before loading optional
 * analytics that set cookies — so GA4 is gated on BOTH a configured
 * measurement ID AND explicit consent.
 *
 * The consent banner UI does not exist yet (it needs a design handoff — see
 * AGENTS.md: "Prototypes are the source of truth for pixels and copy"). This
 * module is the plumbing: it reads/writes the consent state in localStorage
 * and exposes `hasAnalyticsConsent()` for the GA4 loader to check. Until a
 * banner sets the state, `hasAnalyticsConsent()` returns `false` and GA4
 * never loads — the loader is inert, not just unconfigured.
 *
 * When the banner ships, it will call `setAnalyticsConsent(true)` from its
 * "Accept" button and `setAnalyticsConsent(false)` from its "Decline" button.
 * The GA4 loader checks `hasAnalyticsConsent()` at mount time; a later
 * acceptance requires a page reload (same as most consent banner
 * implementations — the scripts load fresh on the next page view).
 */

const CONSENT_KEY = 'dutiva.analytics.consent'

function defaultStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Whether the user has granted consent for optional analytics. Returns
 * `false` when storage is unavailable or no consent has been recorded.
 */
export function hasAnalyticsConsent(storage: Storage | null = defaultStorage()): boolean {
  if (!storage) return false
  try {
    return storage.getItem(CONSENT_KEY) === 'true'
  } catch {
    return false
  }
}

/** Record the user's consent choice. Called by the (future) consent banner. */
export function setAnalyticsConsent(granted: boolean, storage: Storage | null = defaultStorage()): void {
  if (!storage) return
  try {
    storage.setItem(CONSENT_KEY, granted ? 'true' : 'false')
  } catch {
    // Best-effort — a blocked store must not break the UI.
  }
}

/** Whether the user has seen and responded to the consent banner. */
export function hasConsentResponse(storage: Storage | null = defaultStorage()): boolean {
  if (!storage) return false
  try {
    return storage.getItem(CONSENT_KEY) !== null
  } catch {
    return false
  }
}
