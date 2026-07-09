import type { Bi } from '@/i18n/core'
import type { ChatMessage } from '@/features/app/advisor/types'
import type { FlowKeyOrFallback, MessageExtras } from './advisorFlows'

/** A conversation started in this session (prototype `startFlow` newChat). */
export interface SessionChat {
  id: string
  title: Bi
  pinned: boolean
  bucket: 'today'
  flowKey: FlowKeyOrFallback
}

/**
 * In-memory Advisor session — the prototype keeps chats in app-level state,
 * so conversations survive navigating to other views and back. This module
 * store gives the (route-mounted) AdvisorView the same lifetime: it lives for
 * the browser session and is intentionally not persisted (matching the
 * prototype, whose only persistence is theme + language).
 *
 * `mountSeq` gives each AdvisorView mount a distinct engine id-prefix, so ids
 * of messages restored from `transcripts` can never collide with ids the
 * freshly-mounted engine generates.
 */
interface AdvisorSessionStore {
  chats: SessionChat[]
  extras: Record<string, MessageExtras>
  transcripts: Map<string, ChatMessage[]>
  activeChatId: string | null
  nextChatSeq: number
  mountSeq: number
}

export const advisorSession: AdvisorSessionStore = {
  chats: [],
  extras: {},
  transcripts: new Map(),
  activeChatId: null,
  nextChatSeq: 1,
  mountSeq: 1,
}

/** Test helper — clear all session state between tests. */
export function resetAdvisorSession(): void {
  advisorSession.chats = []
  advisorSession.extras = {}
  advisorSession.transcripts = new Map()
  advisorSession.activeChatId = null
  advisorSession.nextChatSeq = 1
  advisorSession.mountSeq = 1
}
