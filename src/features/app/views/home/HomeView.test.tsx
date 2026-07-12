import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { renderApp } from '@/test/renderApp'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { HomeView } from './HomeView'

/** Echoes the current pathname so navigations triggered by the view are observable. */
function LocationProbe() {
  const location = useLocation()
  return <div data-testid="pathname">{location.pathname}</div>
}

describe('HomeView', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the daily brief, fixture-derived metric chips and the priority queue', () => {
    renderApp(<HomeView />, { route: '/app/home' })

    /* Header + Advisor's daily brief hero. */
    expect(screen.getByText('Good to see you, Riley.')).toBeInTheDocument()
    expect(screen.getByText('Advisor’s daily brief')).toBeInTheDocument()
    expect(screen.getByText(/Jordan Mensah’s termination is your top exposure/)).toBeInTheDocument()

    /* Metric chips — counts derive from the @/data fixtures (3 open cases, 5 open tasks). */
    const casesChip = screen.getByRole('button', { name: /Open cases/ })
    expect(casesChip).toHaveTextContent('3')
    expect(casesChip).toHaveTextContent('1 legal review required')
    expect(screen.getByText('of 5 open')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Support signals/ })).toHaveTextContent('1')

    /* Priority queue — Act now / This week / Watching, in severity order. */
    expect(screen.getByText('Jordan Mensah — counsel response outstanding')).toBeInTheDocument()
    expect(screen.getByText('Remote Work Policy overdue by 14 months')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Amara Okafor — accommodation review due Jul 14' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Grace Osei — wellbeing trending down' }),
    ).toBeInTheDocument()

    /* Compliance prediction card + workflows. */
    expect(screen.getByText('in 90 days')).toBeInTheDocument()
    expect(screen.getByText('Top lever')).toBeInTheDocument()
    expect(screen.getAllByText('Workflows in flight').length).toBeGreaterThan(0)
  })

  it('navigates to the case detail when an Act now priority action is clicked', () => {
    renderApp(
      <>
        <HomeView />
        <LocationProbe />
      </>,
      { route: '/app/home' },
    )

    /* pr1 — "Open case" → /app/cases/case1 (prototype openCase('case1')). */
    fireEvent.click(screen.getByRole('button', { name: 'Open case' }))
    expect(screen.getByTestId('pathname')).toHaveTextContent('/app/cases/case1')
  })

  it('opens the supportive wellbeing rail from the Watching row', () => {
    vi.useFakeTimers()
    const view = renderApp(
      <>
        <HomeView />
        <AdvisorRail />
      </>,
      { route: '/app/home' },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Grace Osei — wellbeing trending down' }))

    /* Rail opens on the employee subject (prototype askAboutWellbeing). */
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Grace Osei — wellbeing')).toBeInTheDocument()
    expect(screen.getByText('Alberta')).toBeInTheDocument()

    view.unmount()
  })
})

describe('HomeView in production mode', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  it('renders the real empty state instead of the Northgate fixtures', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () =>
            Promise.resolve({
              data: { session: { user: { id: 'u1', email: 'martin.constantineau@dutiva.ca' } } },
            }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
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
        }),
      },
    }))
    vi.resetModules()

    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { HomeView: HomeViewFresh } = await import('./HomeView')

    renderAppFresh(<HomeViewFresh />, { route: '/app/home' })

    expect(await screen.findByText('Your workspace is ready.')).toBeInTheDocument()
    expect(screen.getByText(/Dutiva Canada Inc\./)).toBeInTheDocument()
    expect(screen.queryByText('Good to see you, Riley.')).not.toBeInTheDocument()
  })
})
