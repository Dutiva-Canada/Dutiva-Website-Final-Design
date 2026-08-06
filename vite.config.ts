import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { parse } from '@babel/parser'
import MagicString from 'magic-string'

/**
 * Vite transform that stamps every host (lowercase) JSX element with a
 * `data-loc="src/…/File.tsx:line"` attribute, so the in-app Dev Annotations
 * overlay (src/devtools/) can map any clicked element back to its exact
 * source location. Runs `pre`, on the raw TSX before the React/oxc JSX
 * transform, and inserts inline (no new lines) so source maps and Fast
 * Refresh are unaffected. Added only for `vite dev` and Vercel *preview*
 * builds (see `stampSource`) — production JSX is never touched, so live
 * dutiva.ca markup carries no data-loc attributes and no dev tooling.
 *
 * (@vitejs/plugin-react v6 is oxc-based and takes no Babel plugins, hence a
 * standalone transform here rather than a JSX Babel visitor.)
 */
function devSourceLocation(): Plugin {
  return {
    name: 'dutiva-dev-source-location',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0] ?? id
      if (!/\.[jt]sx$/.test(file) || file.includes('/node_modules/')) return null
      const rel = file.replace(/\\/g, '/').split('/src/').pop()
      if (!rel) return null

      let ast
      try {
        ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
      } catch {
        return null // never let a parse hiccup break the dev/preview build
      }

      const s = new MagicString(code)
      let touched = false
      walkAst(ast.program, (node) => {
        if (node.type !== 'JSXOpeningElement') return
        const name = node.name
        if (!name || name.type !== 'JSXIdentifier' || !/^[a-z]/.test(name.name)) return
        const line = node.loc?.start?.line
        if (typeof name.end !== 'number' || !line) return
        s.appendLeft(name.end, ` data-loc="src/${rel}:${line}"`)
        touched = true
      })
      if (!touched) return null
      return { code: s.toString(), map: s.generateMap({ hires: true }) }
    },
  }
}

/**
 * Every npm package reachable from `roots` through `dependencies` — the tree
 * that ships when those roots are imported. Used to keep a dependency tree out
 * of the eager `vendor` chunk without hand-maintaining the member list: the
 * markdown renderer alone pulls 99 packages (micromark, mdast-util-*,
 * hast-util-*, unified, …), and a list that long drifts the first time a
 * plugin is added.
 *
 * Peer dependencies are deliberately not followed — react is a peer of
 * react-markdown, and swallowing it would empty the vendor chunk. `keepInVendor`
 * is the belt to that braces: a package named there is never excluded, however
 * it was reached.
 */
function dependencyClosure(roots: readonly string[], keepInVendor: readonly string[]): Set<string> {
  const keep = new Set(keepInVendor)
  const seen = new Set<string>()
  const queue = [...roots]
  while (queue.length) {
    const name = queue.pop()!
    if (seen.has(name) || keep.has(name)) continue
    seen.add(name)
    let pkg: { dependencies?: Record<string, string> }
    try {
      pkg = JSON.parse(
        readFileSync(
          fileURLToPath(new URL(`./node_modules/${name}/package.json`, import.meta.url)),
          'utf8',
        ),
      )
    } catch {
      continue // not installed (optional/platform dep) — nothing to exclude
    }
    queue.push(...Object.keys(pkg.dependencies ?? {}))
  }
  return seen
}

/** `a/b` and `c` → `(?:a[\\/]b|c)`, safe to embed in the vendor group's test. */
function packageAlternation(names: Iterable<string>): string {
  const escaped = [...names]
    .sort()
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\//g, '[\\\\/]'))
  return `(?:${escaped.join('|')})`
}

/** Depth-first walk over a Babel AST, visiting every node with a `type`. */
function walkAst(node: any, visit: (n: any) => void): void {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const child of node) walkAst(child, visit)
    return
  }
  if (typeof node.type === 'string') visit(node)
  for (const key in node) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'range') continue
    walkAst(node[key], visit)
  }
}

/* The markdown renderer's dependency tree, as a regex alternation for the
   vendor group's test below. Computed once at config load. */
const MARKDOWN_TREE = packageAlternation(
  dependencyClosure(
    ['react-markdown', 'remark-gfm'],
    ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'],
  ),
)

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  /* Stamp source locations for local dev and Vercel preview builds only —
     never production (VERCEL_ENV === 'production' or unset) and never under
     Vitest, whose transformed output tests may inspect. */
  const stampSource =
    !process.env.VITEST && (command === 'serve' || process.env.VERCEL_ENV === 'preview')

  return {
    plugins: [...(stampSource ? [devSourceLocation()] : []), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      /* Bake Vercel's VERCEL_ENV system var ('production' | 'preview' |
         'development') into the client bundle at build time. It's a build-only
         env var, not VITE_-prefixed, so it isn't otherwise exposed to the
         browser — this is the one place it crosses into client code. Unset
         locally and in tests, where it collapses to '' (see src/lib/deployEnv).
         Consumed by RequireAdminSession to drop the invite-only gate on
         preview deployments only — never production, and by src/devtools to
         enable the annotation overlay on preview. */
      __VERCEL_ENV__: JSON.stringify(process.env.VERCEL_ENV ?? ''),
      /* Commit SHA of the deployed build (Vercel system var), baked in so
         client error reports (src/lib/errorReporting) can be tied back to the
         exact release and its source maps. Unset locally and under Vitest,
         where it collapses to '' (see src/lib/release). */
      __RELEASE_SHA__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA ?? ''),
    },
    build: {
      /* 'hidden' emits .map files but omits the `//# sourceMappingURL` comment,
         so browsers and crawlers never auto-fetch them. They exist only to
         symbolicate error-report stack traces; scripts/relocate-sourcemaps.mjs
         then moves them out of dist/ so they are never publicly served. */
      sourcemap: 'hidden',
      rolldownOptions: {
        output: {
          /* Splits third-party deps (react, react-router-dom, lucide-react, …)
             into their own chunk so app code changes don't invalidate vendor
             caching, and to keep the main entry chunk under the 500kB warning.
             supabase-js gets its own group: only the app surface and /pricing
             import it (lazily), so prerendered marketing pages never download
             or preload it. */
          codeSplitting: {
            groups: [
              /* The i18n catalogue splits along the same boundary
                 src/i18n/messages/{marketing,workspace,shared}.ts enforce at
                 the type level (TODO.md EF6a): ForcedLangProvider (every
                 marketing page) reads marketing.ts + shared.ts through
                 `t()`; LangProvider (/app, always behind a lazy() boundary —
                 see src/app/appSurface.tsx) reads the full catalogue,
                 including workspace.ts's ~29 modules.

                 Without these two groups, default chunking still put all ~40
                 feature modules in one chunk: workspace.ts and marketing.ts
                 both flow through index.ts, so anything that imports index.ts
                 (LangProvider does, for the app surface) shares a chunk with
                 everything index.ts imports, dragging workspace.ts back onto
                 the marketing critical path despite being lazy-reachable
                 only. Naming the marketing-only group explicitly, before the
                 workspace catch-all, keeps them apart; ForcedLangProvider and
                 src/seo/routes.ts import `marketing.ts` directly rather than
                 `index.ts` for the same reason.

                 The prior single 'messages' grouping predates that split and
                 existed for the opposite reason: left to default chunking,
                 the (then-unsplit) catalogue became 25+ separate files, each
                 modulepreloaded from every prerendered page. Two groups avoid
                 both failure modes at once. */
              /* The i18n catalogue is one chunk on purpose. messages/index.ts
                 merges 42 feature modules into a single object and every
                 surface reads it synchronously through `t()`, so all 42 are in
                 the eager graph regardless. Left to default chunking they
                 became 25+ separate files, each modulepreloaded from every
                 prerendered page — the same bytes bought with 25 extra
                 round-trips on the critical path of a landing page. Grouping
                 changes no code: it only stops splitting what is always
                 fetched together.

                 2026-08-05: src/i18n/messages/{workspace,marketing,shared}.ts
                 now split the *source* by surface, and ForcedLangProvider /
                 src/seo/routes.ts import marketing.ts directly rather than
                 the merged index — real progress on TODO.md EF6a's typing
                 problem. It did NOT translate into fewer eager bytes: tried
                 splitting this group into messages-marketing /
                 messages-workspace and the eager graph stayed 671.5kB,
                 unchanged. Root cause traced one level further than the TODO
                 left it: src/features/app/shell/navLabels.ts and
                 ProductionEmptyState.tsx — both in ALLOWED_APP_MODULES below,
                 eager by construction — import shell.ts and workspaceMode.ts
                 directly, and excluding just those two files from the
                 workspace group's `test` did not stop them appearing in the
                 workspace chunk's output (confirmed via the chunk's own
                 source map). Whatever pulls them back in survives a
                 same-session investigation; left as one chunk rather than
                 shipping two that don't achieve the split they're named for. */
              {
                name: 'messages',
                test: /[\\/]src[\\/]i18n[\\/]messages[\\/]/,
              },
              /* @supabase is excluded from vendor so default chunking keeps it
                 with its only importers (the lazy app surface and /pricing) —
                 prerendered marketing pages never download or preload it. A
                 dedicated `supabase` group would instead attract the shared
                 vite/preload-helper module and get pulled back into the eager
                 entry graph.

                 recharts and its d3 / redux tree are excluded for the same
                 reason, and it matters more: ~430kB raw, serving exactly one
                 thing — the ```chart block in an Advisor reply. ChatMarkdown
                 imports ChatChart dynamically, so left ungrouped those modules
                 form an on-demand chunk fetched the first time a reply
                 actually contains a chart. Naming them as a group instead
                 makes the chunk static, and AdvisorView links it eagerly.

                 react-markdown's tree (MARKDOWN_TREE) is excluded on the same
                 grounds: ~158kB parsing Markdown for Advisor replies, reached
                 only through ChatMarkdown, which only the lazy Advisor surface
                 renders. In vendor it rode the eager entry graph, so every
                 marketing visitor downloaded a Markdown parser to read a
                 landing page. It is computed rather than listed because the
                 tree is 99 packages deep. */
              {
                name: 'vendor',
                test: new RegExp(
                  `node_modules[\\\\/](?!@supabase[\\\\/])(?!${MARKDOWN_TREE}[\\\\/])` +
                    `(?!(?:recharts|victory-vendor|d3-[a-z-]+|internmap|@reduxjs[\\\\/]toolkit` +
                    `|react-redux|reselect|immer|use-sync-external-store|es-toolkit` +
                    `|decimal\\.js-light|eventemitter3)[\\\\/])`,
                ),
              },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      /* First test per worker pays the fixture-module transform cost; on a
         loaded machine that alone can exceed the 5s default. */
      testTimeout: 20000,
      hookTimeout: 20000,
      /* Force the doclib data layer onto its bundled fixtures, independent of
         any local .env: Vite loads .env for `vitest` same as `vite dev`, and a
         real Supabase read returns updated_at-sorted rows instead of the
         fixture order tests assert against. */
      env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
      /* Thresholds set a few points under the measured baseline (statements
         83.7%, branches 69.9%, functions 80.5%, lines 85.1%) so normal
         fluctuation doesn't flake CI, while a real coverage regression still
         fails `npm run test:coverage`. */
      coverage: {
        provider: 'v8',
        thresholds: {
          statements: 80,
          branches: 65,
          functions: 75,
          lines: 80,
        },
      },
    },
  }
})
