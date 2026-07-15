import type { ReactNode } from 'react'
import { cx } from './cx'

interface SidebarTooltipProps {
  children: ReactNode
  label: string
  show: boolean
  position?: 'right' | 'bottom'
}

export function SidebarTooltip({ children, label, show, position = 'right' }: SidebarTooltipProps) {
  if (!show) return <>{children}</>
  return (
    <div className="group relative flex">
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute z-80 hidden whitespace-nowrap rounded-[6px] bg-surface px-[8px] py-[4px] text-[11px] font-medium text-text shadow-[0_4px_16px_rgba(0,0,0,0.18)] ring-1 ring-border',
          'group-hover:block group-focus-within:block group-focus-visible:block',
          position === 'right'
            ? 'left-full top-1/2 ml-[8px] -translate-y-1/2'
            : 'top-full left-1/2 mt-[6px] -translate-x-1/2',
        )}
      >
        {label}
      </span>
    </div>
  )
}
