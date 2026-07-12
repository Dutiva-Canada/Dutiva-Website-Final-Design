import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

/**
 * `supabase` is imported once at module scope, so each scenario mocks
 * `@/lib/supabaseClient` and re-imports the provider + renderApp fresh —
 * same pattern as AdvisorView.test.tsx's "signed in" suite.
 */
describe('WorkspaceModeProvider', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  async function renderProbe() {
    const { renderApp } = await import('@/test/renderApp')
    const { useWorkspaceMode } = await import('./workspaceModeContext')

    function Probe() {
      const { mode, isAdmin, identity } = useWorkspaceMode()
      return (
        <div>
          <span data-testid="mode">{mode}</span>
          <span data-testid="is-admin">{String(isAdmin)}</span>
          <span data-testid="company">{identity.companyName}</span>
          <span data-testid="user-name">{identity.user.name}</span>
        </div>
      )
    }

    renderApp(<Probe />)
  }

  function mockSupabase({
    session,
    isAdmin,
    storedMode,
    profile,
  }: {
    session: { user: { id: string; email: string } } | null
    isAdmin?: boolean
    storedMode?: 'demo' | 'production'
    profile?: {
      legal_name: string | null
      company_name: string | null
      primary_contact: string | null
      province: string | null
      city: string | null
    }
  }) {
    const from = vi.fn((table: string) => {
      if (table === 'workspace_preferences') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: storedMode ? { mode: storedMode } : null,
                  error: null,
                }),
            }),
          }),
        }
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: profile ?? null, error: null }),
            }),
          }),
        }
      }
      throw new Error(`unexpected table: ${table}`)
    })

    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () => Promise.resolve({ data: { session } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        rpc: vi.fn().mockResolvedValue({ data: isAdmin ?? false, error: null }),
        from,
      },
    }))
    vi.resetModules()
  }

  it('stays demo/non-admin when signed out (no Supabase configured)', async () => {
    await renderProbe()

    expect(await screen.findByTestId('mode')).toHaveTextContent('demo')
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
    expect(screen.getByTestId('company')).toHaveTextContent('Northgate Logistics Inc.')
  })

  it('stays demo for a signed-in non-admin', async () => {
    mockSupabase({ session: { user: { id: 'u1', email: 'someone@dutiva.ca' } }, isAdmin: false })
    await renderProbe()

    expect(await screen.findByTestId('is-admin')).toHaveTextContent('false')
    expect(screen.getByTestId('mode')).toHaveTextContent('demo')
  })

  it('stays demo for a confirmed admin who has not stored a production preference', async () => {
    mockSupabase({
      session: { user: { id: 'u1', email: 'martin.constantineau@dutiva.ca' } },
      isAdmin: true,
    })
    await renderProbe()

    await waitFor(() => expect(screen.getByTestId('is-admin')).toHaveTextContent('true'))
    expect(screen.getByTestId('mode')).toHaveTextContent('demo')
  })

  it('resolves production, with the real profile identity, for a confirmed admin who stored it', async () => {
    mockSupabase({
      session: { user: { id: 'u1', email: 'martin.constantineau@dutiva.ca' } },
      isAdmin: true,
      storedMode: 'production',
      profile: {
        legal_name: 'Dutiva Canada Inc.',
        company_name: null,
        primary_contact: 'Martin Constantineau',
        province: 'Ontario',
        city: 'Ottawa',
      },
    })
    await renderProbe()

    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('production'))
    expect(screen.getByTestId('company')).toHaveTextContent('Dutiva Canada Inc.')
    expect(screen.getByTestId('user-name')).toHaveTextContent('Martin Constantineau')
  })
})
