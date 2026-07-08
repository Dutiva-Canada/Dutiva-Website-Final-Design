import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Book,
  Calendar,
  ChartNoAxesColumn,
  DollarSign,
  FileText,
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
import { shellMessages as M } from '@/i18n/messages/shell'

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
}

export interface NavGroup {
  /** Uppercase section heading (only rendered when the sidebar is expanded). */
  heading: Bi | null
  items: NavItem[]
}

/* Sample badge counts — mirror the prototype fixtures (3 workflow runs, 3 open
   cases, 3 compliance flags, 1 wellbeing signal). Replace with derived counts
   from '@/data' once the data fixtures land (data agent works in parallel). */
const WORKFLOWS_BADGE = '3'
const CASES_BADGE = '3'
const COMPLIANCE_BADGE = '3'
const WELLBEING_BADGE = '1'

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
      { key: 'templates', to: '/app/templates', icon: FileText, label: M.shell_nav_documents },
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

/* Topbar / mobile-topbar route titles (prototype `viewLabels`). The employee
   profile route shows the Employees label for now — the prototype titles it
   with the person's name, which needs the '@/data' fixtures. */
const VIEW_LABELS: Record<string, Bi> = {
  home: M.shell_v_home,
  advisor: M.shell_v_advisor,
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

export function viewLabelFor(pathname: string): Bi {
  const segment = pathname.replace(/^\/app\/?/, '').split('/')[0] ?? ''
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
