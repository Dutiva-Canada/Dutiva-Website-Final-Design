import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { LangProvider } from '@/i18n/LangProvider'
import { ToastsProvider } from '@/features/app/toasts/ToastsProvider'
import { DocStudioProvider } from './DocStudioProvider'
import { DocStudioOverlay } from './DocStudioOverlay'
import { useDocStudio } from './docStudioContext'

function Opener() {
  const { openDocStudio } = useDocStudio()
  return (
    <div>
      <button onClick={() => openDocStudio('Offboarding Checklist')}>open-checklist</button>
      <button onClick={() => openDocStudio('Termination Letter')}>open-termination</button>
    </div>
  )
}

function renderStudio() {
  return render(
    <LangProvider>
      <ToastsProvider>
        <DocStudioProvider>
          <Opener />
          <DocStudioOverlay />
        </DocStudioProvider>
      </ToastsProvider>
    </LangProvider>,
  )
}

function openTemplate(name: string) {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name }))
  })
  /* Prototype generation delay (750ms) — sections appear once it elapses. */
  act(() => {
    vi.advanceTimersByTime(750)
  })
}

describe('Document Studio', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing until opened, then shows the fixture sections after generation', () => {
    renderStudio()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'open-checklist' }))
    })
    const dialog = screen.getByRole('dialog', { name: 'Document Studio' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveFocus()

    /* While generating: shimmer visible, sections not yet rendered. */
    expect(screen.getByText('Advisor is drafting…')).toBeInTheDocument()
    expect(
      screen.queryByText('Offboarding Checklist — Jordan Mensah, last day July 19, 2026'),
    ).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(750)
    })
    expect(screen.queryByText('Advisor is drafting…')).not.toBeInTheDocument()
    expect(
      screen.getByText('Offboarding Checklist — Jordan Mensah, last day July 19, 2026'),
    ).toBeInTheDocument()
    /* Standard (non-high-risk) chip and the doc-studio disclaimer. */
    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(
      screen.getByText(/does not provide legal advice\. For high-risk employment decisions/),
    ).toBeInTheDocument()

    /* Escape closes the overlay. */
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('gates exports on high-risk templates and proceeds after confirmation', () => {
    renderStudio()
    openTemplate('open-termination')

    expect(screen.getByText('High-risk document')).toBeInTheDocument()

    /* Export attempt opens the review gate instead of exporting. */
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    })
    const gate = screen.getByRole('alertdialog', { name: 'Review before sending' })
    expect(gate).toBeInTheDocument()
    expect(gate).toHaveTextContent('This document involves a high-risk HR decision.')

    /* Confirm — the gate closes and the deferred export completes. */
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm and continue' }))
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Document details' }))
    })
    expect(screen.getByText('Exported as PDF')).toBeInTheDocument()

    /* Once confirmed, the gate is not shown again (e-signature goes straight through). */
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Send for e-signature' }))
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('Signature requested — awaiting response')).toBeInTheDocument()
  })

  it('cancelling the gate leaves the document unexported', () => {
    renderStudio()
    openTemplate('open-termination')

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Export Word' }))
    })
    expect(screen.getByRole('alertdialog', { name: 'Review before sending' })).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }))
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Document details' }))
    })
    expect(screen.getByText('Not exported')).toBeInTheDocument()
  })

  it('exports directly (setting export status) on standard templates', () => {
    renderStudio()
    openTemplate('open-checklist')

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Export Word' }))
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Document details' }))
    })
    expect(screen.getByText('Exported as Word')).toBeInTheDocument()
  })
})
