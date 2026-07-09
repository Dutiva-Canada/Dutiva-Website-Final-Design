import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { bi } from '@/i18n/core'
import type { LText } from '@/i18n/core'
import { advisorViewMessages as M } from '@/i18n/messages/advisorView'
import { useAdvisorEngine } from '@/features/app/advisor/useAdvisorEngine'
import type { AdvisorTurnSpec, ChatMessage, ToneCardData } from '@/features/app/advisor/types'
import { useRail } from '@/features/app/rail/railContext'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { useDocStudio } from '@/features/app/docstudio/docStudioContext'
import {
  chats,
  employeeDetails,
  employees,
  followupFallbackText,
  followupReplies,
  lightFlowFallbackText,
  lightFlows,
} from '@/data'
import type { FixtureAction, FixtureToneCard } from '@/data'
import { AdvisorHome } from './AdvisorHome'
import { ChatPane } from './ChatPane'
import { ThreadList } from './ThreadList'
import type { ThreadGroup } from './ThreadList'
import {
  estimatorFollowup,
  fallbackChips,
  fallbackIntro,
  flowJurisdictions,
  flowTitles,
  freshQuickForm,
  genericAck,
  routeFlowKeyFromText,
  terminationAssessment,
  terminationIntro,
} from './advisorFlows'
import { readNavNewChat, readNavStartFlow } from './advisorNav'
import { advisorSession } from './advisorSession'
import type { SessionChat } from './advisorSession'
import type { FlowKeyOrFallback, MessageExtras, SuggestChipSpec } from './advisorFlows'
import type { PriorityAction } from './advisorHomeData'

/**
 * Advisor view — the full-page AI chat (prototype `isAdvisorView`):
 *
 * - left column: thread list grouped Pinned / Today / Previous 7 days / Older
 *   (the prototype renders these groups in the sidebar nav while the Advisor
 *   view is active; here they live inside the view — the shell sidebar is
 *   shared chrome);
 * - no active thread → the Advisor home empty state (metrics, daily brief,
 *   priorities, composer, suggestion grid);
 * - active thread → the transcript with the shared streaming engine, canned
 *   light flows, follow-up replies, doc-generate chips, and the termination
 *   quick form.
 *
 * Honours router state `{ chatId }` (AdvisorSearchNavState) to select a
 * thread on mount / on search navigation.
 */

/**
 * Engine message-id prefix. `pushUser`/`pushAdvisor` mirror the engine's
 * sequential id scheme (`${idPrefix}-${n}`, one increment per created
 * message) so per-message extras (docs / follow-ups / quick form) can be
 * keyed by id before the state update lands.
 */
const ENGINE_PREFIX = 'advmsg'

const seedId = (chatId: string, messageId: string) => `seed-${chatId}-${messageId}`

/** Doc/follow-up chips on the seeded transcripts, keyed by seed message id. */
const seedExtras: Record<string, MessageExtras> = {}
for (const chat of chats) {
  for (const m of chat.messages) {
    if ((m.docs?.length ?? 0) > 0 || (m.followups?.length ?? 0) > 0) {
      seedExtras[seedId(chat.id, m.id)] = { docs: m.docs, followups: m.followups }
    }
  }
}

/** Freeze in-flight turns when a thread is stashed (switching threads). */
function settle(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) =>
    m.status === 'thinking' || m.status === 'streaming'
      ? { ...m, status: 'done' as const, streaming: false, streamedLen: undefined }
      : m,
  )
}

function readNavChatId(state: unknown): string | null {
  if (state !== null && typeof state === 'object' && 'chatId' in state) {
    const value = (state as { chatId?: unknown }).chatId
    if (typeof value === 'string') return value
  }
  return null
}


export function AdvisorView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { openRail, closeRail } = useRail()
  const { showToast } = useToasts()
  const { openDocStudio } = useDocStudio()

  /* Session-scoped state lives in the advisorSession module store so
     conversations survive navigating away and back (prototype app-level
     state); the local useState mirrors it for rendering. */
  const [sessionChats, setSessionChatsState] = useState<SessionChat[]>(() => advisorSession.chats)
  const setSessionChats = (updater: (prev: SessionChat[]) => SessionChat[]) => {
    setSessionChatsState((prev) => {
      const next = updater(prev)
      advisorSession.chats = next
      return next
    })
  }
  const [extras, setExtrasState] = useState<Record<string, MessageExtras>>(
    () => advisorSession.extras,
  )
  const setExtras = (
    updater: (prev: Record<string, MessageExtras>) => Record<string, MessageExtras>,
  ) => {
    setExtrasState((prev) => {
      const next = updater(prev)
      advisorSession.extras = next
      return next
    })
  }
  const transcripts = useRef(advisorSession.transcripts)
  const nextEngineId = useRef(1)
  /* Per-mount engine prefix — restored transcript ids never collide with the
     freshly-mounted engine's sequence. */
  const enginePrefixRef = useRef<string | null>(null)
  if (enginePrefixRef.current === null) {
    enginePrefixRef.current = `${ENGINE_PREFIX}m${advisorSession.mountSeq++}`
  }
  const enginePrefix = enginePrefixRef.current
  const selectChatRef = useRef<(chatId: string) => void>(() => {})
  const startFlowRef = useRef<(flowKey: FlowKeyOrFallback, userText: LText) => void>(() => {})
  const newConversationRef = useRef<() => void>(() => {})
  /* Last-handled router state (by identity) — guards StrictMode double-runs
     and re-renders between the replace-navigation and the state clearing. */
  const handledNavState = useRef<unknown>(undefined)

  /* ---------------------------------------------- fixture-card translation */

  const runFixtureAction = (action: FixtureAction) => {
    switch (action.kind) {
      case 'open-case':
        navigate(`/app/cases/${action.target}`)
        break
      case 'open-employee':
        navigate(`/app/employees/${action.target}`)
        break
      case 'open-chat':
        selectChatRef.current(action.target)
        break
      case 'open-compliance':
        navigate('/app/compliance')
        break
      case 'open-view':
        navigate(`/app/${action.target}`)
        break
      case 'draft-doc':
        openDocStudio(action.target)
        break
    }
  }

  const toToneCard = (card: FixtureToneCard): ToneCardData => ({
    tone: card.tone,
    title: card.title,
    body: card.body,
    confidence: card.confidence,
    citations: card.citations,
    actions: card.actions?.map((action) => ({
      label: action.label,
      primary: action.primary,
      onClick: () => runFixtureAction(action),
    })),
  })

  const seedFor = (chatId: string): ChatMessage[] => {
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) return []
    return chat.messages.map((m) => ({
      id: seedId(chatId, m.id),
      author: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      text: m.text ?? '',
      userChips: m.userChips,
      reasoning: m.reasoning,
      cards: m.cards?.map(toToneCard),
      status: 'done' as const,
    }))
  }

  /* --------------------------------------------------------------- engine */

  const [activeChatId, setActiveChatIdState] = useState<string | null>(() => {
    const navId = readNavChatId(location.state)
    if (navId !== null && chats.some((c) => c.id === navId)) return navId
    /* No explicit navigation target — resume the thread that was open when
       the view last unmounted (prototype app-level activeChatId). */
    const resumed = advisorSession.activeChatId
    if (
      resumed !== null &&
      (chats.some((c) => c.id === resumed) || advisorSession.chats.some((c) => c.id === resumed))
    ) {
      return resumed
    }
    return null
  })
  const setActiveChatId = (id: string | null) => {
    advisorSession.activeChatId = id
    setActiveChatIdState(id)
  }

  const initialMessages = useRef<ChatMessage[] | null>(null)
  if (initialMessages.current === null) {
    initialMessages.current =
      activeChatId !== null
        ? (transcripts.current.get(activeChatId) ?? seedFor(activeChatId))
        : []
  }

  const engine = useAdvisorEngine({ idPrefix: enginePrefix, initial: initialMessages.current })

  /** Append a user bubble and return its (mirrored) engine id. */
  const pushUser = (text: LText, chips?: LText[]): string => {
    const id = `${enginePrefix}-${nextEngineId.current++}`
    engine.sendUser(text, chips)
    return id
  }

  /** Push an advisor turn and return its (mirrored) engine id. */
  const pushAdvisor = (spec: AdvisorTurnSpec): string => {
    const id = `${enginePrefix}-${nextEngineId.current++}`
    engine.pushTurn(spec)
    return id
  }

  const stashActive = () => {
    if (activeChatId !== null) transcripts.current.set(activeChatId, settle(engine.messages))
  }

  /* Stash the open transcript when the view unmounts (route change) so the
     conversation is still there when the user comes back. */
  const stashRef = useRef(stashActive)
  stashRef.current = stashActive
  useEffect(() => () => stashRef.current(), [])

  /* ---------------------------------------------------- thread navigation */

  const selectChat = (chatId: string) => {
    if (chatId === activeChatId) return
    const exists = chats.some((c) => c.id === chatId) || sessionChats.some((c) => c.id === chatId)
    if (!exists) return
    stashActive()
    setActiveChatId(chatId)
    engine.reset(transcripts.current.get(chatId) ?? seedFor(chatId))
  }
  selectChatRef.current = selectChat

  const newConversation = () => {
    stashActive()
    setActiveChatId(null)
    engine.reset([])
  }
  newConversationRef.current = newConversation

  /* Search overlay navigation: /app/advisor with { chatId } router state. */
  useEffect(() => {
    const chatId = readNavChatId(location.state)
    if (chatId !== null) selectChatRef.current(chatId)
  }, [location.state])

  /* Home / Workflows navigation contracts: { prompt, flowKey? } starts a
     fresh flow (explicit key wins — the EN-keyword router is only for
     free-typed text, matching the prototype's startFlow(key, text));
     { newConversation } resets to the empty state. State is handled once by
     identity, then cleared via replace-navigation. */
  useEffect(() => {
    const state: unknown = location.state
    if (state === null || state === undefined || handledNavState.current === state) return
    handledNavState.current = state

    const start = readNavStartFlow(state)
    if (start) {
      navigate(location.pathname, { replace: true, state: null })
      const key =
        start.flowKey ??
        routeFlowKeyFromText(typeof start.prompt === 'string' ? start.prompt : start.prompt.en)
      startFlowRef.current(key, start.prompt)
      return
    }
    if (readNavNewChat(state)) {
      navigate(location.pathname, { replace: true, state: null })
      newConversationRef.current()
    }
  }, [location.state, location.pathname, navigate])

  /* ----------------------------------------------------------- chat flows */

  const startFlow = (flowKey: FlowKeyOrFallback, userText: LText) => {
    stashActive()
    const id = `session-${advisorSession.nextChatSeq++}`
    setSessionChats((prev) => [
      { id, title: flowTitles[flowKey], pinned: false, bucket: 'today', flowKey },
      ...prev,
    ])
    setActiveChatId(id)
    engine.reset([])
    pushUser(userText)

    if (flowKey === 'termination') {
      const turnId = pushAdvisor({
        text: terminationIntro.text,
        reasoning: terminationIntro.reasoning,
      })
      setExtras((prev) => ({ ...prev, [turnId]: { quickForm: freshQuickForm() } }))
      return
    }
    if (flowKey === 'fallback') {
      const turnId = pushAdvisor({ text: fallbackIntro })
      setExtras((prev) => ({ ...prev, [turnId]: { suggestChips: fallbackChips } }))
      return
    }
    const flow = lightFlows[flowKey]
    if (!flow) {
      pushAdvisor({ text: lightFlowFallbackText })
      return
    }
    const turnId = pushAdvisor({
      text: flow.text,
      reasoning: flow.reasoning,
      cards: flow.cards?.map(toToneCard),
    })
    if ((flow.docs?.length ?? 0) > 0 || (flow.followups?.length ?? 0) > 0) {
      setExtras((prev) => ({ ...prev, [turnId]: { docs: flow.docs, followups: flow.followups } }))
    }
  }
  startFlowRef.current = startFlow

  /** Free-form send inside an active thread (prototype `sendComposer`). */
  const sendInThread = (text: string) => {
    pushUser(text)
    pushAdvisor({ text: genericAck })
  }

  /** Follow-up chip click (prototype `handleFollowup`). */
  const handleFollowup = (labelEn: string) => {
    if (labelEn === estimatorFollowup.labelEn) {
      pushAdvisor({
        text: '',
        isError: true,
        errorText: estimatorFollowup.errorText,
        retryText: estimatorFollowup.retryText,
      })
      return
    }
    const reply = followupReplies[labelEn]
    if (!reply) {
      pushAdvisor({ text: followupFallbackText })
      return
    }
    const turnId = pushAdvisor({
      text: reply.text,
      reasoning: reply.reasoning,
      cards: reply.cards?.map(toToneCard),
    })
    if ((reply.docs?.length ?? 0) > 0) {
      setExtras((prev) => ({ ...prev, [turnId]: { docs: reply.docs } }))
    }
    if (reply.isEscalation === true) showToast(M.advisorview_toast_counsel, 'ok')
  }

  /* ------------------------------------------------------------ quick form */

  const changeQuickField = (messageId: string, fieldIndex: number, valueEn: string) => {
    setExtras((prev) => {
      const entry = prev[messageId]
      const form = entry?.quickForm
      if (!entry || !form) return prev
      return {
        ...prev,
        [messageId]: {
          ...entry,
          quickForm: {
            ...form,
            fields: form.fields.map((f, i) => (i === fieldIndex ? { ...f, value: valueEn } : f)),
          },
        },
      }
    })
  }

  const submitQuickForm = (messageId: string) => {
    const form = extras[messageId]?.quickForm
    if (!form || form.submitted) return
    setExtras((prev) => {
      const entry = prev[messageId]
      const current = entry?.quickForm
      if (!entry || !current) return prev
      return { ...prev, [messageId]: { ...entry, quickForm: { ...current, submitted: true } } }
    })
    const values = form.fields.map(
      (f) => f.options.find((o) => o.en === f.value) ?? bi(f.value, f.value),
    )
    pushUser('', values)
    const turnId = pushAdvisor({
      text: terminationAssessment.text,
      reasoning: terminationAssessment.reasoning,
      cards: terminationAssessment.cards.map(toToneCard),
    })
    setExtras((prev) => ({
      ...prev,
      [turnId]: { docs: terminationAssessment.docs, followups: terminationAssessment.followups },
    }))
  }

  /* --------------------------------------------------- home priority rails */

  const openCompRail = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId)
    const det = employeeDetails[employeeId]
    if (!emp || !det) return
    const delta = Math.round(((det.salary - det.market) / det.market) * 100)
    const below = delta < -4
    const deltaLabel = `${delta >= 0 ? '+' : ''}${delta}%`
    const baseEn = `$${det.salary.toLocaleString('en-CA')}`
    const marketEn = `$${det.market.toLocaleString('en-CA')}`
    const baseFr = `${det.salary.toLocaleString('fr-CA')} $`
    const marketFr = `${det.market.toLocaleString('fr-CA')} $`
    openRail(
      bi(`${emp.name} — pay`, `${emp.name} — rémunération`),
      {
        text: below
          ? bi(
              `${emp.name}’s base is sitting below the market midpoint for this role and province. Here’s the picture.`,
              `Le salaire de base de ${emp.name} se situe sous le point milieu du marché pour ce poste et cette province. Voici le portrait.`,
            )
          : bi(
              `${emp.name}’s pay is within a healthy band for the role and province.`,
              `La rémunération de ${emp.name} se situe dans une fourchette saine pour le poste et la province.`,
            ),
        cards: [
          {
            tone: below ? 'warning' : 'success',
            title: below
              ? bi('Below market midpoint', 'Sous le point milieu du marché')
              : bi('Within market band', 'Dans la fourchette du marché'),
            body: bi(
              `Base ${baseEn} vs market midpoint ${marketEn} (${deltaLabel}). Pay-equity obligations apply across genders for substantially similar work. Review recommended — additional comparator data is required before any change, and Dutiva does not determine pay-equity compliance conclusively.`,
              `Salaire de base de ${baseFr} contre un point milieu du marché de ${marketFr} (${deltaLabel}). Les obligations d’équité salariale s’appliquent entre les genres pour un travail essentiellement similaire. Examen recommandé — des données de comparaison supplémentaires sont requises avant tout changement, et Dutiva ne détermine pas de façon concluante la conformité en matière d’équité salariale.`,
            ),
            citations: [
              {
                label: bi(
                  'Pay Equity Act (federal / ON)',
                  'Loi sur l’équité salariale (fédéral / ON)',
                ),
              },
            ],
            actions: [
              {
                label: bi('Open compensation tab', 'Ouvrir l’onglet Rémunération'),
                primary: true,
                onClick: () => {
                  closeRail()
                  navigate(`/app/employees/${employeeId}`)
                },
              },
            ],
          },
        ],
      },
      { initials: emp.initials },
    )
  }

  const openWellbeingRail = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId)
    if (!emp) return
    const first = emp.name.split(' ')[0] ?? emp.name
    openRail(
      bi(`${emp.name} — wellbeing`, `${emp.name} — bien-être`),
      {
        text: bi(
          `Here’s what I’m seeing in ${first}’s recent check-ins. I’ll keep this non-diagnostic.`,
          `Voici ce que j’observe dans les derniers suivis de ${first}. Je resterai non diagnostique.`,
        ),
        cards: [
          {
            tone: 'info',
            title: bi('Handle with care', 'À traiter avec soin'),
            body: bi(
              'Frame any conversation around workload and support, not medical questions. If a medical cause surfaces, it may trigger a duty to inquire about accommodation.',
              'Cadrez toute conversation autour de la charge de travail et du soutien, pas de questions médicales. Si une cause médicale émerge, cela peut déclencher une obligation de s’enquérir d’un accommodement.',
            ),
            citations: [
              {
                label: bi(
                  'Human rights — duty to accommodate',
                  'Droits de la personne — obligation d’accommodement',
                ),
              },
            ],
            actions: [
              {
                label: bi('Draft a check-in message', 'Rédiger un message de suivi'),
                primary: true,
                onClick: () => {
                  closeRail()
                  navigate('/app/communications')
                },
              },
            ],
          },
        ],
      },
      { initials: emp.initials },
    )
  }

  const runPriorityAction = (action: PriorityAction) => {
    switch (action.kind) {
      case 'open-case':
        navigate(`/app/cases/${action.caseId}`)
        break
      case 'draft-doc':
        openDocStudio(action.docKey)
        break
      case 'comp-rail':
        openCompRail(action.employeeId)
        break
      case 'wellbeing-rail':
        openWellbeingRail(action.employeeId)
        break
    }
  }

  /* -------------------------------------------------------------- render */

  const activeFixture = activeChatId !== null ? chats.find((c) => c.id === activeChatId) : undefined
  const activeSession =
    activeChatId !== null ? sessionChats.find((c) => c.id === activeChatId) : undefined
  const hasActiveChat = activeFixture !== undefined || activeSession !== undefined
  const activeFlowKey: FlowKeyOrFallback =
    activeFixture?.flowKey ?? activeSession?.flowKey ?? 'fallback'

  const allThreads = [
    ...sessionChats.map((c) => ({ id: c.id, title: c.title, pinned: c.pinned, bucket: c.bucket })),
    ...chats.map((c) => ({ id: c.id, title: c.title, pinned: c.pinned, bucket: c.bucket })),
  ]
  const groups: ThreadGroup[] = [
    { label: M.advisorview_group_pinned, items: allThreads.filter((t) => t.pinned) },
    { label: M.advisorview_group_today, items: allThreads.filter((t) => t.bucket === 'today') },
    { label: M.advisorview_group_week, items: allThreads.filter((t) => t.bucket === 'week') },
    { label: M.advisorview_group_older, items: allThreads.filter((t) => t.bucket === 'older') },
  ].filter((g) => g.items.length > 0)

  const getExtras = (messageId: string): MessageExtras | undefined =>
    extras[messageId] ?? seedExtras[messageId]

  const onSuggestChip = (chip: SuggestChipSpec) => startFlow(chip.flowKey, chip.label)

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ThreadList
        groups={groups}
        activeChatId={activeChatId}
        onSelect={selectChat}
        onNewConversation={newConversation}
      />
      {hasActiveChat ? (
        <ChatPane
          messages={engine.messages}
          busy={engine.busy}
          jurisdiction={flowJurisdictions[activeFlowKey]}
          getExtras={getExtras}
          onSend={sendInThread}
          onRetry={engine.retryTurn}
          onFollowup={handleFollowup}
          onGenerateDoc={openDocStudio}
          onSuggestChip={onSuggestChip}
          onQuickFormChange={changeQuickField}
          onQuickFormSubmit={submitQuickForm}
        />
      ) : (
        <AdvisorHome
          onSend={(text) => startFlow(routeFlowKeyFromText(text), text)}
          onChip={(chip) => startFlow(chip.flowKey, chip.seed)}
          onPriorityAction={runPriorityAction}
          onMetricClick={(view) => navigate(`/app/${view}`)}
        />
      )}
    </div>
  )
}
