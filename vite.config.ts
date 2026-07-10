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
  },
})
