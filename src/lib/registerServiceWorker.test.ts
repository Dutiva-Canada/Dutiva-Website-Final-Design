import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from './registerServiceWorker'

describe('registerServiceWorker', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('is a no-op outside a production build (dev server / tests)', () => {
    const register = vi.fn().mockResolvedValue(undefined)
    const swAddEventListener = vi.fn()
    /* Present a service-worker-capable navigator so the production guard is
       the only thing that can stop registration. */
    vi.stubGlobal('navigator', {
      serviceWorker: { register, addEventListener: swAddEventListener, controller: null },
    })
    const addEventListener = vi.spyOn(window, 'addEventListener')

    registerServiceWorker()

    expect(import.meta.env.PROD).toBe(false)
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.any(Function))
    expect(register).not.toHaveBeenCalled()
    /* The auto-recovery controllerchange listener is gated by the same guard,
       so it must not be wired up in dev / tests either. */
    expect(swAddEventListener).not.toHaveBeenCalled()
  })
})
