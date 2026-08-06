import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { rowsNeedingFollowup, rowsNeedingReminder } from '../_shared/scheduledCalls.ts'
import type { SchedulerRow } from '../_shared/scheduledCalls.ts'

/**
 * Cron sweep for confirmed scheduled calls (TODO.md D3): sends the one
 * reminder this flow sends (~24h before a call) and flags calls whose end
 * time has passed without a written follow-up, prompting the summary the
 * customer journey promises (docs/SUPPORT_ARCHITECTURE.md: "scheduled call
 * only when required -> written ticket summary"). Scheduled every 15 minutes
 * by trigger_support_call_scheduler() (supabase/migrations/0045).
 *
 * Same shape as monitor-law-changes and support-attachment-scan: a locked,
 * idempotent sweep over rows that need attention, each written once via its
 * own flag column (reminder_sent_at / followup_flagged_at) so a rerun after a
 * partial failure never double-sends.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const CRON_LOCK_JOB = 'support-call-scheduler-sweep'
const CRON_LOCK_TTL_SECONDS = 300

/** Same bearer-or-JWT check monitor-law-changes uses for its own cron trigger. */
function isAuthorizedTrigger(req: Request): boolean {
  const auth = req.headers.get('Authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  const token = auth.slice('Bearer '.length)

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const secretKey = Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
  if ((serviceKey && token === serviceKey) || (secretKey && token === secretKey)) return true

  try {
    const payload = token.split('.')[1]
    if (payload) {
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
      const claims = JSON.parse(atob(padded))
      if (claims?.role === 'service_role') return true
    }
  } catch {
    /* not a JWT — fall through */
  }
  return false
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  if (!isAuthorizedTrigger(req)) {
    return json({ error: 'Forbidden.' }, 403)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const instanceId = crypto.randomUUID()
  const { data: acquired, error: lockError } = await db.rpc('acquire_cron_lock', {
    p_job_name: CRON_LOCK_JOB,
    p_instance_id: instanceId,
    p_ttl_seconds: CRON_LOCK_TTL_SECONDS,
  })
  if (lockError) {
    console.warn('[support-call-scheduler] acquire_cron_lock failed; continuing without lock:', lockError.message)
  } else if (!acquired) {
    console.warn('[support-call-scheduler] another instance already holds the lock; skipping.')
    return json({ ok: true, skipped: true, reason: 'another-instance-running' })
  }

  const now = new Date()
  const results: string[] = []

  const { data: candidateRows, error: fetchError } = await db
    .from('support_scheduled_calls')
    .select('id, ticket_id, confirmed_start, confirmed_end, reminder_sent_at, followup_flagged_at')
    .eq('status', 'confirmed')
    .or('reminder_sent_at.is.null,followup_flagged_at.is.null')
  if (fetchError) {
    if (!lockError && acquired) await db.rpc('release_cron_lock', { p_job_name: CRON_LOCK_JOB, p_instance_id: instanceId })
    return json({ error: fetchError.message }, 500)
  }

  const rows: (SchedulerRow & { ticketId: string })[] = (candidateRows ?? []).map((r) => ({
    id: r.id,
    ticketId: r.ticket_id,
    confirmedStart: r.confirmed_start,
    confirmedEnd: r.confirmed_end,
    reminderSentAt: r.reminder_sent_at,
    followupFlaggedAt: r.followup_flagged_at,
  }))

  for (const row of rowsNeedingReminder(rows, now)) {
    const { data: ticket } = await db
      .from('support_tickets')
      .select('public_reference, requester_email, language')
      .eq('id', row.ticketId)
      .maybeSingle()
    if (ticket?.requester_email) {
      await db.from('support_notifications').insert({
        ticket_id: row.ticketId,
        kind: 'call_reminder',
        audience: 'customer',
        recipient: ticket.requester_email,
        language: ticket.language ?? 'en',
        payload: { reference: ticket.public_reference },
      })
    }
    await db.from('support_scheduled_calls').update({ reminder_sent_at: now.toISOString() }).eq('id', row.id)
    results.push(`REMINDER  ticket ${row.ticketId}`)
  }

  const operatorEmail = Deno.env.get('SUPPORT_OPERATOR_EMAIL') ?? 'support@dutiva.ca'
  for (const row of rowsNeedingFollowup(rows, now)) {
    const { data: ticket } = await db
      .from('support_tickets')
      .select('public_reference')
      .eq('id', row.ticketId)
      .maybeSingle()
    await db.from('support_notifications').insert({
      ticket_id: row.ticketId,
      kind: 'call_followup_needed',
      audience: 'operator',
      recipient: operatorEmail,
      language: 'en',
      payload: { reference: ticket?.public_reference ?? '' },
    })
    await db.from('support_scheduled_calls').update({ followup_flagged_at: now.toISOString() }).eq('id', row.id)
    results.push(`FOLLOWUP  ticket ${row.ticketId}`)
  }

  if (!lockError && acquired) {
    const { error: releaseError } = await db.rpc('release_cron_lock', {
      p_job_name: CRON_LOCK_JOB,
      p_instance_id: instanceId,
    })
    if (releaseError) console.warn('[support-call-scheduler] release_cron_lock failed:', releaseError.message)
  }

  return json({ ok: true, checked: rows.length, results })
})
