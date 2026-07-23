import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/App'
import { registerServiceWorker } from './lib/registerServiceWorker'
import { installErrorReporting } from './lib/errorReporting'

/* Install global error/rejection reporting before the app renders so early
   crashes are captured too. Inert in dev, tests, and non-production/preview
   deploys (see src/lib/errorReporting). */
installErrorReporting()

const rootEl = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

/* Public pages ship prerendered HTML (scripts/prerender.mjs) and hydrate;
   the app shell (app.html) has an empty root and client-renders. */
if (rootEl.childElementCount > 0) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}

/* Enable offline use in production builds (no-op in dev / tests). */
registerServiceWorker()
