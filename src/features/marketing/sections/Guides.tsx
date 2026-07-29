import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { SectionIntro } from '../SectionIntro'
import { usePublicPath } from '@/seo/usePublicPath'
import { useLanding } from '../useLanding'
import type { LandingMessageKey } from '../useLanding'

const GUIDES: { title: LandingMessageKey; body: LandingMessageKey }[] = [
  { title: 'landing_g1_t', body: 'landing_g1_p' },
  { title: 'landing_g2_t', body: 'landing_g2_p' },
  { title: 'landing_g3_t', body: 'landing_g3_p' },
  { title: 'landing_g4_t', body: 'landing_g4_p' },
  { title: 'landing_g5_t', body: 'landing_g5_p' },
  { title: 'landing_g6_t', body: 'landing_g6_p' },
]

export function Guides() {
  const { lt } = useLanding()
  const { p } = usePublicPath()
  return (
    <section id="guides" className="mx-auto max-w-300 scroll-mt-20 px-6 py-16">
      <SectionIntro
        badge={lt('landing_guides_badge')}
        title={lt('landing_guides_title')}
        sub={lt('landing_guides_sub')}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {GUIDES.map((guide) => (
          <a key={guide.title} href={p('guides')} className="premium-card-soft block p-5.5">
            <div className="flex items-start gap-3">
              <BookOpen size={16} className="mt-0.5 flex-none text-gold-strong" />
              <div>
                <div className="text-[0.9375rem] font-semibold text-text">{lt(guide.title)}</div>
                <p className="mt-1.5 text-sm leading-[1.55] text-text-2">{lt(guide.body)}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-5">
        <a
          href={p('guides')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gold-strong transition-opacity hover:opacity-80"
        >
          {lt('landing_guides_browse')}
          <ArrowRight size={16} />
        </a>
        <Link
          to={p('blog')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-2 transition-opacity hover:opacity-80"
        >
          {lt('landing_guides_blog')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
