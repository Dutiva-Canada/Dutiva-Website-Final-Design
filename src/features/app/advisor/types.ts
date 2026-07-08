import type { LText } from '@/i18n/core'

/**
 * Shared Advisor chat vocabulary — used by the Advisor view, the contextual
 * rail, and any surface that renders assistant replies. Mirrors the message
 * spec shape of the prototype (`pushAdvisorTurn` / `openRail` in App v2).
 */

/** Tone ramp for embedded cards: risk (red), warning (amber), suggestion/info (gold). */
export type CardTone = 'risk' | 'warning' | 'suggestion' | 'info'

export interface ToneCardAction {
  label: LText
  primary?: boolean
  onClick: () => void
}

export interface Citation {
  label: LText
}

export interface ToneCardData {
  tone: CardTone
  title: LText
  body: LText
  citations?: Citation[]
  actions?: ToneCardAction[]
}

/** One assistant reply: streamed text plus optional embedded cards/citations. */
export interface AdvisorTurnSpec {
  text: LText
  cards?: ToneCardData[]
  citations?: Citation[]
}

export interface ChatMessage {
  id: string
  author: 'user' | 'assistant'
  text: LText
  cards?: ToneCardData[]
  citations?: Citation[]
  /** True while the assistant reply is still streaming in. */
  streaming?: boolean
}
