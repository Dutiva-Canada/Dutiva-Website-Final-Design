import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { WorkspaceContext } from './workspaceContextStore'
import type { WorkspaceContextState } from './workspaceContextStore'

export function WorkspaceContextProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<WorkspaceContextState | null>(null)

  const setContext = useCallback((ctx: WorkspaceContextState | null) => {
    setContextState(ctx)
  }, [])

  const clearContext = useCallback(() => setContextState(null), [])

  const removeContextMeta = useCallback((index: number) => {
    setContextState((prev) =>
      prev ? { ...prev, meta: prev.meta.filter((_, i) => i !== index) } : prev,
    )
  }, [])

  const value = useMemo(
    () => ({ context, setContext, clearContext, removeContextMeta }),
    [context, setContext, clearContext, removeContextMeta],
  )

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>
}
