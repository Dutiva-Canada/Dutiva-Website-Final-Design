import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { GuidanceSourcesPanel } from './GuidanceSourcesPanel'

/**
 * The test suite forces empty Supabase env vars (vite.config.ts), so
 * `supabase` is null and the panel is always signed-out here — exactly the
 * state most users hit. Authenticated fetch behavior is covered directly in
 * api.test.ts and AuthProvider.test.tsx.
 */
describe('GuidanceSourcesPanel', () => {
  it('shows the sign-in form when signed out', () => {
    renderApp(<GuidanceSourcesPanel />)
    expect(screen.getByText('Sign in to see real legal guidance sources and recent law changes.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument()
  })

  it('reports the not-configured error when submitting without Supabase configured', async () => {
    const user = userEvent.setup()
    renderApp(<GuidanceSourcesPanel />)
    await user.type(screen.getByLabelText('Work email'), 'a@b.com')
    await user.click(screen.getByRole('button', { name: 'Send magic link' }))
    expect(
      await screen.findByText('Real legal sources are not configured in this environment.'),
    ).toBeInTheDocument()
  })
})
