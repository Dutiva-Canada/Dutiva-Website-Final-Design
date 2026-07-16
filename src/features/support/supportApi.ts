import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import type {
  ResponseMethod,
  SupportCategory,
  SupportImpact,
  SupportUrgency,
} from '@/config/support'
import type { SupportDiagnostics } from './diagnostics'

/**
 * Client for the `create-support-ticket` edge function. The server re-validates
 * everything and decides priority + restricted visibility (see the function),
 * so this only shapes the payload and validates the reply.
 */

export interface SupportRequestInput {
  category: SupportCategory
  subject: string
  description: string
  impact: SupportImpact
  urgency: SupportUrgency
  language: 'en' | 'fr'
  preferredResponseMethod: ResponseMethod
  workspaceId?: string | null
  diagnostics?: SupportDiagnostics
}

const responseSchema = z.object({
  data: z.object({
    id: z.string(),
    public_reference: z.string(),
    status: z.string(),
    priority: z.string(),
  }),
})

export interface SupportTicketResult {
  id: string
  publicReference: string
  status: string
  priority: string
}

export async function createSupportTicket(
  input: SupportRequestInput,
): Promise<SupportTicketResult> {
  if (!supabase) {
    throw new Error('Support requests are not available in this environment.')
  }
  const { data, error } = await supabase.functions.invoke('create-support-ticket', {
    body: {
      category: input.category,
      subject: input.subject,
      description: input.description,
      impact: input.impact,
      urgency: input.urgency,
      language: input.language,
      preferred_response_method: input.preferredResponseMethod,
      workspace_id: input.workspaceId ?? null,
      diagnostics: input.diagnostics ?? {},
    },
  })
  if (error) throw error
  const parsed = responseSchema.parse(data)
  return {
    id: parsed.data.id,
    publicReference: parsed.data.public_reference,
    status: parsed.data.status,
    priority: parsed.data.priority,
  }
}
