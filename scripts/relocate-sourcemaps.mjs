/**
 * Move client source maps out of dist/ after `vite build`.
 *
 * build.sourcemap is 'hidden' (vite.config.ts): the .map files are emitted so
 * production error-report stack traces can be symbolicated, but the JS carries
 * no `sourceMappingURL` comment, so nothing auto-fetches them. Serving the maps
 * from dist/ would still expose the unminified source to anyone who guesses the
 * URL, so this step relocates every dist/**\/*.map into sourcemaps/<rev>/
 * (git-ignored) BEFORE the service worker precaches dist/assets and before
 * dist/ is deployed. The maps stay available as a build artifact — CI can
 * archive sourcemaps/, and the build is deterministic, so a given release's
 * maps can also be regenerated at the same commit.
 *
 * Runs in the `npm run build` pipeline between `vite build` and `build:ssr`.
 */

import { mkdir, readdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const rev = (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 12)
const outRoot = path.join(root, 'sourcemaps', rev)

/** Recursively collect every *.map file under a directory. */
async function collectMaps(dir) {
  const found = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return found // dist/ (or a subdir) may not exist — nothing to move.
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await collectMaps(full)))
    else if (entry.name.endsWith('.map')) found.push(full)
  }
  return found
}

const maps = await collectMaps(dist)
let moved = 0
for (const abs of maps) {
  const dest = path.join(outRoot, path.relative(dist, abs))
  await mkdir(path.dirname(dest), { recursive: true })
  await rename(abs, dest)
  moved += 1
}

console.log(
  `relocate-sourcemaps: moved ${moved} .map file(s) out of dist/ → sourcemaps/${rev}/ ` +
    '(never served, kept for symbolication)',
)
