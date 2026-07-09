import { useI18n } from '@/i18n/context'
import { homeMessages as M } from '@/i18n/messages/home'
import { statusChipBaseClass, chipToneClass } from '@/components/chips'
import { homeWorkflows, workflowFillWidth } from './homeData'
import type { HomeAction, HomeWorkflow } from './homeData'

/**
 * WorkflowCards — the "Workflows in flight" list. Two placements, per the
 * prototype's Home markup: `rail` (desktop right column, lines 517–532) and
 * `mobile` (after Act now on phones, lines 430–445).
 */

function WorkflowRisk({ w, small }: { w: HomeWorkflow; small: boolean }) {
  const { x } = useI18n()
  if (!w.riskLabel) return null
  return (
    <span
      className={`${statusChipBaseClass} ${chipToneClass(w.riskTone)} ${
        small ? 'px-[8px] py-[1px] text-[10.5px]' : ''
      }`}
    >
      {x(w.riskLabel)}
    </span>
  )
}

function WorkflowProgress({ w, gapTop }: { w: HomeWorkflow; gapTop: string }) {
  const { x } = useI18n()
  return (
    <div className={`flex items-center gap-[8px] ${gapTop}`}>
      <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-inset">
        <div className="h-full rounded-full bg-navy" style={{ width: workflowFillWidth(w) }} />
      </div>
      <span className="text-[11px] font-bold whitespace-nowrap text-text-3">{x(w.stepLabel)}</span>
    </div>
  )
}

function WorkflowMetaLines({ w }: { w: HomeWorkflow }) {
  const { x } = useI18n()
  return (
    <>
      <div className="mt-[4px] text-[11.5px] text-text-3">
        <span className="text-text-muted">{x(M.home_wf_next)}</span> · {x(w.next)}
      </div>
      <div className="mt-[3px] text-[10.5px] text-text-muted">
        {x(w.dueLabel)} · {x(w.docsLabel)} · <span className="text-gold-fg">{x(w.impact)}</span>
      </div>
    </>
  )
}

/** Desktop right-rail card (`showRailWorkflows`). */
export function HomeWorkflowsRailCard({ onAction }: { onAction: (action: HomeAction) => void }) {
  const { x } = useI18n()
  return (
    <div className="hidden rounded-[12px] border border-border bg-surface px-[16px] py-[15px] sm:block">
      <div className="mb-[11px] flex items-baseline justify-between">
        <span className="text-[12.5px] font-bold text-text">{x(M.home_wf_title)}</span>
        <button
          type="button"
          onClick={() => onAction({ kind: 'route', to: '/app/workflows' })}
          className="cursor-pointer border-none bg-transparent p-0 font-sans text-[11.5px] font-semibold text-gold-fg"
        >
          {x(M.home_wf_all)}
        </button>
      </div>
      <div className="flex flex-col gap-[13px]">
        {homeWorkflows.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onAction(w.action)}
            className="block w-full cursor-pointer border-none bg-transparent p-0 text-left font-sans"
          >
            <div className="flex flex-wrap items-center gap-[7px]">
              <span className="text-[12.5px] font-semibold text-text">{x(w.name)}</span>
              <WorkflowRisk w={w} small />
              <span className="ml-auto overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-text-muted">
                {x(w.person)}
              </span>
            </div>
            <WorkflowProgress w={w} gapTop="mt-[5px]" />
            <WorkflowMetaLines w={w} />
          </button>
        ))}
      </div>
    </div>
  )
}

/** Mobile list, directly after Act now (`showMobileWorkflows`). */
export function HomeWorkflowsMobileList({ onAction }: { onAction: (action: HomeAction) => void }) {
  const { x } = useI18n()
  return (
    <div className="sm:hidden">
      <div className="mb-[7px] flex items-baseline justify-between">
        <span className="text-[11px] font-bold tracking-[0.05em] text-text-muted uppercase">
          {x(M.home_wf_title)}
        </span>
        <button
          type="button"
          onClick={() => onAction({ kind: 'route', to: '/app/workflows' })}
          className="cursor-pointer border-none bg-transparent p-0 font-sans text-[11.5px] font-semibold text-gold-fg"
        >
          {x(M.home_wf_all)}
        </button>
      </div>
      <div className="rounded-[12px] border border-border bg-surface px-[14px] py-[4px]">
        {homeWorkflows.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onAction(w.action)}
            className="block w-full cursor-pointer border-t border-t-border-soft bg-transparent py-[11px] text-left font-sans"
          >
            <div className="flex flex-wrap items-center gap-[8px]">
              <span className="text-[12.5px] font-semibold text-text">{x(w.name)}</span>
              <WorkflowRisk w={w} small={false} />
              <span className="ml-auto text-[11px] text-text-muted">{x(w.person)}</span>
            </div>
            <WorkflowProgress w={w} gapTop="mt-[6px]" />
            <WorkflowMetaLines w={w} />
          </button>
        ))}
      </div>
    </div>
  )
}
