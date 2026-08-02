import { Activity, Banknote, BarChart3, BookOpen, Send, ShieldCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'
import { IconChip } from './IconChip'

/**
 * `roadmap: true` marks a module that is not shipped capability.
 * Compensation, Communications and Wellbeing exist in the app only as
 * prototype surfaces on demo fixtures, gated off in a production workspace
 * (`gated(…)` in src/app/appViews.tsx), so CANONICAL_FACTS §4 requires they be
 * presented as roadmap. The other four are real: compliance monitoring, people
 * and cases, the knowledge base, and analytics all run on live data.
 *
 * **These three chips are the modules, not the rings, and the rings being
 * complete does not promote them.** Rings 2, 3 and 4 ship as templates in
 * Document Studio, guides under `/app/knowledge` and flows under
 * `/app/workflows` — all of which the knowledge and monitoring chips already
 * cover. The name collision is the trap CANONICAL_FACTS §4 spells out: do not
 * drop `roadmap` here on the strength of a ring being finished. It comes off
 * when these three surfaces run on real workspace data.
 */
const MODULES: { icon: LucideIcon; label: LandingMessageKey; roadmap?: true }[] = [
  { icon: ShieldCheck, label: 'landing_mod1_label' },
  { icon: Users, label: 'landing_mod2_label' },
  { icon: BookOpen, label: 'landing_mod3_label' },
  { icon: Banknote, label: 'landing_mod4_label', roadmap: true },
  { icon: Send, label: 'landing_mod5_label', roadmap: true },
  { icon: Activity, label: 'landing_mod6_label', roadmap: true },
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
            <IconChip
              key={mod.label}
              icon={mod.icon}
              label={lt(mod.label)}
              note={mod.roadmap === true ? lt('landing_mod_roadmap') : undefined}
            />
          ))}
        </div>
        <p className="mt-3.5 text-sm leading-6 text-text-muted">{lt('landing_mod_roadmap_note')}</p>
      </div>
    </section>
  )
}
