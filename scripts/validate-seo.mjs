/**
 * Post-build SEO validation — crawls the built dist/ output (not React
 * state) and fails the build on any violation. Checks, per prerendered
 * page: unique non-empty title and description, exactly one self-canonical,
 * robots policy, correct <html lang>, reciprocal hreflang (including
 * x-default and self), parseable JSON-LD on the canonical origin, exactly
 * one H1, a <main> landmark, substantive visible text, and no placeholder
 * junk. Site-wide: sitemap ↔ file ↔ canonical consistency, no private or
 * noindex URL in the sitemap or llms.txt, robots.txt policy, resolvable
 * internal links, and a noindex app shell + 404.
 */

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ORIGIN = (process.env.VITE_SITE_ORIGIN || 'https://dutiva.ca').replace(/\/+$/, '')

const errors = []
const fail = (msg) => errors.push(msg)

/* ---------- collect prerendered pages ---------- */

async function collectPages(dir, base = '') {
  const pages = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'assets' || entry.name === 'brand') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      pages.push(...(await collectPages(full, `${base}/${entry.name}`)))
    } else if (entry.name === 'index.html') {
      pages.push({ route: base || '/', file: full })
    }
  }
  return pages
}

const pages = await collectPages(dist)
if (pages.length < 70) fail(`expected ≥70 prerendered pages, found ${pages.length}`)

const one = (doc, re, what, route) => {
  const matches = [...doc.matchAll(re)]
  if (matches.length !== 1) {
    fail(`${route}: expected exactly one ${what}, found ${matches.length}`)
    return undefined
  }
  return matches[0]
}

const PLACEHOLDER = /undefined|\[object Object\]|NaN|TODO|Lorem ipsum/
const seenTitles = new Map()
const seenCanonicals = new Map()
const canonicalByRoute = new Map()
const alternatesByRoute = new Map()

for (const { route, file } of pages) {
  const doc = await readFile(file, 'utf8')
  const head = doc.split('</head>')[0]
  const body = doc.split('<div id="root">')[1] ?? ''

  const title = one(head, /<title>([^<]*)<\/title>/g, '<title>', route)?.[1]
  if (title !== undefined) {
    if (!title.trim()) fail(`${route}: empty title`)
    if (PLACEHOLDER.test(title)) fail(`${route}: placeholder in title`)
    if (seenTitles.has(title)) fail(`${route}: duplicate title (also ${seenTitles.get(title)})`)
    seenTitles.set(title, route)
  }

  const description = one(
    head,
    /<meta name="description" content="([^"]*)"/g,
    'meta description',
    route,
  )?.[1]
  if (description !== undefined && description.trim().length < 40) {
    fail(`${route}: description too short`)
  }
  if (description && PLACEHOLDER.test(description)) fail(`${route}: placeholder in description`)

  const robots = one(head, /<meta name="robots" content="([^"]*)"/g, 'robots meta', route)?.[1]
  const indexable = robots?.includes('index,') || robots?.startsWith('index')
  if (!robots) fail(`${route}: missing robots meta`)

  const lang = /<html lang="([^"]*)"/.exec(doc)?.[1]
  const expectedLang = route === '/fr' || route.startsWith('/fr/') ? 'fr-CA' : 'en-CA'
  if (lang !== expectedLang) fail(`${route}: <html lang> is ${lang}, expected ${expectedLang}`)

  if (indexable) {
    const canonical = one(head, /<link rel="canonical" href="([^"]*)"/g, 'canonical', route)?.[1]
    if (canonical) {
      if (canonical !== `${ORIGIN}${route === '/' ? '/' : route}`) {
        fail(`${route}: canonical ${canonical} is not self-referencing`)
      }
      if (seenCanonicals.has(canonical)) {
        fail(`${route}: canonical shared with ${seenCanonicals.get(canonical)}`)
      }
      seenCanonicals.set(canonical, route)
      canonicalByRoute.set(route, canonical)
    }

    const alternates = Object.fromEntries(
      [...head.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [
        m[1],
        m[2],
      ]),
    )
    for (const key of ['en-CA', 'fr-CA', 'x-default']) {
      if (!alternates[key]) fail(`${route}: missing hreflang ${key}`)
    }
    const self = `${ORIGIN}${route === '/' ? '/' : route}`
    if (alternates[expectedLang] !== self) {
      fail(`${route}: hreflang ${expectedLang} (${alternates[expectedLang]}) ≠ self (${self})`)
    }
    if (alternates['x-default'] !== alternates['en-CA']) {
      fail(`${route}: x-default must equal the en-CA alternate`)
    }
    alternatesByRoute.set(route, alternates)

    for (const [prop, count] of [
      ['og:title', 1],
      ['og:description', 1],
      ['og:url', 1],
      ['og:image', 1],
      ['og:locale', 1],
    ]) {
      const found = [...head.matchAll(new RegExp(`<meta property="${prop}" `, 'g'))].length
      if (found !== count) fail(`${route}: expected ${count} ${prop}, found ${found}`)
    }
    const ogImage = /<meta property="og:image" content="([^"]*)"/.exec(head)?.[1]
    if (ogImage) {
      const imgPath = ogImage.replace(ORIGIN, '')
      if (!existsSync(path.join(dist, imgPath))) fail(`${route}: og:image ${imgPath} missing`)
    }

    const jsonLdBlocks = [
      ...doc.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ]
    if (jsonLdBlocks.length !== 1) fail(`${route}: expected one JSON-LD block`)
    for (const [, block] of jsonLdBlocks) {
      try {
        const parsed = JSON.parse(block)
        const flat = JSON.stringify(parsed)
        if (PLACEHOLDER.test(flat)) fail(`${route}: placeholder value in JSON-LD`)
        for (const url of flat.matchAll(/"(https?:\/\/[^"]+)"/g)) {
          if (!url[1].startsWith(ORIGIN) && !url[1].startsWith('https://schema.org')) {
            fail(`${route}: JSON-LD URL off canonical origin: ${url[1]}`)
          }
        }
      } catch (e) {
        fail(`${route}: JSON-LD does not parse (${e.message})`)
      }
    }
  }

  const h1s = [...body.matchAll(/<h1[\s>]/g)].length
  if (h1s !== 1) fail(`${route}: expected exactly one <h1>, found ${h1s}`)
  if (!/<main[\s>]/.test(body)) fail(`${route}: missing <main> landmark`)
  const visible = body
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
  if (visible.length < 500) fail(`${route}: visible text too small (${visible.length} chars)`)
}

/* ---------- hreflang reciprocity across files ---------- */

for (const [route, alternates] of alternatesByRoute) {
  for (const key of ['en-CA', 'fr-CA']) {
    const target = alternates[key].replace(ORIGIN, '') || '/'
    const targetAlternates = alternatesByRoute.get(target)
    if (!targetAlternates) {
      fail(`${route}: hreflang ${key} points at ${target}, which is not a prerendered page`)
      continue
    }
    if (targetAlternates[key] !== alternates[key]) {
      fail(`${route}: hreflang ${key} not reciprocal with ${target}`)
    }
  }
  // EN and FR pages must never canonicalize to each other.
  const canonical = canonicalByRoute.get(route)
  const otherLocale = route === '/fr' || route.startsWith('/fr/') ? 'en-CA' : 'fr-CA'
  if (
    canonical &&
    canonical === alternates[otherLocale] &&
    alternates['en-CA'] !== alternates['fr-CA']
  ) {
    fail(`${route}: canonical points at the other locale`)
  }
}

/* ---------- sitemap ---------- */

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8')
if (/&(?!amp;|lt;|gt;|quot;|apos;|#)/.test(sitemap)) fail('sitemap.xml: unescaped ampersand')
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail('sitemap.xml: duplicate URLs')
for (const url of sitemapUrls) {
  if (!url.startsWith(`${ORIGIN}/`) && url !== `${ORIGIN}/`) {
    fail(`sitemap.xml: ${url} not on canonical origin`)
  }
  const route = url.replace(ORIGIN, '') || '/'
  if (route.startsWith('/app')) fail(`sitemap.xml: private URL ${url}`)
  if (/[?#]/.test(url)) fail(`sitemap.xml: URL with query/fragment ${url}`)
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route, 'index.html')
  if (!existsSync(file)) {
    fail(`sitemap.xml: ${url} has no prerendered file`)
    continue
  }
  const doc = await readFile(file, 'utf8')
  if (!/<meta name="robots" content="index/.test(doc)) {
    fail(`sitemap.xml: ${url} is not marked indexable`)
  }
}
for (const [route] of canonicalByRoute) {
  const url = `${ORIGIN}${route === '/' ? '/' : route}`
  if (!sitemapUrls.includes(url)) fail(`indexable page ${route} missing from sitemap.xml`)
}

/* ---------- robots.txt ---------- */

const robotsTxt = await readFile(path.join(dist, 'robots.txt'), 'utf8')
if (!robotsTxt.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  fail('robots.txt: missing production sitemap reference')
}
for (const bot of ['GPTBot', 'ClaudeBot']) {
  if (!new RegExp(`User-agent: ${bot}\\nDisallow: /\\n`).test(robotsTxt)) {
    fail(`robots.txt: training bot ${bot} not fully disallowed`)
  }
}
for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', '*']) {
  if (!robotsTxt.includes(`User-agent: ${bot}`)) fail(`robots.txt: missing group for ${bot}`)
}
// Search bots must repeat the private-path exclusions — a bot-specific group
// replaces the * group entirely, so a bare group would open /app to them.
for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) {
  if (!new RegExp(`User-agent: ${bot}\\nDisallow: /app\\n`).test(robotsTxt)) {
    fail(`robots.txt: ${bot} group must repeat the /app exclusions`)
  }
}
if (!/User-agent: \*\nDisallow: \/app\n/.test(robotsTxt)) {
  fail('robots.txt: general group must disallow /app')
}

/* ---------- llms.txt ---------- */

const llms = await readFile(path.join(dist, 'llms.txt'), 'utf8')
/* Only markdown links count as navigation; prose may mention /app to state
   that it is private. */
for (const m of llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
  const url = m[1]
  if (!url.startsWith(ORIGIN)) fail(`llms.txt: off-origin URL ${url}`)
  const route = url.replace(ORIGIN, '') || '/'
  if (route.startsWith('/app')) fail(`llms.txt: private URL ${url}`)
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, route, 'index.html')
  if (!existsSync(file)) fail(`llms.txt: ${url} has no prerendered page`)
}

/* ---------- app shell + 404 ---------- */

const appShell = await readFile(path.join(dist, 'app.html'), 'utf8')
if (!appShell.includes('noindex, nofollow')) fail('app.html: missing noindex')
if (appShell.includes('rel="canonical"')) fail('app.html: must not carry a canonical')
const notFound = await readFile(path.join(dist, '404.html'), 'utf8')
if (!notFound.includes('noindex')) fail('404.html: missing noindex')

/* ---------- internal links resolve ---------- */

const knownRoutes = new Set(pages.map((p) => p.route))
for (const { route, file } of pages) {
  const doc = await readFile(file, 'utf8')
  const body = doc.split('<div id="root">')[1] ?? ''
  for (const m of body.matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) {
    const target = m[1].replace(/\/$/, '') || '/'
    if (target.startsWith('/app')) continue // client-rendered surface
    if (target.startsWith('/assets') || target.startsWith('/brand')) {
      if (!existsSync(path.join(dist, target))) fail(`${route}: broken asset link ${target}`)
      continue
    }
    if (!knownRoutes.has(target)) fail(`${route}: internal link to unknown route ${target}`)
  }
}

/* ---------- report ---------- */

if (errors.length > 0) {
  console.error(`SEO validation failed with ${errors.length} problem(s):`)
  for (const error of errors.slice(0, 50)) console.error(`  - ${error}`)
  process.exit(1)
}
console.log(
  `SEO validation passed: ${pages.length} pages, ${sitemapUrls.length} sitemap URLs, ` +
    'reciprocal hreflang, valid JSON-LD, resolvable internal links.',
)
