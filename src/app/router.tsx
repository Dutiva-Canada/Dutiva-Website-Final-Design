/* oxlint-disable react/only-export-components -- route table, not a component
   module: the lazy() wrappers here don't participate in fast refresh. */
import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/features/app/AppProviders'
import { appViewRoutes } from './appViews'

/* Route-level code splitting: marketing visitors never download the app
   workspace, and vice versa. Suspense fallbacks stay empty — each surface
   paints its own bg via the surface classes, so there is nothing to flash. */
const LandingPage = lazy(() =>
  import('@/features/marketing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
/* Marketing subpages (dutiva.ca content migration) — split per route like the views. */
/* prettier-ignore */ const AboutPage = lazy(() => import('@/features/marketing/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
/* prettier-ignore */ const FaqPage = lazy(() => import('@/features/marketing/pages/FaqPage').then((m) => ({ default: m.FaqPage })))
/* prettier-ignore */ const BlogIndexPage = lazy(() => import('@/features/marketing/pages/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })))
/* prettier-ignore */ const TemplateUsagePage = lazy(() => import('@/features/marketing/pages/TemplateUsagePage').then((m) => ({ default: m.TemplateUsagePage })))
/* prettier-ignore */ const KnownLimitationsPage = lazy(() => import('@/features/marketing/pages/KnownLimitationsPage').then((m) => ({ default: m.KnownLimitationsPage })))
/* prettier-ignore */ const LegalHubPage = lazy(() => import('@/features/marketing/pages/LegalHubPage').then((m) => ({ default: m.LegalHubPage })))
/* prettier-ignore */ const PolicyPage = lazy(() => import('@/features/marketing/pages/PolicyPage').then((m) => ({ default: m.PolicyPage })))
const EntryStage = lazy(() =>
  import('@/features/app/shell/EntryStage').then((m) => ({ default: m.EntryStage })),
)
const AppShell = lazy(() =>
  import('@/features/app/shell/AppShell').then((m) => ({ default: m.AppShell })),
)

/** Marketing routes share the same empty-fallback Suspense wrapper. */
function marketing(element: ReactNode) {
  return <Suspense fallback={null}>{element}</Suspense>
}

/**
 * Route map (see CONVENTIONS.md):
 *   /                      marketing landing page
 *   /about /faq /blog      marketing subpages (dutiva.ca content migration)
 *   /guides/template-usage /known-limitations
 *   /legal                 policy index; /legal/:slug policy documents
 *   /app/welcome           app entry stage (sign-in preview)
 *   /app                   workspace shell → redirects to /app/home
 *   /app/<view>            the 16 workspace views
 *   /app/cases/:caseId     case detail
 *   /app/employees/:employeeId  employee profile
 */
export const router = createBrowserRouter([
  { path: '/', element: marketing(<LandingPage />) },
  { path: '/about', element: marketing(<AboutPage />) },
  { path: '/faq', element: marketing(<FaqPage />) },
  { path: '/blog', element: marketing(<BlogIndexPage />) },
  { path: '/guides/template-usage', element: marketing(<TemplateUsagePage />) },
  { path: '/known-limitations', element: marketing(<KnownLimitationsPage />) },
  { path: '/legal', element: marketing(<LegalHubPage />) },
  { path: '/legal/:slug', element: marketing(<PolicyPage />) },
  {
    path: '/app/welcome',
    element: (
      <Suspense fallback={null}>
        <EntryStage />
      </Suspense>
    ),
  },
  {
    path: '/app',
    element: (
      <AppProviders>
        <Suspense fallback={null}>
          <AppShell />
        </Suspense>
      </AppProviders>
    ),
    children: [{ index: true, element: <Navigate to="/app/home" replace /> }, ...appViewRoutes],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
