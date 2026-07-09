import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { bi } from '@/i18n/core'
import type { Bi } from '@/i18n/core'
import { docMetaDefaults, documentTemplatesByKey } from '@/data'
import type { DocMeta } from '@/data'
import { useToasts } from '@/features/app/toasts/toastsContext'
import { docstudioMessages as M } from '@/i18n/messages/docstudio'
import { DocStudioContext } from './docStudioContext'
import type {
  DocExportKind,
  DocRevisionKind,
  DocStudioContextValue,
  DocStudioState,
} from './docStudioContext'

/** Prototype `handleGenerateDoc` — the fake generation delay before "draft ready". */
const GENERATION_MS = 750

const CLOSED: DocStudioState = {
  open: false,
  templateKey: '',
  title: bi('', ''),
  category: bi('', ''),
  highRisk: false,
  meta: docMetaDefaults,
  sections: [],
  generating: false,
  editingAll: false,
  aiNote: null,
  gate: null,
  gateConfirmed: false,
  exportStatus: null,
  lastModified: false,
  metaOpen: false,
  signatureSent: false,
}

const AI_NOTES: Record<DocRevisionKind, Bi> = {
  formal: M.docstudio_ainote_formal,
  shorten: M.docstudio_ainote_shorten,
  compassionate: M.docstudio_ainote_compassionate,
}

interface ResolvedTemplate {
  title: Bi
  category: Bi
  highRisk: boolean
  meta: DocMeta
  sections: Bi[]
}

/** Prototype `docBodies[title]` + `docMetaFor(title)` + `isHighRiskDoc(title)`. */
function resolveTemplate(templateKey: string, fromLibrary: boolean): ResolvedTemplate {
  const template = documentTemplatesByKey[templateKey]
  if (template) {
    return {
      title: template.title,
      category: template.category,
      highRisk: template.highRisk,
      meta: { ...docMetaDefaults, ...template.meta },
      sections: template.sections.slice(),
    }
  }
  return {
    title: bi(templateKey, templateKey),
    category: M.docstudio_fallback_category,
    highRisk: false,
    meta: docMetaDefaults,
    sections: fromLibrary
      ? [M.docstudio_fallback_library_1, M.docstudio_fallback_library_2]
      : [M.docstudio_fallback_generate],
  }
}

export function DocStudioProvider({ children }: { readonly children: ReactNode }) {
  const [studio, setStudio] = useState<DocStudioState>(CLOSED)
  const { showToast } = useToasts()
  const genTimer = useRef<number | null>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  useEffect(
    () => () => {
      if (genTimer.current !== null) window.clearTimeout(genTimer.current)
    },
    [],
  )

  const clearGenTimer = () => {
    if (genTimer.current !== null) {
      window.clearTimeout(genTimer.current)
      genTimer.current = null
    }
  }

  const rememberFocus = () => {
    lastFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
  }

  const openWith = (templateKey: string, resolved: ResolvedTemplate, generating: boolean) => {
    setStudio({
      ...CLOSED,
      open: true,
      templateKey,
      title: resolved.title,
      category: resolved.category,
      highRisk: resolved.highRisk,
      meta: resolved.meta,
      sections: resolved.sections,
      generating,
    })
  }

  /** Prototype `handleGenerateDoc(e, title)` — shimmer, then "draft ready" toast. */
  const openDocStudio = useCallback(
    (templateKey: string) => {
      rememberFocus()
      const resolved = resolveTemplate(templateKey, false)
      openWith(templateKey, resolved, true)
      clearGenTimer()
      genTimer.current = window.setTimeout(() => {
        genTimer.current = null
        setStudio((prev) => ({ ...prev, generating: false }))
        showToast(
          bi(
            resolved.title.en + M.docstudio_toast_ready_suffix.en,
            resolved.title.fr + M.docstudio_toast_ready_suffix.fr,
          ),
          'ok',
        )
      }, GENERATION_MS)
    },
    [showToast],
  )

  /** Prototype `openDocFromLibrary(title)` — no generation shimmer, no toast. */
  const openDocFromLibrary = useCallback((templateKey: string) => {
    rememberFocus()
    clearGenTimer()
    openWith(templateKey, resolveTemplate(templateKey, true), false)
  }, [])

  const closeDocStudio = useCallback(() => {
    setStudio((prev) => ({ ...prev, open: false }))
    const el = lastFocused.current
    lastFocused.current = null
    if (el) {
      /* Prototype `restoreFocus()` — defer so the overlay unmounts first. */
      window.setTimeout(() => {
        if (el.isConnected) el.focus()
      }, 0)
    }
  }, [])

  const toggleEditAll = useCallback(() => {
    setStudio((prev) => ({ ...prev, editingAll: !prev.editingAll }))
  }, [])

  const updateSection = useCallback((index: number, value: string) => {
    setStudio((prev) => {
      const sections = prev.sections.slice()
      sections[index] = value
      return { ...prev, sections, lastModified: true }
    })
  }, [])

  const applyRevision = useCallback(
    (kind: DocRevisionKind) => {
      setStudio((prev) => ({ ...prev, aiNote: AI_NOTES[kind], lastModified: true }))
      showToast(M.docstudio_toast_revised, 'ok')
    },
    [showToast],
  )

  const doExport = useCallback(
    (kind: DocExportKind) => {
      setStudio((prev) => ({ ...prev, exportStatus: kind }))
      showToast(bi(M.docstudio_exported_as.en + kind, M.docstudio_exported_as.fr + kind), 'ok')
    },
    [showToast],
  )

  const doSendForSignature = useCallback(() => {
    setStudio((prev) => ({ ...prev, signatureSent: true }))
    showToast(M.docstudio_toast_esign, 'ok')
  }, [showToast])

  const exportDoc = useCallback(
    (kind: DocExportKind) => {
      if (studio.highRisk && !studio.gateConfirmed) {
        setStudio((prev) => ({ ...prev, gate: { action: kind } }))
        return
      }
      doExport(kind)
    },
    [studio.highRisk, studio.gateConfirmed, doExport],
  )

  const sendForSignature = useCallback(() => {
    if (studio.highRisk && !studio.gateConfirmed) {
      setStudio((prev) => ({ ...prev, gate: { action: 'signature' } }))
      return
    }
    doSendForSignature()
  }, [studio.highRisk, studio.gateConfirmed, doSendForSignature])

  const confirmGate = useCallback(() => {
    const action = studio.gate?.action
    if (!action) return
    if (action === 'signature') {
      setStudio((prev) => ({ ...prev, gate: null, gateConfirmed: true, signatureSent: true }))
      showToast(M.docstudio_toast_esign, 'ok')
    } else {
      setStudio((prev) => ({ ...prev, gate: null, gateConfirmed: true, exportStatus: action }))
      showToast(bi(M.docstudio_exported_as.en + action, M.docstudio_exported_as.fr + action), 'ok')
    }
  }, [studio.gate, showToast])

  const cancelGate = useCallback(() => {
    setStudio((prev) => ({ ...prev, gate: null }))
  }, [])

  const requestLegalReview = useCallback(() => {
    setStudio((prev) => ({ ...prev, gate: null }))
    showToast(M.docstudio_toast_legal, 'ok')
  }, [showToast])

  const toggleMeta = useCallback(() => {
    setStudio((prev) => ({ ...prev, metaOpen: !prev.metaOpen }))
  }, [])

  const value = useMemo<DocStudioContextValue>(
    () => ({
      studio,
      openDocStudio,
      openDocFromLibrary,
      closeDocStudio,
      toggleEditAll,
      updateSection,
      applyRevision,
      exportDoc,
      sendForSignature,
      confirmGate,
      cancelGate,
      requestLegalReview,
      toggleMeta,
    }),
    [
      studio,
      openDocStudio,
      openDocFromLibrary,
      closeDocStudio,
      toggleEditAll,
      updateSection,
      applyRevision,
      exportDoc,
      sendForSignature,
      confirmGate,
      cancelGate,
      requestLegalReview,
      toggleMeta,
    ],
  )

  return <DocStudioContext value={value}>{children}</DocStudioContext>
}
