import type { ReactNode } from 'react'
import { useI18n } from '@/i18n/context'
import { chipToneClasses, statusChipBaseClass } from '@/components/chips'
import { mergeSegments } from './engine'
import type { DocChipTone, Jurisdiction, PreviewBlock } from './data'

/**
 * Shared primitives the handoff calls out as feature-specific (no existing
 * design-system equivalent): jurisdiction pill (.jchip), the rendered-document
 * "paper" with merge-field highlighting (.doc-body / .mf), wizard step
 * indicator, segmented toggle, skeleton shimmer, and the doclib status chip
 * (maps the handoff's tone names onto the app chip ramp).
 */

const DOC_TONE_CLASS: Record<DocChipTone, string> = {
  risk: chipToneClasses.risk,
  warn: chipToneClasses.warning,
  ok: chipToneClasses.success,
  info: chipToneClasses.info,
  neutral: chipToneClasses.neutral,
  gold: 'bg-(--gold-bg) text-(--gold-fg)',
}

export function DocChip({
  tone,
  children,
}: {
  readonly tone: DocChipTone
  readonly children: ReactNode
}) {
  return <span className={`${statusChipBaseClass} ${DOC_TONE_CLASS[tone]}`}>{children}</span>
}

/** Small jurisdiction pill (ON/QC/FED) — visually distinct from status chips. */
export function JurisdictionPill({ code }: { readonly code: Jurisdiction }) {
  return (
    <span className="inline-flex items-center rounded-[6px] border border-border bg-inset px-[6px] py-px text-[10.5px] font-bold tracking-[0.04em] text-text-muted">
      {code}
    </span>
  )
}

/** Shimmer block for catalogue loading states. */
export function Skel({ className }: { readonly className?: string }) {
  return (
    <div className={`animate-pulse rounded-[8px] bg-inset ${className ?? ''}`} aria-hidden="true" />
  )
}

export function SegButton({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  readonly active: boolean
  readonly onClick: () => void
  readonly children: ReactNode
  readonly ariaLabel?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`cursor-pointer rounded-[8px] px-[10px] py-[5px] text-[12px] font-semibold transition-colors ${
        active
          ? 'border border-border bg-surface text-text shadow-sm'
          : 'text-text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

/** Wizard 3-dot step control: numbered circles, done/active states, jump-back. */
export function StepDots({
  step,
  labels,
  onJump,
}: {
  readonly step: number
  readonly labels: string[]
  readonly onJump: (step: number) => void
}) {
  return (
    <div className="flex items-center gap-[6px]">
      {labels.map((label, index) => {
        const state = index < step ? 'done' : index === step ? 'active' : 'todo'
        const circle =
          state === 'active'
            ? 'bg-(--navy) text-white'
            : state === 'done'
              ? 'bg-ok-bg text-ok-fg'
              : 'bg-inset text-text-faint'
        return (
          <div key={label} className="flex items-center gap-[6px]">
            {index > 0 && <div className="h-px w-[18px] bg-border" aria-hidden="true" />}
            <button
              type="button"
              disabled={index >= step}
              onClick={() => onJump(index)}
              aria-current={state === 'active' ? 'step' : undefined}
              className={`flex h-[24px] w-[24px] items-center justify-center rounded-full text-[11.5px] font-bold ${circle} ${
                index < step ? 'cursor-pointer' : ''
              }`}
            >
              {index + 1}
            </button>
            <span
              className={`text-[12px] font-semibold max-[640px]:hidden ${
                state === 'active' ? 'text-text' : 'text-text-muted'
              }`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Rendered document "paper" ───────────────────────────────────────────── */

function MergeText({
  text,
  values,
}: {
  readonly text: string
  readonly values: Record<string, string>
}) {
  return (
    <>
      {mergeSegments(text, values).map((segment, index) =>
        segment.kind === 'text' ? (
          <span key={index}>{segment.text}</span>
        ) : segment.kind === 'filled' ? (
          <span key={index} className="rounded-[3px] bg-accent-soft px-[3px] font-medium text-text">
            {segment.text}
          </span>
        ) : (
          <span key={index} className="rounded-[3px] bg-warn-bg px-[3px] text-warn-fg">
            {segment.text}
          </span>
        ),
      )}
    </>
  )
}

/**
 * The rendered document. `blocks` should already be conditional-clause
 * resolved (engine.resolveBlocks); `values` = wizard answers merged over the
 * computed tokens (engine.computedTokens). Every preview surface (template
 * detail, wizard live preview, document detail) renders through this.
 */
export function DocPaper({
  blocks,
  values,
  className,
}: {
  readonly blocks: PreviewBlock[]
  readonly values: Record<string, string>
  readonly className?: string
}) {
  const { lang, x } = useI18n()
  return (
    <div
      className={`rounded-[12px] border border-border bg-surface p-[clamp(18px,2.5vw,28px)] font-serif text-[12.5px] leading-[1.7] text-text shadow-sm ${className ?? ''}`}
    >
      {blocks.map((block, index) => {
        const text = block.text ? (lang === 'fr' ? block.text.fr : block.text.en) : ''
        switch (block.type) {
          case 'title':
            return (
              <div
                key={index}
                className="mb-1 text-center font-display text-[15px] font-bold tracking-[-0.01em]"
              >
                <MergeText text={text} values={values} />
              </div>
            )
          case 'meta':
            return (
              <div key={index} className="mb-4 text-center text-[11px] text-text-faint">
                <MergeText text={text} values={values} />
              </div>
            )
          case 'clause':
            return (
              <div key={index} className="mt-3">
                {block.heading && (
                  <div className="text-[12px] font-bold">
                    {block.n !== undefined ? `${block.n}. ` : ''}
                    {x(block.heading)}
                  </div>
                )}
                <p className="mt-0.5">
                  <MergeText text={text} values={values} />
                </p>
              </div>
            )
          case 'ack':
            return (
              <p key={index} className="mt-4 italic">
                <MergeText text={text} values={values} />
              </p>
            )
          case 'note':
            return (
              <div
                key={index}
                className={`mt-4 rounded-[8px] border px-3 py-2 text-[11.5px] ${
                  block.tone === 'risk'
                    ? 'border-(--risk-border) bg-risk-bg text-risk-fg'
                    : 'border-(--accent-soft-border) bg-accent-soft text-text-muted'
                }`}
              >
                <MergeText text={text} values={values} />
              </div>
            )
          case 'sig':
            return (
              <div
                key={index}
                className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8"
              >
                {(block.roles ?? []).map((role, roleIndex) => (
                  <div key={roleIndex}>
                    <div className="border-b border-text/60 pb-6" aria-hidden="true" />
                    <div className="mt-1 text-[11px] text-text-muted">{x(role)}</div>
                  </div>
                ))}
              </div>
            )
          default:
            return (
              <p key={index} className="mt-3">
                <MergeText text={text} values={values} />
              </p>
            )
        }
      })}
    </div>
  )
}

/* ── Document action buttons ─────────────────────────────────────────────── */

const ACTBTN_VARIANT = {
  primary: 'bg-(--navy) text-white hover:opacity-90',
  ghost: 'border border-border bg-surface text-text hover:bg-inset',
  danger: 'border border-(--risk-border) bg-surface text-risk-fg hover:bg-risk-bg',
} as const

export function ActBtn({
  variant = 'ghost',
  onClick,
  children,
}: {
  readonly variant?: keyof typeof ACTBTN_VARIANT
  readonly onClick: () => void
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] px-[12px] py-[7px] text-[12.5px] font-semibold transition-colors ${ACTBTN_VARIANT[variant]}`}
    >
      {children}
    </button>
  )
}
