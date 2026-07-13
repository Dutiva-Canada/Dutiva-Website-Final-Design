import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'

/**
 * Real persistence for Compliance (production mode) — the backend's own
 * public.compliance_findings table (no new schema: org-scoped, RLS lets
 * org members manage their org's findings, and the AI assessment pipeline
 * writes here too). Same boundary contract as the other productionApis:
 * zod-validated rows, throws on failure.
 *
 * The table's status vocabulary (open/accepted/in_progress/resolved/
 * dismissed) is richer than the register UI — the boundary treats
 * resolved/dismissed as closed, only ever writes 'open'/'resolved', and
 * tolerates the rest so pipeline-created findings render correctly.
 */

export type ProductionFindingSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export const PRODUCTION_FINDING_SEVERITIES: readonly ProductionFindingSeverity[] = [
  'info',
  'low',
  'medium',
  'high',
  'critical',
]

export interface ProductionFinding {
  id: string
  title: string
  description: string | null
  recommendation: string | null
  severity: ProductionFindingSeverity
  status: string
  resolved: boolean
}

export interface NewFinding {
  title: string
  severity: ProductionFindingSeverity
  description: string
  recommendation: string
}

const rowSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  recommendation: z.string().nullable(),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']),
  status: z.string(),
})

const SELECT_COLUMNS = 'id, title, description, recommendation, severity, status'

function toFinding(row: z.infer<typeof rowSchema>): ProductionFinding {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    recommendation: row.recommendation,
    severity: row.severity,
    status: row.status,
    resolved: row.status === 'resolved' || row.status === 'dismissed',
  }
}

export async function listFindings(organizationId: string): Promise<ProductionFinding[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('compliance_findings')
    .select(SELECT_COLUMNS)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return z.array(rowSchema).parse(data).map(toFinding)
}

export async function addFinding(
  organizationId: string,
  fields: NewFinding,
): Promise<ProductionFinding> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('compliance_findings')
    .insert({
      organization_id: organizationId,
      title: fields.title,
      severity: fields.severity,
      description: fields.description || null,
      recommendation: fields.recommendation || null,
    })
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw error
  return toFinding(rowSchema.parse(data))
}

/** Register toggle: resolved ⇄ open, stamping/clearing resolved_at. */
export async function setFindingResolved(id: string, resolved: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase
    .from('compliance_findings')
    .update({
      status: resolved ? 'resolved' : 'open',
      resolved_at: resolved ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function removeFinding(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('compliance_findings').delete().eq('id', id)
  if (error) throw error
}

/** Open-finding count for the nav badge — resolved and dismissed are closed. */
export async function countOpenFindings(organizationId: string): Promise<number> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { count, error } = await supabase
    .from('compliance_findings')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .not('status', 'in', '(resolved,dismissed)')
  if (error) throw error
  return count ?? 0
}
