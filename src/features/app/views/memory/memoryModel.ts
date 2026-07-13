import {
  Briefcase,
  Database,
  FileText,
  Lightbulb,
  MessageCircle,
  Scale,
  UserRoundPen,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Bi } from '@/i18n/core'
import { memoryMessages as M } from '@/i18n/messages/memory'
import type { MemoryCategory, MemoryConfidence, MemorySourceType, MemoryVisibility } from '@/data'

/**
 * Advisor Memory view maps — the prototype's `CONF` / `SRC` / `VIS` and the
 * person-view category order, bound to the design-system tokens.
 */

export const CONFIDENCE_META: Record<MemoryConfidence, { label: Bi; dot: string; badge: string }> =
  {
    confirmed: {
      label: M.memory_confirmed,
      dot: 'bg-ok-fg',
      badge: 'border-ok-border bg-ok-bg text-ok-fg',
    },
    inferred: {
      label: M.memory_inferred,
      dot: 'bg-gold-dot',
      badge: 'border-gold-border bg-gold-bg text-gold-fg',
    },
  }

export const SOURCE_META: Record<MemorySourceType, { icon: LucideIcon; kind: Bi }> = {
  hris: { icon: Database, kind: M.memory_src_hris },
  document: { icon: FileText, kind: M.memory_src_document },
  chat: { icon: MessageCircle, kind: M.memory_src_chat },
  manual: { icon: UserRoundPen, kind: M.memory_src_manual },
  inference: { icon: Lightbulb, kind: M.memory_src_inference },
  case: { icon: Briefcase, kind: M.memory_src_case },
}

export const VISIBILITY_META: Record<
  MemoryVisibility,
  { icon: LucideIcon; label: Bi; className: string }
> = {
  hr: { icon: Users, label: M.memory_vis_hr, className: 'text-text-muted' },
  case: { icon: Scale, label: M.memory_vis_case, className: 'text-gold-fg' },
  restricted: { icon: Scale, label: M.memory_vis_restricted, className: 'text-risk-dot' },
}

export const CATEGORY_LABELS: Record<MemoryCategory, Bi> = {
  employment: M.memory_cat_employment,
  compensation: M.memory_cat_compensation,
  matter: M.memory_cat_matter,
  record: M.memory_cat_record,
  note: M.memory_cat_note,
  case: M.memory_cat_case,
  conversation: M.memory_cat_conversation,
}

/** Person-view grouping order (prototype `order`). */
export const PERSON_CATEGORY_ORDER: MemoryCategory[] = [
  'employment',
  'compensation',
  'matter',
  'record',
  'note',
]
