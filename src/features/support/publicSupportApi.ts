import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import type { SupportCategory, SupportImpact, SupportUrgency } from '@/config/support'

/**
 * Client for the `create-public-support-ticket` edge function — the
 * unauthenticated intake used by the public Contact page. The server accepts
 * only the `allowPublic` categories, re-validates everything, and rate-limits
 * by IP/email, so this only shapes the payload. `honeypot` maps to the server's
 * hidden `contact_fax` trap; real users leave it empty.
 */

export type PublicSupportErrorCode = 'rate_limited' | 'validation' | 'error'

export class PublicSupportError extends Error {
  constructor(public readonly code: PublicSupportErrorCode) {
    super(code)
    this.name = 'PublicSupportError'
  }
}

export interface PublicSupportRequestInput {
  category: SupportCategory
  email: string
  subject: string
  description: string
  impact: SupportImpact
  urgency: SupportUrgency
  language: 'en' | 'fr'
  preferredResponseMethod: 'email' | 'scheduled_call'
  consent: boolean
  /** Honeypot — always empty for real users. */
  honeypot?: string
}

const responseSchema = z.object({
  data: z.object({
    public_reference: z.string().nullable().optional(),
    ok: z.boolean().optional(),
  }),
})

function errorCodeFromStatus(status: number | undefined): PublicSupportErrorCode {
  if (status === 429) return 'rate_limited'
  if (status === 400 || status === 422) return 'validation'
  return 'error'
}

/**
 * Submit a public request. Returns the ticket reference, or `null` when the
 * honeypot swallowed the submission (the caller still shows a neutral success).
 */
export async function createPublicSupportTicket(
  input: PublicSupportRequestInput,
): Promise<string | null> {
  if (!supabase) throw new Error('Support requests are not available in this environment.')
  const { data, error } = await supabase.functions.invoke('create-public-support-ticket', {
    body: {
      category: input.category,
      email: input.email,
      subject: input.subject,
      description: input.description,
      impact: input.impact,
      urgency: input.urgency,
      language: input.language,
      preferred_response_method: input.preferredResponseMethod,
      consent: input.consent,
      contact_fax: input.honeypot ?? '',
    },
  })
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status
    throw new PublicSupportError(errorCodeFromStatus(status))
  }
  return responseSchema.parse(data).data.public_reference ?? null
}
