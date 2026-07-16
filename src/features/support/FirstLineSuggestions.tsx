import { useMemo } from 'react'
import { ExternalLink, LifeBuoy, Sparkles } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { supportMessages as M } from '@/i18n/messages/support'
import { helpDocPath } from '@/seo/routes'
import type { SupportCategory } from '@/config/support'
import { suggestFirstLine } from './firstLineAssist'

/**
 * First-line self-service hint shown inside the intake forms (public Contact
 * form + in-app request form). As the requester types, it offers the Help
 * Centre articles most likely to answer them — except for the human-only
 * categories, where it plainly says a person will handle it (see
 * firstLineAssist for the escalation policy). Cross-surface safe tokens only.
 * Article links are plain `<a target="_blank">` (open the public help pages in a
 * new tab, so the draft is never lost, and no router context is required).
 */
export function FirstLineSuggestions({
  query,
  category,
}: {
  readonly query: string
  readonly category: SupportCategory | ''
}) {
  const { x, lang } = useI18n()
  const result = useMemo(() => suggestFirstLine(query, category, lang), [query, category, lang])

  if (result.escalate) {
    return (
      <div
        role="note"
        className="flex items-start gap-[10px] rounded-[10px] border border-border bg-bg px-[14px] py-[12px]"
      >
        <LifeBuoy size={16} aria-hidden="true" className="mt-px flex-none text-gold-strong" />
        <p className="m-0 text-[13px] leading-[1.5] text-text-2">{x(M.support_firstline_human)}</p>
      </div>
    )
  }

  if (result.articles.length === 0) return null

  return (
    <div className="rounded-[10px] border border-border bg-bg px-[14px] py-[12px]">
      <p className="m-0 mb-[8px] flex items-center gap-[6px] text-[12.5px] font-semibold text-text-2">
        <Sparkles size={14} aria-hidden="true" className="text-gold-strong" />
        {x(M.support_firstline_title)}
      </p>
      <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
        {result.articles.map((a) => (
          <li key={a.slug}>
            <a
              href={helpDocPath(a, lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[6px] text-[13px] font-medium text-gold-strong hover:opacity-80"
            >
              {x(a.title)}
              <ExternalLink size={12} aria-hidden="true" className="flex-none" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
