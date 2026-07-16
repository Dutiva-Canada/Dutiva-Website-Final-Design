# Founder support runbook

A practical guide for operating Dutiva support solo, in structured review
periods rather than continuous interruption. Config lives in
[`src/config/support.ts`](../src/config/support.ts); see
[`SUPPORT_ARCHITECTURE.md`](./SUPPORT_ARCHITECTURE.md) for the system design.

> Golden rule: **never collect unnecessary HR information.** If a ticket needs
> employee records, medical information, investigation evidence, or confidential
> workplace files, do **not** ask for them in the ticket thread — reply that
> Dutiva will provide secure instructions, and arrange a secure channel.

## Daily rhythm (suggested)

- **Immediate** (out-of-band alert): critical security reports, widespread
  access failures, confirmed outages.
- **Once or twice a day**: triage new tickets, answer standard/high items.
- **Weekly**: low-priority feedback and feature requests; review waiting-on-
  customer tickets for follow-up or closure.

## Triage a ticket

1. Read the request. Confirm the **category** is right (re-categorize if needed).
2. Set **priority** from real impact, not the customer's wording. The form
   suggests a priority (never `critical`); you confirm or adjust. Reserve
   `critical` for a confirmed/credible platform outage, active security
   incident, widespread auth failure, severe data-access issue, or time-
   sensitive privacy incident.
3. Move status `new → triaged`, then `in_progress`. Use `waiting_on_customer`
   when you need more from them and `waiting_on_dutiva` when the ball is yours.
4. Aim for the **initial-response target** (4 business hours / 1 / 2 / 5 business
   days). These are response targets, not resolution promises.

## Priority quick reference

| Priority | Use when |
| --- | --- |
| Critical | Outage, active security incident, widespread auth failure, severe data-access issue, time-sensitive privacy incident |
| High | Customer can't access an essential account/workflow; billing interrupting service; significant accessibility barrier; major feature failure without workaround |
| Standard | Isolated defect, product question, billing clarification, general issue |
| Low | Feature request, general feedback, non-urgent docs suggestion |

## When to schedule a call

Only when the issue **cannot reasonably be resolved in writing** — complex
account recovery, accessibility accommodation, serious security concern,
escalated billing dispute, enterprise onboarding, or a sensitive complaint.
Requirements before a call: an existing ticket, initial written triage, identity
verification if account details will be discussed, and a scheduled appointment.
There is **no "call us now"** flow, and no general inbound number.

## Document a call

After every call, add a **written summary** to the ticket (a `customer`-visible
message plus an internal note if needed), set status back to the appropriate
written state, and record any commitments. The written ticket is the record.

## Handle a privacy request

Privacy requests (`privacy@dutiva.ca`) are **not** ordinary tickets. Do not treat
them as product support. Confirm the request type (access / correction /
deletion / consent withdrawal / complaint / question), note that identity
verification may be required, and follow the Privacy Request Procedure. Never
collect identity documents through the ordinary form.

## Handle a security report

Security reports (`security@dutiva.ca`) get **restricted visibility** and higher
triage priority. Keep details out of ordinary analytics. Ask for a factual
description, affected URL/feature, safe reproduction steps, and impact. Do not
ask for weaponized exploit details. Remind reporters not to access other
customers' data or disrupt service. There is no bug bounty unless one is
formally established.

## Handle an accessibility request

Accessibility feedback (`accessibility@dutiva.ca`) is available to everyone and
must not sit behind a paywall or authentication. If the customer asks for an
alternative communication method (including telephone or video) as an
accommodation, arrange it — the web form is never the only path.

## Handle a complaint

Acknowledge complaints **separately** from routine product tickets, in a calm,
non-adversarial tone. Capture the nature of the complaint, desired resolution,
relevant dates, language, and accessibility needs. Escalate to a scheduled call
only if written communication is unsuitable.

## Close a ticket

Confirm the resolution is written in the ticket, move to `resolved`, then
`closed` after any waiting period. Optionally invite feedback. Set
`retention_review_at` per the (review-pending) retention schedule.

## Email notifications (turning on the send worker)

The outbox and the `support-notify` worker are **built and deployed**, but email
is **off until configured** — until then, acknowledgements and alerts accumulate
as `pending` in `support_notifications` and nothing is sent. Enabling it flushes
the backlog, so no acknowledgement is lost.

To turn it on:

1. **Verify a sending domain** in Resend (SPF/DKIM) so mail from
   `@dutiva.ca` is deliverable.
2. **Set the function secrets** (Supabase → Edge Functions → `support-notify` →
   Secrets, or `supabase secrets set`):
   - `RESEND_API_KEY` — the Resend API key. (`SUPPORT_EMAIL_PROVIDER_API_KEY`
     also works — it's the provider-agnostic fallback name.)
   - `SUPPORT_EMAIL_FROM` — e.g. `Dutiva Support <support@dutiva.ca>` (must be on
     the verified domain).
   - `SUPPORT_NOTIFY_SECRET` — a long random string. **Required**: with a
     provider key set but no secret, the worker refuses to run (403) so the drain
     endpoint is never open.
   - Optional: `SITE_URL` (ticket links; defaults to `https://dutiva.ca`),
     `SUPPORT_OPERATOR_EMAIL` (operator-alert recipient).
3. **Schedule it** every minute or two via pg_cron + pg_net (store the secret in
   Vault, never inline):

   ```sql
   select cron.schedule('support-notify-drain', '* * * * *', $$
     select net.http_post(
       url     := 'https://<project-ref>.supabase.co/functions/v1/support-notify',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'apikey', '<publishable-key>',
         'x-notify-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'support_notify_secret')
       ),
       body := '{}'::jsonb
     );
   $$);
   ```

4. **Verify**: create a test ticket, then invoke once manually and confirm a
   `sent` count:

   ```bash
   curl -X POST 'https://<project-ref>.supabase.co/functions/v1/support-notify' \
     -H 'apikey: <publishable-key>' -H 'x-notify-secret: <secret>' -d '{}'
   ```

**Monitoring:** rows stuck `pending` with a rising `attempts`/`last_error` mean a
provider problem (bad key, unverified domain); a row hits `failed` after 5
attempts. Query `support_notifications` (admin-read) to inspect. Re-queue a
`failed` row by resetting `status='pending'`, `attempts=0`.

**`sent` does not mean delivered.** It means Resend accepted the message; a
bounce lands minutes later. Check the provider's verdict instead:

```sql
select kind, recipient, status, delivery_status, delivery_detail
from support_notifications
where delivery_status in ('bounced', 'complained');
```

To populate that, add the delivery webhook (one-time):

1. Resend → **Webhooks → Add Endpoint** →
   `https://<project-ref>.supabase.co/functions/v1/resend-webhook`
2. Subscribe to `email.delivered`, `email.bounced`, `email.complained`,
   `email.delivery_delayed`.
3. Copy the **signing secret** (`whsec_…`) and set it as the
   `RESEND_WEBHOOK_SECRET` edge-function secret.

Until that secret is set the webhook returns `503` and rejects everything —
deliberately. It never accepts an unsigned event.

**Role mailboxes must exist.** Every address in `src/config/support.ts`
(`support@`, `privacy@`, `security@`, `accessibility@`, `billing@`, `sales@`)
is published in the legal pages and Help Centre, and `support@` is both the
operator-alert recipient and the `From:` address customers reply to. If one
doesn't exist in Google Workspace, its mail bounces silently — create them as
aliases or groups.

## Never do

- Never publish or imply 24/7 staffed support.
- Never offer routine inbound phone support or expose a personal number/email.
- Never let AI close privacy, security, accessibility, billing-dispute,
  complaint, or account-recovery matters without your review.
- Never request unnecessary HR/employee personal information in a ticket.
