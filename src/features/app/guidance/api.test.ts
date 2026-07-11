import { afterEach, describe, expect, it, vi } from 'vitest'

interface FakeResult {
  data: unknown
  error: unknown
}

/** Chainable, thenable stand-in for a supabase-js PostgrestFilterBuilder. */
function chain(result: FakeResult) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    then: (onfulfilled: (value: FakeResult) => unknown) =>
      Promise.resolve(result).then(onfulfilled),
  }
  return builder
}

async function loadApiWithFakeClient(fromImpl: (table: string) => unknown) {
  vi.doMock('@/lib/supabaseClient', () => ({ supabase: { from: fromImpl } }))
  vi.resetModules()
  return import('./api')
}

async function loadApiWithNoClient() {
  vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
  vi.resetModules()
  return import('./api')
}

describe('guidance api', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  it('returns empty arrays when Supabase is not configured', async () => {
    const { fetchGuidanceSources, fetchRecentLawUpdates } = await loadApiWithNoClient()
    await expect(fetchGuidanceSources()).resolves.toEqual([])
    await expect(fetchRecentLawUpdates()).resolves.toEqual([])
  })

  it('parses well-formed guidance_sources rows', async () => {
    const row = {
      id: 's1',
      title: 'ESA Guide',
      source_type: 'statute',
      jurisdiction: 'ON',
      url: 'https://example.com',
      version: '2026',
      effective_date: '2026-01-01',
    }
    const { fetchGuidanceSources } = await loadApiWithFakeClient(() =>
      chain({ data: [row], error: null }),
    )
    await expect(fetchGuidanceSources()).resolves.toEqual([
      {
        id: 's1',
        title: 'ESA Guide',
        sourceType: 'statute',
        jurisdiction: 'ON',
        url: 'https://example.com',
        version: '2026',
        effectiveDate: '2026-01-01',
      },
    ])
  })

  it('throws when a guidance_sources row fails schema validation', async () => {
    const { fetchGuidanceSources } = await loadApiWithFakeClient(() =>
      chain({ data: [{ id: 's1' }], error: null }),
    )
    await expect(fetchGuidanceSources()).rejects.toThrow()
  })

  it('parses well-formed law_updates rows', async () => {
    const row = {
      id: 'u1',
      jurisdiction: 'QC',
      law_name: 'Loi 25',
      url: 'https://example.com',
      change_summary: 'Amended s.12',
      detected_at: '2026-05-01T00:00:00Z',
      event_type: 'change',
    }
    const { fetchRecentLawUpdates } = await loadApiWithFakeClient(() =>
      chain({ data: [row], error: null }),
    )
    await expect(fetchRecentLawUpdates()).resolves.toEqual([
      {
        id: 'u1',
        jurisdiction: 'QC',
        lawName: 'Loi 25',
        url: 'https://example.com',
        changeSummary: 'Amended s.12',
        detectedAt: '2026-05-01T00:00:00Z',
        eventType: 'change',
      },
    ])
  })

  it('propagates a Supabase error', async () => {
    const { fetchGuidanceSources } = await loadApiWithFakeClient(() =>
      chain({ data: null, error: new Error('RLS denied') }),
    )
    await expect(fetchGuidanceSources()).rejects.toThrow('RLS denied')
  })
})
