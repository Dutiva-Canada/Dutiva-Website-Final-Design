import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Book,
  Brain,
  Calendar,
  ChartNoAxesColumn,
  DollarSign,
  FileStack,
  Folder,
  House,
  ListChecks,
  MessageCircle,
  Send,
  ShieldCheck,
  Users,
  Waypoints,
} from 'lucide-react'
import type { Bi } from '@/i18n/core'
import { bi } from '@/i18n/core'
import { shellMessages as M } from '@/i18n/messages/shell'
import { doclibMessages as DL } from '@/i18n/messages/doclib'
import { memoryMessages as MEM } from '@/i18n/messages/memory'
import { cases, employeeDetails, employees } from '@/data'

/**
 * Sidebar navigation model — order, grouping, icons and badges verbatim from
 * the App v2 prototype sidebar (`SidebarNav` markup + `renderVals()`).
 */

export type NavBadgeTone = 'gold' | 'neutral' | 'risk' | 'warn'

export interface NavItem {
  /** Stable key; also the first path segment under /app. */
  key: string
  to: string
  icon: LucideIcon
  label: Bi
  badge?: { value: string; tone: NavBadgeTone }
  /** Custom active predicate for items sharing a path prefix (doclib). */
  isActive?: (pathname: string) => boolean
}

export interface NavGroup {
  /** Uppercase section heading (only rendered when the sidebar is expanded). */
  heading: Bi | null
  items: NavItem[]
}

/* Badge counts — derivations verbatim from the prototype's renderVals()
   (line ~5150): cases = non-Resolved, wellbeing = employees whose sentiment
   is trending down (<55). Workflow runs and the compliance count are literals
   in the prototype too. */
const WORKFLOWS_BADGE = '3'
const CASES_BADGE = String(cases.filter((c) => c.status.en !== 'Resolved').length)
const COMPLIANCE_BADGE = '3'
const WELLBEING_BADGE = String(
  Object.values(employeeDetails).filter((d) => d.sentiment < 55).length,
)

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: null,
    items: [
      { key: 'home', to: '/app/home', icon: House, label: M.shell_nav_home },
      { key: 'advisor', to: '/app/advisor', icon: MessageCircle, label: M.shell_nav_advisor_home },
      {
        key: 'workflows',
        to: '/app/workflows',
        icon: Waypoints,
        label: M.shell_nav_workflows,
        badge: { value: WORKFLOWS_BADGE, tone: 'gold' },
      },
      { key: 'memory', to: '/app/memory', icon: Brain, label: MEM.memory_nav_memory },
    ],
  },
  {
    heading: M.shell_sec_records,
    items: [
      { key: 'employees', to: '/app/employees', icon: Users, label: M.shell_nav_people },
      {
        key: 'cases',
        to: '/app/cases',
        icon: Folder,
        label: M.shell_nav_cases,
        badge: { value: CASES_BADGE, tone: 'neutral' },
      },
      /* Unified HR Library — HR Library, Document Library, and Document Studio
         are all tabs inside DocumentsLayout. Landing on hr-library (first tab)
         is the default; isActive covers every /app/documents/* subroute. */
      {
        key: 'documents',
        to: '/app/documents/hr-library',
        icon: FileStack,
        label: M.shell_nav_library,
        isActive: (pathname) => pathname.startsWith('/app/documents'),
      },
      { key: 'knowledge', to: '/app/knowledge', icon: Book, label: M.shell_nav_knowledge },
    ],
  },
  {
    heading: M.shell_sec_programs,
    items: [
      {
        key: 'compliance',
        to: '/app/compliance',
        icon: ShieldCheck,
        label: M.shell_nav_compliance,
        badge: { value: COMPLIANCE_BADGE, tone: 'risk' },
      },
      {
        key: 'compensation',
        to: '/app/compensation',
        icon: DollarSign,
        label: M.shell_nav_compensation,
      },
      {
        key: 'communications',
        to: '/app/communications',
        icon: Send,
        label: M.shell_nav_communications,
      },
      {
        key: 'wellbeing',
        to: '/app/wellbeing',
        icon: Activity,
        label: M.shell_nav_wellbeing,
        badge: { value: WELLBEING_BADGE, tone: 'warn' },
      },
      { key: 'tasks', to: '/app/tasks', icon: ListChecks, label: M.shell_nav_tasks },
      { key: 'calendar', to: '/app/calendar', icon: Calendar, label: M.shell_nav_calendar },
    ],
  },
  {
    heading: M.shell_sec_insights,
    items: [
      { key: 'reports', to: '/app/reports', icon: ChartNoAxesColumn, label: M.shell_nav_analytics },
    ],
  },
]

/** Active when the route is the item or one of its children (/app/cases/:id …). */
export function isNavActive(to: string, pathname: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`)
}

/* Studio's subroutes (catalogue → generate flow), as opposed to the
   Repository (index + :docId). Single source of truth for both the topbar
   title below and the Repository/Studio tab strip (DocumentsLayout.tsx). */
const DOCLIB_STUDIO_SUBPATHS = ['studio', 'templates', 'generate']

export function isDoclibStudioPath(pathname: string): boolean {
  const parts = pathname.replace(/^\/app\/?/, '').split('/')
  return parts[0] === 'documents' && DOCLIB_STUDIO_SUBPATHS.includes(parts[1] ?? '')
}

/* Topbar / mobile-topbar route titles (prototype `viewLabels`). */
const VIEW_LABELS: Record<string, Bi> = {
  home: M.shell_v_home,
  advisor: M.shell_v_advisor,
  memory: MEM.memory_title,
  workflows: M.shell_v_workflows,
  cases: M.shell_v_cases,
  employees: M.shell_v_employees,
  compliance: M.shell_v_compliance,
  policies: M.shell_v_policies,
  tasks: M.shell_v_tasks,
  calendar: M.shell_v_calendar,
  reports: M.shell_v_reports,
  templates: M.shell_v_templates,
  knowledge: M.shell_v_knowledge,
  settings: M.shell_v_settings,
  compensation: M.shell_v_compensation,
  wellbeing: M.shell_v_wellbeing,
  communications: M.shell_v_communications,
}

/**
 * Like viewLabelFor, but always the module's own label — no fixture-employee
 * name special case. Used by ModeGate to title production empty states, where
 * surfacing a fixture person's name would itself be a demo-data leak.
 */
export function moduleLabelFor(pathname: string): Bi {
  const segment = pathname.replace(/^\/app\/?/, '').split('/')[0] ?? ''
  if (segment === 'documents') return M.shell_nav_library
  return VIEW_LABELS[segment] ?? M.shell_v_home
}

export function viewLabelFor(pathname: string): Bi {
  const parts = pathname.replace(/^\/app\/?/, '').split('/')
  const segment = parts[0] ?? ''
  /* The prototype titles the employee-profile route with the person's name
     (`viewLabels.profile = profileEmp.name`). */
  if (segment === 'employees' && parts[1]) {
    const emp = employees.find((e) => e.id === parts[1])
    if (emp) return bi(emp.name, emp.name)
  }
  if (segment === 'documents') {
    if (pathname.startsWith('/app/documents/hr-library')) return M.shell_nav_library
    return isDoclibStudioPath(pathname) ? DL.doclib_nav_studio : DL.doclib_nav_documents
  }
  return VIEW_LABELS[segment] ?? M.shell_v_home
}

/* Sample signed-in identity (prototype sidebar footer). Kept local on purpose:
   the data agent owns '@/data' and works in parallel — swap this for the real
   fixture import once it lands. */
export const WORKSPACE_USER = {
  name: 'Riley Summers',
  initials: 'RS',
  role: { en: 'HR Lead', fr: 'Responsable RH' } satisfies Bi,
  email: 'riley@northgatelogistics.ca',
}

export const WORKSPACE_NAME = 'Northgate Logistics Inc.'
