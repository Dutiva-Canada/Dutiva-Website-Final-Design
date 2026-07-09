import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { AdvisorView } from './AdvisorView'
import { resetAdvisorSession } from './advisorSession'

describe('AdvisorView', () => {
  /* Conversations persist in the module-level session store — reset per test. */
  beforeEach(() => {
    resetAdvisorSession()
  })

  it('renders the advisor home empty state with metrics, brief and priorities', () => {
    renderApp(<AdvisorView />, { route: '/app/advisor' })

    expect(screen.getByText('Good to see you, Riley.')).toBeInTheDocument()
    expect(screen.getByText("Here's what Advisor noticed since yesterday.")).toBeInTheDocument()

    /* Metric tiles (fixture-derived counts). */
    expect(screen.getByText('Compliance score')).toBeInTheDocument()
    expect(screen.getByText('82')).toBeInTheDocument()
    expect(screen.getByText('Active cases')).toBeInTheDocument()
    expect(screen.getByText('5 open tasks')).toBeInTheDocument()

    /* Daily brief + priorities feed. */
    expect(screen.getByText(/2 items need action today, and 6 signals/)).toBeInTheDocument()
    expect(screen.getByText('Priorities today')).toBeInTheDocument()
    expect(screen.getByText('Jordan Mensah — counsel response outstanding')).toBeInTheDocument()

    /* Thread list groups from the chats fixtures (c1 is pinned + today). */
    expect(screen.getByText('Pinned')).toBeInTheDocument()
    expect(screen.getByText('Previous 7 days')).toBeInTheDocument()
    expect(screen.getAllByText('Terminating Jordan Mensah — Ontario')).toHaveLength(2)
  })

  it('toggles a priority "Why" expander', () => {
    renderApp(<AdvisorView />, { route: '/app/advisor' })

    const whyButtons = screen.getAllByRole('button', { name: 'Why' })
    expect(whyButtons.length).toBeGreaterThan(0)
    fireEvent.click(whyButtons[0]!)
    expect(screen.getByText(/A legal-review request has been open since Jul 5/)).toBeInTheDocument()
  })

  it('opens a seeded thread and renders its transcript without re-streaming', () => {
    renderApp(<AdvisorView />, { route: '/app/advisor' })

    fireEvent.click(screen.getByRole('button', { name: /Offer letter — Senior Analyst, BC/ }))

    /* Seeded messages render fully (status done — no typing dots). */
    expect(
      screen.getByText('Draft an offer letter for a Senior Analyst role in BC.'),
    ).toBeInTheDocument()
    expect(screen.getByText('BC-specific note')).toBeInTheDocument()
    expect(screen.queryByText('Advisor is thinking')).not.toBeInTheDocument()

    /* Jurisdiction context line stays visible on the active conversation. */
    expect(screen.getByText('British Columbia — Employment Standards Act (BC)')).toBeInTheDocument()

    /* Doc-generate chips + follow-up chips from the fixture. */
    expect(screen.getByText('Offer Letter')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Generate' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Set probation terms' })).toBeInTheDocument()
  })

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('streams the canned acknowledgement after a free-form send in a thread', () => {
      renderApp(<AdvisorView />, { route: '/app/advisor' })

      fireEvent.click(screen.getByRole('button', { name: /Remote work policy refresh/ }))

      const composer = screen.getByPlaceholderText('Message Advisor…')
      fireEvent.change(composer, { target: { value: 'What about vacation payout?' } })
      fireEvent.keyDown(composer, { key: 'Enter' })

      /* The user bubble lands immediately… */
      expect(screen.getByText('What about vacation payout?')).toBeInTheDocument()

      /* …then thinking (850ms) → streaming (3 chars / 16ms) → done. */
      act(() => {
        vi.advanceTimersByTime(849)
      })
      expect(screen.getByText('Advisor is thinking')).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(screen.getByText(/Noted — I've added that to this case/)).toBeInTheDocument()
    })

    it('starts a routed flow from the home composer and lists the new thread under Today', () => {
      renderApp(<AdvisorView />, { route: '/app/advisor' })

      const composer = screen.getByPlaceholderText('Ask Advisor anything about your team…')
      fireEvent.change(composer, { target: { value: 'We need a remote work policy update' } })
      fireEvent.keyDown(composer, { key: 'Enter' })

      /* New generated thread (policy flow) is selected and grouped under Today. */
      expect(screen.getByRole('button', { name: /Policy question/ })).toBeInTheDocument()
      expect(screen.getByText('We need a remote work policy update')).toBeInTheDocument()
      expect(screen.getByText('Multi-province')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(849 + 8000)
      })
      expect(
        screen.getByText(/A solid remote work policy for a multi-province team/),
      ).toBeInTheDocument()
      expect(screen.getByText('Policy is overdue')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Compare to current in-office policy' }),
      ).toBeInTheDocument()
    })
  })
})
