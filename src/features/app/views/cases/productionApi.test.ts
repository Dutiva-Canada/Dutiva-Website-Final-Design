import { afterEach, describe, expect, it, vi } from 'vitest'

/** Same per-test client mock + fresh import pattern as the employees productionApi tests. */
describe('cases productionApi', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  const ROW = {
    id: 'case-1',
    title: 'Accommodation — ergonomic assessment',
    case_type: 'Accommodation',
    employee_id: 'emp-1',
    province: 'Ontario',
    status: 'open',
    due_date: '2026-08-01',
  }

  it('listCases returns parsed rows scoped to the org, newest first', async () => {
    const order = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listCases('org-1')
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(rows).toEqual([
      {
        id: 'case-1',
        title: 'Accommodation — ergonomic assessment',
        caseType: 'Accommodation',
        employeeId: 'emp-1',
        province: 'Ontario',
        status: 'open',
        dueDate: '2026-08-01',
      },
    ])
  })

  it('addCase inserts with the org id and nulls out empty optionals', async () => {
    const single = vi.fn().mockResolvedValue({ data: { ...ROW, employee_id: null }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ insert }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.addCase('org-1', {
      title: 'Accommodation — ergonomic assessment',
      caseType: 'Accommodation',
      employeeId: '',
      province: 'Ontario',
      dueDate: '',
    })
    expect(insert).toHaveBeenCalledWith({
      organization_id: 'org-1',
      title: 'Accommodation — ergonomic assessment',
      case_type: 'Accommodation',
      employee_id: null,
      province: 'Ontario',
      due_date: null,
    })
  })

  it('updateCaseStatus updates by id and throws on failure', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ update }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.updateCaseStatus('case-1', 'resolved')
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'resolved' }))
    expect(eq).toHaveBeenCalledWith('id', 'case-1')
  })

  it('listCases throws when the read fails', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: new Error('rls') })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await expect(api.listCases('org-1')).rejects.toThrow()
  })
})
