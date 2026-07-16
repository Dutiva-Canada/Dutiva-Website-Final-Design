import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'

const createPublicSupportTicket = vi.hoisted(() => vi.fn())
vi.mock('./publicSupportApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./publicSupportApi')>()
  return { ...actual, createPublicSupportTicket }
})

import { PublicSupportForm } from './PublicSupportForm'

describe('PublicSupportForm', () => {
  beforeEach(() => createPublicSupportTicket.mockReset())

  it('offers only the public categories — never account/billing', () => {
    renderApp(<PublicSupportForm />)
    expect(screen.getByRole('option', { name: 'Accessibility feedback' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Security concern' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Privacy request' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Billing' })).toBeNull()
    expect(screen.queryByRole('option', { name: 'Account access' })).toBeNull()
  })

  it('validates the email before calling the server', async () => {
    const user = userEvent.setup()
    renderApp(<PublicSupportForm />)
    await user.selectOptions(screen.getByLabelText('What is this about?'), 'accessibility')
    await user.type(screen.getByLabelText('Your email'), 'not-an-email')
    await user.type(screen.getByLabelText('Subject'), 'Captions missing')
    await user.type(screen.getByLabelText('How can we help?'), 'The videos have no captions.')
    await user.click(screen.getByRole('button', { name: 'Send request' }))
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(createPublicSupportTicket).not.toHaveBeenCalled()
  })

  it('submits a valid request and shows the reference', async () => {
    const user = userEvent.setup()
    createPublicSupportTicket.mockResolvedValue('DUT-2026-000010')
    renderApp(<PublicSupportForm initialTopic="security" />)
    await user.type(screen.getByLabelText('Your email'), 'reporter@example.ca')
    await user.type(screen.getByLabelText('Subject'), 'XSS in the search box')
    await user.type(screen.getByLabelText('How can we help?'), 'Steps to reproduce follow.')
    await user.click(screen.getByLabelText(/I understand Dutiva will use this request/))
    await user.click(screen.getByRole('button', { name: 'Send request' }))

    expect(createPublicSupportTicket).toHaveBeenCalledOnce()
    const status = await screen.findByRole('status')
    expect(within(status).getByText('Request received')).toBeInTheDocument()
    expect(within(status).getByText('DUT-2026-000010')).toBeInTheDocument()
  })

  it('shows the security warning when the security topic is preselected', () => {
    renderApp(<PublicSupportForm initialTopic="security" />)
    expect(screen.getByText(/Reporting a security concern\?/)).toBeInTheDocument()
  })
})
