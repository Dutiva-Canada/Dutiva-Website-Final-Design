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
    expect(result).toEqual({ reply: 'Here is some guidance.', conversationId: 'conv-1' })
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
