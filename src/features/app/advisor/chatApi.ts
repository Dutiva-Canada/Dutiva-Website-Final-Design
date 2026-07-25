import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import { advisorResponseSchema } from './contract'
import type { AdvisorResponse } from './contract'
import { applySafetyBackstop } from './safety'

/**
 * Real AI Advisor replies — calls the `advisor-chat` edge function (bearer
 * JWT via the current Supabase session). See supabase/functions/advisor-chat
 * for the server side: route lookup, engine call, conversation persistence,
 * telemetry.
 *
 * The engine contract (`POST /api/advisor/respond`, Engineering Roadmap P0)
 * adds a structured `advisor_response` payload alongside the conversational
 * reply. It is optional here so the app keeps working against an engine that
 * only returns text: when present and valid it feeds the Compliance
 * Workspace; when absent or malformed the reply still renders and the
 * workspace shows nothing rather than an unvalidated payload.
 *
 * A validated payload is then passed through the deterministic safety backstop
 * (`./safety`, docs/AI_USAGE_STRATEGY.md §5) before it reaches the workspace —
 * client-side defense-in-depth that can only tighten gates (crisis intercept,
 * jurisdiction/statutory-figure gate), never loosen them.
 */

const advisorChatResponseSchema = z.object({
  data: z.object({
    reply: z.string(),
    conversation_id: z.string(),
    advisor_response: z.unknown().optional(),
  }),
})

export interface AdvisorChatResult {
  reply: string
  conversationId: string
  /** Validated structured payload, or null if the engine didn't send one. */
  response: AdvisorResponse | null
}

export async function sendAdvisorMessage(
  message: string,
  conversationId: string | null,
): Promise<AdvisorChatResult> {
  if (!supabase) {
    throw new Error('Real AI Advisor replies are not configured in this environment.')
  }
  const { data, error } = await supabase.functions.invoke('advisor-chat', {
    body: { message, conversation_id: conversationId },
  })
  if (error) throw error
  const parsed = advisorChatResponseSchema.parse(data)
  let response: AdvisorResponse | null = null
  if (parsed.data.advisor_response !== undefined) {
    const structured = advisorResponseSchema.safeParse(parsed.data.advisor_response)
    if (structured.success) {
      response = applySafetyBackstop({
        userMessage: message,
        reply: parsed.data.reply,
        response: structured.data,
      }).response
    } else {
      console.warn('advisor: structured payload failed contract validation', structured.error)
    }
  }
  return { reply: parsed.data.reply, conversationId: parsed.data.conversation_id, response }
}
