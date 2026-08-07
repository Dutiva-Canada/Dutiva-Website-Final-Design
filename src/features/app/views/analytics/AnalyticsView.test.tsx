import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { AnalyticsView } from './AnalyticsView'

describe('AnalyticsView (demo)', () => {
  afterEach(() => {
    localStorage.removeItem('dutiva-lang')
  })

  function scoreCard() {
    return within(screen.getByRole('region', { name: 'Compliance score' }))
  }

  it('renders the compliance score hero with its delta and windowed trend data', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })

    expect(screen.getByText('Workforce and compliance overview.')).toBeInTheDocument()

    const card = scoreCard()
    /* Hero 82/100, up 8 from February (74 → 82 across the six fixtures).
       Selector-scoped: the chart's table twin also carries an 82 cell. */
    expect(card.getByText('82', { selector: 'span' })).toBeInTheDocument()
    expect(card.getByText('/100')).toBeInTheDocument()
    expect(card.getByText('+8 vs February')).toBeInTheDocument()

    /* The chart's table twin carries every month/value pair. */
    const table = card.getByRole('table')
    expect(within(table).getByText('February')).toBeInTheDocument()
    expect(within(table).getByText('74')).toBeInTheDocument()
    expect(within(table).getByText('July')).toBeInTheDocument()

    /* Windowed axis is summarized to AT via the chart's aria-label. */
    expect(card.getByRole('img', { name: /Compliance score by month/ })).toBeInTheDocument()
  })

  it('breaks the score down by category and flags the lowest', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = scoreCard()

    expect(card.getByText('Score breakdown')).toBeInTheDocument()
    expect(card.getByText('Termination & notice')).toBeInTheDocument()
    expect(card.getByText('61')).toBeInTheDocument()
    expect(card.getByText('Language & jurisdiction')).toBeInTheDocument()
    /* Exactly one category (the 61) wears the flag. */
    expect(card.getAllByText('Lowest')).toHaveLength(1)
  })

  it('lists needs-attention items sorted overdue → soonest, with cert/document escalations', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Needs attention' }))

    const rows = card.getAllByRole('listitem')
    expect(rows).toHaveLength(5)

    /* Most overdue first: Devon's lapsed forklift ticket (Jun 28) leads,
       escalated from the certifications card and linking to his profile. */
    expect(
      within(rows[0]!).getByText(/Forklift operator certificate — Devon Clarke/),
    ).toBeInTheDocument()
    expect(within(rows[0]!).getByText('Overdue')).toBeInTheDocument()
    expect(within(rows[0]!).getByRole('link')).toHaveAttribute('href', '/app/employees/e5')

    /* Then the CASL consent audit (was due Jun 30). */
    expect(within(rows[1]!).getByText(/Marketing consent records/)).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Overdue')).toBeInTheDocument()

    /* Soonest due: the Remote Work Policy review (Jul 17 — 12 days out). */
    expect(within(rows[2]!).getByText(/Remote Work Policy/)).toBeInTheDocument()
    expect(within(rows[2]!).getByText('Due in 12 days')).toBeInTheDocument()

    /* Affected count + jurisdiction as the secondary line (AODA hires). */
    expect(card.getByText('3 employees · Ontario')).toBeInTheDocument()

    /* Chen's work permit (Jul 28, inside 30 days) is always escalated —
       an expiring work permit is a compliance event. */
    expect(within(rows[4]!).getByText(/Work permit — Chen Wei/)).toBeInTheDocument()
    expect(within(rows[4]!).getByRole('link')).toHaveAttribute('href', '/app/employees/e8')

    /* Eight qualifying items; the cap cuts the rest (francization review
       among them). */
    expect(card.getByRole('link', { name: 'View all (8)' })).toHaveAttribute(
      'href',
      '/app/compliance',
    )
    expect(card.queryByText(/French-language workplace/)).not.toBeInTheDocument()
  })

  it('flags jurisdictions sitting 10+ points under the blended score', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = scoreCard()

    expect(card.getByText('Score by jurisdiction')).toBeInTheDocument()
    /* QC is 71 vs the blended 82 — flagged; Federal at 75 (−7) is not. */
    expect(card.getByText('71')).toBeInTheDocument()
    expect(card.getByText('−11 below overall')).toBeInTheDocument()
    expect(card.queryByText('−7 below overall')).not.toBeInTheDocument()
  })

  it('buckets certifications 1/2/2/2 and reveals the list in one tap', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Certifications & training' }))

    /* Tile row: Expired 1 · ≤30 2 · 31–60 2 · 61–90 2. */
    expect(card.getByText('Expired')).toBeInTheDocument()
    expect(card.getByText('≤ 30 days')).toBeInTheDocument()

    await user.click(card.getByRole('button', { name: 'Show list (7)' }))
    const rows = card.getAllByRole('listitem')
    expect(rows).toHaveLength(7)
    /* Soonest first: the expired forklift ticket leads with its chip. */
    expect(within(rows[0]!).getByText('Forklift operator certificate')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('Devon Clarke · Ontario')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('First Aid / CPR-C')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Noah Bergeron · Manitoba')).toBeInTheDocument()
  })

  it('lists probation ends within 30 days and flags the missing review task', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Probation periods ending' }))

    const rows = card.getAllByRole('listitem')
    expect(rows).toHaveLength(3)

    /* Soonest first: Priya (Jul 8 — 3 days out), review task in place. */
    expect(within(rows[0]!).getByText('Priya Nair')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('3 days left')).toBeInTheDocument()
    expect(within(rows[0]!).queryByText('No review task yet')).not.toBeInTheDocument()

    /* Jasleen has no review task — the row says so. */
    expect(within(rows[1]!).getByText('Jasleen Kaur')).toBeInTheDocument()
    expect(card.getAllByText('No review task yet')).toHaveLength(1)
  })

  it('shows the leave overview grouped by imminent returns, protected leave marked', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Leave overview' }))

    expect(card.getByText('Returning within 14 days')).toBeInTheDocument()
    expect(card.getByText('Karan Dhillon')).toBeInTheDocument()
    expect(card.getByText('Rosa Almeida')).toBeInTheDocument()

    expect(card.getByText('On leave now')).toBeInTheDocument()
    expect(card.getByText('Ingrid Halvorsen')).toBeInTheDocument()
    /* Amara's ongoing accommodation shows its review note, not a return. */
    expect(card.getByText('90-day review Jul 14')).toBeInTheDocument()

    /* Parental, medical and accommodation are protected; vacation is not. */
    expect(card.getAllByText('Protected')).toHaveLength(3)
  })

  it('renders the headcount trend with the improving turnover tile', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Headcount & turnover' }))

    expect(card.getByText('9.8%')).toBeInTheDocument()
    expect(card.getByText('Turnover (rolling 12 months)')).toBeInTheDocument()
    /* Falling turnover is good — the delta reads −1.4 pts vs June. */
    expect(card.getByText('−1.4 pts vs June')).toBeInTheDocument()

    const table = card.getByRole('table')
    expect(within(table).getByText('February')).toBeInTheDocument()
    expect(within(table).getByText('76')).toBeInTheDocument()
  })

  it('renders headcount by jurisdiction with the total and the Federal footnote', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Headcount by jurisdiction' }))

    expect(card.getByText('82 employees total')).toBeInTheDocument()
    expect(
      card.getByText('Federal = federally regulated roles under the Canada Labour Code.'),
    ).toBeInTheDocument()

    /* Table twin: every jurisdiction with its exact value. */
    const table = card.getByRole('table')
    for (const [jur, value] of [
      ['ON', '34'],
      ['BC', '21'],
      ['QC', '12'],
      ['AB', '9'],
      ['Federal', '6'],
    ]) {
      const rowCell = within(table).getByText(jur!)
      expect(within(rowCell.closest('tr')!).getByText(value!)).toBeInTheDocument()
    }
  })

  it('shows open-case aging tiles and rows that tap through to the case', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Open cases' }))

    /* Three open (case4 resolved); ages 0/15/145 days on July 5 → avg 53. */
    expect(card.getByText('Open now')).toBeInTheDocument()
    expect(card.getByText('3')).toBeInTheDocument()
    expect(card.getByText('Avg. age (days)')).toBeInTheDocument()
    expect(card.getByText('53')).toBeInTheDocument()
    expect(card.getByText('Oldest (days)')).toBeInTheDocument()
    expect(card.getByText('145')).toBeInTheDocument()

    /* Oldest first, linking through to the case record. */
    const rows = card.getAllByRole('listitem')
    expect(within(rows[0]!).getByRole('link')).toHaveAttribute('href', '/app/cases/case3')
    expect(within(rows[0]!).getByText('145 days')).toBeInTheDocument()
    expect(within(rows[2]!).getByRole('link')).toHaveAttribute('href', '/app/cases/case1')
  })

  it('shows the acknowledgment meter with the outstanding-signature action', () => {
    renderApp(<AnalyticsView />, { route: '/app/analytics' })
    const card = within(screen.getByRole('region', { name: 'Policy acknowledgments' }))

    expect(card.getByText('Code of Conduct — annual attestation')).toBeInTheDocument()
    expect(card.getByText('74 / 82 signed')).toBeInTheDocument()
    expect(card.getByText('90%')).toBeInTheDocument()
    /* The suggested action links into the Communications program. */
    expect(
      card.getByRole('link', {
        name: 'Send a reminder to the 8 employees with outstanding signatures.',
      }),
    ).toHaveAttribute('href', '/app/communications')
  })

  it('renders the French strings when the language preference is fr', () => {
    localStorage.setItem('dutiva-lang', 'fr')
    renderApp(<AnalyticsView />, { route: '/app/analytics' })

    expect(screen.getByText('Aperçu de l’effectif et de la conformité.')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Score de conformité' })).toBeInTheDocument()
    expect(screen.getByText('+8 c. février')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Attention requise' })).toBeInTheDocument()
    /* Two overdue rows now (lapsed certification + CASL audit). */
    expect(screen.getAllByText('En retard')).toHaveLength(2)
    expect(screen.getByRole('region', { name: 'Effectif par juridiction' })).toBeInTheDocument()
    expect(screen.getByText('82 employés au total')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Dossiers ouverts' })).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Accusés de réception des politiques' }),
    ).toBeInTheDocument()
    expect(screen.getByText('74 / 82 signés')).toBeInTheDocument()

    /* Phase 2 cards, localized. */
    expect(screen.getByRole('region', { name: 'Attestations et formations' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Fins de probation' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Expirations de documents' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Aperçu des congés' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Effectif et roulement' })).toBeInTheDocument()
    expect(screen.getByText('9,8 %')).toBeInTheDocument()
    expect(screen.getByText('Score par juridiction')).toBeInTheDocument()
  })
})

describe('AnalyticsView in production mode', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  /** Admin signed in, production stored, one org, the five module tables +
   *  score snapshots. */
  function mockProductionClient(data: {
    employees?: Record<string, unknown>[]
    hr_cases?: Record<string, unknown>[]
    compliance_tasks?: Record<string, unknown>[]
    compliance_findings?: Record<string, unknown>[]
    hr_policies?: Record<string, unknown>[]
    compliance_score_snapshots?: Record<string, unknown>[]
  }) {
    const snapshotUpsert = vi.fn(() => Promise.resolve({ error: null }))
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
            upsert: snapshotUpsert,
          }
        }),
      },
    }))
    vi.resetModules()
    return { snapshotUpsert }
  }

  const EMPLOYEE = (id: string, province: string, status = 'active') => ({
    id,
    name: `Employee ${id}`,
    title: null,
    email: null,
    province,
    start_date: null,
    status,
  })

  function daysAgoIso(days: number): string {
    return new Date(Date.now() - days * 86_400_000).toISOString()
  }

  it('blends a live score from the real modules and records a snapshot', async () => {
    const { snapshotUpsert } = mockProductionClient({
      hr_policies: [
        { id: 'p1', name: 'Policy A', status: 'up_to_date', last_reviewed: null },
        { id: 'p2', name: 'Policy B', status: 'missing', last_reviewed: null },
      ],
      compliance_tasks: [
        { id: 't1', title: 'Task', priority: 'high', status: 'completed', due_at: null },
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
      compliance_score_snapshots: [
        { month: '2026-05-01', score: 40, headcount: null },
        { month: '2026-06-01', score: 45, headcount: null },
      ],
    })
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { AnalyticsView: AnalyticsViewFresh } = await import('./AnalyticsView')

    renderAppFresh(<AnalyticsViewFresh />, { route: '/app/analytics', path: '/app/analytics' })

    expect(
      await screen.findByText('Computed live from your workspace records.'),
    ).toBeInTheDocument()

    /* Components: policies 1/2 = 50, tasks 1/1 = 100, findings 0/1 = 0 →
       blended round(150/3) = 50. */
    const card = within(await screen.findByRole('region', { name: 'Compliance score' }))
    expect(await card.findByText('50', { selector: 'span' })).toBeInTheDocument()
    expect(card.getByText('Policies current')).toBeInTheDocument()
    expect(card.getByText('1 of 2')).toBeInTheDocument()
    expect(card.getByText('Tasks complete')).toBeInTheDocument()
    expect(card.getByText('Findings resolved')).toBeInTheDocument()
    /* Findings (0%) is the lowest component. */
    expect(card.getAllByText('Lowest')).toHaveLength(1)

    /* History = two stored months + this month's live point. */
    const table = card.getByRole('table')
    expect(within(table).getByText('May')).toBeInTheDocument()
    expect(within(table).getByText('40')).toBeInTheDocument()

    /* The live score (and headcount — zero roster here) was written down
       for next month's history. */
    expect(snapshotUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ organization_id: 'org-1', score: 50, headcount: 0 }),
      expect.objectContaining({ onConflict: 'organization_id,month' }),
    )
  })

  it('aggregates attention, headcount, case aging and leave from live rows', async () => {
    mockProductionClient({
      employees: [
        EMPLOYEE('e1', 'Ontario'),
        EMPLOYEE('e2', 'Ontario'),
        EMPLOYEE('e3', 'Quebec'),
        EMPLOYEE('e4', 'Alberta', 'terminated'),
        EMPLOYEE('e5', 'Nova Scotia', 'on_leave'),
      ],
      hr_cases: [
        {
          id: 'c1',
          title: 'Accommodation — ergonomic assessment',
          case_type: 'Accommodation',
          employee_id: null,
          province: 'Ontario',
          status: 'open',
          due_date: '2020-01-01',
          created_at: daysAgoIso(20),
        },
        {
          id: 'c2',
          title: 'Onboarding — first hire',
          case_type: 'Onboarding',
          employee_id: null,
          province: 'Quebec',
          status: 'resolved',
          due_date: null,
          created_at: daysAgoIso(40),
        },
      ],
      compliance_tasks: [
        {
          id: 't1',
          title: 'File the harassment training roster',
          priority: 'high',
          status: 'open',
          due_at: '2020-06-30T00:00:00Z',
        },
      ],
    })
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { AnalyticsView: AnalyticsViewFresh } = await import('./AnalyticsView')

    renderAppFresh(<AnalyticsViewFresh />, { route: '/app/analytics', path: '/app/analytics' })

    expect(
      await screen.findByText('Computed live from your workspace records.'),
    ).toBeInTheDocument()

    /* Attention: both dated rows are overdue; the case (2020-01-01) sorts
       ahead of the task (2020-06-30). */
    const attention = within(screen.getByRole('region', { name: 'Needs attention' }))
    const rows = await attention.findAllByRole('listitem')
    expect(within(rows[0]!).getByText('Accommodation — ergonomic assessment')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('Overdue')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('File the harassment training roster')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Compliance task')).toBeInTheDocument()
    expect(attention.getByRole('link', { name: 'View all (2)' })).toHaveAttribute(
      'href',
      '/app/planning/tasks',
    )

    /* Headcount counts non-terminated rows (on-leave included) — the
       terminated Alberta row is out. */
    const headcount = within(screen.getByRole('region', { name: 'Headcount by jurisdiction' }))
    expect(headcount.getByText('4 employees total')).toBeInTheDocument()
    const headTable = headcount.getByRole('table')
    expect(within(headTable).getByText('Ontario')).toBeInTheDocument()
    expect(within(headTable).getByText('2')).toBeInTheDocument()
    expect(within(headTable).getByText('Nova Scotia')).toBeInTheDocument()
    expect(within(headTable).queryByText('Alberta')).not.toBeInTheDocument()

    /* Open cases: one open row, 20 days old (created_at drives aging). */
    const casesCard = within(screen.getByRole('region', { name: 'Open cases' }))
    expect(casesCard.getByText('Open now')).toBeInTheDocument()
    expect(casesCard.getByText('20 days')).toBeInTheDocument()
    expect(casesCard.getByRole('link')).toHaveAttribute('href', '/app/cases/c1')
    expect(casesCard.queryByText('Onboarding — first hire')).not.toBeInTheDocument()

    /* Acknowledgments have no production data source yet — said plainly. */
    expect(screen.getByText('No acknowledgment campaigns yet.')).toBeInTheDocument()

    /* Phase 2 cards without a data source say so instead of hiding. */
    expect(
      screen.getByText('Certification records aren’t tracked in this workspace yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Probation dates aren’t tracked in this workspace yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Employee document expiries aren’t tracked in this workspace yet.'),
    ).toBeInTheDocument()

    /* Leave overview lists the roster's real on-leave status. */
    const leave = within(screen.getByRole('region', { name: 'Leave overview' }))
    expect(leave.getByText('Employee e5')).toBeInTheDocument()
    expect(leave.getByRole('link')).toHaveAttribute('href', '/app/employees/e5')
    expect(
      leave.getByText('Leave types and return dates aren’t tracked in this workspace yet.'),
    ).toBeInTheDocument()

    /* Headcount trend: no snapshot history yet — first data point note,
       and turnover states its missing prerequisite. */
    const trend = within(screen.getByRole('region', { name: 'Headcount & turnover' }))
    expect(
      trend.getByText('Headcount history starts here — this month is your first data point.'),
    ).toBeInTheDocument()
    expect(
      trend.getByText('Turnover needs termination history, which isn’t tracked yet.'),
    ).toBeInTheDocument()

    /* No demo constants anywhere. */
    expect(screen.queryByText('82')).not.toBeInTheDocument()
    expect(screen.queryByText('82 employees total')).not.toBeInTheDocument()
  })

  it('shows the build-it-up empty state when the workspace has no records', async () => {
    mockProductionClient({})
    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { AnalyticsView: AnalyticsViewFresh } = await import('./AnalyticsView')

    renderAppFresh(<AnalyticsViewFresh />, { route: '/app/analytics', path: '/app/analytics' })

    expect(await screen.findByText('Nothing to report yet')).toBeInTheDocument()
    expect(screen.getByText(/Analytics builds itself from your real workspace/)).toBeInTheDocument()
  })
})
