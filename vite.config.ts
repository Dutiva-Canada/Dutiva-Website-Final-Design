import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
       preview deployments only — never production. */
    __VERCEL_ENV__: JSON.stringify(process.env.VERCEL_ENV ?? ''),
  },
  build: {
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
            /* @supabase is excluded from vendor so default chunking keeps it
               with its only importers (the lazy app surface and /pricing) —
               prerendered marketing pages never download or preload it. A
               dedicated `supabase` group would instead attract the shared
               vite/preload-helper module and get pulled back into the eager
               entry graph. */
            { name: 'vendor', test: /node_modules[\\/](?!@supabase[\\/])/ },
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
})
