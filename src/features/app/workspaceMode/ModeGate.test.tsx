import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

/**
 * Same fresh-import pattern as WorkspaceModeProvider.test.tsx: mock the
 * supabase client per scenario, then import ModeGate + renderApp fresh.
 */
describe('ModeGate', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  it('renders the wrapped view unchanged in demo mode (signed out)', async () => {
    const { renderApp } = await import('@/test/renderApp')
    const { ModeGate } = await import('./ModeGate')

    renderApp(
      <ModeGate>
        <div data-testid="fixture-view">Northgate fixture content</div>
      </ModeGate>,
      { route: '/app/cases', path: '/app/cases' },
    )

    expect(screen.getByTestId('fixture-view')).toBeInTheDocument()
    expect(screen.queryByText('Production workspace')).not.toBeInTheDocument()
  })

  it('renders the module-titled empty state instead of the view in production mode', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: {
        auth: {
          getSession: () =>
            Promise.resolve({
              data: { session: { user: { id: 'u1', email: 'martin.constantineau@dutiva.ca' } } },
            }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
        from: vi.fn((table: string) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: table === 'workspace_preferences' ? { mode: 'production' } : null,
                  error: null,
                }),
            }),
          }),
        })),
      },
    }))
    vi.resetModules()

    const { renderApp: renderAppFresh } = await import('@/test/renderApp')
    const { ModeGate: ModeGateFresh } = await import('./ModeGate')

    renderAppFresh(
      <ModeGateFresh>
        <div data-testid="fixture-view">Northgate fixture content</div>
      </ModeGateFresh>,
      { route: '/app/cases', path: '/app/cases' },
    )

    /* Empty state, titled with the module's own label. */
    expect(await screen.findByText('Production workspace')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Case Files' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Settings' })).toBeInTheDocument()
    expect(screen.queryByTestId('fixture-view')).not.toBeInTheDocument()
  })
})
