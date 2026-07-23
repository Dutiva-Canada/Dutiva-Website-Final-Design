import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * PUBLIC (unauthenticated) client error telemetry sink. Deploy with
 * `verify_jwt` off — like resend-webhook / create-public-support-ticket — so
 * `navigator.sendBeacon` can reach it with no auth header (beacons cannot set
 * headers). Storage goes through the ingest_client_error_report() RPC under the
 * service role (migration 0019); there is no anon INSERT policy on the tables.
 *
 * The client (src/lib/errorReporting) already scrubs the payload: route
 * PATTERNS not resolved paths, a coarse user-agent, no DOM/input/token/storage
 * data, and no persistent per-user id. This function re-validates and caps every
 * field defensively — it trusts nothing from the wire.
 *
 * IP handling: the source IP is only ever used to rate-limit this open endpoint.
 * It is keyed with HMAC-SHA256 under a REQUIRED secret pepper (never a committed
 * default) and stored in a separate short-retention limiter table that the RPC
 * purges down to the window — so IPv4's low entropy can't be brute-forced from
 * table access without also holding the secret, and no retained report is
 * linkable to a network beyond the limiter window. The function fails closed if
 * the pepper is unset.
 *
 * Bodies arrive as text/plain (a beacon string), CORS-safelisted so no preflight.
 * Responses are ignored by the beacon: 204 on accept-or-drop, 500 on server
 * misconfiguration or a storage failure (so operational logs expose it).
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

/* Per-IP rate limit, enforced atomically in the RPC. One broken render loop is
   already deduped/capped client-side; this bounds abuse of the open endpoint. */
const RATE_WINDOW_SECONDS = 60
const RATE_LIMIT = 60

function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed.slice(0, max)
}

function oneOf(value: unknown, allowed: string[]): string | null {
  return typeof value === 'string' && allowed.includes(value) ? value : null
}

/** Keyed hash of the IP: HMAC-SHA256(pepper, ip). Requires a real secret. */
async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  return Array.from(new Uint8Array(signature))
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
const serverError = () => new Response(null, { status: 500, headers: corsHeaders })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(null, { status: 405, headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  // Required secret pepper for the IP hash — fail closed if absent (never a
  // committed default an attacker could reproduce).
  const pepper = Deno.env.get('ERROR_REPORT_SALT') ?? Deno.env.get('SUPPORT_NOTIFY_SECRET')
  if (!supabaseUrl || !serviceRoleKey || !pepper) {
    console.error('report-error: missing configuration (url/service-role/pepper)')
    return serverError()
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

  // Re-validate and cap every field. Anything invalid drops to null; a report
  // with no message is noise.
  const message = str(body.message, 2000)
  if (!message) return noContent()

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const ipHash = await hmacHex(pepper, clientIp(req))

  // Atomic check-and-insert: the RPC takes a per-IP advisory lock, enforces the
  // window, and stores the report in one transaction (see migration 0019).
  const { error } = await admin.rpc('ingest_client_error_report', {
    p_ip_hash: ipHash,
    p_env: oneOf(body.env, ENVS),
    p_release: str(body.release, 64),
    p_route: str(body.route, 200),
    p_locale: oneOf(body.locale, LOCALES),
    p_kind: oneOf(body.kind, KINDS),
    p_message: message,
    p_stack: str(body.stack, 8000),
    p_user_agent: str(body.ua, 200),
    p_window_seconds: RATE_WINDOW_SECONDS,
    p_limit: RATE_LIMIT,
  })

  if (error) {
    // Log only non-payload context so a real failure is visible in the function
    // logs rather than silently swallowed behind a 204.
    console.error('report-error: ingest failed', { code: error.code, message: error.message })
    return serverError()
  }

  // The RPC returns 'ok' (stored) or 'rate_limited' (dropped) — both are a 204
  // to the beacon, which ignores the response either way.
  return noContent()
})
