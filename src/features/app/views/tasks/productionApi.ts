import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'

/**
 * Real persistence for Tasks (production mode) — reads and writes the
 * backend's own public.compliance_tasks table (no new migration: it
 * already exists, org-scoped, with RLS letting org members manage their
 * org's tasks). Same boundary contract as the employees/cases
 * productionApis: zod-validated rows, throws on failure.
 *
 * The table's status vocabulary is richer than the checklist UI
 * (open/in_progress/blocked/completed/cancelled) — the view treats
 * 'completed' as done and everything else as open, and only ever writes
 * 'open'/'completed', so rows created by the backend's automation render
 * correctly without the UI needing their full lifecycle yet.
 */

export type ProductionTaskPriority = 'low' | 'medium' | 'high' | 'critical'

export const PRODUCTION_TASK_PRIORITIES: readonly ProductionTaskPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
]

export interface ProductionTask {
  id: string
  title: string
  priority: ProductionTaskPriority
  status: string
  done: boolean
  /** YYYY-MM-DD, derived from the table's timestamptz due_at. */
  dueDate: string | null
}

export interface NewTask {
  title: string
  priority: ProductionTaskPriority
  dueDate: string
}

const rowSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.string(),
  due_at: z.string().nullable(),
})

const SELECT_COLUMNS = 'id, title, priority, status, due_at'

function toTask(row: z.infer<typeof rowSchema>): ProductionTask {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    status: row.status,
    done: row.status === 'completed',
    dueDate: row.due_at ? row.due_at.slice(0, 10) : null,
  }
}

export async function listTasks(organizationId: string): Promise<ProductionTask[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('compliance_tasks')
    .select(SELECT_COLUMNS)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return z.array(rowSchema).parse(data).map(toTask)
}

export async function addTask(organizationId: string, fields: NewTask): Promise<ProductionTask> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('compliance_tasks')
    .insert({
      organization_id: organizationId,
      title: fields.title,
      priority: fields.priority,
      due_at: fields.dueDate || null,
    })
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw error
  return toTask(rowSchema.parse(data))
}

/** Checklist toggle: done ⇄ open, stamping/clearing completed_at. */
export async function setTaskDone(id: string, done: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase
    .from('compliance_tasks')
    .update({
      status: done ? 'completed' : 'open',
      completed_at: done ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function removeTask(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('compliance_tasks').delete().eq('id', id)
  if (error) throw error
}

/** Open-task count for the nav badge — matches the checklist's !done rule. */
export async function countOpenTasks(organizationId: string): Promise<number> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { count, error } = await supabase
    .from('compliance_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .neq('status', 'completed')
  if (error) throw error
  return count ?? 0
}
