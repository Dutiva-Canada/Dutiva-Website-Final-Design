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

## Never do

- Never publish or imply 24/7 staffed support.
- Never offer routine inbound phone support or expose a personal number/email.
- Never let AI close privacy, security, accessibility, billing-dispute,
  complaint, or account-recovery matters without your review.
- Never request unnecessary HR/employee personal information in a ticket.
