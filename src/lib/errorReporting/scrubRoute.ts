/**
 * Reduce a resolved pathname to a privacy-safe **route pattern** before it ever
 * leaves the browser.
 *
 * The binding constraint: the `/app` surface carries employee, case, document,
 * person, and conversation identifiers directly in the URL
 * (`/app/employees/:employeeId`, `/app/cases/:caseId`, …). Sending the resolved
 * path would leak those identifiers into telemetry. So we send the *pattern*
 * (`/app/employees/:id`), never the resolved value — and we strip the query
 * string and hash entirely, since those can carry search text or tokens.
 *
 * Two layers, defensively combined so a route the table doesn't anticipate is
 * still scrubbed:
 *   1. Known public dynamic routes collapse to their named pattern so the
 *      public policy/help slugs (which are not PII) group cleanly rather than
 *      being over-scrubbed to `:id`.
 *   2. Everything else is walked segment by segment: a segment following a
 *      known entity collection, or one that merely *looks* like an identifier,
 *      becomes `:id`. Demo fixtures use human-readable ids (e.g. a person's
 *      name slug), which the identifier heuristic alone would miss — the
 *      collection rule is what guarantees those are scrubbed too.
 */

/** Public dynamic routes whose slug is public content (policy / help docs). */
const PUBLIC_DYNAMIC: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/legal\/[^/]+$/, '/legal/:slug'],
  [/^\/help\/[^/]+$/, '/help/:slug'],
  [/^\/fr\/juridique\/[^/]+$/, '/fr/juridique/:slug'],
  [/^\/fr\/aide\/[^/]+$/, '/fr/aide/:slug'],
]

/**
 * App-surface path segments whose *following* segment is always an entity
 * identifier — even when that identifier is a plain word (demo fixtures) that
 * the identifier heuristic below would not otherwise catch. Kept in sync with
 * the dynamic routes in src/app/appViews.tsx.
 */
const ENTITY_COLLECTIONS = new Set([
  'cases',
  'employees',
  'people',
  'conversations',
  'documents',
  'templates',
  'generate',
  'requests',
  'admin',
])

/** Static children of an entity collection that are real routes, not ids
    (e.g. `/app/documents/studio`) — kept rather than scrubbed. */
const STATIC_CHILDREN = new Set(['studio', 'hr-library', 'templates', 'generate'])

/** Heuristic: does this segment look like an opaque or numeric identifier? */
function isIdentifierLike(segment: string): boolean {
  if (segment.includes('@')) return true // email-ish
  if (/^\d+$/.test(segment)) return true // all digits
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true // uuid
  if (/^[0-9a-f]{16,}$/i.test(segment)) return true // long hex
  if (/^[A-Za-z0-9_-]{20,}$/.test(segment)) return true // long opaque token / nanoid
  if (/\d/.test(segment) && /^[A-Za-z0-9._-]{8,}$/.test(segment)) return true // mixed alnum with a digit
  return false
}

/**
 * Turn a resolved pathname (optionally with query/hash) into a route pattern
 * safe to send in telemetry. Pure and total — never throws.
 */
export function scrubRoutePattern(rawPath: string): string {
  try {
    const path = (rawPath.split(/[?#]/)[0] || '/').trim()
    const normalized = path.startsWith('/') ? path : `/${path}`

    for (const [re, pattern] of PUBLIC_DYNAMIC) {
      if (re.test(normalized)) return pattern
    }

    const segments = normalized.split('/')
    const out: string[] = []
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!
      if (segment === '') {
        out.push(segment)
        continue
      }
      const prev = i > 0 ? segments[i - 1]! : ''
      if (ENTITY_COLLECTIONS.has(prev) && !STATIC_CHILDREN.has(segment)) {
        out.push(':id')
        continue
      }
      out.push(isIdentifierLike(segment) ? ':id' : segment)
    }

    let result = out.join('/') || '/'
    if (result.length > 1) result = result.replace(/\/+$/, '') || '/'
    return result.slice(0, 128)
  } catch {
    /* A scrubbing failure must never block a report — degrade to a safe label. */
    return '/unknown'
  }
}
