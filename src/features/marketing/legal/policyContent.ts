import type { Lang } from '@/i18n/core'

/**
 * Typed collection over the bilingual policy documents shipped by the
 * dutiva.ca content-migration handoff (`content/<slug>.{en,fr}.ts`).
 *
 * The EN and FR editions of a document are NOT structurally parallel — most
 * pairs differ in section, block, or callout counts (the French editions were
 * drafted as whole documents, not sentence-by-sentence translations). So a
 * document stores two independent language editions rather than zipped `Bi`
 * fields, and `resolvePolicyEdition` picks the active language's edition,
 * falling back to the other language when one side is missing.
 */

export interface PolicyBlock {
  type: 'p' | 'li'
  text: string
}

export interface PolicySection {
  title: string
  blocks: PolicyBlock[]
}

/** One language edition of a policy document. */
export interface PolicyEdition {
  title: string
  lastUpdated?: string
  effectiveDate?: string
  callout?: string[]
  sections: PolicySection[]
}

export interface PolicyDoc {
  slug: string
  en?: PolicyEdition
  fr?: PolicyEdition
}

const editionModules = import.meta.glob<PolicyEdition>('./content/*.ts', {
  eager: true,
  import: 'default',
})

function buildCollection(): Map<string, PolicyDoc> {
  const docs = new Map<string, PolicyDoc>()
  for (const [path, edition] of Object.entries(editionModules)) {
    const match = /\/([a-z0-9-]+)\.(en|fr)\.ts$/.exec(path)
    if (!match) continue
    const slug = match[1]
    const lang = match[2] as Lang
    if (!slug) continue
    const doc = docs.get(slug) ?? { slug }
    doc[lang] = edition
    docs.set(slug, doc)
  }
  return docs
}

const collection = buildCollection()

export function policyDoc(slug: string): PolicyDoc | undefined {
  return collection.get(slug)
}

export interface ResolvedPolicyEdition {
  edition: PolicyEdition
  /** The language the edition is actually written in (≠ requested on fallback). */
  lang: Lang
}

/** The active language's edition, or the other language's when missing. */
export function resolvePolicyEdition(
  doc: PolicyDoc,
  lang: Lang,
): ResolvedPolicyEdition | undefined {
  const preferred = doc[lang]
  if (preferred) return { edition: preferred, lang }
  const other: Lang = lang === 'en' ? 'fr' : 'en'
  const fallback = doc[other]
  return fallback ? { edition: fallback, lang: other } : undefined
}

/**
 * Consecutive `li` blocks grouped into one list so the page can render a
 * semantic `<ul>`; `p` blocks stay standalone paragraphs.
 */
export type PolicyBlockGroup = { kind: 'p'; text: string } | { kind: 'list'; items: string[] }

export function groupPolicyBlocks(blocks: PolicyBlock[]): PolicyBlockGroup[] {
  const groups: PolicyBlockGroup[] = []
  for (const block of blocks) {
    const last = groups.at(-1)
    if (block.type === 'li') {
      if (last?.kind === 'list') last.items.push(block.text)
      else groups.push({ kind: 'list', items: [block.text] })
    } else {
      groups.push({ kind: 'p', text: block.text })
    }
  }
  return groups
}
