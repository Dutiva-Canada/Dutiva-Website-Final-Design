import type { LucideIcon } from 'lucide-react'

/**
 * Small icon + label chip used by the template categories and modules rows.
 *
 * `note` appends a muted tag inside the chip — used to mark a module as
 * roadmap rather than shipped. It reads as part of the label, not as a
 * separate legend the eye can skip, because the claim it qualifies is the
 * one CANONICAL_FACTS §4 is about.
 */
export function IconChip({
  icon: Icon,
  label,
  note,
}: {
  readonly icon: LucideIcon
  readonly label: string
  readonly note?: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-bg-soft px-3 py-2 text-sm font-medium text-text-2">
      <Icon size={14} />
      {label}
      {note !== undefined && (
        <span className="rounded-[6px] bg-bg-elevated px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-text-muted uppercase">
          {note}
        </span>
      )}
    </span>
  )
}
