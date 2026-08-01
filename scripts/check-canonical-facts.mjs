/**
 * Canonical-facts drift check — the half that reads stylesheets.
 *
 * `docs/CANONICAL_FACTS.md` is the source of record for Dutiva's load-bearing
 * facts, and it states its own precedence rule: where it disagrees with the
 * code, the code wins and the file gets corrected. Enforcement is split in two
 * along a principled line:
 *
 *   1. `src/canonicalFacts.test.ts` — rows backed by **TypeScript values**
 *      (template count, plan prices, jurisdictions, billing ratio, beta flag,
 *      coverage audit date, retired contact addresses). Those are imported and
 *      compared directly, which is what a test does well.
 *   2. THIS SCRIPT — rows backed by **CSS text** (the brand palette). Vitest
 *      runs with `css: false` (vite.config.ts), which stubs every `.css` file
 *      to an empty string — `?raw` included — so a test physically cannot read
 *      a token value. Turning that off to check two rows would slow the whole
 *      suite, so the stylesheet comparison lives here instead.
 *
 * Why the brand rows are worth enforcing at all: CANONICAL_FACTS §6 records
 * that the *written description* of the accent colour had already drifted once
 * (amber #E8A020 for gold #d4af37) while the logo kit stayed correct. A hex in
 * a document is exactly the kind of fact that gets copied into a deck and
 * outlives the value it described.
 *
 * Dependency-free on purpose, matching check-migrations.mjs.
 */

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docPath = path.join(root, 'docs', 'CANONICAL_FACTS.md')
const stylesDir = path.join(root, 'src', 'styles')

/** Rows whose values must resolve to a hex declared somewhere in src/styles/. */
const BRAND_ROWS = ['Brand gold', 'Brand navy']

const doc = await readFile(docPath, 'utf8')

const styleFiles = (await readdir(stylesDir)).filter((name) => name.endsWith('.css'))
const stylesheets = await Promise.all(
  styleFiles.map(async (name) => ({
    name,
    css: (await readFile(path.join(stylesDir, name), 'utf8')).toLowerCase(),
  })),
)

/**
 * First cell of a markdown table row, trimmed — `null` for a non-table line.
 *
 * Parsed rather than prefix-matched because Prettier formats this repo's
 * markdown and pads table columns to align them, so `| Brand gold |` becomes
 * `| Brand gold   |` as soon as a longer label joins the table.
 */
function firstCell(line) {
  if (!line.trimStart().startsWith('|')) return null
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')[0]
    .trim()
}

const problems = []

for (const label of BRAND_ROWS) {
  const row = doc.split('\n').find((line) => firstCell(line) === label)

  if (!row) {
    problems.push(`docs/CANONICAL_FACTS.md has no "${label}" row`)
    continue
  }

  const hexes = [...row.matchAll(/#([0-9a-f]{6})\b/gi)].map((m) => m[0].toLowerCase())

  if (hexes.length === 0) {
    problems.push(`"${label}" row publishes no hex value — it used to`)
    continue
  }

  for (const hex of hexes) {
    const declaredIn = stylesheets.filter(({ css }) => css.includes(hex)).map(({ name }) => name)

    if (declaredIn.length === 0) {
      problems.push(
        `"${label}" publishes ${hex}, which is not declared anywhere in src/styles/ — ` +
          'the document is describing a colour the product no longer uses',
      )
    }
  }
}

if (problems.length > 0) {
  console.error('check-canonical-facts: FAILED')
  for (const problem of problems) console.error(`  - ${problem}`)
  console.error(
    "\nFix whichever side is wrong. Per the file's own rule, where " +
      'docs/CANONICAL_FACTS.md disagrees with the code, the code wins and the ' +
      'document gets corrected.',
  )
  process.exit(1)
}

console.log(
  `check-canonical-facts: OK (${BRAND_ROWS.length} brand rows resolved against ` +
    `${styleFiles.length} stylesheets)`,
)
