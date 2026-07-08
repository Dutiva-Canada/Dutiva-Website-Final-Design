import type { RouteObject } from 'react-router-dom'
import { HomeView } from '@/features/app/views/home/HomeView'
import { AdvisorView } from '@/features/app/views/advisor/AdvisorView'
import { WorkflowsView } from '@/features/app/views/workflows/WorkflowsView'
import { CasesView } from '@/features/app/views/cases/CasesView'
import { CaseDetailView } from '@/features/app/views/cases/CaseDetailView'
import { EmployeesView } from '@/features/app/views/employees/EmployeesView'
import { EmployeeProfileView } from '@/features/app/views/employees/EmployeeProfileView'
import { ComplianceView } from '@/features/app/views/compliance/ComplianceView'
import { PoliciesView } from '@/features/app/views/policies/PoliciesView'
import { TemplatesView } from '@/features/app/views/templates/TemplatesView'
import { TasksView } from '@/features/app/views/tasks/TasksView'
import { CalendarView } from '@/features/app/views/calendar/CalendarView'
import { ReportsView } from '@/features/app/views/reports/ReportsView'
import { KnowledgeView } from '@/features/app/views/knowledge/KnowledgeView'
import { CommunicationsView } from '@/features/app/views/communications/CommunicationsView'
import { CompensationView } from '@/features/app/views/compensation/CompensationView'
import { WellbeingView } from '@/features/app/views/wellbeing/WellbeingView'
import { SettingsView } from '@/features/app/views/settings/SettingsView'

/** Child routes rendered inside the AppShell outlet. */
export const appViewRoutes: RouteObject[] = [
  { path: 'home', element: <HomeView /> },
  { path: 'advisor', element: <AdvisorView /> },
  { path: 'workflows', element: <WorkflowsView /> },
  { path: 'cases', element: <CasesView /> },
  { path: 'cases/:caseId', element: <CaseDetailView /> },
  { path: 'employees', element: <EmployeesView /> },
  { path: 'employees/:employeeId', element: <EmployeeProfileView /> },
  { path: 'compliance', element: <ComplianceView /> },
  { path: 'policies', element: <PoliciesView /> },
  { path: 'templates', element: <TemplatesView /> },
  { path: 'tasks', element: <TasksView /> },
  { path: 'calendar', element: <CalendarView /> },
  { path: 'reports', element: <ReportsView /> },
  { path: 'knowledge', element: <KnowledgeView /> },
  { path: 'communications', element: <CommunicationsView /> },
  { path: 'compensation', element: <CompensationView /> },
  { path: 'wellbeing', element: <WellbeingView /> },
  { path: 'settings', element: <SettingsView /> },
]
