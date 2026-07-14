import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

/**
 * Same fresh-module-graph pattern as AuthProvider.test.tsx: `supabaseClient`
 * is mocked per test, and RequireAdminSession + AuthProvider + LangProvider
 * are re-imported together after vi.resetModules() so they all share one
 * AuthContext instance.
 */
describe('RequireAdminSession', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  async function renderGuarded() {
    const { RequireAdminSession } = await import('./RequireAdminSession')
    const { AuthProvider } = await import('./AuthProvider')
    const { LangProvider } = await import('@/i18n/LangProvider')

    render(
      <LangProvider>
        <MemoryRouter initialEntries={['/app']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app"
                element={
                  <RequireAdminSession>
                    <div>workspace</div>
                  </RequireAdminSession>
                }
              />
              <Route path="/app/welcome" element={<div>welcome</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </LangProvider>,
    )
  }

  it('renders children when Supabase is not configured (no gate to apply)', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
    vi.resetModules()
    await renderGuarded()
    expect(await screen.findByText('workspace')).toBeInTheDocument()
  })

  it('redirects to /app/welcome when signed out', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
      },
    }))
    vi.resetModules()
    await renderGuarded()
    expect(await screen.findByText('welcome')).toBeInTheDocument()
    expect(screen.queryByText('workspace')).toBeNull()
  })

  it('redirects to /app/welcome for a signed-in session that is not the allowed account', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () =>
            Promise.resolve({ data: { session: { user: { email: 'riley@dutiva.ca' } } } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
      },
    }))
    vi.resetModules()
    await renderGuarded()
    expect(await screen.findByText('welcome')).toBeInTheDocument()
    expect(screen.queryByText('workspace')).toBeNull()
  })

  it('renders children for a signed-in session matching the allowed account', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () =>
            Promise.resolve({
              data: { session: { user: { email: 'martin.constantineau@dutiva.ca' } } },
            }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
      },
    }))
    vi.resetModules()
    await renderGuarded()
    expect(await screen.findByText('workspace')).toBeInTheDocument()
  })
})
