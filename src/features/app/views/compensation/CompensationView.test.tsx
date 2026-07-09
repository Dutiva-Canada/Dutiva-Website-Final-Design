import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { renderApp } from '@/test/renderApp'
import { ADVISOR_STREAM_TICK_MS, ADVISOR_THINK_MS } from '@/features/app/advisor/useAdvisorEngine'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { CompensationView } from './CompensationView'

function LocationProbe() {
  const location = useLocation()
  const state = location.state as { tab?: string } | null
  return (
    <div data-testid="location">
      {location.pathname}
      {state?.tab ? `#${state.tab}` : ''}
    </div>
  )
}

function renderView() {
  return renderApp(
    <>
      <CompensationView />
      <AdvisorRail />
      <LocationProbe />
    </>,
    { route: '/app/compensation' },
  )
}

describe('CompensationView', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the banner, payroll stats, changes pipeline, and the overview table', () => {
    renderView()

    expect(screen.getByText(/Restricted module — visible to Owner\/Admin/)).toBeInTheDocument()

    /* Stat tiles: $915K total base payroll · 1 below midpoint · 12 people. */
    expect(screen.getByText('$915K')).toBeInTheDocument()
    expect(screen.getByText('Annual base payroll')).toBeInTheDocument()
    expect(screen.getByText('Below market midpoint')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()

    /* Changes & approvals pipeline (compChanges fixtures). */
    expect(screen.getByText('Merit increase — Devon Clarke')).toBeInTheDocument()
    expect(screen.getByText('Market adjustment — Théo Lavoie')).toBeInTheDocument()
    expect(screen.getByText('Awaiting HR + Finance approval')).toBeInTheDocument()

    /* Pay-band equity advisory card. */
    expect(
      screen.getByText('Potential internal equity issue — review recommended'),
    ).toBeInTheDocument()

    /* Overview rows (rendered for both the mobile list and the table). */
    expect(screen.getAllByText('Jordan Mensah').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$118,000').length).toBeGreaterThan(0)
    /* Théo Lavoie sits 10% below the market midpoint. */
    expect(screen.getAllByText('-10%').length).toBeGreaterThan(0)
  })

  it('opens the change-review rail with status, note, and pay-equity citation', () => {
    vi.useFakeTimers()
    renderView()

    act(() => {
      const review = screen.getAllByRole('button', { name: 'Review with Advisor' })[0]
      expect(review).toBeDefined()
      fireEvent.click(review as HTMLElement)
    })

    expect(screen.getByRole('dialog', { name: 'Ask Advisor' })).toBeInTheDocument()
    expect(screen.getAllByText('Merit increase — Devon Clarke')).toHaveLength(2)

    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS + 120 * ADVISOR_STREAM_TICK_MS)
    })
    expect(
      screen.getByText(
        /Requires HR\/Finance approval before the Aug 25 payroll cut-off\. Legal\/pay-equity review may be required if a gap is confirmed\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Pay Equity Act (federal / ON)')).toBeInTheDocument()
  })

  it('navigates to the employee compensation tab when a row is opened', () => {
    renderView()

    const row = screen.getAllByRole('button', { name: 'Open compensation for Jordan Mensah' })[0]
    expect(row).toBeDefined()
    fireEvent.click(row as HTMLElement)

    expect(screen.getByTestId('location')).toHaveTextContent('/app/employees/e1#compensation')
  })
})
