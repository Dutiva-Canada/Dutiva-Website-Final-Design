import { describe, expect, it } from 'vitest'
import { renderSupportEmail } from './templates'
import type { EmailContext, NotificationKind } from './templates'

const ctx = (overrides: Partial<EmailContext> = {}): EmailContext => ({
  language: 'en',
  reference: 'DUT-2026-000001',
  ticketUrl: 'https://dutiva.ca/app/support/requests/abc',
  categoryLabel: 'Technical issue',
  responseTargetLabel: 'within 2 business days',
  priorityLabel: 'High',
  ...overrides,
})

const ALL_KINDS: NotificationKind[] = [
  'ticket_received', 'agent_reply', 'info_requested', 'resolved', 'closed',
  'call_proposed', 'call_confirmed', 'privacy_ack', 'accessibility_ack',
  'security_ack', 'complaint_ack', 'operator_alert',
]

describe('renderSupportEmail', () => {
  it('renders every kind in EN and FR with a branded subject carrying the reference', () => {
    for (const kind of ALL_KINDS) {
      const en = renderSupportEmail(kind, ctx({ language: 'en' }))
      const fr = renderSupportEmail(kind, ctx({ language: 'fr' }))
      expect(en.subject).toContain('Dutiva Support')
      expect(fr.subject).toContain('Soutien Dutiva')
      expect(en.subject).toContain('DUT-2026-000001')
      // Subjects never carry body content / PII — only the reference.
      expect(en.subject).not.toContain('dutiva.ca/app')
      expect(en.text.length).toBeGreaterThan(0)
      expect(fr.text.length).toBeGreaterThan(0)
      expect(en.text).not.toBe(fr.text)
    }
  })

  it('customer templates link back to the authenticated ticket', () => {
    const linked: NotificationKind[] = [
      'ticket_received', 'agent_reply', 'info_requested', 'resolved',
      'call_proposed', 'call_confirmed', 'privacy_ack', 'accessibility_ack',
      'security_ack', 'complaint_ack',
    ]
    for (const kind of linked) {
      expect(renderSupportEmail(kind, ctx()).text).toContain(
        'https://dutiva.ca/app/support/requests/abc',
      )
    }
  })

  it('ticket_received includes the target, resolution-varies note, and the no-secrets warning', () => {
    const r = renderSupportEmail('ticket_received', ctx())
    expect(r.text).toContain('within 2 business days')
    expect(r.text.toLowerCase()).toContain('resolution')
    expect(r.text.toLowerCase()).toContain('password')
  })

  it('operator_alert subject includes the priority label', () => {
    expect(renderSupportEmail('operator_alert', ctx({ priorityLabel: 'Critical' })).subject).toContain(
      'Critical',
    )
  })
})
