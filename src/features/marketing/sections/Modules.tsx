import { Activity, Banknote, BarChart3, BookOpen, Send, ShieldCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'
import { IconChip } from './IconChip'

const MODULES: { icon: LucideIcon; label: LandingMessageKey }[] = [
  { icon: ShieldCheck, label: 'landing_mod1_label' },
  { icon: Users, label: 'landing_mod2_label' },
  { icon: BookOpen, label: 'landing_mod3_label' },
  { icon: Banknote, label: 'landing_mod4_label' },
  { icon: Send, label: 'landing_mod5_label' },
  { icon: Activity, label: 'landing_mod6_label' },
  { icon: BarChart3, label: 'landing_mod7_label' },
]

/** "One workspace" band — Advisor on top of day-to-day HR modules. */
export function Modules() {
  const { lt } = useLanding()
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-2 pb-10">
      <div className="rounded-[22px] border border-border bg-bg-elevated p-7">
        <span className="badge">{lt('landing_mod_badge')}</span>
        {/* h2 like the sibling landing sections (visual size unchanged) —
            an h3 here skipped a heading level in the document outline. */}
        <h2 className="mt-3.5 mb-4 max-w-[56ch] font-display text-[clamp(1.25rem,2vw,1.625rem)] leading-[1.35] font-semibold tracking-[-0.01em] text-text">
          {lt('landing_mod_title')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((mod) => (
            <IconChip key={mod.label} icon={mod.icon} label={lt(mod.label)} />
          ))}
        </div>
      </div>
    </section>
  )
}
