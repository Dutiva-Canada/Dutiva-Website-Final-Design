import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * `@/lib/supabaseClient` is mocked per test (vi.doMock + resetModules, same
 * pattern as documents/api.test.ts) so both the fake client's shape and
 * whether it exists at all can vary per test. AuthProvider and useAuth are
 * re-imported fresh each time so the Probe component shares the same
 * AuthContext module instance as the provider under test.
 */
describe('AuthProvider', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  it('stays signed-out when Supabase is not configured, and signInWithEmail reports it', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
    vi.resetModules()
    const { AuthProvider } = await import('./AuthProvider')
    const { useAuth } = await import('./authContext')

    function Probe() {
      const { status, signInWithEmail } = useAuth()
      const [error, setError] = useState<string>()
      return (
        <div>
          <span data-testid="status">{status}</span>
          <button onClick={() => void signInWithEmail('a@b.com').then(setError)}>send</button>
          {error && <span data-testid="error">{error}</span>}
        </div>
      )
    }

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('signed-out')
    await user.click(screen.getByRole('button', { name: 'send' }))
    expect(await screen.findByTestId('error')).toHaveTextContent('not configured')
  })

  it('reflects an existing session on load and updates on sign-out', async () => {
    let stateChangeHandler: ((event: string, session: unknown) => void) | undefined
    const fakeSession = { user: { id: 'u1' } }
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () => Promise.resolve({ data: { session: fakeSession } }),
          onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
            stateChangeHandler = cb
            return { data: { subscription: { unsubscribe: vi.fn() } } }
          },
          signOut: vi.fn(async () => {
            stateChangeHandler?.('SIGNED_OUT', null)
          }),
        },
      },
    }))
    vi.resetModules()
    const { AuthProvider } = await import('./AuthProvider')
    const { useAuth } = await import('./authContext')

    function Probe() {
      const { status, signOut } = useAuth()
      return (
        <div>
          <span data-testid="status">{status}</span>
          <button onClick={() => void signOut()}>signout</button>
        </div>
      )
    }

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(await screen.findByTestId('status')).toHaveTextContent('signed-in')
    await user.click(screen.getByRole('button', { name: 'signout' }))
    expect(await screen.findByTestId('status')).toHaveTextContent('signed-out')
  })
})
