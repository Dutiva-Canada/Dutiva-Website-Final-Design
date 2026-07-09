import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { PolicyPage } from './PolicyPage'

describe('PolicyPage', () => {
  it('renders the Terms of Service document in English', () => {
    renderApp(<PolicyPage />, { route: '/legal/terms', path: '/legal/:slug' })
    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument()
    const main = within(screen.getByRole('main'))
    const meta = main.getByText(/Last updated/)
    expect(meta).toHaveTextContent('Last updated: June 1, 2026')
    expect(
      screen.getByRole('heading', { level: 2, name: '1. Parties and Acceptance' }),
    ).toBeInTheDocument()
    expect(main.getByRole('link', { name: 'All legal & compliance documents' })).toHaveAttribute(
      'href',
      '/legal',
    )
    expect(
      main.getByText(
        'Dutiva provides compliance-oriented HR workflow support and does not provide legal advice. For high-risk employment decisions, consult qualified legal counsel.',
      ),
    ).toBeInTheDocument()
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderApp(<PolicyPage />, { route: '/legal/terms', path: '/legal/:slug' })
    const [langToggle] = screen.getAllByRole('button', { name: 'Toggle language' })
    expect(langToggle).toBeDefined()
    await user.click(langToggle as HTMLElement)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Conditions d’utilisation' }),
    ).toBeInTheDocument()
  })

  it('renders a formerly FR-only document in English now that its EN edition shipped', () => {
    renderApp(<PolicyPage />, { route: '/legal/disclaimer', path: '/legal/:slug' })
    expect(screen.getByRole('heading', { level: 1, name: 'Legal Disclaimer' })).toBeInTheDocument()
    // Complete catalogue → the language-fallback notice must not appear.
    expect(
      within(screen.getByRole('main')).queryByText(
        'The English edition of this document is being finalized — the French edition is shown below.',
      ),
    ).toBeNull()
    expect(screen.getByRole('article')).not.toHaveAttribute('lang')
  })

  it('redirects away from an unknown slug without rendering the shell', () => {
    renderApp(<PolicyPage />, { route: '/legal/does-not-exist', path: '/legal/:slug' })
    expect(screen.queryByRole('main')).toBeNull()
  })
})
