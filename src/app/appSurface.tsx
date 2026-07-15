import { Suspense, lazy } from 'react'
import { LangProvider } from '@/i18n/LangProvider'
import { AppProviders } from '@/features/app/AppProviders'

/**
 * Lazily composed /app route elements. The provider stack (Auth → Supabase
 * client, workspace mode, toasts, rail, …) lives in this chunk rather than
 * the route table, so marketing visitors never download the app
 * dependencies. Language on the app surface follows the persisted
 * preference (LangProvider), not the URL — private routes have no locale
 * URLs and are noindex.
 */
const EntryStage = lazy(() =>
  import('@/features/app/shell/EntryStage').then((m) => ({ default: m.EntryStage })),
)
const AppShell = lazy(() =>
  import('@/features/app/shell/AppShell').then((m) => ({ default: m.AppShell })),
)
const RequireAdminSession = lazy(() =>
  import('@/features/app/auth/RequireAdminSession').then((m) => ({
    default: m.RequireAdminSession,
  })),
)

/** /app/welcome — app entry stage, the sign-in gate (invite-only). */
export function AppWelcome() {
  return (
    <LangProvider>
      <AppProviders>
        <Suspense fallback={null}>
          <EntryStage />
        </Suspense>
      </AppProviders>
    </LangProvider>
  )
}

/** /app — workspace shell; RequireAdminSession bounces anyone who isn't the
    one allowed account back to /app/welcome. */
export function Workspace() {
  return (
    <LangProvider>
      <AppProviders>
        <Suspense fallback={null}>
          <RequireAdminSession>
            <AppShell />
          </RequireAdminSession>
        </Suspense>
      </AppProviders>
    </LangProvider>
  )
}
