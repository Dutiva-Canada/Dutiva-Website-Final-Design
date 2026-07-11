import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'

/**
 * Real AI Advisor replies — calls the `advisor-chat` edge function (bearer
 * JWT via the current Supabase session). See supabase/functions/advisor-chat
 * for the server side: route lookup, DigitalOcean Gradient AI call,
 * conversation persistence, telemetry.
 */

const advisorChatResponseSchema = z.object({
  data: z.object({
    reply: z.string(),
    conversation_id: z.string(),
  }),
})

export interface AdvisorChatResult {
  reply: string
  conversationId: string
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
  return { reply: parsed.data.reply, conversationId: parsed.data.conversation_id }
}
