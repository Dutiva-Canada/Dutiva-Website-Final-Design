import { useI18n } from '@/i18n/context'
import { homeMessages as M } from '@/i18n/messages/home'
import { workflowCatalog } from './homeData'
import type { HomeAction } from './homeData'

/**
 * WorkflowLauncher — the "Start a workflow" tile grid at the bottom of the
 * priority column (prototype Home markup lines 476–488). Each tile starts a
 * fresh Advisor conversation with the workflow's opening prompt.
 */
export function HomeWorkflowCatalog({ onAction }: { onAction: (action: HomeAction) => void }) {
  const { x } = useI18n()
  return (
    <div>
      <div className="mb-[7px] text-[11px] font-bold tracking-[0.05em] text-text-muted uppercase">
        {x(M.home_start_workflow)}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(148px,1fr))] gap-[10px]">
        {workflowCatalog.map((entry) => {
          const Icon = entry.icon
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => onAction({ kind: 'flow', prompt: entry.prompt })}
              className="flex cursor-pointer flex-col items-start gap-[8px] rounded-[11px] border border-border bg-surface p-[12px] text-left font-sans transition-[border-color,transform] duration-150 hover:-translate-y-[1px] hover:border-(--accent-soft-border)"
            >
              <div className="flex h-[27px] w-[27px] items-center justify-center rounded-[7px] bg-navy text-[#F2D9A8]">
                <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-text">{x(entry.label)}</div>
                <div className="mt-[1px] text-[11px] text-text-muted">{x(entry.sub)}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
