import { useI18n } from '@/i18n/context'
import { pickL } from '@/i18n/core'
import type { LText } from '@/i18n/core'
import { renderMarkdown } from './markdown'
import type { MessageStatus } from './types'

/**
 * Assistant reply text with the streaming reveal: while `status` is
 * 'streaming' it shows the first `streamedLen` characters of the localized
 * string plus the blinking caret (2×14px, `blinkCursor`); otherwise the full
 * text. Localization happens at render time, so a live language toggle
 * re-localizes mid-stream.
 *
 * The shown text is rendered as Markdown (`renderMarkdown`) so the backend's
 * `**bold**` / `*italic*` / `` `code` `` / links / headings become formatting
 * rather than literal markers. Partial delimiters mid-stream degrade to plain
 * text, so the reveal never swallows characters.
 */
export interface StreamedTextProps {
  readonly text: LText
  readonly status?: MessageStatus
  readonly streamedLen?: number
}

export function StreamedText({ text, status, streamedLen }: StreamedTextProps) {
  const { lang } = useI18n()
  const full = pickL(text, lang)
  const streaming = status === 'streaming'
  const shown = streaming ? full.slice(0, streamedLen ?? 0) : full
  return (
    <>
      {renderMarkdown(shown)}
      {streaming && (
        <span
          aria-hidden="true"
          className="ml-[2px] inline-block h-[14px] w-[2px] animate-[blinkCursor_.9s_infinite] bg-ink align-middle"
        />
      )}
    </>
  )
}
