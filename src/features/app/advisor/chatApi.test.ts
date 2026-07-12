import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadChatApiWithFakeInvoke(
  invoke: (name: string, opts: { body: unknown }) => Promise<{ data: unknown; error: unknown }>,
) {
  vi.doMock('@/lib/supabaseClient', () => ({ supabase: { functions: { invoke } } }))
  vi.resetModules()
  return import('./chatApi')
}

async function loadChatApiWithNoClient() {
  vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
  vi.resetModules()
  return import('./chatApi')
}

describe('sendAdvisorMessage', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  it('throws when Supabase is not configured', async () => {
    const { sendAdvisorMessage } = await loadChatApiWithNoClient()
    await expect(sendAdvisorMessage('hello', null)).rejects.toThrow('not configured')
  })

  it('invokes advisor-chat with the message and conversation id, and parses the reply', async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { data: { reply: 'Here is some guidance.', conversation_id: 'conv-1' } },
      error: null,
    })
    const { sendAdvisorMessage } = await loadChatApiWithFakeInvoke(invoke)

    const result = await sendAdvisorMessage('What is ESA notice?', 'conv-0')

    expect(invoke).toHaveBeenCalledWith('advisor-chat', {
      body: { message: 'What is ESA notice?', conversation_id: 'conv-0' },
    })
    expect(result).toEqual({
      reply: 'Here is some guidance.',
      conversationId: 'conv-1',
      response: null,
    })
  })

  it('parses a structured advisor_response payload against the contract', async () => {
    const advisorResponse = {
      route: {
        responseMode: 'hr',
        workspaceAllowed: true,
        retrievalAllowed: true,
        legalBasisAllowed: true,
        documentsAllowed: true,
        webSearchAllowed: false,
      },
      jurisdiction: { status: 'known', value: 'Ontario · Provincially regulated' },
      risk: { compliance: 'high', safety: 'none' },
      professionalReview: null,
      supportNotice: false,
      legalBasis: { items: [{ label: 'ESA s.57 — Notice of termination', valid: true }] },
      retrieval: { items: ['Termination · ON'] },
      webSearch: null,
      confidence: { label: 'Moderate', pct: 62 },
      warnings: [],
      isCrisis: false,
    }
    const invoke = vi.fn().mockResolvedValue({
      data: {
        data: { reply: 'ok', conversation_id: 'conv-2', advisor_response: advisorResponse },
      },
      error: null,
    })
    const { sendAdvisorMessage } = await loadChatApiWithFakeInvoke(invoke)

    const result = await sendAdvisorMessage('hi', null)
    expect(result.response).toEqual(advisorResponse)
  })

  it('returns response null (reply intact) when the structured payload is malformed', async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        data: { reply: 'ok', conversation_id: 'conv-3', advisor_response: { route: 'nope' } },
      },
      error: null,
    })
    const { sendAdvisorMessage } = await loadChatApiWithFakeInvoke(invoke)

    const result = await sendAdvisorMessage('hi', null)
    expect(result.reply).toBe('ok')
    expect(result.response).toBeNull()
  })

  it('propagates an invoke error', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: new Error('network down') })
    const { sendAdvisorMessage } = await loadChatApiWithFakeInvoke(invoke)
    await expect(sendAdvisorMessage('hi', null)).rejects.toThrow('network down')
  })

  it('throws when the response fails schema validation', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { data: { reply: 'ok' } }, error: null })
    const { sendAdvisorMessage } = await loadChatApiWithFakeInvoke(invoke)
    await expect(sendAdvisorMessage('hi', null)).rejects.toThrow()
  })
})
