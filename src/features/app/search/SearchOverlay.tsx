import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Search } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { searchMessages as M } from '@/i18n/messages/search'
import { useEscapeToClose } from '@/lib/escapeStack'
import { useSearch } from './searchContext'
import { filterSearchEntries, pinnedChatEntries, searchTabs } from './searchCorpus'
import type {
  AdvisorSearchNavState,
  SearchEntry,
  SearchTabKey,
  TemplatesSearchNavState,
} from './searchCorpus'

/**
 * Global search overlay (⌘K / topbar search) — App v2 `buildSearchView()` +
 * overlay markup (App v2.dc.html, 2302–2346). Renders nothing while closed;
 * the dialog remounts on every open so query/tab/active row reset like the
 * prototype's `openSearch()`.
 */
export function SearchOverlay() {
  const { open } = useSearch()
  if (!open) return null
  return <SearchDialog />
}

function SearchDialog() {
  const { x, lang } = useI18n()
  const { closeSearch } = useSearch()
  const navigate = useNavigate()

  /* Escape closes only this overlay (the topmost) — see lib/escapeStack. */
  useEscapeToClose(true, closeSearch)

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchTabKey>('all')
  const [rawActiveIdx, setRawActiveIdx] = useState(0)

  const results = useMemo(() => filterSearchEntries(tab, query, lang), [tab, query, lang])
  /* Prototype clamps the active row against the current result count. */
  const activeIdx = Math.min(rawActiveIdx, Math.max(results.length - 1, 0))

  const showRecent = !query
  const noResults = !!query && results.length === 0

  /* Focus the input on open; restore focus to the trigger on close
     (prototype `openSearch()` stores `_lastFocused`, `restoreFocus()`). */
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const lastFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    inputRef.current?.focus()
    return () => {
      if (lastFocused?.isConnected) lastFocused.focus()
    }
  }, [])

  const openEntry = useCallback(
    (entry: SearchEntry) => {
      closeSearch()
      const nav = entry.nav
      switch (nav.kind) {
        case 'employee':
          navigate(`/app/employees/${nav.employeeId}`)
          break
        case 'case':
          navigate(`/app/cases/${nav.caseId}`)
          break
        case 'chat':
          /* TODO(phase-c): the Advisor view selects the thread from
             `location.state.chatId` once thread selection lands. */
          navigate('/app/advisor', {
            state: { chatId: nav.chatId } satisfies AdvisorSearchNavState,
          })
          break
        case 'document':
          /* TODO(phase-c): the Templates view / Document Studio opens the
             template from `location.state.docKey`. */
          navigate('/app/templates', {
            state: { docKey: nav.docKey } satisfies TemplatesSearchNavState,
          })
          break
        case 'view':
          navigate(`/app/${nav.view}`)
          break
      }
    },
    [closeSearch, navigate],
  )

  /* Prototype `onKeyDown` (App v2.dc.html, 2764–2778): arrows move the
     active row, Enter opens it, Escape closes; ⌘/Ctrl+K while open resets. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setQuery('')
        setTab('all')
        setRawActiveIdx(0)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setRawActiveIdx(Math.min(activeIdx + 1, Math.max(results.length - 1, 0)))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setRawActiveIdx(Math.max(activeIdx - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        const active = results[activeIdx]
        if (active) {
          e.preventDefault()
          openEntry(active)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [results, activeIdx, openEntry])

  const stopClickPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()

  return (
    <div
      onClick={closeSearch}
      className="fixed inset-0 z-[350] flex items-start justify-center bg-[rgba(20,25,32,0.4)] pt-[12vh]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={x(M.search_dialog_label)}
        onClick={stopClickPropagation}
        className="flex max-h-[66vh] w-[min(560px,92vw)] animate-[fadeInUp_.15s_ease] flex-col overflow-hidden rounded-[14px] bg-surface font-sans shadow-[0_30px_70px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center gap-[12px] border-b border-border-soft px-[18px] py-[16px]">
          <Search
            size={17}
            strokeWidth={1.8}
            className="shrink-0 text-text-muted"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setRawActiveIdx(0)
            }}
            placeholder={x(M.search_placeholder)}
            aria-label={x(M.search_dialog_label)}
            className="flex-1 border-none bg-transparent font-sans text-[15px] text-text outline-none"
          />
          <span className="rounded-[4px] border border-border px-[6px] py-[2px] text-[11px] text-text-faint">
            ESC
          </span>
        </div>

        <div className="flex gap-[8px] px-[18px] pt-[12px]">
          {searchTabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => {
                setTab(tb.key)
                setRawActiveIdx(0)
              }}
              className={
                'cursor-pointer rounded-[100px] border-none px-[13px] py-[7px] font-sans text-[12.5px] font-semibold ' +
                (tab === tb.key ? 'bg-navy text-white' : 'bg-inset text-text-2')
              }
            >
              {x(tb.label)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-[10px] pt-[12px] pb-[16px]">
          {showRecent && (
            <>
              <div className="px-[10px] pt-[8px] pb-[4px] text-[11px] font-bold tracking-[.04em] text-text-muted uppercase">
                {x(M.search_pinned)}
              </div>
              {pinnedChatEntries.map((r) => (
                <button
                  key={`pinned-${r.id}`}
                  type="button"
                  onClick={() => openEntry(r)}
                  className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] border-none bg-transparent p-[10px] text-left font-sans hover:bg-inset"
                >
                  <span className="w-[78px] shrink-0 text-[11px] font-bold text-gold-dot">
                    {x(r.kindLabel)}
                  </span>
                  <span className="text-[13.5px] text-text">{x(r.title)}</span>
                </button>
              ))}
            </>
          )}

          <div className="px-[10px] pt-[10px] pb-[4px] text-[11px] font-bold tracking-[.04em] text-text-muted uppercase">
            {x(M.search_results)}
          </div>
          {results.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openEntry(r)}
              className={
                'flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] border-none p-[10px] text-left font-sans hover:bg-inset ' +
                (i === activeIdx ? 'bg-inset' : 'bg-transparent')
              }
            >
              <span className="w-[78px] shrink-0 text-[11px] font-bold text-text-muted">
                {x(r.kindLabel)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block overflow-hidden text-[13.5px] text-ellipsis whitespace-nowrap text-text">
                  {x(r.title)}
                </span>
                {r.sub && (
                  <span className="mt-[1px] block overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap text-text-muted">
                    {x(r.sub)}
                  </span>
                )}
              </span>
              {r.restricted && (
                <span className="inline-flex shrink-0 items-center gap-[4px] text-[10.5px] font-bold tracking-[.03em] text-gold-fg uppercase">
                  <Lock size={11} strokeWidth={2} aria-hidden="true" />
                  {x(M.search_restricted)}
                </span>
              )}
            </button>
          ))}

          {noResults && (
            <div className="px-[16px] py-[34px] text-center">
              <div className="text-[13.5px] font-semibold text-text">
                {x(M.search_no_results)} “{query}”
              </div>
              <div className="mt-[4px] text-[12.5px] text-text-muted">
                {x(M.search_no_results_hint)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
