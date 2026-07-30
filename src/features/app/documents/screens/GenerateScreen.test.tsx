import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { DoclibProvider } from '../DoclibProvider'
import { fillProgress } from '../engine'
import { templateByTid } from '../data'
import { GenerateScreen } from './GenerateScreen'

const PATH = '/app/documents/generate/:templateId'

const renderWizard = (templateId: string) =>
  renderApp(
    <DoclibProvider>
      <GenerateScreen />
    </DoclibProvider>,
    { route: `/app/documents/generate/${templateId}`, path: PATH },
  )

describe('GenerateScreen', () => {
  it('renders the context step for T01 with jurisdiction/language toggles and the org strip', async () => {
    renderWizard('tpl_t01')

    /* Data loads async from fixtures — first assertion must await. */
    expect(await screen.findByText('Generate · Offer of employment letter')).toBeInTheDocument()
    expect(screen.getByText('Who and where is this document for?')).toBeInTheDocument()

    /* Org compliance strip (default profile: 42 employees, non-union, ON).
       T01 carries an ON 25+ headcount clause gate → 'Required for you'. */
    expect(screen.getByText('Small employer · 42')).toBeInTheDocument()
    expect(screen.getByText('Non-union')).toBeInTheDocument()
    expect(screen.getByText('Required for you')).toBeInTheDocument()

    /* Candidate-subject template: employee link is optional, case picker shown. */
    expect(screen.getByRole('combobox', { name: 'Employee record (optional)' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Case file (optional)' })).toBeInTheDocument()

    /* Jurisdiction segments limited to the template's list + doc language. */
    for (const code of ['ON', 'QC', 'FED', 'EN', 'FR']) {
      expect(screen.getByRole('button', { name: code })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'ON' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('advances to guided questions and autosaves a typed answer (unsaved → saving → saved)', async () => {
    renderWizard('tpl_t01')
    await screen.findByText('Generate · Offer of employment letter')

    /* Switch jurisdiction, then advance — question sections appear. */
    fireEvent.click(screen.getByRole('button', { name: 'QC' }))
    expect(screen.getByRole('button', { name: 'QC' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Candidate')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Compensation')).toBeInTheDocument()

    /* Typing flips the autosave indicator through its simulated cycle. */
    expect(screen.getByRole('status')).toHaveTextContent('All changes saved')
    fireEvent.change(screen.getByPlaceholderText('e.g. Gabriel Dubois'), {
      target: { value: 'Gabriel Dubois' },
    })
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved changes')
    expect(await screen.findByText('Saving…', {}, { timeout: 2500 })).toBeInTheDocument()
    expect(await screen.findByText('All changes saved', {}, { timeout: 2500 })).toBeInTheDocument()
  })

  it('shows fill progress and risk/review posture on the review step', async () => {
    renderWizard('tpl_t01')
    await screen.findByText('Generate · Offer of employment letter')

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.change(screen.getByPlaceholderText('e.g. Gabriel Dubois'), {
      target: { value: 'Gabriel Dubois' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    const t01 = templateByTid.get('T01')
    if (!t01) throw new Error('fixture template T01 missing')
    const { total } = fillProgress(t01, {})
    expect(screen.getByText(`1/${total}`)).toBeInTheDocument()
    expect(screen.getByText('fields filled')).toBeInTheDocument()

    expect(screen.getByText('Low risk')).toBeInTheDocument()
    expect(screen.getByText('HR review required')).toBeInTheDocument()
    expect(
      screen.getByText('HR review is required before this document is used.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save to repository' })).toBeInTheDocument()
  })

  it('requires an employee before Next on an employee-subject template (T03) and prefills the name', async () => {
    renderWizard('tpl_t03')
    await screen.findByText('Generate · Termination letter (without cause)')

    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toBeDisabled()

    fireEvent.change(screen.getByRole('combobox', { name: 'Employee' }), {
      target: { value: 'emp_jm' },
    })
    expect(next).toBeEnabled()

    fireEvent.click(next)
    /* employee_name is prefilled once from the chosen employee. */
    expect(screen.getByPlaceholderText('Full legal name')).toHaveValue('Jordan Mensah')
    expect(screen.getByText('Auto-filled from context')).toBeInTheDocument()
  })

  /**
   * The statutory-notice floor, wired end to end (statutoryFloor.ts). The
   * letter tells the employee the figure "meets or exceeds" the ESA minimum,
   * so a number below it ships a letter asserting compliance while
   * under-providing. Unit tests cover the arithmetic; these cover the wiring.
   */
  describe('statutory notice floor (T03, Ontario)', () => {
    /* Jurisdiction is chosen on the context step, so it has to be set before
       advancing to the questions. */
    const openQuestions = async (jurisdiction?: 'QC' | 'FED') => {
      renderWizard('tpl_t03')
      await screen.findByText('Generate · Termination letter (without cause)')
      fireEvent.change(screen.getByRole('combobox', { name: 'Employee' }), {
        target: { value: 'emp_jm' },
      })
      if (jurisdiction) fireEvent.click(screen.getByRole('button', { name: jurisdiction }))
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    }

    const setField = (label: string, value: string) =>
      fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } })

    it('warns when the entered notice is below the statutory minimum', async () => {
      await openQuestions()
      setField('Years of continuous service', '6')
      setField('Notice / pay in lieu', '2')

      /* 6 completed years → 6 weeks under ESA s.57. */
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Below the statutory minimum of 6 weeks/,
      )
    })

    it('confirms a figure that meets the minimum, without alarm', async () => {
      await openQuestions()
      setField('Years of continuous service', '6')
      setField('Notice / pay in lieu', '6')

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByText(/At or above the statutory minimum of 6 weeks/)).toBeInTheDocument()
    })

    it('always says the floor is only a floor', async () => {
      /* The figure must never read as a recommended amount — common-law
         reasonable notice is frequently far higher. */
      await openQuestions()
      setField('Years of continuous service', '6')
      setField('Notice / pay in lieu', '6')

      expect(
        screen.getByText(/common-law reasonable notice is often considerably higher/),
      ).toBeInTheDocument()
    })

    it('shows the floor as guidance before a figure is entered', async () => {
      await openQuestions()
      setField('Years of continuous service', '3')

      expect(screen.getByText(/Statutory minimum for this tenure: 3 weeks/)).toBeInTheDocument()
    })

    it('hedges for a jurisdiction with no reviewed schedule', async () => {
      /* QC and FED bands are deliberately null pending legal review. */
      await openQuestions('QC')
      setField('Years of continuous service', '6')
      setField('Notice / pay in lieu', '1')

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByText(/No verified minimum is available/)).toBeInTheDocument()
    })
  })
})
