import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { renderApp } from '@/test/renderApp'
import { ADVISOR_STREAM_TICK_MS, ADVISOR_THINK_MS } from '@/features/app/advisor/useAdvisorEngine'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { WellbeingView } from './WellbeingView'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderView() {
  return renderApp(
    <>
      <WellbeingView />
      <AdvisorRail />
      <LocationProbe />
    </>,
    { route: '/app/wellbeing' },
  )
}

describe('WellbeingView', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the non-diagnostic banner, stats, and support signals', () => {
    renderView()

    /* Explicit usage-limits framing. */
    expect(
      screen.getByText(/Support signals are for supportive follow-up and workload review only/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Access to support signals is recorded in the audit log.'),
    ).toBeInTheDocument()

    /* Stat tiles: 5 active signals, 2 follow-ups. */
    expect(screen.getByText('Active support signals')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Follow-ups this week')).toBeInTheDocument()

    /* Signal cards (supportSignals fixtures). */
    expect(screen.getByText('Repeated overtime pattern')).toBeInTheDocument()
    expect(screen.getByText('Return-to-work follow-up')).toBeInTheDocument()
    expect(screen.getByText('Medium — workload data only')).toBeInTheDocument()
    expect(screen.getByText('High — do not link to discipline')).toBeInTheDocument()
    expect(screen.getAllByText('Recommended supportive action')).toHaveLength(5)

    /* Team-level signal has no "Open profile" button: 4 of 5 signals do. */
    expect(screen.getAllByRole('button', { name: 'Open profile' })).toHaveLength(4)
    expect(screen.getAllByRole('button', { name: 'Draft support check-in' })).toHaveLength(5)
  })

  it('opens the check-in rail with the "Handle with care" card for a personal signal', () => {
    vi.useFakeTimers()
    renderView()

    /* First signal (ws1) belongs to Grace Osei. */
    act(() => {
      const draft = screen.getAllByRole('button', { name: 'Draft support check-in' })[0]
      expect(draft).toBeDefined()
      fireEvent.click(draft as HTMLElement)
    })

    expect(screen.getByRole('dialog', { name: 'Ask Advisor' })).toBeInTheDocument()
    expect(screen.getByText('Grace Osei — wellbeing')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS + 120 * ADVISOR_STREAM_TICK_MS)
    })
    expect(
      screen.getByText(
        'Here’s what I’m seeing in Grace’s recent check-ins. I’ll keep this non-diagnostic.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Handle with care')).toBeInTheDocument()
    expect(screen.getByText('Human rights — duty to accommodate')).toBeInTheDocument()

    /* The primary action routes to Communications and closes the rail. */
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Draft a check-in message' }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/app/communications')
  })

  it('routes team-level signals straight to Communications', () => {
    renderView()

    /* Last signal (ws5) is the team-level workload imbalance. */
    const buttons = screen.getAllByRole('button', { name: 'Draft support check-in' })
    const teamDraft = buttons[buttons.length - 1]
    expect(teamDraft).toBeDefined()
    fireEvent.click(teamDraft as HTMLElement)

    expect(screen.getByTestId('location')).toHaveTextContent('/app/communications')
  })
})
