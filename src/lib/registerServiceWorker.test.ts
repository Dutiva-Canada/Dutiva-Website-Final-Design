import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from './registerServiceWorker'

describe('registerServiceWorker', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('is a no-op outside a production build (dev server / tests)', () => {
    const register = vi.fn().mockResolvedValue(undefined)
    /* Present a service-worker-capable navigator so the production guard is
       the only thing that can stop registration. */
    vi.stubGlobal('navigator', { serviceWorker: { register } })
    const addEventListener = vi.spyOn(window, 'addEventListener')

    registerServiceWorker()

    expect(import.meta.env.PROD).toBe(false)
    expect(addEventListener).not.toHaveBeenCalledWith('load', expect.any(Function))
    expect(register).not.toHaveBeenCalled()
  })
})
