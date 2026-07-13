import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { BlogIndexPage } from './BlogIndexPage'

const EN_TITLES = [
  'Ontario termination notice requirements',
  'Probation clauses in Ontario',
  'Canadian employer document checklist',
  'Employment contract clauses in Canada',
  'Duty to accommodate in Canada',
  'Termination documentation in Canada',
]

describe('BlogIndexPage', () => {
  it('renders hero, six article cards, and CTA in English', () => {
    renderApp(<BlogIndexPage />, { route: '/blog', path: '/blog' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'HR compliance, in practice.' }),
    ).toBeInTheDocument()
    const main = within(screen.getByRole('main'))
    for (const title of EN_TITLES) {
      expect(main.getByText(title)).toBeInTheDocument()
    }
    expect(main.getByText('Termination · 6 min read')).toBeInTheDocument()
    // Header carries its own "Start free" links — scope the CTA check to <main>.
    expect(main.getByRole('link', { name: /Start free/ })).toHaveAttribute('href', '/app/welcome')
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderApp(<BlogIndexPage />, { route: '/blog', path: '/blog' })
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    expect(langToggle).toBeDefined()
    await user.click(langToggle as HTMLElement)
    expect(
      screen.getByRole('heading', { level: 1, name: 'La conformité RH, en pratique.' }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('main')).getByText(
        'Exigences de préavis de cessation d’emploi en Ontario',
      ),
    ).toBeInTheDocument()
  })
})
