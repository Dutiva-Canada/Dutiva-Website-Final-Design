import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import type { WorkspaceMode } from './workspaceModeContext'

export interface AdminProfile {
  companyName: string
  contactName: string
}

const preferenceRowSchema = z.object({ mode: z.enum(['demo', 'production']) })

const profileRowSchema = z.object({
  legal_name: z.string().nullable(),
  company_name: z.string().nullable(),
  primary_contact: z.string().nullable(),
})

/**
 * Real backend reads behind the workspace mode toggle. Every function
 * degrades to the safe "demo"/non-admin answer when Supabase isn't
 * configured, the call fails, or the client doesn't implement a method
 * (e.g. a test double stubbing only the auth surface) — this feature must
 * never throw and strand the app, so each call is wrapped defensively.
 */

/** True only for a confirmed admin — the real is_admin_user() RPC, not a hardcoded email. */
export async function checkIsAdmin(): Promise<boolean> {
  if (!supabase) return false
  try {
    const { data, error } = await supabase.rpc('is_admin_user')
    return !error && data === true
  } catch {
    return false
  }
}

export async function fetchStoredMode(userId: string): Promise<WorkspaceMode> {
  if (!supabase) return 'demo'
  try {
    const { data, error } = await supabase
      .from('workspace_preferences')
      .select('mode')
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return 'demo'
    return preferenceRowSchema.parse(data).mode
  } catch {
    return 'demo'
  }
}

export async function saveStoredMode(userId: string, mode: WorkspaceMode): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('workspace_preferences')
      .upsert({ user_id: userId, mode, updated_at: new Date().toISOString() })
    return !error
  } catch {
    return false
  }
}

export async function fetchAdminProfile(userId: string): Promise<AdminProfile | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('legal_name, company_name, primary_contact')
      .eq('id', userId)
      .maybeSingle()
    if (error || !data) return null
    const row = profileRowSchema.parse(data)
    return {
      companyName: row.legal_name ?? row.company_name ?? 'Dutiva Canada Inc.',
      contactName: row.primary_contact ?? 'Martin Constantineau',
    }
  } catch {
    return null
  }
}
