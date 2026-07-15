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
function renderPricing() {
  return render(
    <ThemeProvider>
      <LangProvider>
        <MemoryRouter initialEntries={['/pricing']}>
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
  it('renders the hero and all four plan cards in English', () => {
    renderPricing()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Start structured. Upgrade as your HR workflow grows.',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Free / Beta')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Most popular')).toBeInTheDocument()
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
})
