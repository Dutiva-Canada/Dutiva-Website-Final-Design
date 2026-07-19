/**
 * Registers the offline service worker (dist/sw.js, generated at build time by
 * scripts/generate-sw.mjs).
 *
 * Production browser builds only: the dev server must never be caching (it
 * breaks HMR) and no sw.js exists there anyway, so this is a no-op under
 * `vite dev` and in tests (import.meta.env.PROD === false). Registration is
 * deferred to the load event so it never competes with first paint, and
 * updateViaCache:'none' makes the browser revalidate sw.js against the network
 * on each navigation rather than serving it from the HTTP cache — so a
 * redeployed worker is picked up promptly. A failed registration is swallowed:
 * offline support is an enhancement and must never break the live app.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {
      /* Never let a registration failure surface to the user. */
    })
  })
}
