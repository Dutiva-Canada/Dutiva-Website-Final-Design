import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { LText } from '@/i18n/core'
import type { AdvisorTurnSpec } from '@/features/app/advisor/types'
import type { ChatMessage } from '@/features/app/advisor/types'
import { RailContext } from './railContext'
import type { RailContextMeta, RailState } from './railContext'

const CLOSED: RailState = { open: false, title: '', meta: {}, messages: [] }

/** Canned rail acknowledgement — verbatim from the prototype (`sendRailMessage`). */
const RAIL_ACK: AdvisorTurnSpec = {
  text: {
    en: "Noted — I've logged that against this context. For document generation or a full step-by-step, open this in Advisor Home.",
    fr: 'Noté — je l’ai consigné dans ce contexte. Pour générer des documents ou obtenir la démarche complète, ouvrez ceci dans l’accueil du Conseiller.',
  },
}

export function RailProvider({ children }: { children: ReactNode }) {
  const [rail, setRail] = useState<RailState>(CLOSED)
  const nextId = useRef(1)

  const openRail = useCallback((title: LText, spec: AdvisorTurnSpec, meta: RailContextMeta = {}) => {
    const intro: ChatMessage = {
      id: `rail-${nextId.current++}`,
      author: 'assistant',
      text: spec.text,
      cards: spec.cards,
      citations: spec.citations,
    }
    setRail({ open: true, title, meta, messages: [intro] })
  }, [])

  const closeRail = useCallback(() => {
    setRail((prev) => ({ ...prev, open: false }))
  }, [])

  const sendRailMessage = useCallback((text: string) => {
    setRail((prev) => {
      if (!prev.open) return prev
      const user: ChatMessage = { id: `rail-${nextId.current++}`, author: 'user', text }
      const ack: ChatMessage = {
        id: `rail-${nextId.current++}`,
        author: 'assistant',
        text: RAIL_ACK.text,
        streaming: true,
      }
      return { ...prev, messages: [...prev.messages, user, ack] }
    })
  }, [])

  const value = useMemo(
    () => ({ rail, openRail, closeRail, sendRailMessage }),
    [rail, openRail, closeRail, sendRailMessage],
  )

  return <RailContext value={value}>{children}</RailContext>
}
