import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * Generative first-line answer for the AUTHENTICATED in-app support form. Given
 * a question plus Help Centre excerpts the client retrieved, it asks the model
 * for a short, grounded answer — a suggestion shown before the user sends a
 * ticket, never a replacement for the human reply.
 *
 * Hard guardrails (defense in depth — the client gates too):
 *   • HUMAN_ONLY categories (privacy, security, accessibility, complaint,
 *     billing, account_access) are NEVER auto-answered — the function refuses
 *     and returns { escalate: true } without calling the model.
 *   • Grounded only in the provided public Help Centre excerpts; the system
 *     prompt forbids legal advice, guessing, and inventing policies/citations,
 *     and tells the model to defer to a person when the answer isn't present.
 *   • Authenticated + per-user rate limited (via ai_telemetry_events) to bound
 *     cost/abuse. Reuses the active advisor_chat model route.
 *
 * The answer is advisory only: the UI always shows a not-legal-advice notice,
 * links the source articles, and lets the user send their request regardless.
 * Keep the escalation set in sync with src/features/support/firstLineAssist.ts.
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

const HUMAN_ONLY = new Set([
  'privacy', 'security', 'accessibility', 'complaint', 'billing', 'account_access',
])

const RATE_LIMIT = 15 // per user per hour
const MAX_CONTEXT_ARTICLES = 3
const MAX_CONTEXT_CHARS = 1500
const MAX_QUESTION_CHARS = 2000
const MAX_TOKENS = 320

function systemPrompt(lang: 'en' | 'fr', context: string): string {
  const language = lang === 'fr' ? 'French' : 'English'
  return [
    "You are Dutiva's support assistant for a Canadian HR compliance product.",
    'Answer the user\'s question using ONLY the Dutiva Help Centre excerpts below.',
    'Rules:',
    '1. If the answer is not clearly contained in the excerpts, reply only that you are not certain and a Dutiva team member will follow up — never guess.',
    '2. Never provide legal advice or interpret employment law. Dutiva provides HR workflow support and compliance-oriented guidance, not legal advice.',
    `3. Be concise: at most 3 sentences, plain language, written in ${language}.`,
    '4. Do not invent policies, prices, timelines, links, or citations that are not in the excerpts.',
    '5. Do not ask for or repeat sensitive personal information.',
    '',
    'Help Centre excerpts:',
    context,
  ].join('\n')
}

interface Provider {
  provider_key: string
  base_url: string
  secret_ref: string
  status: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Server configuration missing' }, 500)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing bearer token' }, 401)
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(
    authHeader.replace('Bearer ', ''),
  )
  const user = userData?.user
  if (userError || !user) return json({ error: 'Invalid user token' }, 401)

  const admin = createClient(supabaseUrl, serviceRoleKey)

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const category = typeof body.category === 'string' ? body.category : ''
  // Hard escalation gate — sensitive matters are never auto-answered.
  if (HUMAN_ONLY.has(category)) return json({ data: { escalate: true } })

  const question = typeof body.question === 'string' ? body.question.trim().slice(0, MAX_QUESTION_CHARS) : ''
  if (question.length < 3) return json({ error: 'A question is required' }, 422)
  const lang = body.language === 'fr' ? 'fr' : 'en'

  const rawContext = Array.isArray(body.context) ? body.context : []
  const context = rawContext
    .slice(0, MAX_CONTEXT_ARTICLES)
    .map((c) => {
      const item = c as Record<string, unknown>
      const title = typeof item.title === 'string' ? item.title : ''
      const text = typeof item.text === 'string' ? item.text.slice(0, MAX_CONTEXT_CHARS) : ''
      return `## ${title}\n${text}`
    })
    .join('\n\n')
  if (!context.trim()) return json({ data: { escalate: false, answer: '' } })

  // Per-user hourly rate limit via the telemetry table.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await admin
    .from('ai_telemetry_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('operation', 'support_firstline')
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT) {
    return json({ error: 'You’ve used the instant-answer helper several times recently. Please send your request.' }, 429)
  }

  // Reuse the active advisor_chat model route (same provider/model as the Advisor).
  const { data: route } = await admin
    .from('ai_model_routes')
    .select('model_name, config, provider:ai_model_providers(provider_key, base_url, secret_ref, status)')
    .eq('route_key', 'advisor_chat')
    .eq('status', 'active')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle()
  const provider = route?.provider as Provider | null | undefined
  if (!route || !provider || provider.status !== 'active') {
    return json({ error: 'The instant-answer helper is unavailable right now.' }, 503)
  }
  const apiKey = Deno.env.get(provider.secret_ref)
  if (!apiKey) return json({ error: 'The instant-answer helper is unavailable right now.' }, 503)

  const started = Date.now()
  let completion: {
    choices?: { message?: { content?: string } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  }
  try {
    const upstream = await fetch(`${provider.base_url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: route.model_name,
        messages: [
          { role: 'system', content: systemPrompt(lang, context) },
          { role: 'user', content: question },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
      }),
    })
    if (!upstream.ok) {
      const errText = await upstream.text()
      throw new Error(`Upstream ${upstream.status}: ${errText.slice(0, 300)}`)
    }
    completion = await upstream.json()
  } catch (error) {
    await admin.from('ai_telemetry_events').insert({
      user_id: user.id,
      provider: provider.provider_key,
      model: route.model_name,
      operation: 'support_firstline',
      status: 'error',
      latency_ms: Date.now() - started,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    })
    return json({ error: 'The instant-answer helper is temporarily unavailable.' }, 502)
  }

  const answer = completion.choices?.[0]?.message?.content?.trim() ?? ''
  const usage = completion.usage ?? {}
  await admin.from('ai_telemetry_events').insert({
    user_id: user.id,
    provider: provider.provider_key,
    model: route.model_name,
    operation: 'support_firstline',
    prompt_tokens: usage.prompt_tokens ?? null,
    completion_tokens: usage.completion_tokens ?? null,
    total_tokens: usage.total_tokens ?? null,
    latency_ms: Date.now() - started,
    status: 'completed',
  })

  return json({ data: { escalate: false, answer } })
})
