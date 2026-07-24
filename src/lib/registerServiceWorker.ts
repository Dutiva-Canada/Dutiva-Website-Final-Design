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
 *
 * Auto-recovery: the worker calls skipWaiting()/clients.claim() on a new
 * deploy, so a freshly activated worker takes control of already-open tabs.
 * Without the page reacting, such a tab keeps rendering whatever the
 * superseded worker had served until the user manually hard-refreshes. The
 * `controllerchange` handler below reloads the tab once when that happens, so
 * it re-renders against the new worker with fresh, per-route HTML instead. The
 * reload is skipped on the very first control hand-off (no worker was
 * controlling this load — a first visit has nothing stale to escape), and the
 * `reloaded` latch keeps it to a single reload, so it can never loop.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  /* Was an active worker already controlling this page at startup? Only then
     is a controllerchange an *update* replacing a running worker (reload to
     escape its output); a null controller means a first-visit install, whose
     initial claim needs no reload. Null too after a hard-reload (the worker is
     bypassed), which is already the freshest possible load — nothing to do. */
  const hadController = navigator.serviceWorker.controller !== null
  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || !hadController) return
    reloaded = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {
      /* Never let a registration failure surface to the user. */
    })
  })
}
