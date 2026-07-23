import { z } from 'zod'
import type { Bi } from '@/i18n/core'
import { docCases, docEmployees, docTemplates, sampleDocuments, templateCategories } from './data'
import type { DocCase, DocEmployee, DocTemplate, GeneratedDoc, TemplateCategory } from './data'
import { customTemplates } from './customTemplates'

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
  /* customTemplates are hand-authored (see that file's header) — spliced
     in here rather than into data/templates/index.ts (generated, would
     be clobbered on a future regen). */
  templates: [...docTemplates, ...customTemplates],
  categories: templateCategories,
  documents: sampleDocuments,
  employees: docEmployees,
  cases: docCases,
  source: 'fixtures',
}

const SUPA_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL
const SUPA_KEY: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

async function rest<T>(view: string, query: string, schema: z.ZodType<T>): Promise<T[]> {
  const res = await fetch(`${SUPA_URL}/rest/v1/${view}?${query}`, {
    headers: { apikey: SUPA_KEY ?? '', Authorization: `Bearer ${SUPA_KEY}` },
  })
  if (!res.ok) throw new Error(`doclib read ${view}: ${res.status}`)
  return z.array(schema).parse(await res.json())
}

/* Row shapes as the views return them (snake_case, flattened Bi pairs).
   Schemas are the single source of truth — the TS types are inferred from
   them, so a column rename/drop/type-change in the DB fails the parse in
   `rest()` instead of silently producing malformed domain objects downstream. */
const templateRowSchema = z.object({
  id: z.string(),
  category_id: z.string(),
  template_key: z.string(),
  tid: z.string(),
  kind: z.string(),
  core: z.boolean(),
  subject: z.string(),
  name_en: z.string(),
  name_fr: z.string(),
  desc_en: z.string(),
  desc_fr: z.string(),
  jurisdictions_supported: z.array(z.string()),
  risk_level: z.string(),
  review_status: z.string(),
  requires_lawyer_review: z.boolean(),
  est_minutes: z.number(),
  usage_count: z.number(),
  effective_date: z.string(),
  updated_at: z.string(),
})

const templateVersionRowSchema = z.object({
  template_id: z.string(),
  version_number: z.number(),
  question_flow_json: z.unknown(),
  clause_library_json: z.unknown(),
  statutory_references_json: z.unknown(),
  jurisdiction_notes_json: z.unknown(),
  includes_json: z.unknown(),
  body_content: z.string().nullable(),
})

const categoryRowSchema = z.object({
  id: z.string(),
  name_en: z.string(),
  name_fr: z.string(),
  order: z.number(),
  icon: z.string(),
  desc_en: z.string(),
  desc_fr: z.string(),
})

const documentRowSchema = z.object({
  id: z.string(),
  template_id: z.string(),
  employee_id: z.string().nullable(),
  case_id: z.string().nullable(),
  ref: z.string(),
  title_en: z.string(),
  title_fr: z.string(),
  language: z.string(),
  jurisdiction: z.string(),
  status: z.string(),
  risk_level: z.string(),
  review_status: z.string(),
  signature_status: z.string(),
  current_version: z.number(),
  created_by: z.string(),
  updated_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  archived_at: z.string().nullable(),
  answers_json: z.record(z.string(), z.string()),
})

const versionRowSchema = z.object({
  document_id: z.string(),
  version_number: z.number(),
  change_summary_en: z.string(),
  change_summary_fr: z.string(),
  created_by: z.string(),
  created_at: z.string(),
})

const recipientRowSchema = z.object({
  document_id: z.string(),
  recipient_type: z.string(),
  name: z.string(),
  email: z.string(),
  signing_order: z.number(),
  status: z.string(),
  signed_at: z.string().nullable(),
})

const signatureRowSchema = z.object({
  document_id: z.string(),
  provider: z.string(),
  external_envelope_id: z.string(),
  status: z.string(),
  sent_at: z.string().nullable(),
  viewed_at: z.string().nullable(),
  signed_at: z.string().nullable(),
  declined_at: z.string().nullable(),
  expires_at: z.string().nullable(),
})

const auditRowSchema = z.object({
  document_id: z.string(),
  actor_name: z.string(),
  event_type: z.string(),
  event_metadata: z.string().nullable(),
  created_at: z.string(),
})

const employeeRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  jurisdiction: z.string(),
})

const caseRowSchema = z.object({
  id: z.string(),
  employee_id: z.string(),
  title_en: z.string(),
  title_fr: z.string(),
  jurisdiction: z.string(),
  risk: z.string(),
})

const bi = (en: string, fr: string): Bi => ({ en, fr })

/* The seed's jsonb columns hold the SAME folded shapes as the fixtures
   (questions/preview/statutory/notes/includes were folded before insert), so
   these casts restore the domain types the fixtures carry natively. */
async function fetchFromSupabase(): Promise<DoclibData> {
  const [tplRows, verRows, catRows, docRows, verEntries, recRows, sigRows, auditRows] =
    await Promise.all([
      rest('doclib_templates', 'select=*&order=tid', templateRowSchema),
      rest('doclib_template_versions', 'select=*', templateVersionRowSchema),
      rest('doclib_template_categories', 'select=*&order=order', categoryRowSchema),
      rest('doclib_documents', 'select=*&order=updated_at.desc', documentRowSchema),
      rest('doclib_document_versions', 'select=*&order=version_number', versionRowSchema),
      rest('doclib_document_recipients', 'select=*&order=signing_order', recipientRowSchema),
      rest('doclib_document_signatures', 'select=*', signatureRowSchema),
      rest('doclib_document_audit_events', 'select=*&order=created_at', auditRowSchema),
      // employees + cases are tiny; fetched below to stay under the parallel-arity noise
    ])
  const [empRows, caseRows] = await Promise.all([
    rest('doclib_employees', 'select=*&order=name', employeeRowSchema),
    rest('doclib_employee_cases', 'select=*', caseRowSchema),
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
      // No raw ids in the message: it can surface in the error boundary and in
      // client error telemetry, which must not carry document/template ids.
      throw new Error('doclib: a generated document references an unknown template')
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
  cache ??=
    SUPA_URL && SUPA_KEY
      ? fetchFromSupabase().catch((error: unknown) => {
          console.error('doclib: Supabase read failed, serving bundled fixtures', error)
          return FIXTURES
        })
      : Promise.resolve(FIXTURES)
  return cache
}

/** Test hook. */
export function resetDoclibCache(): void {
  cache = null
}
