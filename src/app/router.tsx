import { Navigate, createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '@/features/marketing/LandingPage'
import { EntryStage } from '@/features/app/shell/EntryStage'
import { AppShell } from '@/features/app/shell/AppShell'
import { appViewRoutes } from './appViews'

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
  { path: '/', element: <LandingPage /> },
  { path: '/app/welcome', element: <EntryStage /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [{ index: true, element: <Navigate to="/app/home" replace /> }, ...appViewRoutes],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
