import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { ReportsView } from './ReportsView'

describe('ReportsView', () => {
  afterEach(() => {
    localStorage.removeItem('dutiva-lang')
  })

  it('renders the subtitle, headcount bars, and compliance trend', () => {
    const { container } = renderApp(<ReportsView />, { route: '/app/reports' })

    expect(screen.getByText('Workforce and compliance overview.')).toBeInTheDocument()

    /* Headcount card: 34 + 21 + 12 + 9 + 6 = 82 across five bars. */
    expect(screen.getByText('Headcount by province')).toBeInTheDocument()
    expect(screen.getByText('82 total employees')).toBeInTheDocument()
    for (const p of ['ON', 'BC', 'QC', 'AB', 'Federal']) {
      expect(screen.getByText(p)).toBeInTheDocument()
    }

    /* Trend card: latest score line + the six-point polyline. */
    expect(screen.getByText('Compliance score trend')).toBeInTheDocument()
    expect(screen.getByText('Now at 82/100, up from 74 six months ago')).toBeInTheDocument()
    const polyline = container.querySelector('polyline')
    expect(polyline).not.toBeNull()
    const expectedPoints = [74, 76, 79, 78, 81, 82]
      .map((v, i) => i * (240 / 5) + ',' + (60 - (v / 100) * 60))
      .join(' ')
    expect(polyline).toHaveAttribute('points', expectedPoints)
  })

  it('renders the French strings when the language preference is fr', () => {
    localStorage.setItem('dutiva-lang', 'fr')
    renderApp(<ReportsView />, { route: '/app/reports' })

    expect(screen.getByText('Aperçu de l’effectif et de la conformité.')).toBeInTheDocument()
    expect(screen.getByText('Effectif par province')).toBeInTheDocument()
    expect(screen.getByText('82 employés au total')).toBeInTheDocument()
    expect(screen.getByText('Fédéral')).toBeInTheDocument()
    expect(screen.getByText('Tendance du score de conformité')).toBeInTheDocument()
  })
})

describe('ReportsView in production mode', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  /** Admin signed in, production stored, one org, all five real tables. */
  function mockProductionClient(data: {
    employees?: Record<string, unknown>[]
    hr_cases?: Record<string, unknown>[]
    compliance_tasks?: Record<string, unknown>[]
    compliance_findings?: Record<string, unknown>[]
    hr_policies?: Record<string, unknown>[]
  }) {
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () =>
            Promise.resolve({
              data: { session: { user: { id: 'u1', email: 'martin.constantineau@dutiva.ca' } } },
            }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        rpc: vi.fn((fn: string) =>
          Promise.resolve(
            fn === 'is_admin_user' ? { data: true, error: null } : { data: null, error: null },
          ),
        ),
        from: vi.fn((table: string) => {
          if (table === 'workspace_preferences') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: { mode: 'production' }, error: null }),
                }),
              }),
            }
          }
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: () =>
                    Promise.resolve({
                      data: {
                        legal_name: 'Dutiva Canada Inc.',
                        company_name: null,
                        primary_contact: 'Martin Constantineau',
                        province: 'Ontario',
                        city: 'Ottawa',
                      },
                      error: null,
                    }),
                }),
              }),
            }
          }
          if (table === 'organization_members') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    limit: () => ({
                      maybeSingle: () =>
                        Promise.resolve({ data: { organization_id: 'org-1' }, error: null }),
                    }),
                  }),
                }),
              }),
            }
          }
          const rows = (data as Record<string, Record<string, unknown>[] | undefined>)[table] ?? []
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: rows, error: null }),
              }),
            }),
          }
        }),
      },
    }))
    vi.resetModules()
  }

  const EMPLOYEE = (id: string, province: string) => ({
    id,
    name: `Employee ${id}`,
    title: null,
    email: null,
    province,
    start_date: null,
    status: 'active',
  })

  it('aggregates live stats and breakdowns from the real modules', async () => {
    mockProductionClient({
      employees: [EMPLOYEE('e1', 'Ontario'), EMPLOYEE('e2', 'Ontario'), EMPLOYEE('e3', 'Quebec')],
      hr_cases: [
        {
          id: 'c1',
          title: 'Case one',
          case_type: 'Performance',
          employee_id: null,
          province: 'Ontario',
          status: 'open',
          due_date: null,
        },
        {
          id: 'c2',
          title: 'Case two',
          case_type: 'Onboarding',
          employee_id: null,
          province: 'Ontario',
          status: 'resolved',
          due_date: null,
        },
      ],
      compliance_tasks: [
        { id: 't1', title: 'Task', priority: 'high', status: 'open', due_at: null },
      ],
      compliance_findings: [
        {
          id: 'f1',
          title: 'Finding',
          description: null,
          recommendation: null,
          severity: 'high',
          status: 'open',
        },
      ],
      hr_policies: [
        { id: 'p1', name: 'Policy A', status: 'up_to_date', last_reviewed: null },
        { id: 'p2', name: 'Policy B', status: 'missing', last_reviewed: null },
      ],
    })
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { ReportsView: ReportsViewFresh } = await import('./ReportsView')

    renderAppFresh(<ReportsViewFresh />, { route: '/app/reports', path: '/app/reports' })

    expect(
      await screen.findByText('Computed live from your workspace records.'),
    ).toBeInTheDocument()

    /* Stat cards: 3 employees, 1 open case, 1 open task, 1 open finding. */
    expect(screen.getByText('Employees')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Open cases')).toBeInTheDocument()
    expect(screen.getByText('Open tasks')).toBeInTheDocument()
    expect(screen.getByText('Open findings')).toBeInTheDocument()

    /* Headcount by province from real employees. */
    expect(screen.getByText('Headcount by province')).toBeInTheDocument()
    expect(screen.getByText('Ontario')).toBeInTheDocument()
    expect(screen.getByText('Quebec')).toBeInTheDocument()

    /* Cases-by-status and policy-posture breakdowns. */
    expect(screen.getByText('Cases by status')).toBeInTheDocument()
    expect(screen.getByText('Resolved')).toBeInTheDocument()
    expect(screen.getByText('Policy posture')).toBeInTheDocument()
    expect(screen.getByText('Missing')).toBeInTheDocument()

    /* No demo constants. */
    expect(screen.queryByText('82')).not.toBeInTheDocument()
  })

  it('shows the build-it-up empty state when the workspace has no records', async () => {
    mockProductionClient({})
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { ReportsView: ReportsViewFresh } = await import('./ReportsView')

    renderAppFresh(<ReportsViewFresh />, { route: '/app/reports', path: '/app/reports' })

    expect(await screen.findByText('Nothing to report yet')).toBeInTheDocument()
    expect(
      screen.getByText(/Reports build themselves from your real workspace/),
    ).toBeInTheDocument()
  })
})
