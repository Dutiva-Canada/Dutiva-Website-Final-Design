import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/context'
import { workspaceModeMessages as M } from '@/i18n/messages/workspaceMode'

/**
 * The shared production-mode empty state ModeGate renders in place of a
 * fixture-driven view: the module's title, the "starts empty" explainer, and
 * a link back to Settings where the Demo/Production toggle lives. Home and
 * Advisor have their own tailored variants; every other gated module shares
 * this one until it grows real persistence.
 */
export function ProductionEmptyState({ title }: { readonly title: string }) {
  const { x } = useI18n()

  return (
    <div className="flex-1 overflow-y-auto px-[24px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[560px] pt-[48px] text-center">
        <div className="mx-auto mb-[16px] flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-inset">
          <Inbox size={20} strokeWidth={1.7} className="text-text-muted" aria-hidden="true" />
        </div>
        <div className="mb-[10px] text-[11px] font-bold tracking-[0.09em] text-text-faint uppercase">
          {x(M.wsmode_empty_eyebrow)}
        </div>
        <h1 className="m-0 mb-[10px] font-display text-[22px] font-semibold text-text">{title}</h1>
        <p className="m-0 mb-[6px] text-[13.5px] leading-[1.6] text-text-muted">
          {x(M.wsmode_empty_body)}
        </p>
        <p className="m-0 mb-[20px] text-[13.5px] leading-[1.6] text-text-muted">
          {x(M.wsmode_empty_hint)}
        </p>
        <Link
          to="/app/settings"
          className="inline-block rounded-[8px] border border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-text"
        >
          {x(M.wsmode_empty_settings_link)}
        </Link>
      </div>
    </div>
  )
}
