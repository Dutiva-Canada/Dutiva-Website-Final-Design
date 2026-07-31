import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { GUIDE_ARTICLES, articlePath } from '../articles'
import { GuidesIndexPage } from './GuidesIndexPage'

/** Guide titles contain regex metacharacters (parentheses, ?) — escape before
    building the accessible-name matcher. */
const escapeRe = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('GuidesIndexPage', () => {
  it('renders the hero, a linked card per guide, and the CTA in English', () => {
    renderApp(<GuidesIndexPage />, { route: '/guides', path: '/guides' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Practical guidance for Canadian employers.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'All guides' })).toBeInTheDocument()

    const main = within(screen.getByRole('main'))
    for (const guide of GUIDE_ARTICLES) {
      expect(main.getByRole('heading', { level: 3, name: guide.title.en })).toBeInTheDocument()
      expect(
        main.getByRole('link', { name: new RegExp(escapeRe(guide.title.en)) }),
      ).toHaveAttribute('href', articlePath(guide, 'en'))
    }

    expect(main.getByRole('link', { name: /Start free/ })).toHaveAttribute('href', '/app/welcome')
  })

  it('still links the template-usage how-to, which is not part of the collection', () => {
    renderApp(<GuidesIndexPage />, { route: '/guides', path: '/guides' })
    expect(
      within(screen.getByRole('main')).getByRole('link', {
        name: /How to use Dutiva templates/,
      }),
    ).toHaveAttribute('href', '/guides/template-usage')
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
