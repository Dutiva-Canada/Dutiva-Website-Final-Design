/* oxlint-disable react/only-export-components -- route table, not a component
   module: the lazy() wrappers here don't participate in fast refresh. */
import { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/features/app/AppProviders'
import { appViewRoutes } from './appViews'

/* Route-level code splitting: marketing visitors never download the app
   workspace, and vice versa. Suspense fallbacks stay empty — each surface
   paints its own bg via the surface classes, so there is nothing to flash. */
const LandingPage = lazy(() =>
  import('@/features/marketing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const EntryStage = lazy(() =>
  import('@/features/app/shell/EntryStage').then((m) => ({ default: m.EntryStage })),
)
const AppShell = lazy(() =>
  import('@/features/app/shell/AppShell').then((m) => ({ default: m.AppShell })),
)

/**
 * Route map (see CONVENTIONS.md):
 *   /                      marketing landing page
 *   /app/welcome           app entry stage (sign-in preview)
 *   /app                   workspace shell → redirects to /app/home
 *   /app/<view>            the 16 workspace views
 *   /app/cases/:caseId     case detail
 *   /app/employees/:employeeId  employee profile
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    ),
  },
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
