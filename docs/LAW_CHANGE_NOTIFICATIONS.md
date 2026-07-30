# Law-change notifications — groundwork

**Status: design + decision brief. Nothing sends yet, deliberately.**

Today a detected law change lands in `law_updates` and waits to be read. Nobody
is told. A customer learns their jurisdiction's employment standards moved only
if they happen to open the Knowledge panel — which, for a compliance product,
is close to the feature not existing.

This document is the groundwork: what is already true, what has been built, and
the decisions that have to be made by a person before anything can be sent.

> **Not legal advice.** The CASL discussion below is engineering analysis of how
> the law shapes the architecture. Dutiva's own standing boundary applies to
> Dutiva: get the determination in §2 confirmed by counsel before the first
> message goes out.

## 1. What already exists

| Piece | State |
| --- | --- |
| Detection | Working — `law_updates` gets a `change` row per amendment (`docs/LAW_MONITORING.md`) |
| Relevance filter | **Built** — `supabase/functions/_shared/lawUpdateRelevance.ts` |
| Recipient jurisdiction | Available — `profiles.province`, `organizations.default_jurisdiction` |
| Recipient language | Available — `profiles.language_default`, `organizations.default_language` |
| Email delivery | Proven — Resend, via the `support_notifications` outbox + `resend-webhook` |
| Consent record | **Missing — see §3** |
| Recipient model | **Undecided — see §4** |

### The relevance filter

`lawUpdateRelevance.ts` answers "is this row a real, supported, customer-facing
law change?" — the part that is true regardless of how the decisions below are
settled. Two rules, both fail-closed:

- **Only `change` events.** `first_seen` means we started watching a page.
  `redirect` is our plumbing. `broken` is a report that *Dutiva's own scraper*
  failed — operationally urgent, and the last thing a customer should receive
  dressed as legal news.
- **Only ON / QC / FED.** The monitor watches 14 jurisdictions; Dutiva supports
  three. An unmapped jurisdiction returns `null`, never "pass it through".

A recipient with no jurisdiction on file receives **nothing**, not everything.
An unknown jurisdiction is a gap to fill, not a licence to send.

## 2. The CASL question, and why it drives the design

CASL governs *commercial electronic messages* — broadly, messages one purpose
of which is to encourage participation in a commercial activity. Two paths make
a law-change email lawful, and they lead to different products:

**Path A — a service message, outside the CEM definition.** A purely factual
notice to an existing customer about the service they already pay for is
arguably not a CEM at all; CASL also excludes messages that provide factual
information about the ongoing use or purchase of a subscription. On this
reading a bare "the Ontario ESA was amended on <date>; here is the section and
the official source" is a service message.

**Path B — a commercial message requiring consent.** The moment the email
carries an upsell, a plan comparison, a "refer a colleague", or marketing
footer, it is a CEM. It then needs consent, an identified sender, and a working
unsubscribe — and consent must be **provable by the sender**, not by the
recipient.

**This is the architectural fork, not a copywriting detail.** Path A buys
deliverability to every customer with no consent burden, but only if the
message stays austere forever — one marketing link retroactively reframes the
whole channel. Path B is unrestricted in content but reaches only people whose
consent you can evidence.

**Recommendation: build Path A, and enforce it structurally** — no promotional
content in the law-change template, ever, with the constraint written into the
template rather than left to whoever edits copy next. Then a marketing
newsletter, if wanted later, is a separate channel with its own consent, rather
than something that quietly contaminates this one.

Either path needs an unsubscribe/preference control. Under Path A it is
courtesy and good practice; under Path B it is mandatory. Build it regardless.

## 3. Finding: consent is collected but never recorded

The marketing signup asks for express CASL consent and the client refuses to
submit without it (`BetaSignup.tsx`, `landing_cta_consent_label`: *"Yes, email
me product updates about Dutiva. I can unsubscribe at any time."*). The value is
sent to `create-beta-signup` as `consent`.

**`beta_signups` has no column to store it.** Columns are `id, email, name,
company, team_size, province, role, hr_challenge, source, created_at, status,
internal_notes, language` — the consent flag is collected, transmitted, and
dropped.

Why this matters: under CASL the **burden of proving consent falls on the
sender**. Consent you cannot evidence — with a timestamp, the wording agreed
to, and how it was obtained — is not consent you can rely on when asked. Right
now Dutiva is asking correctly and keeping no record of the answer.

This is not blocking for Path A, which does not rest on consent. It *is*
blocking for Path B, and it is worth fixing on its own account regardless of
which path is chosen, because the consent is already being collected — the only
thing missing is writing it down.

**Suggested fix (not done here — it changes a live signup path):** add
`consent_granted boolean`, `consent_text text`, `consent_at timestamptz`,
`consent_source text` to `beta_signups`, and persist them. Storing the exact
wording matters: proving consent means proving what someone agreed to, and that
sentence will be edited eventually.

## 4. Decisions needed

**a. Who receives them?** Every signed-in customer; only paid plans; only
people who opt in; or internal-only to start (a digest to `support@dutiva.ca`,
so the pipeline is proven before it touches a customer). Internal-only is the
cheapest way to find out whether the summaries are actually good enough to send.

**b. Immediate or digest?** Amendments are rare and rarely same-day urgent. A
weekly digest is calmer, batches naturally, and fails softly if a run is missed.
Immediate sending makes each message an interruption and each false positive
expensive.

**c. Which jurisdiction decides relevance?** `profiles.province` and
`organizations.default_jurisdiction` can disagree, and neither is guaranteed
present. A recipient with neither gets nothing under the current filter — is
that right, or should they be prompted to set one?

**d. What does the message contain?** Under Path A: the Act, the jurisdiction,
the date, the model-written summary, and a link to the official source. Note
that summaries are **model-generated and unreviewed** — sending them
unsupervised to customers is a meaningfully different risk posture from showing
them in a panel the reader chose to open, and may warrant human review before
send.

**e. Where does the boundary sit?** The standing disclaimer must ship with any
generated summary. An email is a generated document leaving the product.

## 5. Proposed architecture (once §4 is settled)

Reuse the proven pattern rather than inventing one. `support_notifications`
already solves this shape — outbox rows with `status`, `attempts`, `last_error`,
`provider_message_id`, and a separate `delivery_status` fed by
`resend-webhook`, because *we sent it* and *it arrived* are different facts
(learned the hard way on 2026-07-16; see `0018_notification_delivery.sql`).

1. A `law_update_notifications` outbox in the same shape, with a uniqueness
   constraint on `(recipient, law_update_id)` so a retry or an overlapping run
   can never double-send. Idempotency belongs in the schema, not in the sender's
   good intentions.
2. A `send-law-updates` edge function: select unsent `change` rows, filter
   through `lawUpdateRelevance.ts`, group per recipient, enqueue, hand to
   Resend.
3. Scheduled by `pg_cron` — for the reason in `docs/LAW_MONITORING.md`: a
   schedule that lives with the data cannot be lost to a hosting move.
4. A preference control in Settings, and an unsubscribe link, from day one.

**Do not send during the beta backfill.** The first real sweep after the Vault
secret lands will produce a burst of `first_seen` and `broken` events. The
filter already excludes both, but the sender should also ignore anything
detected before its own go-live timestamp — otherwise the first email a
customer receives is a history dump.

## 6. Prerequisite

None of this is worth building until the monitor actually runs: detection needs
`law_monitor_service_key` in Vault, and **Ontario and Québec currently have no
working source at all** (`docs/LAW_MONITORING.md`). A notification channel for
two jurisdictions that cannot be monitored would notify nobody about nothing.
Federal is the one supported jurisdiction with a reliable source today, so a
federal-only pilot is the realistic first version.
