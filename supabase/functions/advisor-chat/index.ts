import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * Real AI Advisor replies. Looks up the active `advisor_chat` route in
 * ai_model_routes/ai_model_providers (currently DigitalOcean Gradient AI /
 * mistral-3-14B — see the row inserted 2026-07-10), calls it, persists the
 * turn to `conversations`, and logs `ai_telemetry_events`. Auth follows the
 * same bearer-JWT pattern as the other dutiva-* functions.
 *
 * v1 is plain-text replies only — no tone cards / citations / reasoning
 * trace. The frontend's scripted demo turns keep that structured format;
 * this endpoint is additive, not a replacement for it yet.
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

const SYSTEM_PROMPT =
  'You are the Dutiva AI Advisor, a compliance-oriented HR assistant for Canadian ' +
  'employers. Give practical, jurisdiction-aware HR guidance (Ontario, Quebec, and ' +
  'federally regulated workplaces). You are not a lawyer and do not provide legal ' +
  'advice — for high-risk employment decisions (termination, discipline, ' +
  'accommodation), tell the user to consult qualified legal counsel.'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
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
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const token = authHeader.replace('Bearer ', '')

  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  const user = userData?.user
  if (userError || !user) return json({ error: 'Invalid user token' }, 401)

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return json({ error: 'message is required' }, 400)
  const conversationId = typeof body.conversation_id === 'string' ? body.conversation_id : null
  const organizationId = typeof body.organization_id === 'string' ? body.organization_id : null

  const { data: route, error: routeError } = await adminClient
    .from('ai_model_routes')
    .select(
      'id, model_name, config, provider:ai_model_providers(id, provider_key, base_url, secret_ref, status)',
    )
    .eq('route_key', 'advisor_chat')
    .eq('status', 'active')
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (routeError) return json({ error: routeError.message }, 500)
  const provider = route?.provider as
    | { id: string; provider_key: string; base_url: string; secret_ref: string; status: string }
    | null
    | undefined
  if (!route || !provider || provider.status !== 'active') {
    return json({ error: 'No active model route configured for advisor_chat' }, 503)
  }

  const apiKey = Deno.env.get(provider.secret_ref)
  if (!apiKey) return json({ error: `Missing secret ${provider.secret_ref}` }, 500)

  let conversation: { id: string; messages: ChatMessage[] }
  if (conversationId) {
    const { data, error } = await adminClient
      .from('conversations')
      .select('id, messages')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()
    if (error || !data) return json({ error: 'Conversation not found' }, 404)
    conversation = data as { id: string; messages: ChatMessage[] }
  } else {
    const { data, error } = await adminClient
      .from('conversations')
      .insert({ user_id: user.id, organization_id: organizationId, messages: [] })
      .select('id, messages')
      .single()
    if (error) return json({ error: error.message }, 500)
    conversation = data as { id: string; messages: ChatMessage[] }
  }

  const history = Array.isArray(conversation.messages) ? conversation.messages : []
  const userMessage: ChatMessage = { role: 'user', content: message }

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
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, userMessage],
        max_tokens: (route.config as { max_tokens?: number } | null)?.max_tokens ?? 800,
      }),
    })
    if (!upstream.ok) {
      const errText = await upstream.text()
      throw new Error(`Upstream ${upstream.status}: ${errText.slice(0, 500)}`)
    }
    completion = await upstream.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    await adminClient.from('ai_telemetry_events').insert({
      organization_id: organizationId,
      user_id: user.id,
      provider: provider.provider_key,
      model: route.model_name,
      operation: 'chat',
      status: 'error',
      latency_ms: Date.now() - started,
      metadata: { error: errorMessage },
    })
    return json({ error: 'The AI Advisor is temporarily unavailable. Try again shortly.' }, 502)
  }

  const latencyMs = Date.now() - started
  const reply = completion.choices?.[0]?.message?.content ?? ''
  const usage = completion.usage ?? {}
  const assistantMessage: ChatMessage = { role: 'assistant', content: reply }
  const nextMessages = [...history, userMessage, assistantMessage]

  const { error: updateError } = await adminClient
    .from('conversations')
    .update({ messages: nextMessages, updated_at: new Date().toISOString() })
    .eq('id', conversation.id)
  if (updateError) return json({ error: updateError.message }, 500)

  await adminClient.from('ai_telemetry_events').insert({
    organization_id: organizationId,
    user_id: user.id,
    provider: provider.provider_key,
    model: route.model_name,
    operation: 'chat',
    prompt_tokens: usage.prompt_tokens ?? null,
    completion_tokens: usage.completion_tokens ?? null,
    total_tokens: usage.total_tokens ?? null,
    latency_ms: latencyMs,
    status: 'completed',
  })

  return json({ data: { reply, conversation_id: conversation.id } })
})
