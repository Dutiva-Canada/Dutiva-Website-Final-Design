import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LangProvider } from '@/i18n/LangProvider'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/features/app/auth/AuthProvider'
import { PlanProvider } from '@/features/app/billing/PlanProvider'
import { PricingPage } from './PricingPage'

/**
 * Mirrors the production wrapping in src/app/router.tsx's `pricing()`
 * helper (Auth + Plan providers only, not the full app AppProviders bundle)
 * so this test exercises the same provider composition /pricing actually
 * renders with.
 */
function renderPricing(route = '/pricing') {
  return render(
    <ThemeProvider>
      <LangProvider>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            <PlanProvider>
              <Routes>
                <Route path="/pricing" element={<PricingPage />} />
              </Routes>
            </PlanProvider>
          </AuthProvider>
        </MemoryRouter>
      </LangProvider>
    </ThemeProvider>,
  )
}

describe('PricingPage', () => {
  it('renders the hero and all four plan tiers in English', () => {
    renderPricing()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Start structured. Upgrade as your HR workflow grows.',
      }),
    ).toBeInTheDocument()

    /* Each tier name now appears in both the plan card and the comparison
       table header, so assert presence rather than a single occurrence. */
    for (const name of ['Free / Beta', 'Starter', 'Growth', 'Professional']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
    expect(screen.getByText('Most popular')).toBeInTheDocument()
  })

  it('switches plan prices when toggling to annual billing', async () => {
    const user = userEvent.setup()
    renderPricing()
    // Growth is $49/mo on monthly billing.
    expect(screen.getByText('$49')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Annual/i }))
    // Annual = two months free → $41/mo effective for Growth.
    expect(screen.getByText('$41')).toBeInTheDocument()
    expect(screen.queryByText('$49')).not.toBeInTheDocument()
  })

  it('renders the feature comparison table', () => {
    renderPricing()
    expect(screen.getByText('AI Advisor')).toBeInTheDocument()
    expect(screen.getByText('Advisor access')).toBeInTheDocument()
    expect(screen.getByText('Save & export documents')).toBeInTheDocument()
  })

  it('shows the not-legal-advice disclaimer', () => {
    renderPricing()
    expect(screen.getByText(/not provide legal advice/i)).toBeInTheDocument()
  })

  it('re-localizes to French via the header language toggle', async () => {
    const user = userEvent.setup()
    renderPricing()
    const [langToggle] = screen.getAllByRole('button', { name: /Toggle language/ })
    await user.click(langToggle as HTMLElement)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Commencez de façon structurée. Évoluez à mesure que vos RH grandissent.',
      }),
    ).toBeInTheDocument()
  })

  it('reads "Sign in to continue" on paid plans when signed out, not the plan CTA', () => {
    renderPricing()
    expect(screen.getAllByRole('button', { name: /Sign in to continue/ }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /Upgrade to Growth/i })).toBeNull()
  })

  it('shows a success notice for a Stripe return', () => {
    renderPricing('/pricing?checkout=success&plan=growth')
    expect(screen.getByText(/your subscription is being set up/i)).toBeInTheDocument()
  })

  it('shows a cancelled notice for a Stripe return', () => {
    renderPricing('/pricing?checkout=cancelled')
    expect(screen.getByText(/checkout was cancelled/i)).toBeInTheDocument()
  })
})
