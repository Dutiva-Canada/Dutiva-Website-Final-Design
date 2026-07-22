import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * PUBLIC (unauthenticated) client error telemetry sink. Deploy with
 * `verify_jwt` off — like resend-webhook / create-public-support-ticket — so
 * `navigator.sendBeacon` can reach it with no auth header (beacons cannot set
 * headers). Writes go through the service role into public.client_error_reports
 * (migration 0019); there is no anon INSERT policy on the table.
 *
 * The client (src/lib/errorReporting) already scrubs the payload: route
 * PATTERNS not resolved paths, a coarse user-agent, no DOM/input/token/storage
 * data, and no persistent per-user id. This function re-validates and caps
 * every field defensively — it trusts nothing from the wire — and NEVER derives
 * anything more identifying than a salted, one-way IP hash used solely to
 * rate-limit abuse of this open endpoint.
 *
 * Bodies arrive as text/plain (a beacon string), which is CORS-safelisted and
 * needs no preflight. Responses are ignored by the beacon, so this stays terse:
 * 204 on accept-or-drop, 500 only on server misconfiguration.
 *
 * See docs/ERROR_REPORTING.md.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const KINDS = ['route-boundary', 'window-error', 'unhandled-rejection']
const ENVS = ['production', 'preview']
const LOCALES = ['en-CA', 'fr-CA']

/** Max accepted request body (a scrubbed report is < ~14 KB by construction). */
const MAX_BODY_BYTES = 16 * 1024

/* Per-IP rate limit: bounds abuse of the open endpoint. One broken render loop
   is already deduped/capped client-side; this protects against everything else. */
const RATE_WINDOW_MIN = 1
const RATE_LIMIT = 60

function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed.slice(0, max)
}

function oneOf(value: unknown, allowed: string[]): string | null {
  return typeof value === 'string' && allowed.includes(value) ? value : null
}

async function sha256hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Best-effort client IP from the usual proxy headers. */
function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? 'unknown'
}

const noContent = () => new Response(null, { status: 204, headers: corsHeaders })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(null, { status: 405, headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(null, { status: 500, headers: corsHeaders })
  }

  // Reject oversized bodies before reading them into memory.
  const declared = Number(req.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return noContent()

  let raw = ''
  try {
    raw = await req.text()
  } catch {
    return noContent()
  }
  if (raw.length === 0 || raw.length > MAX_BODY_BYTES) return noContent()

  let body: Record<string, unknown>
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return noContent()
    body = parsed as Record<string, unknown>
  } catch {
    return noContent()
  }

  // Re-validate and cap every field. Anything invalid is dropped to null, not
  // trusted — the row's CHECK constraints are the final backstop.
  const message = str(body.message, 2000)
  if (!message) return noContent() // a report with no message is noise

  const row = {
    env: oneOf(body.env, ENVS),
    release: str(body.release, 64),
    route: str(body.route, 200),
    locale: oneOf(body.locale, LOCALES),
    kind: oneOf(body.kind, KINDS),
    message,
    stack: str(body.stack, 8000),
    user_agent: str(body.ua, 200),
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // Salted, one-way IP hash — used only to rate-limit; never the raw IP.
  const salt =
    Deno.env.get('ERROR_REPORT_SALT') ?? Deno.env.get('SUPPORT_NOTIFY_SECRET') ?? 'dutiva-error-report'
  const ipHash = await sha256hex(`${salt}:ip:${clientIp(req)}`)

  const since = new Date(Date.now() - RATE_WINDOW_MIN * 60 * 1000).toISOString()
  const { count } = await admin
    .from('client_error_reports')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT) return noContent() // silently drop the flood

  await admin.from('client_error_reports').insert({ ...row, ip_hash: ipHash })

  return noContent()
})
