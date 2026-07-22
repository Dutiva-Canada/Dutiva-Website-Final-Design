import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { beaconOrFetch, createReporter } from './reporter'
import type { ReportPayload } from './reporter'

describe('createReporter', () => {
  let sent: Array<{ endpoint: string; payload: ReportPayload }>
  let clock: number

  function makeReporter(overrides: { send?: () => boolean } = {}) {
    sent = []
    return createReporter({
      endpoint: 'https://proj.supabase.co/functions/v1/report-error',
      env: 'production',
      release: 'abc1234',
      now: () => clock,
      send:
        overrides.send ??
        ((endpoint, body) => {
          sent.push({ endpoint, payload: JSON.parse(body) as ReportPayload })
          return true
        }),
    })
  }

  beforeEach(() => {
    clock = 1_000_000
    document.documentElement.setAttribute('lang', 'en-CA')
  })

  it('builds a scrubbed, PII-free payload', () => {
    const reporter = makeReporter()
    reporter.report({
      error: new Error('Cannot read properties of undefined'),
      kind: 'route-boundary',
      pathname: '/app/cases/8f3b9c1e-0a2d-4b6f-9c1e-0a2d4b6f9c1e?tab=notes',
    })

    expect(sent).toHaveLength(1)
    const { endpoint, payload } = sent[0]!
    expect(endpoint).toBe('https://proj.supabase.co/functions/v1/report-error')
    expect(payload.route).toBe('/app/cases/:id') // resolved id + query gone
    expect(payload.env).toBe('production')
    expect(payload.release).toBe('abc1234')
    expect(payload.kind).toBe('route-boundary')
    expect(payload.locale).toBe('en-CA')
    expect(payload.message).toBe('Cannot read properties of undefined')
    expect(payload).not.toHaveProperty('installId')
  })

  it('reads locale from the live <html lang>', () => {
    document.documentElement.setAttribute('lang', 'fr-CA')
    const reporter = makeReporter()
    reporter.report({ error: new Error('boom'), kind: 'window-error', pathname: '/fr' })
    expect(sent[0]!.payload.locale).toBe('fr-CA')
  })

  it('dedupes an identical error within the dedupe window', () => {
    const reporter = makeReporter()
    const input = { error: new Error('loop'), kind: 'route-boundary' as const, pathname: '/app/home' }
    reporter.report(input)
    reporter.report(input)
    reporter.report(input)
    expect(sent).toHaveLength(1)
  })

  it('re-sends the same error after the dedupe window elapses', () => {
    const reporter = makeReporter()
    const input = { error: new Error('loop'), kind: 'route-boundary' as const, pathname: '/app/home' }
    reporter.report(input)
    clock += 61_000
    reporter.report(input)
    expect(sent).toHaveLength(2)
  })

  it('rate-limits a burst of distinct errors in the rolling window', () => {
    const reporter = makeReporter()
    for (let i = 0; i < 10; i++) {
      reporter.report({ error: new Error(`distinct ${i}`), kind: 'window-error', pathname: '/app/home' })
    }
    expect(sent.length).toBeLessThanOrEqual(5)
  })

  it('never throws and does not record state when the transport fails', () => {
    const reporter = makeReporter({
      send: () => {
        throw new Error('transport exploded')
      },
    })
    expect(() =>
      reporter.report({ error: new Error('x'), kind: 'window-error', pathname: '/' }),
    ).not.toThrow()
  })

  it('does not mark a fingerprint sent when transport returns false (allows retry)', () => {
    let ok = false
    const reporter = makeReporter({
      send: () => {
        sent.push({ endpoint: '', payload: {} as ReportPayload })
        return ok
      },
    })
    const input = { error: new Error('retry'), kind: 'window-error' as const, pathname: '/' }
    reporter.report(input) // returns false → not recorded
    ok = true
    reporter.report(input) // retried, now succeeds
    expect(sent).toHaveLength(2)
  })

  it('handles non-Error rejection reasons', () => {
    const reporter = makeReporter()
    reporter.report({ error: 'string reason', kind: 'unhandled-rejection', pathname: '/' })
    reporter.report({ error: { message: 'objecty' }, kind: 'unhandled-rejection', pathname: '/app/home' })
    expect(sent.map((s) => s.payload.message)).toEqual(['string reason', 'objecty'])
  })
})

describe('beaconOrFetch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('prefers sendBeacon and does not call fetch when it succeeds', () => {
    const sendBeacon = vi.fn().mockReturnValue(true)
    const fetchSpy = vi.fn()
    vi.stubGlobal('navigator', { ...navigator, sendBeacon })
    vi.stubGlobal('fetch', fetchSpy)

    expect(beaconOrFetch('https://e', '{}')).toBe(true)
    expect(sendBeacon).toHaveBeenCalledWith('https://e', '{}')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('falls back to a keepalive fetch when sendBeacon returns false', () => {
    const sendBeacon = vi.fn().mockReturnValue(false)
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('navigator', { ...navigator, sendBeacon })
    vi.stubGlobal('fetch', fetchSpy)

    expect(beaconOrFetch('https://e', '{}')).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://e',
      expect.objectContaining({ method: 'POST', keepalive: true, credentials: 'omit' }),
    )
  })

  it('falls back to fetch when sendBeacon throws', () => {
    const sendBeacon = vi.fn().mockImplementation(() => {
      throw new Error('nope')
    })
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('navigator', { ...navigator, sendBeacon })
    vi.stubGlobal('fetch', fetchSpy)

    expect(beaconOrFetch('https://e', '{}')).toBe(true)
    expect(fetchSpy).toHaveBeenCalled()
  })
})
