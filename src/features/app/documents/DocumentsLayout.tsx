import { Outlet } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { DoclibProvider } from './DoclibProvider'
import { useDoclib } from './doclibContext'
import { workspaceRoles } from './data'
import type { WorkspaceRole } from './data'

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
      <div className="mx-auto max-w-[1240px]">
        <ViewingAsBar />
        <Outlet />
      </div>
    </DoclibProvider>
  )
}
