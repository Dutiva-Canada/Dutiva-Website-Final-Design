import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import type { Bi } from '@/i18n/core'
import { bi } from '@/i18n/core'

/**
 * Real persistence for the Employees roster (production mode) — reads and
 * writes `public.employees`, org-scoped by RLS (see migration 0006). Unlike
 * the workspaceMode api (which degrades silently because it runs for every
 * visitor), these throw on failure: they only ever run for the signed-in
 * admin in production mode, where an error must surface, not vanish.
 */

export type ProductionEmployeeStatus = 'active' | 'on_leave' | 'terminated'

export interface ProductionEmployee {
  id: string
  name: string
  title: string | null
  email: string | null
  province: string
  startDate: string | null
  status: ProductionEmployeeStatus
}

export interface NewEmployee {
  name: string
  title: string
  email: string
  province: string
  startDate: string
}

const rowSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().nullable(),
  email: z.string().nullable(),
  province: z.string(),
  start_date: z.string().nullable(),
  status: z.enum(['active', 'on_leave', 'terminated']),
})

const SELECT_COLUMNS = 'id, name, title, email, province, start_date, status'

function toEmployee(row: z.infer<typeof rowSchema>): ProductionEmployee {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    email: row.email,
    province: row.province,
    startDate: row.start_date,
    status: row.status,
  }
}

export async function listEmployees(organizationId: string): Promise<ProductionEmployee[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('employees')
    .select(SELECT_COLUMNS)
    .eq('organization_id', organizationId)
    .order('name')
  if (error) throw error
  return z.array(rowSchema).parse(data).map(toEmployee)
}

export async function addEmployee(
  organizationId: string,
  fields: NewEmployee,
): Promise<ProductionEmployee> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('employees')
    .insert({
      organization_id: organizationId,
      name: fields.name,
      title: fields.title || null,
      email: fields.email || null,
      province: fields.province,
      start_date: fields.startDate || null,
    })
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw error
  return toEmployee(rowSchema.parse(data))
}

export async function removeEmployee(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw error
}

/* ── Employee profile (Phase 12): single fetch, status, notes thread ────── */

export interface ProductionEmployeeNote {
  id: string
  body: string
  /** ISO timestamp — displayed date-only. */
  createdAt: string
}

const noteRowSchema = z.object({
  id: z.string(),
  body: z.string(),
  created_at: z.string(),
})

export async function getEmployee(id: string): Promise<ProductionEmployee | null> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('employees')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return toEmployee(rowSchema.parse(data))
}

export async function updateEmployeeStatus(
  id: string,
  status: ProductionEmployeeStatus,
): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase
    .from('employees')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function listEmployeeNotes(employeeId: string): Promise<ProductionEmployeeNote[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('hr_employee_notes')
    .select('id, body, created_at')
    .eq('employee_id', employeeId)
    .order('created_at')
  if (error) throw error
  return z
    .array(noteRowSchema)
    .parse(data)
    .map((r) => ({ id: r.id, body: r.body, createdAt: r.created_at }))
}

export async function addEmployeeNote(
  organizationId: string,
  employeeId: string,
  body: string,
): Promise<ProductionEmployeeNote> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('hr_employee_notes')
    .insert({ organization_id: organizationId, employee_id: employeeId, body })
    .select('id, body, created_at')
    .single()
  if (error) throw error
  const row = noteRowSchema.parse(data)
  return { id: row.id, body: row.body, createdAt: row.created_at }
}

/**
 * Province of employment options — DB stores the EN name (matches the
 * `profiles.province` convention); the form displays the active language.
 */
export const EMPLOYMENT_PROVINCES: readonly Bi[] = [
  bi('Alberta', 'Alberta'),
  bi('British Columbia', 'Colombie-Britannique'),
  bi('Manitoba', 'Manitoba'),
  bi('New Brunswick', 'Nouveau-Brunswick'),
  bi('Newfoundland and Labrador', 'Terre-Neuve-et-Labrador'),
  bi('Northwest Territories', 'Territoires du Nord-Ouest'),
  bi('Nova Scotia', 'Nouvelle-Écosse'),
  bi('Nunavut', 'Nunavut'),
  bi('Ontario', 'Ontario'),
  bi('Prince Edward Island', 'Île-du-Prince-Édouard'),
  bi('Quebec', 'Québec'),
  bi('Saskatchewan', 'Saskatchewan'),
  bi('Yukon', 'Yukon'),
]
