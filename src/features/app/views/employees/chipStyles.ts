import type { Tone } from '@/data'

/**
 * Chip + dot colour helpers for the employees views — ports of the
 * prototype's `statusChipStyle(tone)` (App v2.dc.html, 3310–3314) and
 * `sourceChipStyle(tone)` (4125–4128), plus the 7px/9px status-dot fills
 * used by the org chart and the unified timeline (4134, 4163).
 */

/** Timeline/org chips add a `neutral` step to the fixture tone ramp. */
export type ChipTone = Tone | 'neutral'

const statusToneClasses: Record<'risk' | 'warning' | 'success' | 'info', string> = {
  risk: 'bg-risk-bg text-risk-fg',
  warning: 'bg-warn-bg text-warn-fg',
  success: 'bg-ok-bg text-ok-fg',
  info: 'bg-accent-soft text-accent',
}

/** Pill status chip (12px, 3px 10px, radius 100px). Unknown tones fall back to info. */
export function statusChipClass(tone: Tone): string {
  const key = tone === 'risk' || tone === 'warning' || tone === 'success' ? tone : 'info'
  return `inline-flex rounded-[100px] px-[10px] py-[3px] text-[12px] font-semibold whitespace-nowrap ${statusToneClasses[key]}`
}

const sourceToneClasses: Record<'risk' | 'warning' | 'success' | 'info' | 'neutral', string> = {
  ...statusToneClasses,
  neutral: 'bg-inset text-text-muted',
}

/** Uppercase source chip (10.5px, 2px 7px, radius 5px). Unknown tones fall back to neutral. */
export function sourceChipClass(tone: ChipTone): string {
  const key =
    tone === 'risk' || tone === 'warning' || tone === 'success' || tone === 'info'
      ? tone
      : 'neutral'
  return `inline-flex shrink-0 rounded-[5px] px-[7px] py-[2px] text-[10.5px] font-bold tracking-[0.03em] uppercase whitespace-nowrap ${sourceToneClasses[key]}`
}

/** Status-dot fill (risk-dot / gold-dot / ok-fg / text-faint / accent). */
export function dotToneClass(tone: ChipTone): string {
  switch (tone) {
    case 'risk':
      return 'bg-risk-dot'
    case 'warning':
      return 'bg-gold-dot'
    case 'success':
      return 'bg-ok-fg'
    case 'neutral':
      return 'bg-text-faint'
    default:
      return 'bg-accent'
  }
}
