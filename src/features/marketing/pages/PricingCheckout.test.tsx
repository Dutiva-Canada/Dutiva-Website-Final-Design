import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { LangProvider } from '@/i18n/LangProvider'
import { PricingPage } from './PricingPage'

/**
 * Guards the annual-billing safety branch: because create-checkout-session
 * only has monthly Stripe prices, a signed-in customer who picks Annual must
 * be stopped with a notice rather than sent to a monthly subscription. The
 * data hooks are mocked so the page renders signed-in and paid-eligible
 * without the Supabase-backed provider stack, and `invoke` spies on checkout.
 */
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    functions: { invoke },
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}))
vi.mock('@/features/app/auth/authContext', () => ({
  useAuth: () => ({
    status: 'signed-in',
    session: { user: { email: 'buyer@example.com' } },
    signInWithEmail: vi.fn(),
    signOut: vi.fn(),
  }),
}))
vi.mock('@/features/app/billing/planContext', () => ({
  usePlan: () => ({ isAdmin: false, plan: 'free', stripeCustomerId: null, loading: false }),
}))

function renderPage() {
  return render(
    <ThemeProvider>
      <LangProvider>
        <MemoryRouter initialEntries={['/pricing']}>
          <PricingPage />
        </MemoryRouter>
      </LangProvider>
    </ThemeProvider>,
  )
}

describe('PricingPage — annual checkout guard', () => {
  it('blocks paid annual checkout with a coming-soon notice and never calls checkout', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /Annual/i }))
    await user.click(screen.getByRole('button', { name: /Upgrade to Growth/i }))
    expect(await screen.findByText(/Annual billing is coming soon/i)).toBeInTheDocument()
    expect(invoke).not.toHaveBeenCalled()
  })
})
