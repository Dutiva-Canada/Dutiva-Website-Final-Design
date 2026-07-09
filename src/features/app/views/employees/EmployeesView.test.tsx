import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { ADVISOR_STREAM_TICK_MS, ADVISOR_THINK_MS } from '@/features/app/advisor/useAdvisorEngine'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { EmployeesView } from './EmployeesView'

function renderEmployees() {
  return renderApp(
    <>
      <EmployeesView />
      <AdvisorRail />
    </>,
    { route: '/app/employees', path: '/app/employees' },
  )
}

describe('EmployeesView', () => {
  it('renders the roster with fixture rows, status chips, and the sample count', () => {
    renderEmployees()

    /* Desktop table + phone cards are both in the DOM (CSS-responsive). */
    expect(screen.getAllByText('Jordan Mensah').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Senior Operations Manager').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Offboarding').length).toBeGreaterThan(0)
    expect(screen.getAllByText('On PIP').length).toBeGreaterThan(0)
    expect(screen.getByText(/Showing 12 of 82 · sample records/)).toBeInTheDocument()
  })

  it('filters by name/role/province and clears via the empty state', () => {
    renderEmployees()
    const input = screen.getByPlaceholderText('Filter by name, role, or province…')

    fireEvent.change(input, { target: { value: 'quebec' } })
    expect(screen.getByText(/Showing 2 of 82/)).toBeInTheDocument()
    expect(screen.getAllByText('Marc-Étienne Roy').length).toBeGreaterThan(0)
    expect(screen.queryByText('Jordan Mensah')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'zzz-no-match' } })
    expect(screen.getByText('No employees match your filter.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filter' }))
    expect(screen.getByText(/Showing 12 of 82/)).toBeInTheDocument()
  })

  it('switches to the org chart with stats and the reporting-line watch note', () => {
    renderEmployees()
    fireEvent.click(screen.getByRole('tab', { name: 'Org chart' }))

    expect(screen.getByText('People managers')).toBeInTheDocument()
    expect(screen.getByText('Direct reports')).toBeInTheDocument()
    /* Workspace root + the offboarding transition note (Jordan, 4 reports). */
    expect(screen.getByText('Riley Summers')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Jordan Mensah is being offboarded — their 4 direct reports in Operations will need a reporting line before the departure date.',
      ),
    ).toBeInTheDocument()
    /* Roster chrome is gone in org mode. */
    expect(
      screen.queryByPlaceholderText('Filter by name, role, or province…'),
    ).not.toBeInTheDocument()
  })

  describe('Ask Advisor', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('opens the rail on the employee with their insight and risk card', () => {
      renderEmployees()
      const firstAsk = screen.getAllByRole('button', {
        name: 'Ask Advisor about this employee',
      })[0]
      if (!firstAsk) throw new Error('missing Ask Advisor button')
      act(() => {
        fireEvent.click(firstAsk)
      })

      const dialog = screen.getByRole('dialog', { name: 'Ask Advisor' })
      expect(dialog).toBeInTheDocument()

      /* Complete the streamed intro turn. */
      act(() => {
        vi.advanceTimersByTime(ADVISOR_THINK_MS + 200 * ADVISOR_STREAM_TICK_MS)
      })
      expect(screen.getByText(/Jordan's termination is in progress/)).toBeInTheDocument()
      expect(screen.getByText('Notice exposure risk')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Open full case' })).toBeInTheDocument()
    })
  })
})
