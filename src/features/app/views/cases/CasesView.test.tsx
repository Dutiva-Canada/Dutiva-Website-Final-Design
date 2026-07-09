import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderApp } from '@/test/renderApp'
import { CasesView } from './CasesView'
import { CaseDetailView } from './CaseDetailView'
import { resetCreatedCases } from './caseModel'

/** List + detail mounted together so row clicks / case creation can navigate. */
const casesRoutes = (
  <Routes>
    <Route path="/app/cases" element={<CasesView />} />
    <Route path="/app/cases/:caseId" element={<CaseDetailView />} />
  </Routes>
)

describe('CasesView', () => {
  beforeEach(() => {
    resetCreatedCases()
  })

  it('renders the fixture case files with the open count and progress', () => {
    renderApp(casesRoutes, { route: '/app/cases' })

    expect(screen.getByText('3 open of 4 cases')).toBeInTheDocument()
    expect(screen.getByText('Termination — Jordan Mensah')).toBeInTheDocument()
    expect(screen.getByText('Performance — Devon Clarke')).toBeInTheDocument()
    expect(screen.getByText('Accommodation — Amara Okafor')).toBeInTheDocument()
    expect(screen.getByText('Onboarding — Marc-Étienne Roy')).toBeInTheDocument()

    /* Status chips + step progress from the fixtures. */
    expect(screen.getByText('Legal review recommended')).toBeInTheDocument()
    expect(screen.getByText('4/6')).toBeInTheDocument()
    expect(screen.getByText('Resolved')).toBeInTheDocument()
  })

  it('navigates to the case detail when a row is opened', () => {
    renderApp(casesRoutes, { route: '/app/cases' })

    fireEvent.click(screen.getByRole('button', { name: 'Open case Termination — Jordan Mensah' }))

    /* Case detail header + overview content. */
    expect(screen.getByText('Advisor recommendation')).toBeInTheDocument()
    expect(screen.getByText(/Without-cause termination during a restructuring/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Advisor' })).toBeInTheDocument()
  })

  it('creates an Intake case through the New case modal and opens it', () => {
    renderApp(casesRoutes, { route: '/app/cases' })

    fireEvent.click(screen.getByRole('button', { name: 'New case' }))
    const dialog = screen.getByRole('dialog', { name: 'New case' })
    expect(dialog).toBeInTheDocument()

    /* Default type (Termination) is a restricted case type → lock note. */
    expect(
      screen.getByText(
        'Restricted case type — access is limited to the case owner, HR lead, and counsel.',
      ),
    ).toBeInTheDocument()

    /* A non-restricted type clears the note and takes the Pending risk path. */
    fireEvent.change(screen.getByLabelText('Case type'), {
      target: { value: 'Workplace conflict' },
    })
    expect(
      screen.queryByText(
        'Restricted case type — access is limited to the case owner, HR lead, and counsel.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create case' }))

    /* Lands on the created case's detail in the Intake stage. */
    expect(screen.getByText('Workplace conflict — Workplace-wide')).toBeInTheDocument()
    expect(screen.getByText('Intake')).toBeInTheDocument()
    expect(
      screen.getByText(/Intake started — record the key facts and Advisor will assess risk/),
    ).toBeInTheDocument()
    /* Pending risk fallback (non-assessed case type). */
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Not yet assessed — Advisor will assess risk once intake facts are recorded.',
      ),
    ).toBeInTheDocument()
  })
})
