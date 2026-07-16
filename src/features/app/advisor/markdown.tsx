import type { ReactNode } from 'react'

/**
 * Minimal, dependency-free Markdown renderer for Advisor replies.
 *
 * The real `advisor-chat` backend (see supabase/functions/advisor-chat) returns
 * Markdown-formatted prose — `**bold**`, `*italic*`, `` `code` ``, `[links](…)`,
 * and `#` headings. Rendered as plain text those markers show literally (the
 * stray `**`/`*` asterisks in the greeting). This turns the common inline
 * constructs into React elements while leaving everything else — line breaks,
 * `-`/`•` bullet dashes, indentation — to the bubble's `whitespace-pre-wrap`.
 *
 * Safe by construction: output is React elements, never `dangerouslySetInnerHTML`,
 * so no author can inject markup. Link hrefs are restricted to http(s)/mailto;
 * anything else renders as literal text. Unterminated delimiters (a `**` whose
 * closing pair hasn't streamed in yet) fall through to literal text, so a
 * partially-streamed reply degrades to plain characters rather than swallowing
 * the rest of the message.
 */

const STRONG = 'font-semibold'
const EM = 'italic'
const CODE = 'rounded-[4px] bg-inset px-[5px] py-[1.5px] font-mono text-[.9em]'
const LINK = 'text-accent underline underline-offset-2 break-words'

const SAFE_URL = /^(?:https?:\/\/|mailto:)/i
const WORD = /[\p{L}\p{N}]/u

/** True when the emphasis run at [start, start+len) is flanked by non-word chars.
 *  Guards `_`/`__` so intra-word underscores (`max_tokens`) stay literal. */
function underscoreBoundaryOk(line: string, start: number, len: number): boolean {
  const prev = line[start - 1]
  const next = line[start + len]
  return (prev === undefined || !WORD.test(prev)) && (next === undefined || !WORD.test(next))
}

/** Inline spans (emphasis, code, links) within a single line of text. */
function renderInline(line: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  let buf = ''
  let i = 0
  let key = 0
  const flush = () => {
    if (buf) {
      out.push(buf)
      buf = ''
    }
  }

  while (i < line.length) {
    const rest = line.slice(i)

    // `inline code` — no nested parsing inside.
    const code = /^`([^`\n]+)`/.exec(rest)
    if (code) {
      flush()
      out.push(
        <code key={`${keyBase}-c${key++}`} className={CODE}>
          {code[1]}
        </code>,
      )
      i += code[0].length
      continue
    }

    // [label](url) — only safe schemes become links; otherwise literal.
    const link = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(rest)
    if (link) {
      flush()
      const [whole, label = '', url = ''] = link
      if (SAFE_URL.test(url)) {
        out.push(
          <a
            key={`${keyBase}-l${key++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            {renderInline(label, `${keyBase}-l${key}`)}
          </a>,
        )
      } else {
        buf += whole
      }
      i += whole.length
      continue
    }

    // **bold** — matched before *italic* so double delimiters win.
    const bold = /^\*\*(?!\s)([\s\S]+?)(?<!\s)\*\*/.exec(rest)
    if (bold) {
      flush()
      out.push(
        <strong key={`${keyBase}-b${key++}`} className={STRONG}>
          {renderInline(bold[1] ?? '', `${keyBase}-b${key}`)}
        </strong>,
      )
      i += bold[0].length
      continue
    }

    // __bold__ — same, guarded against intra-word underscores.
    const boldU = /^__(?!\s)([\s\S]+?)(?<!\s)__/.exec(rest)
    if (boldU && underscoreBoundaryOk(line, i, boldU[0].length)) {
      flush()
      out.push(
        <strong key={`${keyBase}-b${key++}`} className={STRONG}>
          {renderInline(boldU[1] ?? '', `${keyBase}-b${key}`)}
        </strong>,
      )
      i += boldU[0].length
      continue
    }

    // *italic*
    const italic = /^\*(?!\s)([\s\S]+?)(?<!\s)\*/.exec(rest)
    if (italic) {
      flush()
      out.push(
        <em key={`${keyBase}-i${key++}`} className={EM}>
          {renderInline(italic[1] ?? '', `${keyBase}-i${key}`)}
        </em>,
      )
      i += italic[0].length
      continue
    }

    // _italic_ — guarded against intra-word underscores.
    const italicU = /^_(?!\s)([\s\S]+?)(?<!\s)_/.exec(rest)
    if (italicU && underscoreBoundaryOk(line, i, italicU[0].length)) {
      flush()
      out.push(
        <em key={`${keyBase}-i${key++}`} className={EM}>
          {renderInline(italicU[1] ?? '', `${keyBase}-i${key}`)}
        </em>,
      )
      i += italicU[0].length
      continue
    }

    buf += line[i]
    i++
  }

  flush()
  return out
}

/**
 * Render Markdown text to React nodes. Lines are preserved as literal `\n`
 * (the assistant bubble is `whitespace-pre-wrap`); `#`..`######` headings render
 * as emphasized text on their own line.
 */
export function renderMarkdown(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const lines = text.split('\n')
  lines.forEach((line, idx) => {
    if (idx > 0) out.push('\n')
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      out.push(
        <span key={`h${idx}`} className={STRONG}>
          {renderInline(heading[2] ?? '', `h${idx}`)}
        </span>,
      )
    } else {
      out.push(<span key={`l${idx}`}>{renderInline(line, `l${idx}`)}</span>)
    }
  })
  return out
}
