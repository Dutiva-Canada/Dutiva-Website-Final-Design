import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SCORE_FORMULA_VERSION, computeOrgScore } from './scoring.ts'

/**
 * record-score-snapshots — the daily compliance-score snapshot job
 * (0068_score_formula_v2.sql schedules it; docs/SCORING_LOGIC.md §2.3).
 *
 * Upserts every organization's *current-month* row in
 * public.compliance_score_snapshots with the same v2 blend the Analytics
 * view computes live (scoring.ts, drift-tested against the app's copy).
 * Why this exists: the view's write-on-read history depended on an org
 * owner/admin opening Analytics that month — a month without such a visit
 * left a gap. The job writes with the service role, so each month's row
 * always exists and its last write is the month-close state. The write is
 * idempotent and only ever touches the current month, so a manual or late
 * fire can never rewrite a frozen month.
 *
 * Orgs with no scoreable rows at all are skipped, same as the view: no
 * data is an empty state, never a number.
 *
 * Auth: cron invokes with the vault-stored service key; the check is an
 * exact match against the function's own service credentials, same as
 * monitor-law-changes.
 */

function isAuthorizedTrigger(req: Request): boolean {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (token === '') return false

  // Exact match only. Both are real credentials; neither is derived from
  // anything the caller controls.
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const secretKey = Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
  return (serviceKey !== '' && token === serviceKey) || (secretKey !== '' && token === secretKey)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  if (!isAuthorizedTrigger(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const nowISO = new Date().toISOString()
  const monthISO = `${nowISO.slice(0, 7)}-01`

  const { data: orgs, error: orgsError } = await supabase.from('organizations').select('id')
  if (orgsError) {
    return new Response(JSON.stringify({ error: orgsError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let written = 0
  let skipped = 0
  const failures: string[] = []

  for (const org of orgs ?? []) {
    try {
      const [policies, tasks, findings, employees] = await Promise.all([
        supabase.from('hr_policies').select('status').eq('organization_id', org.id),
        supabase.from('compliance_tasks').select('status').eq('organization_id', org.id),
        supabase.from('compliance_findings').select('severity, status').eq('organization_id', org.id),
        supabase.from('employees').select('status').eq('organization_id', org.id),
      ])
      const firstError = policies.error ?? tasks.error ?? findings.error ?? employees.error
      if (firstError) throw firstError

      const { score, components } = computeOrgScore({
        policyStatuses: (policies.data ?? []).map((r) => r.status as string),
        taskStatuses: (tasks.data ?? []).map((r) => r.status as string),
        findings: (findings.data ?? []) as { severity: string; status: string }[],
      })
      if (score === null) {
        skipped += 1
        continue
      }

      const headcount = (employees.data ?? []).filter((r) => r.status !== 'terminated').length
      const componentsJson = Object.fromEntries(
        components.map((c) => [
          c.key,
          {
            done: c.done,
            total: c.total,
            ...(c.weightedDone !== undefined && c.weightedTotal !== undefined
              ? { weighted_done: c.weightedDone, weighted_total: c.weightedTotal }
              : {}),
          },
        ]),
      )

      const { error: upsertError } = await supabase.from('compliance_score_snapshots').upsert(
        {
          organization_id: org.id,
          month: monthISO,
          score,
          components: componentsJson,
          headcount,
          formula_version: SCORE_FORMULA_VERSION,
          updated_at: nowISO,
        },
        { onConflict: 'organization_id,month' },
      )
      if (upsertError) throw upsertError
      written += 1
    } catch (err) {
      /* One org's failure must not stop the sweep — record and continue. */
      failures.push(`${org.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (failures.length > 0) {
    console.warn(`[score-snapshots] ${failures.length} org(s) failed: ${failures.join('; ')}`)
  }

  return new Response(
    JSON.stringify({
      month: monthISO,
      organizations: orgs?.length ?? 0,
      written,
      skipped,
      failed: failures.length,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
