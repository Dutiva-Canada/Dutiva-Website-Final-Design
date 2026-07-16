import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LangProvider } from '@/i18n/LangProvider'

const getSupportTicket = vi.hoisted(() => vi.fn())
const replyToSupportTicket = vi.hoisted(() => vi.fn())
vi.mock('@/features/support/supportApi', () => ({ getSupportTicket, replyToSupportTicket }))

import { SupportTicketDetail } from './SupportTicketDetail'

function renderDetail(id = 't1') {
  render(
    <LangProvider>
      <MemoryRouter initialEntries={[`/app/support/requests/${id}`]}>
        <Routes>
          <Route path="/app/support/requests/:ticketId" element={<SupportTicketDetail />} />
        </Routes>
      </MemoryRouter>
    </LangProvider>,
  )
}

const baseTicket = {
  id: 't1',
  publicReference: 'DUT-2026-000001',
  subject: 'Cannot generate',
  category: 'technical',
  priority: 'standard',
  createdAt: '2026-07-16T00:00:00Z',
  updatedAt: '2026-07-16T00:00:00Z',
}

beforeEach(() => {
  getSupportTicket.mockReset()
  replyToSupportTicket.mockReset()
})

describe('SupportTicketDetail', () => {
  it('renders the thread and appends a customer reply', async () => {
    getSupportTicket.mockResolvedValue({
      ...baseTicket,
      status: 'in_progress',
      messages: [{ id: 'm1', authorRole: 'customer', body: 'The button does nothing', createdAt: '2026-07-16T00:00:00Z' }],
    })
    replyToSupportTicket.mockResolvedValue({ id: 'm2', authorRole: 'customer', body: 'Still broken', createdAt: '2026-07-16T01:00:00Z' })
    const user = userEvent.setup()
    renderDetail()

    expect(await screen.findByText('The button does nothing')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/add a reply/i), 'Still broken')
    await user.click(screen.getByRole('button', { name: /send reply/i }))

    expect(await screen.findByText('Still broken')).toBeInTheDocument()
    expect(replyToSupportTicket).toHaveBeenCalledWith('t1', 'Still broken')
  })

  it('hides the reply box for a closed request', async () => {
    getSupportTicket.mockResolvedValue({ ...baseTicket, status: 'closed', messages: [] })
    renderDetail()

    expect(await screen.findByText(/this request is closed/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /send reply/i })).not.toBeInTheDocument()
  })

  it('shows a not-found message when the ticket is missing', async () => {
    getSupportTicket.mockResolvedValue(null)
    renderDetail()
    expect(await screen.findByText(/could not be found/i)).toBeInTheDocument()
  })
})
