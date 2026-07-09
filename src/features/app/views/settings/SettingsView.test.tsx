import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { SettingsView } from './SettingsView'

describe('SettingsView', () => {
  it('renders workspace, team, retention, billing, and audit content', () => {
    renderApp(<SettingsView />, { route: '/app/settings', path: '/app/settings' })

    // Workspace card
    expect(screen.getByText('Northgate Logistics Inc.')).toBeInTheDocument()
    expect(screen.getByText('Federally regulated')).toBeInTheDocument()
    expect(screen.getByText('Ottawa (HQ) · Montréal · Vancouver')).toBeInTheDocument()

    // Team + preference toggles
    expect(screen.getByText('Riley Summers')).toBeInTheDocument()
    expect(screen.getByText('Partner counsel (external)')).toBeInTheDocument()
    expect(screen.getByText('Daily email digest')).toBeInTheDocument()
    expect(screen.getByText('Use workspace context in Advisor')).toBeInTheDocument()

    // Retention, security, billing, audit
    expect(screen.getByText('7 years after employment ends (ESA/CRA)')).toBeInTheDocument()
    expect(screen.getByText('Canada (Montréal region)')).toBeInTheDocument()
    expect(
      screen.getByText('Growth plan — $49/mo CAD · Next invoice Aug 1, 2026'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Riley Summers viewed compensation — Jordan Mensah'),
    ).toBeInTheDocument()
  })

  it('flips a preference toggle on click (autoEscalate starts off)', async () => {
    const user = userEvent.setup()
    renderApp(<SettingsView />, { route: '/app/settings', path: '/app/settings' })

    const toggle = screen.getByRole('switch', { name: 'Auto-suggest legal escalation' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    const emailDigest = screen.getByRole('switch', { name: 'Daily email digest' })
    expect(emailDigest).toHaveAttribute('aria-checked', 'true')
  })

  it('clears the calendar-sync error state via Retry', async () => {
    const user = userEvent.setup()
    renderApp(<SettingsView />, { route: '/app/settings', path: '/app/settings' })

    // Prototype starts with integrationError: true — two Connected + one error.
    expect(screen.getByText('Connection error')).toBeInTheDocument()
    expect(screen.getAllByText('Connected')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(screen.queryByText('Connection error')).not.toBeInTheDocument()
    expect(screen.getAllByText('Connected')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  it('switches the app language from the Language segment', async () => {
    const user = userEvent.setup()
    renderApp(<SettingsView />, { route: '/app/settings', path: '/app/settings' })

    expect(screen.getByText('Appearance')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Français' }))

    expect(screen.getByText('Apparence')).toBeInTheDocument()
    expect(screen.getByText('Données et confidentialité')).toBeInTheDocument()
    expect(screen.getByText('Sous réglementation fédérale')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'English' }))
    expect(screen.getByText('Appearance')).toBeInTheDocument()
  })
})
