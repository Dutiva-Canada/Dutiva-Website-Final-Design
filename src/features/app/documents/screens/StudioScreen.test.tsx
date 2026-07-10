import { describe, expect, it } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'
import { DoclibProvider } from '../DoclibProvider'
import { StudioScreen } from './StudioScreen'

const renderStudio = () =>
  renderApp(
    <DoclibProvider>
      <StudioScreen />
    </DoclibProvider>,
    { route: '/app/documents/studio', path: '/app/documents/studio' },
  )

describe('StudioScreen', () => {
  it('renders all 16 templates grouped by category', async () => {
    renderStudio()

    /* Data loads async from fixtures — wait for the first card. */
    expect(await screen.findByText('Offer of employment letter')).toBeInTheDocument()
    /* Spot-check across categories: hiring / agreements / termination. */
    expect(screen.getByText('Confidentiality agreement')).toBeInTheDocument()
    expect(screen.getByText('Group termination notice')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(16)
    expect(screen.getByText('16 templates')).toBeInTheDocument()
    /* Category group headings in handoff order. */
    expect(screen.getByRole('heading', { name: 'Hiring & onboarding' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Termination & offboarding' })).toBeInTheDocument()
  })

  it('search narrows the grid to offer templates and updates the count', async () => {
    renderStudio()
    await screen.findByText('Offer of employment letter')

    fireEvent.change(screen.getByPlaceholderText('Search 16 templates…'), {
      target: { value: 'offer' },
    })

    expect(screen.getByText('Offer of employment letter')).toBeInTheDocument()
    expect(screen.getByText('Québec offer letter')).toBeInTheDocument()
    expect(screen.queryByText('Confidentiality agreement')).not.toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('2 templates')).toBeInTheDocument()
  })

  it('union toggle flips T03 to "Collective agreement governs"', async () => {
    renderStudio()
    await screen.findByText('Termination letter (without cause)')

    const card = () =>
      within(screen.getByRole('article', { name: 'Termination letter (without cause)' }))
    expect(card().getByText('Applies to you')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Unionized' }))

    expect(card().getByText('Collective agreement governs')).toBeInTheDocument()
  })

  it('raising headcount to 60 makes T15 "Required for you"', async () => {
    renderStudio()
    await screen.findByText('Group termination notice')

    const card = () => within(screen.getByRole('article', { name: 'Group termination notice' }))
    /* Default org is 42 employees — below the 50+ group-termination trigger. */
    expect(card().getByText('Applies above your size')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Headcount' }), {
      target: { value: '60' },
    })

    expect(card().getByText('Required for you')).toBeInTheDocument()
  })
})
