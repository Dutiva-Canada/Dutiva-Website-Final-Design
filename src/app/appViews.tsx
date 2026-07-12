/* oxlint-disable react/only-export-components -- route table, not a component
   module: the lazy() wrappers here don't participate in fast refresh. */
import { lazy } from 'react'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { ModeGate } from '@/features/app/workspaceMode/ModeGate'

/**
 * Child routes rendered inside the AppShell outlet. Each view is lazy-loaded
 * so the marketing landing page (and any single view) doesn't pull the whole
 * workspace into the initial chunk.
 *
 * gated() wraps a fixture-driven view in ModeGate: demo renders it as-is,
 * production renders the shared empty state. Ungated on purpose: home and
 * advisor (own production variants), knowledge (generic HR-law reference +
 * the real guidance panel), settings (hosts the toggle), and the Document
 * Studio screens (the template catalog is real product content — only the
 * fixture repository is gated). Remove a view's gate when it gains real
 * persistence.
 */
function gated(view: ReactNode) {
  return <ModeGate>{view}</ModeGate>
}
/* prettier-ignore */ const HomeView = lazy(() => import('@/features/app/views/home/HomeView').then((m) => ({ default: m.HomeView })))
/* prettier-ignore */ const AdvisorView = lazy(() => import('@/features/app/views/advisor/AdvisorView').then((m) => ({ default: m.AdvisorView })))
/* Advisor Memory (person / case / chat recall / manager) */
/* prettier-ignore */ const MemoryLayout = lazy(() => import('@/features/app/views/memory/MemoryLayout').then((m) => ({ default: m.MemoryLayout })))
/* prettier-ignore */ const MemoryManagerView = lazy(() => import('@/features/app/views/memory/MemoryManagerView').then((m) => ({ default: m.MemoryManagerView })))
/* prettier-ignore */ const PersonMemoryView = lazy(() => import('@/features/app/views/memory/PersonMemoryView').then((m) => ({ default: m.PersonMemoryView })))
/* prettier-ignore */ const CaseMemoryView = lazy(() => import('@/features/app/views/memory/CaseMemoryView').then((m) => ({ default: m.CaseMemoryView })))
/* prettier-ignore */ const ChatRecallView = lazy(() => import('@/features/app/views/memory/ChatRecallView').then((m) => ({ default: m.ChatRecallView })))
/* prettier-ignore */ const WorkflowsView = lazy(() => import('@/features/app/views/workflows/WorkflowsView').then((m) => ({ default: m.WorkflowsView })))
/* prettier-ignore */ const CasesView = lazy(() => import('@/features/app/views/cases/CasesView').then((m) => ({ default: m.CasesView })))
/* prettier-ignore */ const CaseDetailView = lazy(() => import('@/features/app/views/cases/CaseDetailView').then((m) => ({ default: m.CaseDetailView })))
/* prettier-ignore */ const EmployeesView = lazy(() => import('@/features/app/views/employees/EmployeesView').then((m) => ({ default: m.EmployeesView })))
/* prettier-ignore */ const EmployeeProfileView = lazy(() => import('@/features/app/views/employees/EmployeeProfileView').then((m) => ({ default: m.EmployeeProfileView })))
/* prettier-ignore */ const ComplianceView = lazy(() => import('@/features/app/views/compliance/ComplianceView').then((m) => ({ default: m.ComplianceView })))
/* prettier-ignore */ const PoliciesView = lazy(() => import('@/features/app/views/policies/PoliciesView').then((m) => ({ default: m.PoliciesView })))
/* prettier-ignore */ const TemplatesView = lazy(() => import('@/features/app/views/templates/TemplatesView').then((m) => ({ default: m.TemplatesView })))
/* prettier-ignore */ const TasksView = lazy(() => import('@/features/app/views/tasks/TasksView').then((m) => ({ default: m.TasksView })))
/* prettier-ignore */ const CalendarView = lazy(() => import('@/features/app/views/calendar/CalendarView').then((m) => ({ default: m.CalendarView })))
/* prettier-ignore */ const ReportsView = lazy(() => import('@/features/app/views/reports/ReportsView').then((m) => ({ default: m.ReportsView })))
/* prettier-ignore */ const KnowledgeView = lazy(() => import('@/features/app/views/knowledge/KnowledgeView').then((m) => ({ default: m.KnowledgeView })))
/* prettier-ignore */ const CommunicationsView = lazy(() => import('@/features/app/views/communications/CommunicationsView').then((m) => ({ default: m.CommunicationsView })))
/* prettier-ignore */ const CompensationView = lazy(() => import('@/features/app/views/compensation/CompensationView').then((m) => ({ default: m.CompensationView })))
/* prettier-ignore */ const WellbeingView = lazy(() => import('@/features/app/views/wellbeing/WellbeingView').then((m) => ({ default: m.WellbeingView })))
/* prettier-ignore */ const SettingsView = lazy(() => import('@/features/app/views/settings/SettingsView').then((m) => ({ default: m.SettingsView })))
/* HR Documents Library (Document Studio + Repository) */
/* prettier-ignore */ const DocumentsLayout = lazy(() => import('@/features/app/documents/DocumentsLayout').then((m) => ({ default: m.DocumentsLayout })))
/* prettier-ignore */ const StudioScreen = lazy(() => import('@/features/app/documents/screens/StudioScreen').then((m) => ({ default: m.StudioScreen })))
/* prettier-ignore */ const TemplateDetailScreen = lazy(() => import('@/features/app/documents/screens/TemplateDetailScreen').then((m) => ({ default: m.TemplateDetailScreen })))
/* prettier-ignore */ const GenerateScreen = lazy(() => import('@/features/app/documents/screens/GenerateScreen').then((m) => ({ default: m.GenerateScreen })))
/* prettier-ignore */ const RepositoryScreen = lazy(() => import('@/features/app/documents/screens/RepositoryScreen').then((m) => ({ default: m.RepositoryScreen })))
/* prettier-ignore */ const DocumentDetailScreen = lazy(() => import('@/features/app/documents/screens/DocumentDetailScreen').then((m) => ({ default: m.DocumentDetailScreen })))

export const appViewRoutes: RouteObject[] = [
  { path: 'home', element: <HomeView /> },
  { path: 'advisor', element: <AdvisorView /> },
  {
    path: 'memory',
    element: gated(<MemoryLayout />),
    children: [
      { index: true, element: <MemoryManagerView /> },
      { path: 'people/:personId', element: <PersonMemoryView /> },
      { path: 'cases/:caseId', element: <CaseMemoryView /> },
      { path: 'conversations/:threadId', element: <ChatRecallView /> },
    ],
  },
  { path: 'workflows', element: gated(<WorkflowsView />) },
  /* Cases list handles both modes itself (real persistence in production);
     the fixture case-detail route stays gated. */
  { path: 'cases', element: <CasesView /> },
  { path: 'cases/:caseId', element: gated(<CaseDetailView />) },
  /* Employees list handles both modes itself (real persistence in
     production); the fixture profile route stays gated. */
  { path: 'employees', element: <EmployeesView /> },
  { path: 'employees/:employeeId', element: gated(<EmployeeProfileView />) },
  { path: 'compliance', element: gated(<ComplianceView />) },
  { path: 'policies', element: gated(<PoliciesView />) },
  { path: 'templates', element: gated(<TemplatesView />) },
  /* Tasks handles both modes itself (real persistence in production). */
  { path: 'tasks', element: <TasksView /> },
  { path: 'calendar', element: gated(<CalendarView />) },
  { path: 'reports', element: gated(<ReportsView />) },
  { path: 'knowledge', element: <KnowledgeView /> },
  { path: 'communications', element: gated(<CommunicationsView />) },
  { path: 'compensation', element: gated(<CompensationView />) },
  { path: 'wellbeing', element: gated(<WellbeingView />) },
  { path: 'settings', element: <SettingsView /> },
  {
    path: 'documents',
    element: <DocumentsLayout />,
    children: [
      { index: true, element: gated(<RepositoryScreen />) },
      { path: 'studio', element: <StudioScreen /> },
      { path: 'templates/:tid', element: <TemplateDetailScreen /> },
      { path: 'generate/:templateId', element: <GenerateScreen /> },
      { path: ':docId', element: gated(<DocumentDetailScreen />) },
    ],
  },
]
