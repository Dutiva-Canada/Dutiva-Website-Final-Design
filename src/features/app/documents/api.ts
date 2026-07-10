import type { Bi } from '@/i18n/core'
import { docCases, docEmployees, docTemplates, sampleDocuments, templateCategories } from './data'
import type { DocCase, DocEmployee, DocTemplate, GeneratedDoc, TemplateCategory } from './data'

/**
 * Read layer for the HR Documents Library. When Supabase env vars are present
 * (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) the catalogue is fetched from
 * the project's read-only `public.doclib_*` views (RLS-backed, demo posture);
 * otherwise — local dev without env, and the test suite — the bundled
 * fixtures serve the identical content synchronously. Field-for-field the two
 * sources match: the views were seeded from the same handoff data the
 * fixtures are generated from.
 *
 * The anon key this reads with is a project-wide credential: PostgREST
 * exposes every table/view granted to `anon` in the shared project's public
 * schema, not just doclib_*. See docs/DATA_MODEL.md and the note in
 * .env.example.
 */

export interface DoclibData {
  templates: DocTemplate[]
  categories: TemplateCategory[]
  documents: GeneratedDoc[]
  employees: DocEmployee[]
  cases: DocCase[]
  /** Which source actually served the data (surfaced nowhere user-facing; useful in dev). */
  source: 'supabase' | 'fixtures'
}

const FIXTURES: DoclibData = {
  templates: docTemplates,
  categories: templateCategories,
  documents: sampleDocuments,
  employees: docEmployees,
  cases: docCases,
  source: 'fixtures',
}

const SUPA_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL
const SUPA_KEY: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

async function rest<T>(view: string, query: string): Promise<T[]> {
  const res = await fetch(`${SUPA_URL}/rest/v1/${view}?${query}`, {
    headers: { apikey: SUPA_KEY ?? '', Authorization: `Bearer ${SUPA_KEY}` },
  })
  if (!res.ok) throw new Error(`doclib read ${view}: ${res.status}`)
  return (await res.json()) as T[]
}

/* Row shapes as the views return them (snake_case, flattened Bi pairs). */
interface TemplateRow {
  id: string
  category_id: string
  template_key: string
  tid: string
  kind: string
  core: boolean
  subject: string
  name_en: string
  name_fr: string
  desc_en: string
  desc_fr: string
  jurisdictions_supported: string[]
  risk_level: string
  review_status: string
  requires_lawyer_review: boolean
  est_minutes: number
  usage_count: number
  effective_date: string
  updated_at: string
}
interface TemplateVersionRow {
  template_id: string
  version_number: number
  question_flow_json: unknown
  clause_library_json: unknown
  statutory_references_json: unknown
  jurisdiction_notes_json: unknown
  includes_json: unknown
  body_content: string | null
}
interface CategoryRow {
  id: string
  name_en: string
  name_fr: string
  order: number
  icon: string
  desc_en: string
  desc_fr: string
}
interface DocumentRow {
  id: string
  template_id: string
  employee_id: string | null
  case_id: string | null
  ref: string
  title_en: string
  title_fr: string
  language: string
  jurisdiction: string
  status: string
  risk_level: string
  review_status: string
  signature_status: string
  current_version: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  archived_at: string | null
  answers_json: Record<string, string>
}
interface VersionRow {
  document_id: string
  version_number: number
  change_summary_en: string
  change_summary_fr: string
  created_by: string
  created_at: string
}
interface RecipientRow {
  document_id: string
  recipient_type: string
  name: string
  email: string
  signing_order: number
  status: string
  signed_at: string | null
}
interface SignatureRow {
  document_id: string
  provider: string
  external_envelope_id: string
  status: string
  sent_at: string | null
  viewed_at: string | null
  signed_at: string | null
  declined_at: string | null
  expires_at: string | null
}
interface AuditRow {
  document_id: string
  actor_name: string
  event_type: string
  event_metadata: string | null
  created_at: string
}

const bi = (en: string, fr: string): Bi => ({ en, fr })

/* The seed's jsonb columns hold the SAME folded shapes as the fixtures
   (questions/preview/statutory/notes/includes were folded before insert), so
   these casts restore the domain types the fixtures carry natively. */
async function fetchFromSupabase(): Promise<DoclibData> {
  const [tplRows, verRows, catRows, docRows, verEntries, recRows, sigRows, auditRows] =
    await Promise.all([
      rest<TemplateRow>('doclib_templates', 'select=*&order=tid'),
      rest<TemplateVersionRow>('doclib_template_versions', 'select=*'),
      rest<CategoryRow>('doclib_template_categories', 'select=*&order=order'),
      rest<DocumentRow>('doclib_documents', 'select=*&order=updated_at.desc'),
      rest<VersionRow>('doclib_document_versions', 'select=*&order=version_number'),
      rest<RecipientRow>('doclib_document_recipients', 'select=*&order=signing_order'),
      rest<SignatureRow>('doclib_document_signatures', 'select=*'),
      rest<AuditRow>('doclib_document_audit_events', 'select=*&order=created_at'),
      // employees + cases are tiny; fetched below to stay under the parallel-arity noise
    ])
  const [empRows, caseRows] = await Promise.all([
    rest<{ id: string; name: string; jurisdiction: string }>(
      'doclib_employees',
      'select=*&order=name',
    ),
    rest<{
      id: string
      employee_id: string
      title_en: string
      title_fr: string
      jurisdiction: string
      risk: string
    }>('doclib_employee_cases', 'select=*'),
  ])

  const versionByTpl = new Map(verRows.map((v) => [v.template_id, v]))
  const templates = tplRows.map((r): DocTemplate => {
    const v = versionByTpl.get(r.id)
    if (!v) throw new Error(`doclib: template ${r.tid} has no version row`)
    return {
      id: r.id,
      tid: r.tid,
      key: r.template_key,
      kind: r.kind,
      category: r.category_id as DocTemplate['category'],
      core: r.core,
      name: bi(r.name_en, r.name_fr),
      desc: bi(r.desc_en, r.desc_fr),
      jurisdictions: r.jurisdictions_supported as DocTemplate['jurisdictions'],
      risk: r.risk_level as DocTemplate['risk'],
      review: r.review_status as DocTemplate['review'],
      requiresLawyerReview: r.requires_lawyer_review,
      version: `v${v.version_number}`,
      versionNumber: v.version_number,
      effectiveDate: r.effective_date,
      updatedAt: r.updated_at,
      estMinutes: r.est_minutes,
      usageCount: r.usage_count,
      statutory: v.statutory_references_json as DocTemplate['statutory'],
      jurisdictionNotes: v.jurisdiction_notes_json as DocTemplate['jurisdictionNotes'],
      includes: v.includes_json as DocTemplate['includes'],
      questions: v.question_flow_json as DocTemplate['questions'],
      preview: v.clause_library_json as DocTemplate['preview'],
      subject: r.subject as DocTemplate['subject'],
      ...(v.body_content ? { bodyHtmlEn: v.body_content } : {}),
    }
  })
  const tidById = new Map(tplRows.map((r) => [r.id, r]))

  const groupBy = <T extends { document_id: string }>(rows: T[]) => {
    const map = new Map<string, T[]>()
    for (const row of rows) {
      const list = map.get(row.document_id) ?? []
      list.push(row)
      map.set(row.document_id, list)
    }
    return map
  }
  const versionsByDoc = groupBy(verEntries)
  const recipientsByDoc = groupBy(recRows)
  const auditByDoc = groupBy(auditRows)
  const signatureByDoc = new Map(sigRows.map((s) => [s.document_id, s]))

  const documents = docRows.map((r): GeneratedDoc => {
    const tpl = tidById.get(r.template_id)
    if (!tpl)
      throw new Error(`doclib: document ${r.id} references unknown template ${r.template_id}`)
    const sig = signatureByDoc.get(r.id)
    return {
      id: r.id,
      ref: r.ref,
      templateTid: tpl.tid,
      templateKey: tpl.template_key,
      title: bi(r.title_en, r.title_fr),
      ...(r.employee_id ? { employeeId: r.employee_id } : {}),
      ...(r.case_id ? { caseId: r.case_id } : {}),
      jurisdiction: r.jurisdiction as GeneratedDoc['jurisdiction'],
      language: r.language as GeneratedDoc['language'],
      status: r.status as GeneratedDoc['status'],
      reviewStatus: r.review_status as GeneratedDoc['reviewStatus'],
      signatureStatus: r.signature_status as GeneratedDoc['signatureStatus'],
      risk: r.risk_level as GeneratedDoc['risk'],
      currentVersion: r.current_version,
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      archived: r.archived_at !== null,
      answers: r.answers_json ?? {},
      versions: (versionsByDoc.get(r.id) ?? []).map((v) => ({
        n: v.version_number,
        changeSummary: bi(v.change_summary_en, v.change_summary_fr),
        createdBy: v.created_by,
        createdAt: v.created_at,
      })),
      recipients: (recipientsByDoc.get(r.id) ?? []).map((rec) => ({
        name: rec.name,
        type: rec.recipient_type as GeneratedDoc['recipients'][number]['type'],
        email: rec.email,
        order: rec.signing_order,
        status: rec.status,
        ...(rec.signed_at ? { signedAt: rec.signed_at } : {}),
      })),
      ...(sig
        ? {
            signature: {
              provider: sig.provider,
              envelopeId: sig.external_envelope_id,
              status: sig.status as GeneratedDoc['signatureStatus'],
              ...(sig.sent_at ? { sentAt: sig.sent_at } : {}),
              ...(sig.viewed_at ? { viewedAt: sig.viewed_at } : {}),
              ...(sig.signed_at ? { signedAt: sig.signed_at } : {}),
              ...(sig.declined_at ? { declinedAt: sig.declined_at } : {}),
              ...(sig.expires_at ? { expiresAt: sig.expires_at } : {}),
            },
          }
        : {}),
      audit: (auditByDoc.get(r.id) ?? []).map((a) => ({
        event: a.event_type as GeneratedDoc['audit'][number]['event'],
        actor: a.actor_name,
        at: a.created_at,
        ...(a.event_metadata ? { meta: a.event_metadata } : {}),
      })),
    }
  })

  return {
    templates,
    categories: catRows.map((c) => ({
      id: c.id as TemplateCategory['id'],
      order: c.order,
      icon: c.icon,
      name: bi(c.name_en, c.name_fr),
      desc: bi(c.desc_en, c.desc_fr),
    })),
    documents,
    employees: empRows.map((e) => ({
      id: e.id,
      name: e.name,
      jurisdiction: e.jurisdiction as DocEmployee['jurisdiction'],
    })),
    cases: caseRows.map((c) => ({
      id: c.id,
      title: bi(c.title_en, c.title_fr),
      employeeId: c.employee_id,
      jurisdiction: c.jurisdiction as DocCase['jurisdiction'],
      risk: c.risk as DocCase['risk'],
    })),
    source: 'supabase',
  }
}

let cache: Promise<DoclibData> | null = null

/** Load once per session; Supabase failures fall back to fixtures loudly (console). */
export function loadDoclibData(): Promise<DoclibData> {
  if (!cache) {
    cache =
      SUPA_URL && SUPA_KEY
        ? fetchFromSupabase().catch((error: unknown) => {
            console.error('doclib: Supabase read failed, serving bundled fixtures', error)
            return FIXTURES
          })
        : Promise.resolve(FIXTURES)
  }
  return cache
}

/** Test hook. */
export function resetDoclibCache(): void {
  cache = null
}
