import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * `@/lib/supabaseClient` is mocked per test (vi.doMock + resetModules, same
 * pattern as documents/api.test.ts) so both the fake client's shape and
 * whether it exists at all can vary per test. AuthProvider, useAuth, AND
 * LangProvider are all re-imported fresh (dynamically, after resetModules)
 * so every module involved shares one module graph — AuthProvider now calls
 * useI18n(), and a statically-imported LangProvider would carry a stale
 * LangContext instance that doesn't match the freshly re-imported one.
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
    const { LangProvider } = await import('@/i18n/LangProvider')

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
      <LangProvider>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </LangProvider>,
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
    const { LangProvider } = await import('@/i18n/LangProvider')

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
      <LangProvider>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </LangProvider>,
    )
    expect(await screen.findByTestId('status')).toHaveTextContent('signed-in')
    await user.click(screen.getByRole('button', { name: 'signout' }))
    expect(await screen.findByTestId('status')).toHaveTextContent('signed-out')
  })

  it('rejects a non-allowed email without ever calling signInWithOtp', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
          signInWithOtp,
        },
      },
    }))
    vi.resetModules()
    const { AuthProvider } = await import('./AuthProvider')
    const { useAuth } = await import('./authContext')
    const { LangProvider } = await import('@/i18n/LangProvider')

    function Probe() {
      const { signInWithEmail } = useAuth()
      const [error, setError] = useState<string>()
      return (
        <div>
          <button onClick={() => void signInWithEmail('someone@gmail.com').then(setError)}>
            send
          </button>
          {error && <span data-testid="error">{error}</span>}
        </div>
      )
    }

    const user = userEvent.setup()
    render(
      <LangProvider>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </LangProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'send' }))
    expect(await screen.findByTestId('error')).toHaveTextContent('invite-only')
    expect(signInWithOtp).not.toHaveBeenCalled()
  })

  it('rejects a different @dutiva.ca email that is not the allowed account', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
          signInWithOtp,
        },
      },
    }))
    vi.resetModules()
    const { AuthProvider } = await import('./AuthProvider')
    const { useAuth } = await import('./authContext')
    const { LangProvider } = await import('@/i18n/LangProvider')

    function Probe() {
      const { signInWithEmail } = useAuth()
      const [error, setError] = useState<string>()
      return (
        <div>
          <button onClick={() => void signInWithEmail('riley@dutiva.ca').then(setError)}>
            send
          </button>
          {error && <span data-testid="error">{error}</span>}
        </div>
      )
    }

    const user = userEvent.setup()
    render(
      <LangProvider>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </LangProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'send' }))
    expect(await screen.findByTestId('error')).toHaveTextContent('invite-only')
    expect(signInWithOtp).not.toHaveBeenCalled()
  })

  it('allows the allowed account through to signInWithOtp, case-insensitively', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
          signInWithOtp,
        },
      },
    }))
    vi.resetModules()
    const { AuthProvider } = await import('./AuthProvider')
    const { useAuth } = await import('./authContext')
    const { LangProvider } = await import('@/i18n/LangProvider')

    function Probe() {
      const { status, signInWithEmail } = useAuth()
      return (
        <div>
          <span data-testid="status">{status}</span>
          <button onClick={() => void signInWithEmail('Martin.Constantineau@Dutiva.ca')}>
            send
          </button>
        </div>
      )
    }

    const user = userEvent.setup()
    render(
      <LangProvider>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </LangProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'send' }))
    expect(signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'Martin.Constantineau@Dutiva.ca' }),
    )
    expect(await screen.findByTestId('status')).toHaveTextContent('sent-link')
  })
})
