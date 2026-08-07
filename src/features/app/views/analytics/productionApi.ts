import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'

/**
 * Real persistence for the one thing Analytics can't recompute later: score
 * history — public.compliance_score_snapshots, org-scoped by RLS (migration
 * 0062). One row per org per month. Everything else on the page aggregates
 * live through the other modules' productionApi boundaries.
 *
 * Same boundary contract as those modules: zod-validated rows, throws on
 * failure (these calls only run for the signed-in admin in production).
 */

export interface ScoreSnapshot {
  /** First day of the month, YYYY-MM-DD. */
  monthISO: string
  score: number
}

export interface SnapshotComponent {
  key: string
  done: number
  total: number
}

const rowSchema = z.object({
  month: z.string(),
  score: z.number(),
})

export async function listScoreSnapshots(organizationId: string): Promise<ScoreSnapshot[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('compliance_score_snapshots')
    .select('month, score')
    .eq('organization_id', organizationId)
    .order('month', { ascending: true })
  if (error) throw error
  return z
    .array(rowSchema)
    .parse(data)
    .map((row) => ({ monthISO: row.month, score: row.score }))
}

/**
 * Upsert the current month's snapshot with the freshly computed live score.
 * Fire-and-forget from the view: recording history is an enhancement — a
 * failure must never take the dashboard down, so callers catch and drop.
 */
export async function recordScoreSnapshot(
  organizationId: string,
  monthISO: string,
  score: number,
  components: readonly SnapshotComponent[],
): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const componentsJson = Object.fromEntries(
    components.map((c) => [c.key, { done: c.done, total: c.total }]),
  )
  const { error } = await supabase.from('compliance_score_snapshots').upsert(
    {
      organization_id: organizationId,
      month: monthISO,
      score,
      components: componentsJson,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,month' },
  )
  if (error) throw error
}
