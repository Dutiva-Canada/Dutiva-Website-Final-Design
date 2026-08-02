# Open items — the running to-do list

**Swept 2026-08-02, across every session in this repository: PRs #1–#132.**

Sessions here end at a merge, and each one closes by writing down what it did
_not_ do — in a "Still staged", "Not done", "Follow-up" or "Decisions needed"
section of its PR body, and usually in a doc under `docs/`. That is good
practice and it had one failure mode: those notes were spread across 132 PR
descriptions and a dozen documents, so nothing said what was open _in total_.
This file is that total.

**Precedence.** This file is an index of open work, not a source of fact.
[CANONICAL_FACTS.md](CANONICAL_FACTS.md) outranks it, and the code outranks
both. Where an item names a file, the file is the authority on its current
state — an entry here can go stale, a test cannot.

**Verification note.** Items are verified against the repository at the sweep
date. Items whose truth lives on the live Supabase project or in a dashboard are
marked _unverified here_ — this session had no database or dashboard access, so
"the code is inert until a secret is set" is checkable and "the secret is not
set" is not.

## Status vocabulary

| Status       | Meaning                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| **Owner**    | Built and merged; needs a secret, an account, or a dashboard action to come on  |
| **Decision** | Blocked on a product or policy call, not on engineering time                    |
| **Blocked**  | Blocked by something outside this repo (network policy, legal review, a vendor) |
| **Build**    | Ready to implement; no decision or credential in the way                        |
| **Verify**   | Something believed true that no one has confirmed                               |

---

## 1. Owner actions — merged, and inert until configured

Everything in this section is code that exists, passes tests, and does nothing
until someone with credentials acts. A merged migration is not an applied
migration and a merged function is not a deployed one; see
[AGENTS.md § Migrations ship in two halves](../AGENTS.md).

**OA1 — Law-monitor service key.** _Owner._ The nightly sweep runs, finds no
`law_monitor_service_key` in Vault, logs a warning and returns. Until the secret
exists, law-change monitoring is a deliberate no-op and the Knowledge panel ages
in place. One SQL statement, in
[LAW_MONITORING.md § Setup](LAW_MONITORING.md). Blocks OA2 and EF2. (PR #105)

**OA2 — First federal sweep, then flip the coverage claim.** _Owner, then
Build._ `monitoringCoverage.ts` states Federal as `unverified` because no sweep
has proven the Justice Canada XML source. After the first successful run, flip
it to active — the test asserting the all-unconfirmed state will fail and prompt
exactly that. Depends on OA1. (PR #107)

**OA3 — Turn support email on.** _Owner._ Verify a Resend sending domain, set
`RESEND_API_KEY`, `SUPPORT_EMAIL_FROM`, `SUPPORT_NOTIFY_SECRET`, and schedule
`support-notify` via pg_cron. Rows sit `pending` rather than dropping, so
enabling it flushes the backlog. Set `RESEND_WEBHOOK_SECRET` at the same time or
`resend-webhook` rejects every delivery receipt with a 503, leaving _sent_ and
_delivered_ indistinguishable. [SUPPORT_RUNBOOK.md](SUPPORT_RUNBOOK.md).
(PRs #43, #50, #51)

**OA4 — Turn CAPTCHA on.** _Owner._ `CAPTCHA_SECRET_KEY` (edge-function secret)
and `VITE_CAPTCHA_SITE_KEY` (client, baked in at build) must be set **together**
and followed by a redeploy — the site key is compiled into the bundle, so
rotating the secret alone breaks the public form. With neither set the check is
a safe no-op. (PR #115)

**OA5 — Turn attachment scanning on.** _Owner._ `SUPPORT_ATTACHMENT_SCAN_URL` +
`SUPPORT_ATTACHMENT_SCAN_KEY`, plus the `attachment_scan_service_key` Vault
secret the pg_cron job reads. Until then every row stays `scan_status: pending`
— which is the honest state, since `pending` has never meant clean. (PR #115)

**OA6 — Confirm the error-reporting pepper.** _Owner / Verify._ `report-error`
reads `ERROR_REPORT_SALT`, falls back to `SUPPORT_NOTIFY_SECRET`, and **fails
closed with a 500 if neither is set**. Function secrets were not readable from
the session that shipped it, so this was never confirmed. Also confirm the
hourly `purge-client-error-data` job exists — the migration deliberately does
not schedule it, so retention is unbounded until someone does.
[ERROR_REPORTING.md § Deployment status](ERROR_REPORTING.md). (PR #92)

**OA7 — Supabase Auth dashboard settings for magic links.** _Owner._ The three
settings in [AUTH_MAGIC_LINK.md](AUTH_MAGIC_LINK.md) §1–§3, in particular
switching the email template to `token_hash`. The client-side safety net
recovers root landings without them; it does not eliminate the scanner-burn
failure. (PR #52)

**OA8 — Search Console and Bing Webmaster Tools.** _Owner._ Verify both, set
`GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` as build env vars, submit
`https://dutiva.ca/sitemap.xml`, and request indexing for the expanded articles.
Nothing downstream in [SEO_AUTHORITY_PLAYBOOK.md](SEO_AUTHORITY_PLAYBOOK.md) is
measurable until this happens, and no session so far has been able to reach
`dutiva.ca` from its sandbox to verify production headers. (PRs #112, #113)

**OA9 — Send the DigitalOcean residency ticket.** _Owner._ The ticket is
drafted and unsent in
[do-residency-confirmation-request.md](do-residency-confirmation-request.md).
Five public legal documents state the Advisor's processing location as Toronto;
that claim rests on a July 2026 confirmation covering the _previous_ model, and
the production route moved to `deepseek-3.2` on 2026-07-26. Resolving it unblocks
the PIPEDA wording in CANONICAL_FACTS §2. (PR #103)

**OA10 — Commit the database schema snapshot.** _Owner._ `supabase/schema.sql`
does not exist in the repo (verified 2026-08-02). `supabase/migrations/` is a
curated subset of a history that predates this repo, so today a reviewer cannot
see the real RLS policies or function bodies in a diff. `npm run db:snapshot`
needs the database password, which is why no session has run it.
[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md). (PR #74)

**OA11 — Stripe secrets and webhook endpoint.** _Owner, deferred._ The six
secrets and the webhook subscription in
[BILLING_BETA_AUDIT.md § Remaining work](BILLING_BETA_AUDIT.md). Deferred rather
than urgent: `PAID_PLANS_DISABLED_DURING_BETA` is `true` in
`src/config/plans.ts`, so nothing on `/pricing` is purchasable and
`create-checkout-session` failing closed is invisible. This becomes blocking the
day paid plans are re-enabled.

---

## 2. Decisions needed before anyone writes code

These are not backlog items. Each one was deliberately left to the owner because
building it speculatively would have meant deciding it speculatively.

**D1 — Law-change notifications: five open questions.** Recipients (everyone /
paid / opt-in / internal-only pilot), immediate vs weekly digest, which
jurisdiction field wins when `profiles.province` and
`organizations.default_jurisdiction` disagree, whether model-written summaries
get human review before being _pushed_ rather than shown in a panel, and where
the standing disclaimer sits on an outbound email. The groundwork is merged and
nothing sends. [LAW_CHANGE_NOTIFICATIONS.md § 4](LAW_CHANGE_NOTIFICATIONS.md).
(PR #108)

**D2 — Support analytics: the privacy model comes first.** What is collected,
anonymous vs user-scoped, retention. `recordHelpfulness` is the single seam a
sink would hook; nothing is transmitted today.
[SUPPORT_ARCHITECTURE.md § Staged](SUPPORT_ARCHITECTURE.md). (PR #49)

**D3 — Scheduled-call booking needs a calendar decision.** The intake forms
already offer a scheduled call and triage can move a ticket to
`scheduled_call`; the appointment itself is arranged by hand. Availability,
invitations and reminders are unbuilt because the calendar choice is upstream of
the code. (PRs #44, #46)

**D4 — Training-crawler policy.** `scripts/prerender.mjs` still emits
`Disallow: /` for `GPTBot` and `ClaudeBot` (verified 2026-08-02). It does not
affect citation in ChatGPT or Claude search results — those crawlers are
separate and already allowed — but it does keep the brand out of future training
corpora. Worth deciding on purpose rather than inheriting.
[SEO_AUTHORITY_PLAYBOOK.md § Open items](SEO_AUTHORITY_PLAYBOOK.md). (PR #117)

**D5 — Which business plan is the plan of record.** Two are live in Drive and
neither is marked superseded. CANONICAL_FACTS § Open items 3. (PR #103)

**D6 — Is a non-figure linkable asset worth building.** A termination-notice
calculator was proposed and ruled out: publishing notice periods violates the
editorial rule in `articleModel.ts`, which exists precisely because a wrong
figure on an answer-engine-indexed page gets quoted onward without the
disclaimer beside it. The link-earning gap that motivated it is still open.
(PR #117)

**D7 — `/guides` vs `/blog` positioning.** The current copy is one session's
read of what the twelve articles already are. If a real publishing cadence is
planned, a dated blog becomes viable and the strings should change — they are
the cheapest thing in that area to change. (PR #120)

---

## 3. Legal and content verification

The corpus rule is that every statutory figure comes from a direct fetch of an
official government page, fetched twice — once to author, once to verify
independently. Everything in this section is gated on that rule.

**L1 — Restore primary-source access, then run the amendment tranche.**
_Blocked._ On 2026-08-02 every official host (`canada.ca`, `ontario.ca`,
`cnesst.gouv.qc.ca`, `legisquebec.gouv.qc.ca`, `chrc-ccdp.gc.ca`, `cdpdj.qc.ca`)
was refused at the egress proxy with a 403 on CONNECT, along with the
`web.archive.org` and `canlii.org` fallbacks. The environment's network policy
is fixed when the environment is created, so unblocking this means allowlisting
those domains **and starting a new session**. Blocks L2, L3 and L4.
[advisor-corpus-verification-2026-08-02.md](advisor-corpus-verification-2026-08-02.md).
(PR #132)

**L2 — WI1: federal statutory leaves may be incomplete.** _Blocked by L1._ The
concern is omission, not error — Pregnancy Loss Leave and Leave for the
Placement of a Child are both reported by secondary sources and neither is in
the chunk. Confirm existence, duration, paid days, service threshold, claim
window and in-force date from the official page, and re-read the whole page for
anything else added since 2026-07-27.

**L3 — WI3: Ontario minimum wage, special categories.** _Blocked by L1 —
time-sensitive._ The chunk carries the general rate correctly but gives
special-category rates only for the period ending **2026-09-30**, so it goes
stale on **2026-10-01**. That is roughly two months out from this sweep. The
whole minimum-wage cluster is the highest-churn part of the corpus and this
cycle's check was snippet-based, so re-verify all of it from primary sources in
the same pass.

**L4 — WI2: CNESST URL normalization.** _Blocked by L1._ Two competing path
forms cite the same two CNESST pages across four rows. Settling it means
following the live redirects to see which form CNESST serves canonically;
guessing bakes link rot into the citations. Scope is 4 of the 12 CNESST-citing
rows, not all of them.

**L5 — Corpus review gate.** _Blocked (human review)._ Every row in
`advisor_guidance_chunks` is `review_status: machine_curated`. Only a human
flips a row to `reviewed`, and that gate has never been exercised. Unverified
here — the live table was not reachable from this session.

**L6 — Québec and Federal notice bands.** _Blocked (qualified legal review)._
`NOTICE_SCHEDULES` in `src/features/app/advisor/safety/statutoryNotice.ts` has
`bands: null` for QC (LNT s. 82) and FED (CLC Part III s. 230), verified
2026-08-02. Ontario is populated. `null` means "hedge", never zero — so the
Advisor's safety backstop and Document Studio's statutory-floor check both
decline to state a figure in two of three supported jurisdictions. A test
asserts they never report "below" there, which is the correct failure mode and
also the reason this gap is easy to forget. (PRs #78, #110)

**L7 — ESA s. 64 severance is flagged, not computed.** Eligibility turns on a
payroll threshold the Document Studio wizard does not collect, and there is no
reviewed severance schedule to read against. Closing it means either collecting
the payroll figure or accepting that severance stays a flag. (PR #110)

**L8 — Four unverified canonical facts.** Incorporation date, trademark status
and business phone each trace to a single document and have never been checked
against a filing; CANONICAL_FACTS records them as unverified rather than
asserting them. The phone number also blocks any directory listing that requires
one. (PR #103, SEO playbook item 2)

**L9 — Drive template hygiene.** T01, T02 and T04 went to `Legal Review` as
`_polished` drafts in June 2026 and never returned to the `ON/EN` folder, which
is now missing them; and every template in the HR tree exists twice from two
uploads on 2026-06-16. Deliberately deferred by the owner rather than fixed
unilaterally, since it means deleting files. CANONICAL_FACTS § Open items 4–5.

---

## 4. Engineering follow-ups

**EF1 — The Advisor's first real authenticated turn is still unobserved.**
_Verify._ `advisor-chat` returns the structured engine contract and the AI usage
guardrails are live, but neither has been exercised by a signed-in beta user —
every session so far lacked a JWT it could create. Expect exactly one
`ai_telemetry_events` row, `completed`, with a token count. A row stranded at
`started` means the usage claim landed and finalize did not. (PRs #87, #90)

**EF2 — Ontario and Québec are unmonitorable, and that is a sourcing problem.**
Ontario's source loads statute text in the browser; Québec's refuses automated
requests (verified UA-independent). Fixing Federal took a different data source
entirely — Justice Canada XML — so these two need the same treatment, not a
retry. Until then `monitoringCoverage.ts` says so on the Knowledge panel, signed
out included. (PRs #105, #106)

**EF3 — Export-trail follow-ups.** An in-app admin viewer over `export_events`
(the trail is read through service-role tooling today); the Advisor chat "Copy"
button and on-screen text are unwatermarked, since watermarking starts at
export; and downloads should move to short-lived signed URLs if Supabase Storage
ever holds real files. [EXPORT_PROTECTION.md](EXPORT_PROTECTION.md). (PR #102)

**EF4 — Annual billing is unwired below the surface.** `create-checkout-session`
knows only `STRIPE_PRICE_*_MONTHLY` (verified 2026-08-02). The annual toggle is
hidden while paid plans are disabled, so nothing is broken today — but
re-enabling annual pricing means wiring the annual price IDs first, and
confirming the "two months free" convention. (PRs #66, #96)

**EF5 — `inferCheckoutPrice` reads `session.line_items`, which webhooks never
carry.** Not an active bug: this repo's own checkout always sets `metadata.plan`
server-side, so the fallback is what resolves the plan. A real fix means an
extra Stripe API call from inside the webhook. Recorded as short-of-intent, not
broken. (BILLING_BETA_AUDIT § Still open)

**EF6 — The entry graph is broad and react-markdown rides on it.** `main`
preloads 32 chunks including app-only ones like `cases` and `employees`, so
react-markdown's +158 kB could not be deferred by chunking alone. Narrowing the
entry graph is the actual fix and predates that PR. (PR #114)

**EF7 — The legacy document fixture was never migrated.** `src/data/documents.ts`
still exists alongside the doclib catalogue, with five templates that have no
doclib match; `PoliciesView.tsx` and `searchCorpus.ts` were explicitly left out
of the unification. Additive by design — but two sources for one concept is the
shape of the drift this repo keeps correcting elsewhere. (PR #33)

**EF8 — Paid-area gating by plan does not exist.** `/app` is gated by invite,
not by plan; the pricing page and Stripe plumbing are real but nothing reads a
plan to decide access. Dormant while the beta is open to the invite list, and a
prerequisite for selling anything. (PRs #34, #88)

**EF9 — Ring 2 Pillar B's two design-blocked tools are built; the pattern is
not.** The duty-to-accommodate workflow and the functional-limitations guide
needed a decision-tree runner and a reference-content surface, and both surfaces
now exist (`flows/data/`, `reference/data/`). Nothing is outstanding — this
entry exists so the next tool goes into one of the three established shapes
rather than inventing a fourth.
[FOUR_RING_FRAMEWORK.md](FOUR_RING_FRAMEWORK.md). (PRs #121, #123, #125)

**EF10 — The raised "Ask" tab keeps a star where the brief card has a
sparkle.** Flagged rather than changed, because handoffs are the source of truth
for pixels and this one specifies a star. A design call, not a bug. (PR #118)

---

## 5. Verification and hygiene

**V1 — Migration drift against the live project is unchecked in-session.**
`npm run check:migrations` only compares against the project when
`SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` are set; otherwise it
enforces filename discipline alone. Migrations `0033`–`0041` (export audit, cron
locks, law-monitor schedule, consent record, attachment scan, and the three
`hr_*` module tables) are in the repo; whether all are applied was not verified
here.

**V2 — `0021_drop_doclib_demo_schema.sql` still carries a "not yet applied"
banner.** It was staged deliberately for deploy-then-drop ordering. Either apply
it and update the banner, or record why it is still staged — a stale banner is
how the last round of "applied?" confusion started. (PR #73)

**V3 — PR #101 was closed without merging.** "Expand the grounding corpus;
polish crisis-turn framing", with an empty description. Confirm whether its
crisis-turn framing changes were superseded by later work or simply lost. (Also
closed unmerged and correctly so: #60/#61, duplicates of #59; #86, review-only
for commits already on `main`.)

---

## Recently closed — do not re-open

Sweeping 132 PR bodies turns up items that read as open in one PR and were
closed two PRs later. These are settled; the note is here so the next sweep
does not resurrect them.

| Item                                        | Closed by                                                          |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Annual toggle advertised an unbuyable price | #96 — hidden while paid plans are disabled                         |
| CASL consent not recorded at signup         | #109 — `0037_beta_signups_consent_record`                          |
| `scan_status` documented an intention       | #115 — `support-attachment-scan` and the release rules             |
| Support entry-point sweep, CAPTCHA          | #115                                                               |
| `/blog` and `/guides` cards linked nowhere  | #113 — twelve bilingual article pages                              |
| French corpus body missing on 40 rows       | #99 / `0032` — `content_fr` non-null on 42/42                      |
| "Regenerate with `generate-doclib.mjs`"     | #128 — the generator does not run; headers now say hand-maintained |
| Rings 2, 3 and 4 listed as roadmap          | #121–#131 — all four rings complete                                |
| AI usage unmetered during an open beta      | #90 / #91 — guardrails live 2026-07-28                             |
| Client error reporting inert                | #92 — `0019` applied, `report-error` deployed (but see OA6)        |

---

## Keeping this current

The convention that produced this list is worth keeping: **every PR says what it
did not do.** This file is where those notes accumulate.

- Closing an item means deleting its entry, not striking it through — and moving
  it to "Recently closed" only if a future session would plausibly re-raise it.
- Opening one means adding it with the same shape: what, why it is open, where
  the authority lives, and which PR left it.
- An item that names a secret, a dashboard or a filing is an **Owner** item.
  Piling those into an engineering backlog is how they stay open for months.
