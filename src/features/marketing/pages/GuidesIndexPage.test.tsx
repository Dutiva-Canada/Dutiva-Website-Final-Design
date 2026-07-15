import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { GuidesIndexPage } from './GuidesIndexPage'

describe('GuidesIndexPage', () => {
  it('renders the hero, all six guide cards, and the CTA in English', () => {
    renderApp(<GuidesIndexPage />, { route: '/guides', path: '/guides' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Practical guidance for Canadian employers.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'All guides' })).toBeInTheDocument()

    expect(
      within(screen.getByRole('main')).getByRole('link', { name: /Start free/ }),
    ).toHaveAttribute('href', '/app/welcome')
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderApp(<GuidesIndexPage />, { route: '/guides', path: '/guides' })
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    await user.click(langToggle as HTMLElement)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Des conseils pratiques pour les employeurs canadiens.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Tous les guides' })).toBeInTheDocument()
  })
})
