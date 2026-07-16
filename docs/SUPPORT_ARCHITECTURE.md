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

Phase-1 triage simplifications, refined with the scheduling work: dates are
treated as UTC calendar dates (callers pass an ET-normalized day); only nominal
statutory dates are modelled (no observed/substitute day when a fixed holiday
falls on a weekend); and due dates are date-granular (no end-of-business-hours
clock time). None affect the published targets, only edge-of-day/edge-of-year
precision.

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
  **excludes executables**. Downloads use short-lived signed URLs.

**Attachments** ([`support-attachment-action`](../supabase/functions/support-attachment-action/index.ts),
deployed): the browser uploads a file straight to the bucket under its own
`<uid>/<ticket>/` prefix (storage RLS permits nothing else), then the function
records the metadata with the service role after re-validating owner + path +
MIME + size — there is no authenticated INSERT policy on `support_attachments`,
so that's the only way a row lands, and an orphaned object is removed if
recording fails. Reads go through a `sign` action that access-checks the caller
(requester / admin / non-restricted workspace member) and mints a 60-second
signed URL. Client:
[`attachmentsApi.ts`](../src/features/support/attachmentsApi.ts) +
[`SupportAttachments.tsx`](../src/features/support/SupportAttachments.tsx), on the
customer thread (upload while open) and the admin view. `scan_status` starts
`pending`; the malware-scan hook (`SUPPORT_ATTACHMENT_SCAN_URL`) that flips it is
the documented next hardening. The **public** intake carries no attachments by
design (unauthenticated users can't write to the bucket).

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

## Email & notifications

Notifications use an **outbox**: the edge functions enqueue a row into
`support_notifications` on each event (customer acknowledgement + operator alert
on ticket creation; a customer notification on an agent reply). A **future send
worker** drains `pending` rows, renders the template, sends via the configured
provider, and marks them `sent`/`failed`. Decoupling this way means a missing
email provider never blocks ticket creation, and the outbox stores **nothing
sensitive** — only the public reference and category (never the body or PII).

- Templates: [`src/features/support/email/templates.ts`](../src/features/support/email/templates.ts)
  — 11 bilingual customer templates + an operator alert, pure and unit-tested.
  **Rules enforced:** subjects carry only the reference (never body/PII); bodies
  link back to the authenticated ticket (a secure link) and reuse the approved
  no-secrets / resolution-varies copy.
- Rules: [`notifications.ts`](../src/features/support/email/notifications.ts) —
  `acknowledgementKind` (category → ack), `operatorChannel` (immediate for
  security or high/critical, else digest), and the reminder-rule catalogue for
  the scheduler. The edge functions mirror the first two.
- Provider seam: [`emailService.ts`](../src/features/support/email/emailService.ts)
  — an `EmailProvider` interface; delivery no-ops (logs) when no provider is set.
  [`resendProvider.ts`](../src/features/support/email/resendProvider.ts) is the
  tested reference adapter (Resend request shape + error handling).
- Send worker: [`supabase/functions/support-notify`](../supabase/functions/support-notify/index.ts)
  — **deployed**. Drains up to 50 `pending` rows per run, renders the bilingual
  email, sends via Resend, and marks each row `sent`/`failed` (up to 5 attempts,
  then `failed`). It mirrors `templates.ts` / `resendProvider.ts` / the
  `src/config/support.ts` labels (kept in sync the same way `suggestPriority`
  is). No sensitive content ever goes in a subject; customer emails link back to
  the authenticated ticket, operator alerts to the admin ticket view.

**Turning email on** (operator steps — see the runbook): the mechanism is built
and deployed; it is inert until configured. (1) Verify a sending domain in
Resend and set `SUPPORT_EMAIL_PROVIDER_API_KEY` + `SUPPORT_EMAIL_FROM`. (2) Set
`SUPPORT_NOTIFY_SECRET` — the worker **fails closed** (403) if a provider key is
set without it, so the drain endpoint is never unauthenticated. (3) Schedule the
worker (pg_cron → the function, passing `x-notify-secret`). Until then the worker
is a safe no-op (`{ note: 'no_provider' }`) and notifications accumulate as
`pending`, so enabling it flushes the backlog rather than dropping anything.
`SUPPORT_OPERATOR_EMAIL` sets the operator-alert recipient (defaults to
`support@dutiva.ca`).

## Help Centre

The public, unauthenticated self-service layer (`/help`, `/fr/aide`) — the first
step of the customer journey before a written request. It lives in the marketing
surface alongside the legal hub and is fully prerendered/indexable in both
locales.

- Content: [`src/features/support/help/helpCenterData.ts`](../src/features/support/help/helpCenterData.ts)
  — six topic categories and bilingual `Bi` articles (product-accurate, never
  legal advice; compliance specifics defer to the legal documents). Pure data,
  so search and the SEO registry consume it directly.
- Search: [`helpSearch.ts`](../src/features/support/help/helpSearch.ts) —
  client-side, accent- and case-insensitive, AND-across-terms, ranked
  title > summary > body. The set is small and bundled, so no index is needed.
- Feedback: [`helpFeedback.ts`](../src/features/support/help/helpFeedback.ts) +
  [`HelpfulnessWidget.tsx`](../src/features/support/help/HelpfulnessWidget.tsx)
  — "Was this article helpful?" stored locally so a returning reader isn't
  re-asked. **Nothing is transmitted** — privacy-conscious analytics is a later
  phase; `recordHelpfulness` is the single seam a future sink would hook.
- Pages: `HelpCenterPage` (hero + live search + browse-by-topic + contact CTA)
  and `HelpArticlePage` (article, feedback widget, related links, contact CTA).
  Both register in the SEO route table (`help` id + `helpDoc:<slug>` dynamic
  pages) so the sitemap, hreflang, and language toggle stay in sync. Entry point:
  the marketing footer's Resources column.

## Public intake (unauthenticated)

The signed-out path — so the flows that must never sit behind a login
(accessibility feedback, privacy requests, security reports) are reachable by
anyone, alongside general product/sales questions.

- Page: `ContactPage` at `/contact` · `/fr/contact` (marketing surface,
  indexable). A `?topic=security|privacy|accessibility|product|sales` deep link
  preselects the category. Entry points: the footer's **Contact** link and the
  Help Centre's contact CTA.
- Form: [`PublicSupportForm`](../src/features/support/PublicSupportForm.tsx) —
  collects an email (no account), offers **only the `allowPublic` categories**,
  carries no diagnostics/workspace context, includes a honeypot, and shows the
  same category-aware notices as the in-app form.
- Function: [`create-public-support-ticket`](../supabase/functions/create-public-support-ticket/index.ts)
  (**deployed**, `verify_jwt` off). Accepts only public categories, re-validates
  everything, assigns priority (capped at `high`), flags `restricted`, writes the
  ticket with the service role (`requester_user_id = null` → admin-only under
  RLS), and enqueues the same acknowledgement + operator-alert notifications.
- Anti-abuse: a honeypot; per-IP (3 / 15 min) and per-email (3 / 60 min) rate
  limits backed by `support_public_intake` (migration `0016`), which stores
  **only salted hashes** (`PUBLIC_INTAKE_SALT`) — never the raw IP or email.
  A third-party CAPTCHA (Turnstile/hCaptcha) is the documented next hardening.

An anonymous requester can't sign in to read the ticket, so updates go by email;
account/billing issues are steered to sign-in (those categories aren't public).

## Done so far

Foundation (config, policy, data model + RLS), authenticated request flow +
ticket loop, founder dashboard, email templates + outbox + send worker, Help
Centre, public unauthenticated intake, and ticket attachments — all shipped.
Four edge functions: `create-support-ticket`, `create-public-support-ticket`,
`support-agent-action`, `support-notify`, plus `support-attachment-action`.

## Staged (not yet implemented)

- **Turn email on** (operator config): verify a Resend domain, set the secrets,
  schedule `support-notify` (see the runbook). The mechanism is built; it's inert
  until then.
- **Entry-point sweep & scheduled-call scheduling** — remaining support entry
  points (nav/account/billing/error/login-recovery pages) and the post-triage
  "request a scheduled call" *scheduling* flow (the forms already offer it as a
  preferred response method; the founder arranges calls manually today).
- **Attachment malware scan** — a worker consuming `SUPPORT_ATTACHMENT_SCAN_URL`
  that flips `support_attachments.scan_status`.
- **CAPTCHA** on the public intake (Turnstile/hCaptcha) as a second anti-abuse
  layer beyond the honeypot + rate limits.
- **Status, analytics, AI-assist** — branded status route, privacy-conscious
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
