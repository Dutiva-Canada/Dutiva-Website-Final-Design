import { useState } from 'react'
import { useI18n } from '@/i18n/context'
import { pick } from '@/i18n/core'
import { knowledgeMessages as M } from '@/i18n/messages/knowledge'
import { knowledgeItems } from '@/data'
import { useRail } from '@/features/app/rail/railContext'
import { GuidanceSourcesPanel } from '@/features/app/guidance/GuidanceSourcesPanel'

/**
 * Knowledge Base — the HR library article list (App v2.dc.html markup lines
 * 1251–1265, `buildKnowledgeView()` lines 3524–3529). A search input filters
 * articles by title or tag (case-insensitive substring, empty query passes
 * everything); opening an article asks the Advisor rail for a summary
 * (prototype `openRail(a.title, { text: …, citations: [] })`).
 *
 * The prototype matches its EN state strings; here matching runs against the
 * current language so FR users can search FR titles (same decision as
 * `filterSearchEntries` in the search corpus).
 *
 * GuidanceSourcesPanel below the article list is real backend data with no
 * prototype counterpart — see its own doc comment.
 */
export function KnowledgeView() {
  const { x, lang } = useI18n()
  const { openRail } = useRail()
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const items = knowledgeItems.filter(
    (a) =>
      !q ||
      pick(a.title, lang).toLowerCase().includes(q) ||
      pick(a.tag, lang).toLowerCase().includes(q),
  )

  return (
    <div className="flex-1 overflow-y-auto px-[32px] pt-[28px] pb-[60px]">
      <div className="mx-auto max-w-[760px]">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={x(M.knowledge_filter_placeholder)}
          aria-label={x(M.knowledge_filter_placeholder)}
          className="mb-[18px] w-full rounded-[10px] border border-border bg-surface px-[16px] py-[11px] font-sans text-[13.5px] text-text"
        />
        <div data-testid="knowledge-articles" className="flex flex-col gap-[10px]">
          {items.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => openRail(a.title, { text: M.knowledge_rail_intro, citations: [] })}
              className="flex cursor-pointer flex-col gap-[4px] rounded-[11px] border border-border bg-surface px-[16px] py-[14px] text-left font-sans"
            >
              <span className="text-[14px] font-semibold text-text">{x(a.title)}</span>
              <span className="text-[12px] text-text-muted">{x(a.tag)}</span>
            </button>
          ))}
        </div>
        <GuidanceSourcesPanel />
      </div>
    </div>
  )
}
