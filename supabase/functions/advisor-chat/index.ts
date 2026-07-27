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
  'accommodation), tell the user to consult qualified legal counsel.\n\n' +
  'Be factual and grounded at all times. Do not go along with statements just to be ' +
  'agreeable: if the user says something inaccurate — even something small, like ' +
  'greeting you with "Good evening" when it is morning — respond with the correct ' +
  'fact (e.g., "Good morning") rather than echoing the mistake, then continue ' +
  'helping. When you are unsure of a fact, say so instead of guessing.\n\n' +
  'Statutory precision: never cite bill numbers, section or regulation numbers, or ' +
  'court cases from memory — name the governing law in general terms instead (e.g., ' +
  '"the Ontario Employment Standards Act", "the Loi sur les normes du travail", ' +
  '"the Canada Labour Code"). Only state a specific statutory figure (weeks of ' +
  'notice, dollar thresholds, percentages) when you are confident it is current; ' +
  'otherwise say you are not certain and point the user to the official source ' +
  '(Ontario.ca, the CNESST, or Canada.ca). When the jurisdiction is unknown and it ' +
  'changes the answer, ask for it before giving figures. Employment rules change — ' +
  'when giving figures, remind the user to verify against the official source.'

/* The model has no clock — without an explicit timestamp it can only infer the
   time of day from what the user says, which is how "Good evening" gets
   mirrored back in the morning. The client sends its IANA timezone; anything
   invalid falls back to UTC (Intl throws on bad zone names, which also keeps
   unvetted client input out of the prompt). */
function currentTimeLine(timezone: string | null): string {
  let tz = 'UTC'
  if (timezone) {
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: timezone })
      tz = timezone
    } catch {
      /* invalid timezone from client — keep UTC */
    }
  }
  const formatted = new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: tz,
  }).format(new Date())
  return `Current date and time for the user: ${formatted} (${tz}).`
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type SupabaseClient = ReturnType<typeof createClient>

interface ServerConfig {
  supabaseUrl: string
  anonKey: string
  serviceRoleKey: string
}

interface AuthenticatedRequest {
  adminClient: SupabaseClient
  user: { id: string; email?: string }
}

interface ChatRequest {
  message: string
  conversationId: string | null
  organizationId: string | null
  timezone: string | null
}

interface ModelProvider {
  id: string
  provider_key: string
  base_url: string
  secret_ref: string
  status: string
}

interface ModelRoute {
  model_name: string
  config: { max_tokens?: number; temperature?: number } | null
}

interface ActiveModelRoute {
  route: ModelRoute
  provider: ModelProvider
}

interface Conversation {
  id: string
  messages: ChatMessage[]
}

interface Completion {
  choices?: { message?: { content?: string } }[]
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
}

interface GuidanceChunk {
  title: string
  content: string
  source_url: string
  source_name: string
  jurisdiction: string
  effective_note: string | null
}

/**
 * Ranked full-text retrieval over the curated grounding corpus — the
 * match_advisor_guidance RPC (migration 0023: OR-ed lexemes ordered by
 * ts_rank; strict websearch matching returns zero rows on conversational
 * questions). Additive: any failure returns no chunks and the reply
 * proceeds under the prompt's statutory-precision fallback rules —
 * retrieval must never take the Advisor down.
 */
async function retrieveGuidance(
  adminClient: SupabaseClient,
  message: string,
): Promise<GuidanceChunk[]> {
  try {
    const { data, error } = await adminClient.rpc('match_advisor_guidance', {
      q: message,
      k: 4,
    })
    if (error) return []
    return (data as GuidanceChunk[] | null) ?? []
  } catch {
    return []
  }
}

function guidanceBlock(chunks: GuidanceChunk[]): string {
  if (chunks.length === 0) return ''
  const items = chunks
    .map((c) => {
      const effective = c.effective_note ? `; ${c.effective_note}` : ''
      return `- [${c.jurisdiction}] ${c.title}: ${c.content} (Source: ${c.source_name}, ${c.source_url}${effective})`
    })
    .join('\n')
  return (
    "\n\nRetrieved guidance from Dutiva's curated corpus — each entry carries its official " +
    'source. Treat these entries as the ONLY authoritative basis for statutory figures this ' +
    'turn: when they cover the question, answer from them and name the source; when they do ' +
    'not cover it, follow the statutory-precision rules above.\n' +
    items
  )
}

function serverConfig(): ServerConfig | Response {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Server configuration missing' }, 500)
  }
  return { supabaseUrl, anonKey, serviceRoleKey }
}

async function authenticateRequest(
  req: Request,
  config: ServerConfig,
): Promise<AuthenticatedRequest | Response> {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing bearer token' }, 401)

  const userClient = createClient(config.supabaseUrl, config.anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const token = authHeader.replace('Bearer ', '')
  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  const user = userData?.user
  if (userError || !user) return json({ error: 'Invalid user token' }, 401)

  /* Invite-only, single account — same restriction enforced at the RLS
     layer for direct guidance_sources/law_updates reads (see
     supabase/migrations/0011_restrict_guidance_law_updates_to_single_admin.sql
     and src/features/app/auth/allowedEmail.ts, the source of truth this
     mirrors). This function uses a service-role client that bypasses RLS,
     so it needs its own check regardless. */
  const ALLOWED_EMAIL = 'martin.constantineau@dutiva.ca'
  if (!user.email || user.email.trim().toLowerCase() !== ALLOWED_EMAIL) {
    return json({ error: 'Access to this workspace is invite-only.' }, 403)
  }

  return { user, adminClient: createClient(config.supabaseUrl, config.serviceRoleKey) }
}

async function readChatRequest(req: Request): Promise<ChatRequest | Response> {
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) return json({ error: 'message is required' }, 400)
  return {
    message,
    conversationId: typeof body.conversation_id === 'string' ? body.conversation_id : null,
    organizationId: typeof body.organization_id === 'string' ? body.organization_id : null,
    timezone: typeof body.timezone === 'string' ? body.timezone : null,
  }
}

async function activeModelRoute(adminClient: SupabaseClient): Promise<ActiveModelRoute | Response> {
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
  const provider = route?.provider as ModelProvider | null | undefined
  if (!route || !provider || provider.status !== 'active') {
    return json({ error: 'No active model route configured for advisor_chat' }, 503)
  }
  return { route, provider }
}

async function loadConversation(
  adminClient: SupabaseClient,
  userId: string,
  organizationId: string | null,
  conversationId: string | null,
): Promise<Conversation | Response> {
  if (conversationId) {
    const { data, error } = await adminClient
      .from('conversations')
      .select('id, messages')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single()
    if (error || !data) return json({ error: 'Conversation not found' }, 404)
    return data as Conversation
  }

  const { data, error } = await adminClient
    .from('conversations')
    .insert({ user_id: userId, organization_id: organizationId, messages: [] })
    .select('id, messages')
    .single()
  if (error) return json({ error: error.message }, 500)
  return data as Conversation
}

async function recordUpstreamError(
  adminClient: SupabaseClient,
  request: ChatRequest,
  userId: string,
  provider: ModelProvider,
  route: ModelRoute,
  started: number,
  error: unknown,
): Promise<Response> {
  const errorMessage = error instanceof Error ? error.message : String(error)
  await adminClient.from('ai_telemetry_events').insert({
    organization_id: request.organizationId,
    user_id: userId,
    provider: provider.provider_key,
    model: route.model_name,
    operation: 'chat',
    status: 'error',
    latency_ms: Date.now() - started,
    metadata: { error: errorMessage },
  })
  return json({ error: 'The AI Advisor is temporarily unavailable. Try again shortly.' }, 502)
}

async function requestCompletion(
  adminClient: SupabaseClient,
  request: ChatRequest,
  userId: string,
  route: ModelRoute,
  provider: ModelProvider,
  history: ChatMessage[],
  userMessage: ChatMessage,
  guidance: string,
): Promise<{ completion: Completion; latencyMs: number } | Response> {
  const apiKey = Deno.env.get(provider.secret_ref)
  if (!apiKey) return json({ error: `Missing secret ${provider.secret_ref}` }, 500)

  const started = Date.now()
  try {
    const upstream = await fetch(`${provider.base_url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: route.model_name,
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_PROMPT}\n\n${currentTimeLine(request.timezone)}${guidance}`,
          },
          ...history,
          userMessage,
        ],
        max_tokens: route.config?.max_tokens ?? 800,
        /* DB-tunable so a model that pins sampling (some reasoning models
           reject temperature != 1) needs a config change, not a deploy. The
           typeof guard keeps a jsonb null or string from reaching the wire. */
        ...(typeof route.config?.temperature === 'number'
          ? { temperature: route.config.temperature }
          : {}),
      }),
    })
    if (!upstream.ok) {
      const errText = await upstream.text()
      throw new Error(`Upstream ${upstream.status}: ${errText.slice(0, 500)}`)
    }
    return { completion: await upstream.json(), latencyMs: Date.now() - started }
  } catch (error) {
    return recordUpstreamError(adminClient, request, userId, provider, route, started, error)
  }
}

async function saveConversation(
  adminClient: SupabaseClient,
  conversation: Conversation,
  messages: ChatMessage[],
): Promise<Response | null> {
  const { error } = await adminClient
    .from('conversations')
    .update({ messages, updated_at: new Date().toISOString() })
    .eq('id', conversation.id)
  return error ? json({ error: error.message }, 500) : null
}

async function recordCompletion(
  adminClient: SupabaseClient,
  request: ChatRequest,
  userId: string,
  route: ModelRoute,
  provider: ModelProvider,
  completion: Completion,
  latencyMs: number,
  retrievedChunks: number,
) {
  const usage = completion.usage ?? {}
  await adminClient.from('ai_telemetry_events').insert({
    organization_id: request.organizationId,
    user_id: userId,
    provider: provider.provider_key,
    model: route.model_name,
    operation: 'chat',
    prompt_tokens: usage.prompt_tokens ?? null,
    completion_tokens: usage.completion_tokens ?? null,
    total_tokens: usage.total_tokens ?? null,
    latency_ms: latencyMs,
    status: 'completed',
    metadata: { retrieved_chunks: retrievedChunks },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const config = serverConfig()
  if (config instanceof Response) return config
  const authenticated = await authenticateRequest(req, config)
  if (authenticated instanceof Response) return authenticated
  const request = await readChatRequest(req)
  if (request instanceof Response) return request
  const activeRoute = await activeModelRoute(authenticated.adminClient)
  if (activeRoute instanceof Response) return activeRoute
  const conversation = await loadConversation(
    authenticated.adminClient,
    authenticated.user.id,
    request.organizationId,
    request.conversationId,
  )
  if (conversation instanceof Response) return conversation

  const fullHistory = Array.isArray(conversation.messages) ? conversation.messages : []
  /* Cap what goes upstream: the full transcript persists in `conversations`,
     but an unbounded prompt grows cost/latency every turn and eventually
     overflows the context window. 20 messages = 10 user/assistant
     exchanges — far beyond real usage. */
  const history = fullHistory.slice(-20)
  const userMessage: ChatMessage = { role: 'user', content: request.message }
  const guidanceChunks = await retrieveGuidance(authenticated.adminClient, request.message)
  const completionResult = await requestCompletion(
    authenticated.adminClient,
    request,
    authenticated.user.id,
    activeRoute.route,
    activeRoute.provider,
    history,
    userMessage,
    guidanceBlock(guidanceChunks),
  )
  if (completionResult instanceof Response) return completionResult

  const reply = completionResult.completion.choices?.[0]?.message?.content ?? ''
  const nextMessages = [
    ...fullHistory,
    userMessage,
    { role: 'assistant' as const, content: reply },
  ]
  const updateResponse = await saveConversation(
    authenticated.adminClient,
    conversation,
    nextMessages,
  )
  if (updateResponse) return updateResponse
  await recordCompletion(
    authenticated.adminClient,
    request,
    authenticated.user.id,
    activeRoute.route,
    activeRoute.provider,
    completionResult.completion,
    completionResult.latencyMs,
    guidanceChunks.length,
  )

  return json({ data: { reply, conversation_id: conversation.id } })
})
