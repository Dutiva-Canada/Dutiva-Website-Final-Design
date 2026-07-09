import { describe, expect, it } from 'vitest'
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
