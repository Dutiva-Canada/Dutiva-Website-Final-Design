/* oxlint-disable react/only-export-components -- route table, not a component
   module: the lazy() wrappers here don't participate in fast refresh. */
import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/features/app/AppProviders'
import { AuthProvider } from '@/features/app/auth/AuthProvider'
import { PlanProvider } from '@/features/app/billing/PlanProvider'
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
/* prettier-ignore */ const PricingPage = lazy(() => import('@/features/marketing/pages/PricingPage').then((m) => ({ default: m.PricingPage })))
/* prettier-ignore */ const TemplatesPage = lazy(() => import('@/features/marketing/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })))
/* prettier-ignore */ const GuidesIndexPage = lazy(() => import('@/features/marketing/pages/GuidesIndexPage').then((m) => ({ default: m.GuidesIndexPage })))
const EntryStage = lazy(() =>
  import('@/features/app/shell/EntryStage').then((m) => ({ default: m.EntryStage })),
)
const AppShell = lazy(() =>
  import('@/features/app/shell/AppShell').then((m) => ({ default: m.AppShell })),
)
const RequireAdminSession = lazy(() =>
  import('@/features/app/auth/RequireAdminSession').then((m) => ({
    default: m.RequireAdminSession,
  })),
)

/** Marketing routes share the same empty-fallback Suspense wrapper. */
function marketing(element: ReactNode) {
  return <Suspense fallback={null}>{element}</Suspense>
}

/**
 * /pricing needs a Supabase session (to resolve plan + the internal-account
 * billing bypass, see features/app/billing/PlanProvider) but none of the
 * other workspace providers — wraps just Auth + Plan rather than the full
 * AppProviders bundle every /app route pulls in.
 */
function pricing(element: ReactNode) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        <PlanProvider>{element}</PlanProvider>
      </AuthProvider>
    </Suspense>
  )
}

/**
 * Route map (see CONVENTIONS.md):
 *   /                      marketing landing page
 *   /about /faq /blog      marketing subpages (dutiva.ca content migration)
 *   /pricing               plan comparison + Stripe checkout (Auth+Plan only, no AppProviders)
 *   /templates             template catalogue preview (real Document Studio data)
 *   /guides /guides/template-usage /known-limitations
 *   /legal                 policy index; /legal/:slug policy documents
 *   /app/welcome           app entry stage — sign-in gate (invite-only)
 *   /app                   workspace shell → redirects to /app/home
 *                          (gated: RequireAdminSession bounces anyone who
 *                          isn't the one allowed account back to /app/welcome)
 *   /app/<view>            the 16 workspace views
 *   /app/cases/:caseId     case detail
 *   /app/employees/:employeeId  employee profile
 */
export const router = createBrowserRouter([
  { path: '/', element: marketing(<LandingPage />) },
  { path: '/about', element: marketing(<AboutPage />) },
  { path: '/faq', element: marketing(<FaqPage />) },
  { path: '/blog', element: marketing(<BlogIndexPage />) },
  { path: '/pricing', element: pricing(<PricingPage />) },
  { path: '/templates', element: marketing(<TemplatesPage />) },
  { path: '/guides', element: marketing(<GuidesIndexPage />) },
  { path: '/guides/template-usage', element: marketing(<TemplateUsagePage />) },
  { path: '/known-limitations', element: marketing(<KnownLimitationsPage />) },
  { path: '/legal', element: marketing(<LegalHubPage />) },
  { path: '/legal/:slug', element: marketing(<PolicyPage />) },
  {
    path: '/app/welcome',
    element: (
      <AppProviders>
        <Suspense fallback={null}>
          <EntryStage />
        </Suspense>
      </AppProviders>
    ),
  },
  {
    path: '/app',
    element: (
      <AppProviders>
        <Suspense fallback={null}>
          <RequireAdminSession>
            <AppShell />
          </RequireAdminSession>
        </Suspense>
      </AppProviders>
    ),
    children: [{ index: true, element: <Navigate to="/app/home" replace /> }, ...appViewRoutes],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
