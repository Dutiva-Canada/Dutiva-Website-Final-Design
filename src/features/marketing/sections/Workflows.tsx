import {
  Accessibility,
  Award,
  CalendarClock,
  FileText,
  Search,
  TrendingUp,
  UserMinus,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionIntro } from '../SectionIntro'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'

interface Tile {
  icon: LucideIcon
  label: LandingMessageKey
  sub: LandingMessageKey
}

const TILES: Tile[] = [
  { icon: UserPlus, label: 'landing_wf1_label', sub: 'landing_wf1_sub' },
  { icon: UserMinus, label: 'landing_wf2_label', sub: 'landing_wf2_sub' },
  { icon: Accessibility, label: 'landing_wf3_label', sub: 'landing_wf3_sub' },
  { icon: TrendingUp, label: 'landing_wf4_label', sub: 'landing_wf4_sub' },
  { icon: CalendarClock, label: 'landing_wf5_label', sub: 'landing_wf5_sub' },
  { icon: Search, label: 'landing_wf6_label', sub: 'landing_wf6_sub' },
  { icon: Award, label: 'landing_wf7_label', sub: 'landing_wf7_sub' },
  { icon: FileText, label: 'landing_wf8_label', sub: 'landing_wf8_sub' },
]

export function Workflows() {
  const { lt } = useLanding()
  return (
    <section id="workflows" className="mx-auto max-w-[1200px] scroll-mt-[80px] px-6 py-16">
      <SectionIntro
        badge={lt('landing_wf_badge')}
        title={lt('landing_wf_title')}
        sub={lt('landing_wf_sub')}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        {TILES.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-border bg-bg-elevated p-4">
            <tile.icon size={18} className="text-gold-strong" />
            <div className="mt-2.5 text-[0.8125rem] font-semibold text-text">{lt(tile.label)}</div>
            <div className="mt-0.5 text-xs text-text-3">{lt(tile.sub)}</div>
          </div>
        ))}
      </div>

      {/* Example workflow card */}
      <div className="mt-4 max-w-[560px] rounded-2xl border border-border bg-bg-elevated px-[22px] py-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-text">{lt('landing_wf_ex_name')}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-risk-border bg-risk-bg px-2.5 py-[3px] text-[0.6875rem] font-bold tracking-wider uppercase text-risk-fg">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-fg" />
            {lt('landing_wf_ex_risk')}
          </span>
        </div>
        <div className="mb-3 text-[0.8125rem] text-text-2">{lt('landing_wf_ex_meta')}</div>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-soft">
            <div className="h-full w-[57%] rounded-full bg-risk-fg" />
          </div>
          <span className="text-xs font-bold whitespace-nowrap text-text-3">
            {lt('landing_wf_ex_step')}
          </span>
        </div>
        <div className="mt-2.5 text-[0.8125rem] text-text-3">
          <span className="font-semibold text-text-2">{lt('landing_wf_ex_next_label')}</span>{' '}
          {lt('landing_wf_ex_next')}
        </div>
      </div>
    </section>
  )
}
