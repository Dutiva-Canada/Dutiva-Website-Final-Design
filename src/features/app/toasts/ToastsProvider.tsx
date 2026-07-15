import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { LText } from '@/i18n/core'
import { ToastsContext } from './toastsContext'
import type { Toast, ToastTone } from './toastsContext'

const TOAST_DURATION_MS = 3600

export function ToastsProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: LText, tone: ToastTone = 'ok') => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, message, tone }])
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  )

  return <ToastsContext value={value}>{children}</ToastsContext>
}
