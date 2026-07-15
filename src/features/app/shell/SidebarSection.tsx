import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from './cx'

interface SidebarSectionProps {
  readonly id: string
  readonly heading: string
  readonly expanded: boolean
  readonly open: boolean
  readonly onToggle: () => void
  readonly children: ReactNode
}

export function SidebarSection({
  id,
  heading,
  expanded,
  open,
  onToggle,
  children,
}: SidebarSectionProps) {
  const panelId = `${id}-panel`

  return (
    <div className="flex flex-col">
      {expanded && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-[10px] pt-[14px] pb-[6px] text-left"
        >
          <span className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
            {heading}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className={cx(
              'shrink-0 text-text-muted transition-transform duration-150 ease-in-out motion-reduce:transition-none',
              open ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden="true"
          />
        </button>
      )}
      <div
        id={expanded ? panelId : undefined}
        className={cx(
          'transition-[grid-template-rows,opacity] duration-150 ease-in-out motion-reduce:transition-none',
          expanded ? 'grid' : 'block',
          expanded && open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className={cx(expanded && 'overflow-hidden')}>{children}</div>
      </div>
    </div>
  )
}
