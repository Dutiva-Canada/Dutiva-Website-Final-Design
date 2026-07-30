import type { Lang } from '@/i18n/core'

/**
 * Word-compatible .doc export — Word's HTML dialect, which Word (and Pages,
 * LibreOffice, Google Docs) opens as a native-feeling document. Chosen over
 * real .docx for the same reason as the hand-rolled PDF: no dependency, and
 * full control over where the export fingerprint lives.
 *
 * Fingerprint channels in this artifact (fingerprint.ts):
 *   - the invisible zero-width tag, inline at the end of the body text —
 *     survives copy-paste out of the opened document;
 *   - `<meta name="dutiva-export-id">` + an HTML comment — survive re-saves
 *     that keep the HTML shape;
 *   - the visible watermark block at the end, plus a Word-only running page
 *     footer (mso conditional, invisible to browsers so the block does not
 *     show twice outside Word).
 */

export interface WordDocInput {
  title: string
  paragraphs: string[]
  footerLines: [string, string]
  invisibleTag: string
  exportId: string
  author: string
  workspaceLabel: string
  lang: Lang
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const para = (text: string) => `<p>${escapeHtml(text).replaceAll('\n', '<br>')}</p>`

export function buildWordDoc(input: WordDocInput): string {
  const [identity, confidential] = input.footerLines
  const body = input.paragraphs.map(para).join('\n')
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="${input.lang === 'fr' ? 'fr-CA' : 'en-CA'}">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="author" content="${escapeHtml(input.author)}">
<meta name="dutiva-workspace" content="${escapeHtml(input.workspaceLabel)}">
<meta name="dutiva-export-id" content="${input.exportId}">
<!--dutiva-export-id:${input.exportId}-->
<title>${escapeHtml(input.title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
@page WordSection1 { size: 8.5in 11.0in; margin: 1.0in; mso-footer: f1; }
div.WordSection1 { page: WordSection1; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.65; color: #141920; }
h1 { font-size: 16pt; margin: 0 0 6pt 0; }
hr.rule { border: none; border-top: 1pt solid #d3d8de; margin: 0 0 14pt 0; }
p.DutivaWatermark { color: #6a7280; font-size: 8.5pt; line-height: 1.45; border-top: 1pt solid #d3d8de; padding-top: 6pt; margin-top: 20pt; }
</style>
</head>
<body>
<div class="WordSection1">
<h1>${escapeHtml(input.title)}</h1>
<hr class="rule">
${body}
<span>${input.invisibleTag}</span>
<p class="DutivaWatermark">${escapeHtml(identity)}<br>${escapeHtml(confidential)}</p>
<!--[if gte mso 9]>
<div style="mso-element:footer" id="f1"><p class="DutivaWatermark" style="border-top:none;margin-top:0;">${escapeHtml(identity)}</p></div>
<![endif]-->
</div>
</body>
</html>
`
}
