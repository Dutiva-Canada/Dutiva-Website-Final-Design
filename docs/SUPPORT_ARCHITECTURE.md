# Customer support architecture

Dutiva runs a **digital-first** support model: self-service and asynchronous by
default, with scheduled telephone/video reserved for exceptional cases. There is
no routine inbound phone channel and no 24/7 staffed support.

Customer journey:

> Help Centre / contextual guidance → support request → automated
> acknowledgement → triage → written resolution → scheduled call only when
> required → written ticket summary → closure and optional feedback

This document describes the **foundation** that is implemented today and the
integration points staged for later phases. Legal/CX wording in the support
policy and messages is **flagged for human review**.

## What is implemented (Phase 1)

| Area | Location |
| --- | --- |
| Centralized config (channels, hours, targets, priority, status, categories, escalation) | [`src/config/support.ts`](../src/config/support.ts) |
| Triage logic (suggested priority, Ontario business calendar, response due dates) | [`src/features/support/triage.ts`](../src/features/support/triage.ts) + `triage.test.ts` |
| Bilingual support prose (approved policy + sensitive-info + diagnostics + ack) | [`src/i18n/messages/support.ts`](../src/i18n/messages/support.ts) |
| Public Customer Support Policy (EN/FR, approved wording) | `src/features/marketing/legal/content/support-policy.{en,fr}.ts` → `/legal/support-policy`, `/fr/juridique/politique-soutien` |
| Ticket data model + RLS + private attachments bucket | [`supabase/migrations/0014_support_system.sql`](../supabase/migrations/0014_support_system.sql) |

The config is the **single source of truth**. Support email addresses,
business hours, and response targets are defined only in `src/config/support.ts`
and must never be duplicated inline in components.

## Support channels

Sourced from `SUPPORT_CHANNELS` — never hard-code an address:

| Channel | Address | Public intake | Restricted handling |
| --- | --- | --- | --- |
| Support | support@dutiva.ca | yes | no |
| Billing | billing@dutiva.ca | no (prefers authenticated) | no |
| Privacy | privacy@dutiva.ca | yes | yes |
| Security | security@dutiva.ca | yes | yes |
| Accessibility | accessibility@dutiva.ca | yes | yes |
| Sales | sales@dutiva.ca | yes | no |

No personal founder email or phone number is exposed anywhere.

## Priority & response targets

Priority is `critical | high | standard | low`. Customers describe **impact** and
**urgency**; `suggestPriority()` derives an initial priority and is **capped at
`high`** — `critical` is only ever set by a human in triage. Published
initial-response targets (service targets, not guarantees, not resolution times):

| Priority | Initial-response target |
| --- | --- |
| Critical | within 4 business hours |
| High | within 1 business day |
| Standard | within 2 business days |
| Low | within 5 business days |

Business days exclude weekends and **Ontario statutory holidays** (9 holidays,
computed per year including Good Friday via the Gregorian computus). Business
hours: Mon–Fri 09:00–17:00 America/Toronto.

## Ticket status lifecycle

`new → triaged → in_progress → waiting_on_customer → waiting_on_dutiva →
scheduled_call → resolved → closed`. Customer-facing labels are bilingual
(`STATUS_LABELS`).

## Data model & RLS

Six tables, all with RLS enabled (migration `0014`):

- `support_tickets` — UUID `id`, human-readable `public_reference` (`DUT-YYYY-NNNNNN`
  via `support_ticket_ref_seq` + trigger), category/status/priority/impact/urgency,
  language, preferred response method, source, `restricted` flag, escalation
  fields, `first_response_at`/`resolved_at`/`closed_at`, `retention_review_at`.
- `support_messages` — customer/agent/system messages; `is_internal_note` for
  founder-only notes separate from customer-visible replies.
- `support_attachments` — **metadata only** (never base64); points at the private
  `support-attachments` storage bucket; `scan_status` is the malware-scan hook.
- `support_ticket_events` — audit trail (admin-read only).
- `support_ticket_assignments` — assignment history (admin-read only).
- `support_ticket_feedback` — "Was this helpful?" / closure feedback.

**RLS summary** (helpers `is_admin(uuid)`, `is_org_member(org, uuid)`):

- A ticket is readable by its `requester_user_id`, by members of its
  `workspace_id`, or by an admin. Nothing else.
- Messages: readable on a visible ticket; internal notes only for admins. A
  requester may INSERT a non-internal `customer` reply to their own ticket.
- Attachments/feedback: scoped to a visible ticket; requester may leave feedback
  on their own ticket.
- Events/assignments: **admin-read only**.
- **All ticket creation, triage, status changes, priority assignment, and
  internal notes go through the service-role edge function** (Phase 2) and
  bypass RLS. No authenticated INSERT policy on `support_tickets` exists, so the
  browser cannot forge tickets or spoof `workspace_id`.
- Storage: objects are namespaced `<uid>/<ticket>/<file>`; authenticated users
  may read/write/delete **only under their own uid prefix**. The bucket is
  private (`public = false`) with a 25 MB size limit and a MIME allowlist that
  **excludes executables**. Downloads use short-lived signed URLs (Phase 2).

**Rollback** is documented at the top of the migration file (drop tables in
reverse dependency order, drop the helper functions/sequence, delete the bucket).

## Environment variables

Phase 1 introduces **no new required env vars** — config is code and the
migration is applied. The following are **future** vars for later phases,
documented now in `.env.example`:

- `SUPPORT_EMAIL_PROVIDER_API_KEY` — transactional email (no provider is wired
  yet; an abstraction is the Phase 2 integration point).
- `SUPPORT_INBOUND_WEBHOOK_SECRET` — verifying inbound email→ticket webhooks.
- `SUPPORT_ATTACHMENT_SCAN_URL` / `SUPPORT_ATTACHMENT_SCAN_KEY` — malware-scan
  hook that flips `support_attachments.scan_status`.
- `STATUS_PAGE_API_URL` — public status provider feed (branded route consumes it).

## Retention

Every retention-sensitive table carries a `retention_review_at` column. Final
retention durations are **flagged for privacy/legal review** and configured, not
hard-coded — deletion/anonymization workflows are a Phase 2 edge-function job.

## Staged phases (not yet implemented)

2. **Intake & Help Centre UI** — authenticated support request form (conditional
   fields, sensitive-info warning, diagnostic-context notice + review/remove),
   the `create-support-ticket` edge function (server-side zod validation, rate
   limiting, priority assignment, service-role writes), Help Centre IA
   (categories, search, article states, "was this helpful?", contact
   escalation), and support entry points across nav/footer/account/billing/error
   pages.
3. **Specialized flows** — security report, privacy request, accessibility
   feedback (unauthenticated-accessible), complaint escalation, and the
   post-triage "request a scheduled call" option.
4. **Founder ops** — internal support dashboard (queues, filters, internal
   notes, audit trail), notification service abstraction (immediate for
   critical, digest otherwise), and the bilingual email templates.
5. **Status, analytics, AI-assist** — branded status route, privacy-conscious
   support analytics events, and AI-assisted first-line answers with mandatory
   human escalation for privacy/security/accessibility/billing-dispute/
   complaint/account-recovery.

## Diagnostic context policy

The authenticated request form (Phase 2) may attach: user id, workspace id,
plan, current route, app version, browser/OS, timestamp, locale, feature/module,
correlation id, and a recent non-sensitive error code — and **never** employee
records, HR case details, document contents, chat transcripts, passwords, or
tokens (see `support_diagnostic_notice`). The notice is shown and the optional
diagnostics are reviewable/removable before submission.
