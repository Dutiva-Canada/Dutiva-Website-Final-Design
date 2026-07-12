import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { ComplianceView } from './ComplianceView'

function renderCompliance() {
  return renderApp(
    <>
      <ComplianceView />
      <AdvisorRail />
    </>,
    { route: '/app/compliance', path: '/app/compliance' },
  )
}

describe('ComplianceView', () => {
  it('renders stats, the obligation register, posture bars, flags and the watchlist', () => {
    renderCompliance()

    /* Stat cards (counters over the full register / item list). */
    expect(screen.getByText('Open obligations')).toBeInTheDocument()
    expect(screen.getByText('Due in 30 days')).toBeInTheDocument()
    expect(screen.getByText('Open risk items')).toBeInTheDocument()
    expect(screen.getByText('Provinces covered')).toBeInTheDocument()

    /* Obligation register fixture content. */
    expect(screen.getByText('Obligation register')).toBeInTheDocument()
    expect(screen.getByText('Vacation time & pay reconciliation')).toBeInTheDocument()
    expect(screen.getByText('Marketing consent records — semi-annual audit')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()

    /* Posture by area. */
    expect(screen.getByText('Posture by area')).toBeInTheDocument()
    expect(screen.getByText('Termination & notice')).toBeInTheDocument()
    expect(screen.getByText('61')).toBeInTheDocument()

    /* Active risk flags. */
    expect(
      screen.getByText('Jordan Mensah — notice exposure; no termination clause on file'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Request counsel review before any offer; budget toward the 12-month end of the range.',
      ),
    ).toBeInTheDocument()

    /* Regulatory watchlist. */
    expect(screen.getByText('Regulatory watchlist')).toBeInTheDocument()
    expect(
      screen.getByText('Ontario — proposed ESA amendments on sick-leave provisions'),
    ).toBeInTheDocument()
  })

  it('filters the register and the flags by jurisdiction', () => {
    renderCompliance()

    fireEvent.click(screen.getByRole('tab', { name: 'Quebec' }))

    /* Ontario obligation hidden, Quebec obligation kept. */
    expect(screen.queryByText('Vacation time & pay reconciliation')).not.toBeInTheDocument()
    expect(screen.getByText('Privacy impact assessment — HRIS vendor change')).toBeInTheDocument()

    /* Ontario flag hidden; Multi-province and Quebec flags kept. */
    expect(
      screen.queryByText('Jordan Mensah — notice exposure; no termination clause on file'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Remote Work Policy not reviewed in 14 months')).toBeInTheDocument()
    expect(screen.getByText('Onboarding — Quebec French-language requirement')).toBeInTheDocument()
  })

  it('marks obligation evidence on file and swaps in the audit-trail line', () => {
    renderCompliance()

    /* 5 obligations are missing evidence (needs / progress / overdue). */
    const attachButtons = screen.getAllByRole('button', { name: 'Mark evidence on file' })
    expect(attachButtons).toHaveLength(5)

    /* First one is ob2 (workplace violence & harassment program). */
    fireEvent.click(attachButtons[0]!)

    expect(
      screen.getByText('Evidence recorded just now — logged in the audit trail.'),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Mark evidence on file' })).toHaveLength(4)
    /* ob1/ob3/ob6 already ok + ob2 just recorded. */
    expect(screen.getAllByText('Evidence on file')).toHaveLength(4)
  })

  it('opens the Advisor rail from "Resolve with Advisor" on a flag', () => {
    renderCompliance()

    const resolveButtons = screen.getAllByRole('button', { name: 'Resolve with Advisor' })
    expect(resolveButtons).toHaveLength(5)
    fireEvent.click(resolveButtons[0]!)

    const rail = screen.getByRole('dialog', { name: 'Ask Advisor' })
    expect(
      within(rail).getByText('Jordan Mensah — notice exposure; no termination clause on file'),
    ).toBeInTheDocument()
  })

  it('opens the Advisor rail from "Explain with Advisor" on an obligation', () => {
    renderCompliance()

    const explainButtons = screen.getAllByRole('button', { name: 'Explain with Advisor' })
    expect(explainButtons).toHaveLength(8)
    fireEvent.click(explainButtons[0]!)

    const rail = screen.getByRole('dialog', { name: 'Ask Advisor' })
    expect(within(rail).getByText('Vacation time & pay reconciliation')).toBeInTheDocument()
  })
})

describe('ComplianceView in production mode', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  /** Admin signed in, production stored, one org, real compliance_findings. */
  function mockProductionClient(initialFindings: Record<string, unknown>[]) {
    const findingRows = [...initialFindings]
    const insert = vi.fn((row: Record<string, unknown>) => ({
      select: () => ({
        single: () => {
          const created = {
            id: `finding-${findingRows.length + 1}`,
            title: row.title,
            description: row.description ?? null,
            recommendation: row.recommendation ?? null,
            severity: row.severity,
            status: 'open',
          }
          findingRows.unshift(created)
          return Promise.resolve({ data: created, error: null })
        },
      }),
    }))
    const update = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))

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
          if (table === 'compliance_findings') {
            return {
              select: () => ({
                eq: () => ({
                  order: () => Promise.resolve({ data: findingRows, error: null }),
                }),
              }),
              insert,
              update,
            }
          }
          throw new Error(`unexpected table: ${table}`)
        }),
      },
    }))
    vi.resetModules()
    return { insert, update }
  }

  it('renders real findings with severity and recommendation, not the fixtures', async () => {
    mockProductionClient([
      {
        id: 'finding-1',
        title: 'Vacation accrual policy missing for Quebec staff',
        description: 'No written policy covers CNESST vacation accrual rules.',
        recommendation: 'Draft a Quebec-specific vacation policy addendum.',
        severity: 'high',
        status: 'open',
      },
    ])
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { ComplianceView: ComplianceViewFresh } = await import('./ComplianceView')

    renderAppFresh(<ComplianceViewFresh />, { route: '/app/compliance', path: '/app/compliance' })

    expect(
      await screen.findByText('Vacation accrual policy missing for Quebec staff'),
    ).toBeInTheDocument()
    expect(screen.getByText('1 open finding')).toBeInTheDocument()
    expect(
      screen.getByText('Draft a Quebec-specific vacation policy addendum.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Remote Work Policy overdue by 14 months')).not.toBeInTheDocument()
  })

  it('logs a finding and resolves it through the real write paths', async () => {
    const { insert, update } = mockProductionClient([])
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { ComplianceView: ComplianceViewFresh } = await import('./ComplianceView')

    renderAppFresh(<ComplianceViewFresh />, { route: '/app/compliance', path: '/app/compliance' })

    expect(await screen.findByText('No findings yet')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Log finding' }))
    fireEvent.change(screen.getByLabelText('Finding'), {
      target: { value: 'Missing OHS policy for home offices' },
    })
    fireEvent.change(screen.getByLabelText('Severity'), { target: { value: 'critical' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save finding' }))

    expect(await screen.findByText('Missing OHS policy for home offices')).toBeInTheDocument()
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: 'org-1',
        title: 'Missing OHS policy for home offices',
        severity: 'critical',
      }),
    )
    expect(screen.getByText('1 open finding')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mark resolved' }))
    expect(await screen.findByText('0 open findings')).toBeInTheDocument()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'resolved' }))
    expect(screen.getByText('Resolved')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument()
  })
})
