import { describe, expect, it } from 'vitest'
import { decodeInvisibleTag, encodeInvisibleTag } from '../fingerprint'
import { buildWordDoc, type WordDocInput } from './wordDoc'

const EXPORT_ID = 'de305d54-75b4-431b-adb2-eb6b9e546014'

function input(overrides: Partial<WordDocInput> = {}): WordDocInput {
  return {
    title: 'Termination Letter — Jordan Mensah',
    paragraphs: ['Dear Jordan,', 'First line\nsecond line of the same paragraph.'],
    footerLines: ['Exported from Dutiva — Export ID ' + EXPORT_ID + '.', 'Confidential.'],
    invisibleTag: encodeInvisibleTag(EXPORT_ID),
    exportId: EXPORT_ID,
    author: 'Amara Osei (amara@northgate.ca)',
    workspaceLabel: 'Northgate Logistics Inc.',
    lang: 'en',
    ...overrides,
  }
}

describe('buildWordDoc', () => {
  it('embeds all three fingerprint channels', () => {
    const html = buildWordDoc(input())
    expect(html).toContain(`<meta name="dutiva-export-id" content="${EXPORT_ID}">`)
    expect(html).toContain(`<!--dutiva-export-id:${EXPORT_ID}-->`)
    expect(decodeInvisibleTag(html)).toBe(EXPORT_ID)
    expect(html).toContain('Exported from Dutiva')
  })

  it('escapes user content and preserves in-paragraph line breaks', () => {
    const html = buildWordDoc(
      input({
        title: 'Offer <script>alert(1)</script> & Co',
        paragraphs: ['Salary > $70,000 & "benefits"'],
      }),
    )
    expect(html).not.toContain('<script>')
    expect(html).toContain('Offer &lt;script&gt;alert(1)&lt;/script&gt; &amp; Co')
    expect(html).toContain('Salary &gt; $70,000 &amp; &quot;benefits&quot;')
    expect(buildWordDoc(input())).toContain('First line<br>second line')
  })

  it('keeps the Word page footer inside an mso conditional so browsers show one watermark', () => {
    const html = buildWordDoc(input())
    const conditional =
      /<!--\[if gte mso 9\]>\s*<div style="mso-element:footer"[\s\S]*?<!\[endif\]-->/.exec(html)
    expect(conditional).not.toBeNull()
    expect(html).toContain('lang="en-CA"')
    expect(buildWordDoc(input({ lang: 'fr' }))).toContain('lang="fr-CA"')
  })
})
