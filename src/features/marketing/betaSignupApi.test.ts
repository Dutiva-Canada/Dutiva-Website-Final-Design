import { describe, expect, it, vi, beforeEach } from 'vitest'

const invoke = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabaseClient', () => ({ supabase: { functions: { invoke } } }))

import { createBetaSignup, BetaSignupError } from './betaSignupApi'

/** Shape of a supabase-js FunctionsHttpError as the client surfaces it. */
const httpError = (status: number) => ({ error: { context: { status } } })

describe('createBetaSignup', () => {
  beforeEach(() => invoke.mockReset())

  it('sends the fields the edge function expects', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })
    await createBetaSignup({
      email: 'owner@example.ca',
      company: '  Example Inc. ',
      province: 'on',
      language: 'fr',
      consent: true,
    })

    expect(invoke).toHaveBeenCalledWith('create-beta-signup', {
      body: {
        email: 'owner@example.ca',
        company: 'Example Inc.',
        province: 'on',
        language: 'fr',
        source: 'landing',
        consent: true,
        contact_fax: '',
      },
    })
  })

  it('omits the optional fields rather than sending empty strings', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })
    await createBetaSignup({
      email: 'owner@example.ca',
      company: '   ',
      province: '',
      language: 'en',
      consent: true,
    })

    const body = invoke.mock.calls[0]![1].body
    expect(body.company).toBeUndefined()
    expect(body.province).toBeUndefined()
  })

  it('forwards the honeypot to the server trap', async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null })
    await createBetaSignup({
      email: 'bot@example.ca',
      language: 'en',
      consent: true,
      honeypot: 'filled-by-a-bot',
    })

    expect(invoke.mock.calls[0]![1].body.contact_fax).toBe('filled-by-a-bot')
  })

  it('maps 429 to rate_limited', async () => {
    invoke.mockResolvedValue(httpError(429))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).rejects.toMatchObject({ code: 'rate_limited' })
  })

  it('maps 422 to validation', async () => {
    invoke.mockResolvedValue(httpError(422))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: false }),
    ).rejects.toMatchObject({ code: 'validation' })
  })

  it('maps anything else to a generic error', async () => {
    invoke.mockResolvedValue(httpError(500))
    await expect(
      createBetaSignup({ email: 'owner@example.ca', language: 'en', consent: true }),
    ).rejects.toBeInstanceOf(BetaSignupError)
  })
})
