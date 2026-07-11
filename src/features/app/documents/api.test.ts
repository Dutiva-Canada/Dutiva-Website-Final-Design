import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `import.meta.env.VITE_SUPABASE_*` is read once at module scope in api.ts,
 * and vite.config.ts forces both vars empty for the whole suite (so every
 * other test exercises the fixture path deterministically). To exercise the
 * Supabase branch here, stub the env and re-import the module fresh per test.
 */
async function loadApiWithEnv(url: string, key: string) {
  vi.stubEnv('VITE_SUPABASE_URL', url)
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', key)
  vi.resetModules()
  return import('./api')
}

const VALID_TEMPLATE_ROW = {
  id: 't1',
  category_id: 'hiring',
  template_key: 'offer_letter',
  tid: 'T01',
  kind: 'letter',
  core: true,
  subject: 'candidate',
  name_en: 'Offer',
  name_fr: 'Offre',
  desc_en: 'd',
  desc_fr: 'd',
  jurisdictions_supported: ['ON'],
  risk_level: 'low',
  review_status: 'hr_review_required',
  requires_lawyer_review: false,
  est_minutes: 6,
  usage_count: 1,
  effective_date: '2026-01-01',
  updated_at: '2026-01-01',
}

const VALID_ROWS: Record<string, unknown[]> = {
  doclib_templates: [VALID_TEMPLATE_ROW],
  doclib_template_versions: [
    {
      template_id: 't1',
      version_number: 1,
      question_flow_json: [],
      clause_library_json: [],
      statutory_references_json: [],
      jurisdiction_notes_json: {},
      includes_json: [],
      body_content: null,
    },
  ],
  doclib_template_categories: [
    { id: 'hiring', name_en: 'Hiring', name_fr: 'Embauche', order: 1, icon: 'briefcase', desc_en: 'd', desc_fr: 'd' },
  ],
  doclib_documents: [],
  doclib_document_versions: [],
  doclib_document_recipients: [],
  doclib_document_signatures: [],
  doclib_document_audit_events: [],
  doclib_employees: [],
  doclib_employee_cases: [],
}

function viewFromUrl(url: string): string {
  const match = /\/rest\/v1\/([a-z_]+)\?/.exec(url)
  if (!match?.[1]) throw new Error(`unexpected fetch url: ${url}`)
  return match[1]
}

describe('doclib Supabase read boundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    consoleError.mockRestore()
  })

  it('parses well-formed rows and serves them as the DoclibData source', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(VALID_ROWS[viewFromUrl(url)] ?? []),
        }),
      ),
    )
    const { loadDoclibData } = await loadApiWithEnv('https://x.test.supabase.co', 'anon-key')
    const data = await loadDoclibData()
    expect(data.source).toBe('supabase')
    expect(data.templates).toHaveLength(1)
    expect(data.templates[0]?.tid).toBe('T01')
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('falls back to bundled fixtures — loudly — when a row fails schema validation', async () => {
    const malformedRows: Record<string, unknown[]> = {
      ...VALID_ROWS,
      // usage_count should be a number; a drifted/renamed DB column would
      // surface exactly this way (wrong type, or the field missing).
      doclib_templates: [{ ...VALID_TEMPLATE_ROW, usage_count: 'a lot' }],
    }
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(malformedRows[viewFromUrl(url)] ?? []),
        }),
      ),
    )
    const { loadDoclibData } = await loadApiWithEnv('https://x.test.supabase.co', 'anon-key')
    const data = await loadDoclibData()
    expect(data.source).toBe('fixtures')
    expect(data.templates.length).toBeGreaterThan(0)
    expect(consoleError).toHaveBeenCalledWith(
      'doclib: Supabase read failed, serving bundled fixtures',
      expect.anything(),
    )
  })
})
