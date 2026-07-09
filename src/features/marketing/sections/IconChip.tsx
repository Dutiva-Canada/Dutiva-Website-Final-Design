import type { LucideIcon } from 'lucide-react'

/** Small icon + label chip used by the template categories and modules rows. */
export function IconChip({ icon: Icon, label }: { readonly icon: LucideIcon; readonly label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-bg-soft px-3 py-2 text-sm font-medium text-text-2">
      <Icon size={14} />
      {label}
    </span>
  )
}
