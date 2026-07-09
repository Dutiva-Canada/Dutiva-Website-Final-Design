import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen, within } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { AdvisorRail } from '@/features/app/rail/AdvisorRail'
import { DocStudioOverlay } from '@/features/app/docstudio/DocStudioOverlay'
import { PoliciesView } from './PoliciesView'

function renderPolicies() {
  return renderApp(
    <>
      <PoliciesView />
      <AdvisorRail />
      <DocStudioOverlay />
    </>,
    { route: '/app/policies', path: '/app/policies' },
  )
}

describe('PoliciesView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the register with statuses and review dates', () => {
    renderPolicies()

    expect(screen.getByText('Review status across your policy library.')).toBeInTheDocument()

    /* All six fixture policies. */
    expect(screen.getByText('Remote Work Policy')).toBeInTheDocument()
    expect(screen.getByText('Vacation & Time Off Policy')).toBeInTheDocument()
    expect(screen.getByText('Code of Conduct')).toBeInTheDocument()
    expect(screen.getByText('Workplace Accommodation Policy')).toBeInTheDocument()
    expect(screen.getByText('Anti-Harassment & Violence Policy')).toBeInTheDocument()
    expect(screen.getByText('Expense Reimbursement Policy')).toBeInTheDocument()

    /* Status chips + last-reviewed lines. */
    expect(screen.getAllByText('Up to date')).toHaveLength(3)
    expect(screen.getAllByText('Needs review')).toHaveLength(2)
    expect(screen.getByText('Missing')).toBeInTheDocument()
    expect(screen.getByText('Last reviewed 14 months ago')).toBeInTheDocument()
    expect(screen.getByText('Last reviewed never generated')).toBeInTheDocument()

    expect(screen.getAllByRole('button', { name: 'Review with Advisor' })).toHaveLength(6)
  })

  it('opens the Advisor rail on review, and "Draft it now" hands a Missing policy to Document Studio', () => {
    renderPolicies()

    /* Row 6 — Expense Reimbursement Policy (Missing). */
    const reviewButtons = screen.getAllByRole('button', { name: 'Review with Advisor' })
    act(() => {
      fireEvent.click(reviewButtons[5]!)
    })

    const rail = screen.getByRole('dialog', { name: 'Ask Advisor' })
    expect(within(rail).getByText('Expense Reimbursement Policy')).toBeInTheDocument()

    /* Let the advisor turn think (850ms) and stream to done. */
    act(() => {
      vi.advanceTimersByTime(850 + 2000)
    })
    expect(
      within(rail).getByText(
        'This policy hasn’t been generated yet. I can draft a first version now.',
      ),
    ).toBeInTheDocument()

    /* The card's primary action closes the rail and opens Document Studio. */
    act(() => {
      fireEvent.click(within(rail).getByRole('button', { name: 'Draft it now' }))
    })
    expect(screen.queryByRole('dialog', { name: 'Ask Advisor' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Document Studio' })).toBeInTheDocument()
    expect(screen.getByText('Advisor is drafting…')).toBeInTheDocument()
  })
})
