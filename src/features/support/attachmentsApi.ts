import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'

/**
 * Ticket attachments. Files upload straight to the private `support-attachments`
 * bucket (storage RLS lets a user write only under their own uid prefix); the
 * `support-attachment-action` edge function then records the metadata with the
 * service role (validating ownership + path + MIME + size) and mints short-lived
 * signed URLs for downloads. Listing goes through the session client — RLS scopes
 * it to tickets the caller may see.
 */

const BUCKET = 'support-attachments'
export const ATTACHMENT_MAX_SIZE = 26214400 // 25 MB (matches the bucket + function)
export const ATTACHMENT_ALLOWED_MIME: readonly string[] = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export type AttachmentValidationError = 'too_large' | 'bad_type'

export function validateAttachment(file: { size: number; type: string }): AttachmentValidationError | null {
  if (file.size > ATTACHMENT_MAX_SIZE) return 'too_large'
  if (!ATTACHMENT_ALLOWED_MIME.includes(file.type)) return 'bad_type'
  return null
}

export interface SupportAttachment {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  scanStatus: string
  createdAt: string
}

const attachmentSchema = z.object({
  id: z.string(),
  file_name: z.string(),
  mime_type: z.string(),
  size_bytes: z.number(),
  scan_status: z.string(),
  created_at: z.string(),
})

function toAttachment(r: z.infer<typeof attachmentSchema>): SupportAttachment {
  return {
    id: r.id,
    fileName: r.file_name,
    mimeType: r.mime_type,
    sizeBytes: r.size_bytes,
    scanStatus: r.scan_status,
    createdAt: r.created_at,
  }
}

/** Keep object keys filesystem-safe; the display name stays the original. */
function sanitizeName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  return cleaned.replace(/^[._]+/, '') || 'file'
}

export async function listAttachments(ticketId: string): Promise<SupportAttachment[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('support_attachments')
    .select('id, file_name, mime_type, size_bytes, scan_status, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return z.array(attachmentSchema).parse(data ?? []).map(toAttachment)
}

export async function uploadAttachment(ticketId: string, file: File): Promise<SupportAttachment> {
  if (!supabase) throw new Error('Attachments are not available in this environment.')
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData?.user?.id
  if (!uid) throw new Error('You must be signed in to attach a file.')

  const path = `${uid}/${ticketId}/${Date.now()}-${sanitizeName(file.name)}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase.functions.invoke('support-attachment-action', {
    body: {
      action: 'record',
      ticket_id: ticketId,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    },
  })
  if (error) {
    // Recording failed — remove the orphaned object (best effort).
    await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined)
    throw error
  }
  return toAttachment(attachmentSchema.parse((data as { data: unknown }).data))
}

export async function getAttachmentDownloadUrl(attachmentId: string): Promise<string> {
  if (!supabase) throw new Error('Attachments are not available in this environment.')
  const { data, error } = await supabase.functions.invoke('support-attachment-action', {
    body: { action: 'sign', attachment_id: attachmentId },
  })
  if (error) throw error
  return z.object({ data: z.object({ url: z.string() }) }).parse(data).data.url
}

/** Human-readable size (KB/MB) for the attachment list. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
