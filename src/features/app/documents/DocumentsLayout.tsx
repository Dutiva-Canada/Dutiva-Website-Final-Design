import { Link, Outlet, useLocation } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { doclibMessages as DL } from '@/i18n/messages/doclib'
import { shellMessages as M } from '@/i18n/messages/shell'
import { isDoclibStudioPath } from '@/features/app/shell/navConfig'
import { DoclibProvider } from './DoclibProvider'
import { useDoclib } from './doclibContext'
import { workspaceRoles } from './data'
import type { WorkspaceRole } from './data'

/**
 * Repository/Studio switcher. These are two distinct routes, not panels of
 * one page, so this is a nav landmark with `aria-current` rather than
 * WAI-ARIA tab semantics (role="tab" implies roving-tabindex arrow-key
 * navigation and an associated tabpanel, neither of which applies here).
 */
function DocumentsTabs() {
  const { x } = useI18n()
  const { pathname } = useLocation()
  const studio = isDoclibStudioPath(pathname)
  const linkClass = (active: boolean) =>
    `shrink-0 rounded-none border-b-2 px-[14px] py-[9px] font-sans text-[13px] font-semibold whitespace-nowrap ${
      active ? 'border-navy text-text' : 'border-transparent text-text-muted'
    }`
  return (
    <nav
      aria-label={x(M.shell_nav_library)}
      className="mb-[16px] flex gap-[2px] overflow-x-auto border-b border-border"
    >
      <Link
        to="/app/documents"
        aria-current={studio ? undefined : 'page'}
        className={linkClass(!studio)}
      >
        {x(DL.doclib_nav_documents)}
      </Link>
      <Link
        to="/app/documents/studio"
        aria-current={studio ? 'page' : undefined}
        className={linkClass(studio)}
      >
        {x(DL.doclib_nav_studio)}
      </Link>
    </nav>
  )
}

/**
 * Shared frame for every /app/documents route: mounts the feature provider
 * and the "Viewing as" bar — the prototype's permission-demo control (kept
 * per the handoff; real auth is out of scope for the demo phase).
 */
function ViewingAsBar() {
  const { t, x } = useI18n()
  const { role, setRole } = useDoclib()
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
        <UserRound size={13} aria-hidden="true" />
        {t('doclib_app_viewingAs')}
      </span>
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as WorkspaceRole)}
        aria-label={t('doclib_app_viewingAs')}
        className="max-w-[190px] truncate rounded-[9px] border border-border bg-surface px-[10px] py-[5px] text-[12.5px] font-semibold text-text"
      >
        {workspaceRoles.map((info) => (
          <option key={info.key} value={info.key}>
            {x(info.label)}
          </option>
        ))}
      </select>
    </div>
  )
}

export function DocumentsLayout() {
  return (
    <DoclibProvider>
      {/* The shell's flex column doesn't scroll itself (AppShell.tsx) — every
          top-level view supplies its own flex-1 overflow-y-auto scroll
          container (see e.g. PoliciesView); this layout is the doclib
          screens' equivalent. min-h-0 lets it shrink so overflow can engage. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1240px]">
          <DocumentsTabs />
          <ViewingAsBar />
          <Outlet />
        </div>
      </div>
    </DoclibProvider>
  )
}
