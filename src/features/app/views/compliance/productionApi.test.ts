import { afterEach, describe, expect, it, vi } from 'vitest'

/** Same per-test client mock + fresh import pattern as the other productionApi tests. */
describe('compliance productionApi', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  const ROW = {
    id: 'finding-1',
    title: 'Vacation accrual policy missing for Quebec staff',
    description: 'No written policy covers CNESST vacation accrual rules.',
    recommendation: 'Draft a Quebec-specific vacation policy addendum.',
    severity: 'high',
    status: 'open',
  }

  it('listFindings parses rows and derives resolved from status', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [ROW, { ...ROW, id: 'finding-2', status: 'dismissed' }],
      error: null,
    })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listFindings('org-1')
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1')
    expect(rows[0]).toMatchObject({ severity: 'high', resolved: false })
    /* dismissed counts as closed even though the UI never writes it. */
    expect(rows[1]).toMatchObject({ status: 'dismissed', resolved: true })
  })

  it('addFinding inserts with the org id and nulls empty optionals', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...ROW, description: null, recommendation: null },
      error: null,
    })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ insert }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.addFinding('org-1', {
      title: 'Vacation accrual policy missing for Quebec staff',
      severity: 'high',
      description: '',
      recommendation: '',
    })
    expect(insert).toHaveBeenCalledWith({
      organization_id: 'org-1',
      title: 'Vacation accrual policy missing for Quebec staff',
      severity: 'high',
      description: null,
      recommendation: null,
    })
  })

  it('setFindingResolved resolves and reopens with resolved_at stamped/cleared', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ update }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.setFindingResolved('finding-1', true)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'resolved', resolved_at: expect.any(String) }),
    )

    await api.setFindingResolved('finding-1', false)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'open', resolved_at: null }),
    )
  })

  it('listFindings throws when the read fails', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: new Error('rls') })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await expect(api.listFindings('org-1')).rejects.toThrow()
  })

  it('countOpenFindings issues a head count excluding resolved and dismissed', async () => {
    const notFn = vi.fn().mockResolvedValue({ count: 1, error: null })
    const eq = vi.fn().mockReturnValue({ not: notFn })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    expect(await api.countOpenFindings('org-1')).toBe(1)
    expect(notFn).toHaveBeenCalledWith('status', 'in', '(resolved,dismissed)')
  })
})
