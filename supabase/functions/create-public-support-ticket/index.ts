import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * PUBLIC (unauthenticated) support intake. This is the signed-out path for the
 * flows that must not sit behind a login — accessibility feedback, privacy
 * requests, security reports — plus general product/sales questions. It is a
 * separate function from create-support-ticket precisely because it is
 * unauthenticated: it accepts only the `allowPublic` categories, has its own
 * anti-abuse controls, and never touches workspace or diagnostic context.
 *
 * Anti-abuse (no third-party CAPTCHA yet — that's the documented next hardening):
 *   • a honeypot field that real users never see;
 *   • per-IP and per-email rate limits backed by support_public_intake, which
 *     stores ONLY salted hashes (never the raw IP or email);
 *   • strict field validation and length caps.
 *
 * All writes use the service role (there is no anon INSERT policy on
 * support_tickets). A public ticket has no requester_user_id and no workspace,
 * so under RLS it is visible to admins only — the requester is updated by email.
 *
 * Mirrors src/config/support.ts (public categories, restricted set) and
 * src/features/support/triage.ts (suggestPriority) — keep in sync.
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

const CATEGORIES = [
  'account_access', 'billing', 'technical', 'product_question', 'privacy',
  'security', 'accessibility', 'complaint', 'sales', 'other',
] as const
type Category = (typeof CATEGORIES)[number]

/** Only these may be submitted without an account (mirror allowPublic in config). */
const PUBLIC_CATEGORIES = new Set<Category>([
  'product_question', 'privacy', 'security', 'accessibility', 'sales',
])
/** Restricted handling: requester + admin only, off the ordinary product queue. */
const RESTRICTED_CATEGORIES = new Set<Category>(['privacy', 'security', 'accessibility', 'complaint'])

const IMPACTS = ['blocking', 'major', 'minor', 'none'] as const
type Impact = (typeof IMPACTS)[number]
const URGENCIES = ['urgent', 'soon', 'whenever'] as const
type Urgency = (typeof URGENCIES)[number]
const RESPONSE_METHODS = ['email', 'scheduled_call'] as const
const LANGUAGES = ['en', 'fr'] as const

const PRIORITIES = ['low', 'standard', 'high', 'critical'] as const

/** Server-side priority — capped at 'high'; 'critical' is a human triage call. */
function suggestPriority(category: Category, impact: Impact, urgency: Urgency): string {
  const impactRank = impact === 'blocking' ? 2 : impact === 'major' || impact === 'minor' ? 1 : 0
  const categoryFloor =
    category === 'security'
      ? 2
      : category === 'account_access' || category === 'accessibility' ||
          category === 'privacy' || category === 'billing' || category === 'complaint'
        ? 1
        : 0
  let rank = Math.max(impactRank, categoryFloor)
  if (urgency === 'urgent' && impact !== 'none') rank += 1
  return PRIORITIES[Math.min(rank, 2)]
}

/** Customer acknowledgement kind by category (mirror notifications.ts). */
function acknowledgementKind(category: Category): string {
  if (category === 'privacy') return 'privacy_ack'
  if (category === 'security') return 'security_ack'
  if (category === 'accessibility') return 'accessibility_ack'
  if (category === 'complaint') return 'complaint_ack'
  return 'ticket_received'
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length >= 1 && trimmed.length <= max ? trimmed : null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sha256hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Best-effort client IP from the usual proxy headers. */
function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? 'unknown'
}

const IP_WINDOW_MIN = 15
const IP_LIMIT = 3
const EMAIL_WINDOW_MIN = 60
const EMAIL_LIMIT = 3

const OPERATOR_EMAIL = Deno.env.get('SUPPORT_OPERATOR_EMAIL') ?? 'support@dutiva.ca'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server configuration missing' }, 500)

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  // Honeypot: a hidden field real users never fill. Pretend success so bots
  // don't learn they were caught, but write nothing.
  if (typeof body.contact_fax === 'string' && body.contact_fax.trim() !== '') {
    return json({ data: { ok: true } })
  }

  const category = oneOf<Category>(body.category, CATEGORIES, 'other')
  if (!PUBLIC_CATEGORIES.has(category)) {
    return json({ error: 'This request type requires a signed-in account.', field: 'category' }, 400)
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: 'A valid email address is required.', field: 'email' }, 422)
  }
  const subject = str(body.subject, 200)
  const description = str(body.description, 20000)
  if (!subject) return json({ error: 'A subject is required.', field: 'subject' }, 422)
  if (!description) return json({ error: 'A description is required.', field: 'description' }, 422)
  if (body.consent !== true) return json({ error: 'Please confirm to continue.', field: 'consent' }, 422)

  const impact = oneOf<Impact>(body.impact, IMPACTS, 'none')
  const urgency = oneOf<Urgency>(body.urgency, URGENCIES, 'whenever')
  const language = oneOf(body.language, LANGUAGES, 'en')
  const preferredResponseMethod = oneOf(body.preferred_response_method, RESPONSE_METHODS, 'email')

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Rate limiting on salted hashes (never the raw IP/email).
  const salt = Deno.env.get('PUBLIC_INTAKE_SALT') ?? Deno.env.get('SUPPORT_NOTIFY_SECRET') ?? 'dutiva-intake'
  const ipHash = await sha256hex(`${salt}:ip:${clientIp(req)}`)
  const emailHash = await sha256hex(`${salt}:email:${email}`)

  const ipSince = new Date(Date.now() - IP_WINDOW_MIN * 60 * 1000).toISOString()
  const emailSince = new Date(Date.now() - EMAIL_WINDOW_MIN * 60 * 1000).toISOString()
  const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
    admin.from('support_public_intake').select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash).gte('created_at', ipSince),
    admin.from('support_public_intake').select('id', { count: 'exact', head: true })
      .eq('email_hash', emailHash).gte('created_at', emailSince),
  ])
  if ((ipCount ?? 0) >= IP_LIMIT || (emailCount ?? 0) >= EMAIL_LIMIT) {
    return json({ error: 'Too many requests in a short time. Please try again later, or email support@dutiva.ca.' }, 429)
  }

  const priority = suggestPriority(category, impact, urgency)
  const restricted = RESTRICTED_CATEGORIES.has(category)

  const { data: ticket, error: insertError } = await admin
    .from('support_tickets')
    .insert({
      requester_user_id: null,
      requester_email: email,
      workspace_id: null,
      category,
      subject,
      description,
      impact,
      urgency,
      language,
      preferred_response_method: preferredResponseMethod,
      source: 'public_form',
      priority,
      restricted,
      status: 'new',
    })
    .select('id, public_reference')
    .single()
  if (insertError || !ticket) {
    return json({ error: insertError?.message ?? 'Could not create the request.' }, 500)
  }

  await admin.from('support_messages').insert({
    ticket_id: ticket.id,
    author_user_id: null,
    author_role: 'customer',
    body: description,
    is_internal_note: false,
  })
  await admin.from('support_ticket_events').insert({
    ticket_id: ticket.id,
    actor_user_id: null,
    event_type: 'created',
    data: { source: 'public_form' },
  })

  // Record the rate-limit row (hashes only) after acceptance.
  await admin.from('support_public_intake').insert({ ip_hash: ipHash, email_hash: emailHash })

  // Enqueue notifications to the outbox (support-notify sends them). The
  // acknowledgement goes to the address the requester supplied.
  await admin.from('support_notifications').insert([
    {
      ticket_id: ticket.id,
      kind: acknowledgementKind(category),
      audience: 'customer',
      recipient: email,
      language,
      payload: { reference: ticket.public_reference, category },
    },
    {
      ticket_id: ticket.id,
      kind: 'operator_alert',
      audience: 'operator',
      recipient: OPERATOR_EMAIL,
      language: 'en',
      payload: { reference: ticket.public_reference, category, priority },
    },
  ])

  return json({ data: { public_reference: ticket.public_reference } })
})
