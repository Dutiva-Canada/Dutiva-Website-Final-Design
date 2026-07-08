/**
 * "Advisor is thinking" indicator — three dots pulsing on the prototype's
 * `pulseDot` keyframe with 0 / .15s / .3s delays. `md` matches the Advisor
 * view (5px dots), `sm` the rail (4px dots).
 */
export interface TypingDotsProps {
  /** Localized label, e.g. x(advisorCore.advisor_thinking). */
  label: string
  size?: 'md' | 'sm'
}

const DELAYS = [0, 0.15, 0.3]

export function TypingDots({ label, size = 'md' }: TypingDotsProps) {
  const container =
    size === 'md'
      ? 'flex items-center gap-[8px] py-[6px] text-[13.5px] text-text-muted'
      : 'flex items-center gap-[7px] text-[12.5px] text-text-muted'
  const dot = size === 'md' ? 'h-[5px] w-[5px]' : 'h-[4px] w-[4px]'
  return (
    <div className={container}>
      <span className="flex gap-[3px]">
        {DELAYS.map((delay) => (
          <span
            key={delay}
            className={`inline-block rounded-full bg-text-faint ${dot} animate-[pulseDot_1.1s_ease-in-out_infinite]`}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </span>
      {label}
    </div>
  )
}
