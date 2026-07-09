import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { ADVISOR_STREAM_TICK_MS, ADVISOR_THINK_MS } from '@/features/app/advisor/useAdvisorEngine'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { CommunicationsView } from './CommunicationsView'

function renderView() {
  return renderApp(
    <>
      <CommunicationsView />
      <AdvisorRail />
    </>,
    { route: '/app/communications' },
  )
}

describe('CommunicationsView', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the pipeline in display order with review dimensions and statuses', () => {
    renderView()

    expect(
      screen.getByText(
        'Advisor reviews every announcement for jurisdiction and tone before it goes out.',
      ),
    ).toBeInTheDocument()

    /* Fixture content (order cm1, cm5, cm6, cm4, cm2, cm3). */
    expect(screen.getByText('Return-to-office cadence — company-wide')).toBeInTheDocument()
    expect(screen.getByText('Disciplinary meeting invite — Devon Clarke')).toBeInTheDocument()
    expect(screen.getByText('Statutory holiday notice — August')).toBeInTheDocument()

    /* Statuses: four drafts, one scheduled, one sent. */
    expect(screen.getAllByText('Draft')).toHaveLength(4)
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()

    /* Advisor review dimensions (cm1: tone ok, legal + policy need review). */
    expect(screen.getAllByText('Tone · OK').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Legal · Review').length).toBeGreaterThan(0)

    /* Linked entity + bilingual meta. */
    expect(screen.getByText('Linked: Remote Work Policy (refresh in draft)')).toBeInTheDocument()
    expect(screen.getByText(/EN \+ FR ready/)).toBeInTheDocument()
  })

  it('sends a non-sensitive communication directly and flips it to Sent · Just now', () => {
    renderView()

    /* cm2 (Benefits enrolment reminder) is Scheduled and not sensitive. */
    fireEvent.click(screen.getByRole('button', { name: 'Send now' }))

    expect(screen.queryByRole('button', { name: 'Send now' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Sent')).toHaveLength(2)
    expect(screen.getByText(/Just now/)).toBeInTheDocument()
  })

  it('gates a sensitive send behind the review rail, then marks it sent on confirm', () => {
    vi.useFakeTimers()
    renderView()

    /* First "Send" belongs to cm1 (Return-to-office cadence), a sensitive draft. */
    act(() => {
      const sendButton = screen.getAllByRole('button', { name: 'Send' })[0]
      expect(sendButton).toBeDefined()
      fireEvent.click(sendButton as HTMLElement)
    })

    const dialog = screen.getByRole('dialog', { name: 'Ask Advisor' })
    expect(dialog).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(ADVISOR_THINK_MS + 120 * ADVISOR_STREAM_TICK_MS)
    })
    expect(
      screen.getByText('This is a sensitive communication — review before sending.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Review before sending')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Mark reviewed & send' }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByText('Sent')).toHaveLength(2)
    expect(screen.getByText(/Just now/)).toBeInTheDocument()
  })

  it('opens the Advisor review rail with the communication context', () => {
    vi.useFakeTimers()
    renderView()

    act(() => {
      const reviewButton = screen.getAllByRole('button', { name: 'Review with Advisor' })[0]
      expect(reviewButton).toBeDefined()
      fireEvent.click(reviewButton as HTMLElement)
    })

    const dialog = screen.getByRole('dialog', { name: 'Ask Advisor' })
    expect(dialog).toBeInTheDocument()
    /* Rail header title + context chips (province · audience). */
    expect(screen.getAllByText('Return-to-office cadence — company-wide')).toHaveLength(2)
    /* The province and audience surface as rail context chips. */
    expect(screen.getByText('Multi-province')).toBeInTheDocument()
    expect(screen.getByText('All employees · 94 people')).toBeInTheDocument()
  })
})
