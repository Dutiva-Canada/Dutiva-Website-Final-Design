import { useI18n } from '@/i18n/context'
import { pickL } from '@/i18n/core'
import { useToasts } from './toastsContext'

/**
 * Bottom-right toast stack — the port of the prototype's `toastsView` markup:
 * fixed at 20px from the corner (z 400), each toast an ink-filled pill with
 * white 13.5px text entering on `toastIn`. (The prototype's only alternate
 * ramp — `--risk-dot` for an 'error' tone — has no producer in the app;
 * every `pushToast` uses the ink style ported here.)
 *
 * Mounted by the AppShell inside the `.surface-app` token scope. Messages are
 * stored as `Bi` in the toasts context, so a live language toggle
 * re-localizes visible toasts.
 */
export function ToastHost() {
  const { toasts } = useToasts()
  const { lang } = useI18n()
  return (
    <div className="pointer-events-none fixed right-[20px] bottom-[20px] z-[400] flex max-w-[340px] flex-col gap-[8px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex animate-[toastIn_.2s_ease] items-center gap-[10px] rounded-[10px] bg-ink px-[16px] py-[12px] text-[13.5px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
        >
          {pickL(toast.message, lang)}
        </div>
      ))}
    </div>
  )
}
