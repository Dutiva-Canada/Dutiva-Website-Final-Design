import { Search } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { shellMessages as M } from '@/i18n/messages/shell'
import { useSearch } from '@/features/app/search/searchContext'
import { SidebarTooltip } from './SidebarTooltip'

interface SidebarSearchProps {
  readonly expanded: boolean
}

export function SidebarSearch({ expanded }: SidebarSearchProps) {
  const { x } = useI18n()
  const { openSearch } = useSearch()

  if (!expanded) {
    return (
      <SidebarTooltip label={x(M.shell_search)} show>
        <button
          type="button"
          onClick={openSearch}
          aria-label={x(M.shell_search)}
          className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[8px] border border-border bg-transparent text-text-3 hover:bg-inset"
        >
          <Search size={16} strokeWidth={1.8} />
        </button>
      </SidebarTooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={openSearch}
      className="flex w-full cursor-pointer items-center gap-[8px] rounded-[8px] border border-border bg-transparent px-[12px] py-[8px] text-[13px] font-medium text-text-3 hover:bg-inset"
    >
      <Search size={15} strokeWidth={1.8} className="shrink-0" />
      <span className="flex min-w-0 flex-1 items-center gap-[8px] overflow-hidden whitespace-nowrap">
        <span className="flex-1 text-left">{x(M.shell_search)}</span>
        <span className="rounded-[4px] border border-border px-[5px] py-px text-[11px] text-text-faint">
          ⌘K
        </span>
      </span>
    </button>
  )
}
