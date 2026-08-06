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

**OA12 — Scheduled-call booking: three deployment steps.** _Owner._ D3 was
decided 2026-08-06 (Google Calendar, full loop) and built the same day —
propose/confirm/remind/follow-up, migration `0045` applied. Three things
outside this repo remain, each independently no-op until done: (1) a Google
Cloud service account with Calendar access, shared to the target calendar,
and its three secrets (`GOOGLE_CALENDAR_CLIENT_EMAIL` /
`GOOGLE_CALENDAR_PRIVATE_KEY` / `GOOGLE_CALENDAR_ID`) — without them,
confirmation still works, just without an automatic calendar invite; (2)
deploying `support-agent-action` (extended), `support-confirm-call`, and
`support-call-scheduler`; (3) the `support_scheduler_service_key` Vault
secret the cron sweep needs to fire. See
[SUPPORT_CALL_SCHEDULING.md](SUPPORT_CALL_SCHEDULING.md) for exact steps and
`select * from public.support_call_scheduler_status();` to verify.

**OA13 — Law-change digest: three deployment steps, plus the monitor itself.**
_Owner._ D1 was decided 2026-08-06 (internal-only, weekly, human-reviewed) and
built the same day — `send-law-updates`, `law_updates.review_status`,
migration `0046` applied. What's left: (1) OA1/OA2 — without the monitor
actually running for a jurisdiction, there is nothing to review or digest;
(2) deploying `send-law-updates` and confirming `RESEND_API_KEY` /
`SUPPORT_OPERATOR_EMAIL` are set (OA3); (3) the
`law_update_digest_service_key` Vault secret the Monday cron needs to fire.
Also: reviewing a row is direct SQL for now (`update law_updates set
review_status = 'reviewed' where id = '<uuid>'`) — there is no admin UI, on
purpose, for a low-volume internal pilot. See
[LAW_CHANGE_NOTIFICATIONS.md § 7](LAW_CHANGE_NOTIFICATIONS.md) and
`select * from public.law_update_digest_status();` to verify.

---

## 2. Decisions needed before anyone writes code

These are not backlog items. Each one was deliberately left to the owner because
building it speculatively would have meant deciding it speculatively.

**D2 — Support analytics: the privacy model comes first.** What is collected,
anonymous vs user-scoped, retention. `recordHelpfulness` is the single seam a
sink would hook; nothing is transmitted today.
[SUPPORT_ARCHITECTURE.md § Staged](SUPPORT_ARCHITECTURE.md). (PR #49)

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

**L5 — Corpus review gate.** _Blocked (human review)._ Every row in
`advisor_guidance_chunks` is `review_status: machine_curated`. Only a human
flips a row to `reviewed`, and that gate has never been exercised. Unverified
here — the live table was not reachable from this session.

**L6 — Québec and Federal notice bands: the pack is built, awaiting a
signature.** _Blocked (qualified legal review) — but the research is done._
`NOTICE_SCHEDULES` still has `bands: null` for QC and FED, and stays that way
until a qualified reviewer signs off;
[notice-bands-review-pack.md](notice-bands-review-pack.md) is what makes that a
one-hour reading job rather than a research project. It carries LNT s. 82 and
CLC s. 230(1.1) quoted verbatim in both languages, the proposed band arrays in
the file's exact shape with step-by-step derivations, every carve-out a flat
table cannot express, and a sign-off block.

Two findings in it decide the question and were not visible from the code:

- **Québec's band is only a floor.** CCQ art. 2091 reasonable notice sits on top
  of s. 82 (preserved expressly by s. 82 ¶4) and is non-renounceable under
  art. 2092, so presenting the band as "the notice a Québec employee gets" is
  materially misleading. A technically correct table can still be the wrong
  thing to ship. s. 82 is also literally ambiguous at exactly 5 and 10 years, in
  **both** language editions — so the Charter's French-prevails tiebreaker
  cannot resolve it, and only CNESST's non-binding administrative reading does.
- **The federal picture is due to change silently.** 2018, c. 27, ss. 479–484
  are enacted but **not yet in force**; they would make group termination
  _displace_ the s. 230(1.1) band table (with an 8-week floor) rather than add
  to it. A federal table shipped today becomes wrong for group terminations the
  day those are proclaimed, with no change to the in-force consolidated text.
  If FED is approved, attach a monitoring commitment to the sign-off.

(PRs #78, #110)

**L7 — ESA s. 64 severance: three options written up, awaiting a choice.**
_Decision._ Severance does not fit `NOTICE_SCHEDULES` at all — it is continuous
and proportional rather than banded, its gate is a property of the employer
(the $2.5M payroll test) and of the event (50 employments severed in six months
on a permanent closure) rather than of tenure, and it carries a 26-week ceiling
the shape has no field for. Adding it means changing the type, not adding a row.
Options A (collect payroll and compute), B (collect payroll, gate eligibility
only — recommended) and C (severance stays a flag, which is defensible) are
written up concretely in
[notice-bands-review-pack.md § 3](notice-bands-review-pack.md).

Sourcing caveat carried forward: ss. 63–65 could **not** be quoted from the
consolidated statute — Ontario e-Laws serves statute text through a client-side
app, and `/print`, a version-pinned URL and an XML `Accept` header all return
the same shell. The substance came from ontario.ca's official ESA guide and
needs checking against the statute. (This independently confirms EF2.) (PR #110)

**L8a — The business phone is still unverified, and may be unverifiable.**
_Owner._ Incorporation and trademark were checked against the registries on
2026-08-04 and are now confirmed in
[CANONICAL_FACTS.md](CANONICAL_FACTS.md) with the identifiers that let anyone
re-check them (corporation no. 1780679-5; CIPO application no. 2465617). The
phone number is the one that did not resolve: no public authoritative source
lists 1 (800) 349-0297 and none attributes it to Dutiva, dutiva.ca publishes no
phone number, and the Corporations Canada record has no telephone field. A
toll-free number is registered to a carrier rather than a public registry, so
this may not be confirmable from outside — the founder is the authority on
whether it is provisioned and answered. Still blocking any directory listing
that requires a phone number (SEO playbook item 2).

**L8b — The trademark application has an open CIPO objection.** _Owner._ Not
previously recorded anywhere. CIPO's Action History on application 2465617 shows
a **Pre-Assessment Letter sent 2026-04-09, "Goods or Services Not Acceptable"** —
so as of the last action on the file the goods and services wording has been
objected to. This does not change what may be claimed today (an application is
an application either way, and the repo's copy is clean — no `®`, no "registered
trademark" anywhere), but it is a live prosecution matter with a response
deadline that nothing in this repo or the business plan mentions.

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

**EF2 — Ontario and Québec fetch/detection code is built; it has never run
live.** _Verify, then Owner._ Built 2026-08-05, in the shape the Justice
Canada XML path established: `MONITORED_PAGES` now carries Ontario's ESA,
Human Rights Code and WSIA on the confirmed `act-versions` API ids (`00e41`,
`90h19`, `97w16`), and Quebec's LNT and Charter on Données Québec's CKAN
dataset (`c8433300-f752-4815-8ea2-69cad416dd80`, "Lois" resource). See
`ontarioApi.ts` / `quebecCkan.ts` and
[LAW_MONITORING.md § Sourcing evaluation](LAW_MONITORING.md) for the sourcing
this implements and what it deliberately does not yet do (per-statute
drill-down into the Québec zip; independent liveness alarms for the two
Ontario health checks beyond the per-fetch verdict).

No session here can reach a deployed edge function or the cron schedule, so
none of this has executed against the live APIs — it is unit-tested against
captured real responses only. **Do not flip `monitoringCoverage.ts`'s
ON/QC-unmonitored claim until a real scheduled sweep proves it**, the same
discipline OA2 already applies to Federal. (PRs #105, #106)

**EF3 — Export-trail follow-ups.** An in-app admin viewer over `export_events`
(the trail is read through service-role tooling today); the Advisor chat "Copy"
button and on-screen text are unwatermarked, since watermarking starts at
export; and downloads should move to short-lived signed URLs if Supabase Storage
ever holds real files. [EXPORT_PROTECTION.md](EXPORT_PROTECTION.md). (PR #102)

The viewer is not just a screen: `0033` enables RLS on `export_events` with
**no policies at all**, deliberately — service-role only, so today nothing
signed-in can read a row. Building the viewer means either an admin `select`
policy (the shape `0011` already uses for guidance/law_updates) or an
admin-gated edge function. That is a decision about the audit table's security
posture and should be taken on purpose, not inherited from whichever is easier
to write.

**EF4a — Annual billing needs its Stripe objects and migration 0043.** _Owner._
The code half is done: `create-checkout-session` resolves
`STRIPE_PRICE_*_ANNUAL`, the webhook's price lookup maps the annual ids, and
`getCheckoutProfilePatch` records the real interval instead of hardcoding
`monthly`. Three things outside this repo remain, and annual checkout does not
work until all three land: create the annual Price objects in Stripe (yearly
recurring, charging `ANNUAL_MONTHS_BILLED` = 10 months' worth), set the three
env vars, and **apply migration `0043`** — without it
`profiles.billing_period` may still reject `'annual'`, which would take the
money and lose the entitlement. The function fails closed with a 503 meanwhile,
and `PricingPage`'s annual guard turns that into an intelligible notice; remove
that guard only once this is done. Folded into OA11.

**EF4b — The live `billing_period` constraint is unknown.** _Verify._ `0013`
declares `check (billing_period in ('monthly'))` but was never applied under its
own name — the live `profiles` came from the predecessor repo, as
`0024_reconcile_billing_schema.sql` records. So nobody knows what the project
actually enforces on that column. `0043` is written defensively (drop-if-exists
then add, 0024's pattern) and works under any of those cases, but if the live
table carries a differently _named_ check the drop will miss it and the old one
will still reject `'annual'`. The migration ends with the `pg_constraint` query
to settle it. This is the same blind spot as V1.

**EF6 — Done.** The entry graph was broad because three things rode it: the
`vendor` group carried react-markdown's 157kB parser tree; `messages/index.ts`
split into 25+ tiny chunks that were each modulepreloaded; and `routes.tsx` →
`appViews.tsx` → `ModeGate` → `navConfig` → `@/data` put 113kB of demo HR
fixtures in front of every landing page. 34 preloads → 5, and 1121kB → 850kB
raw. `scripts/check-entry-graph.mjs` now fails the build on a regression,
reading membership from the build's own source maps.

**EF6b — Done.** The router imported `@/seo/routes`, which read every article
and help article to build `allPublicPages()` — it needs slugs, and it was
getting `blogArticles.ts` (89kB), `guideArticles.ts` (111kB) and
`helpCenterData.ts` (32kB) in full. Prose is now split from the records it
hangs off, keyed by English slug, in `blogContent.ts` / `guideContent.ts` /
`helpContent.ts`. Every consumer — `ArticlePage`, `HelpArticlePage`, Help
Centre search, the support first-line helper — is behind a lazy route, so the
imports stay static and prerendering is unchanged.

Entry chunk 248kB → 62kB; eager graph 850kB → 665kB. The move was done with a
codemod copying verbatim source ranges, and verified by comparing every
authored string literal against `git HEAD`: 786 article strings and 76 help
strings, identical. `check-entry-graph.mjs` now bars the three content modules
by name, and parity tests assert the metadata and content key sets match in
both directions per collection.

**EF7 — The legacy document fixture was never migrated.** `src/data/documents.ts`
still exists alongside the doclib catalogue, with five templates that have no
doclib match; `PoliciesView.tsx` and `searchCorpus.ts` were explicitly left out
of the unification. Additive by design — but two sources for one concept is the
shape of the drift this repo keeps correcting elsewhere. (PR #33)

It is a live fallback, not dead weight: `DocStudioProvider` and
`resolveDocTitle` both try the doclib set by tid and fall back to
`documentTemplatesByKey` when there is no match, which is what keeps those five
templates reachable. So deleting the file removes five templates from Document
Studio. Closing this means authoring them into the doclib catalogue — legal
content in a compliance product, which per
[FOUR_RING_FRAMEWORK.md](FOUR_RING_FRAMEWORK.md) needs review budget, not just
engineering time — or deciding they should go, which is a product call.

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

**V1 — Migration drift is unchecked in CI, and now says so.** _Owner._ Confirmed
2026-08-04: `gh secret list` returns empty, so neither `SUPABASE_ACCESS_TOKEN`
nor `SUPABASE_PROJECT_REF` is set on this repository and the drift half of
`check:migrations` has been skipping on **every** CI run — a required check
going green on the exact meaning "drift unchecked". The repo half is closed:
the script now raises a GitHub warning annotation and a job-summary entry when
it skips, so the skip is visible where results are read rather than in a log
(`announceSkippedDriftCheck`). What remains is an owner action — set both
secrets as repository secrets and the step starts enforcing with no code
change. Until then, whether migrations `0033`–`0041` are applied is still
unverified.

---

## Recently closed — do not re-open

Sweeping 132 PR bodies turns up items that read as open in one PR and were
closed two PRs later. These are settled; the note is here so the next sweep
does not resurrect them.

| Item                                        | Closed by                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| EF6a — split the message catalogue by surface, and guard `t()`'s surface boundary | Catalogue source split into `workspace.ts`/`marketing.ts`/`shared.ts`; `vite.config.ts`'s `messages-workspace` group needed `includeDependenciesRecursively: false` to actually stop riding into the eager graph (671.3kB → 539.9kB, -131.4kB) — see that file's comment for the rolldown mechanism. `t()` itself is still typed `MessageKey`, not per-surface — `scripts/check-message-scopes.mjs` (`npm run check`) guards the same boundary a different way, by scanning every literal `t('key')` call against its file's surface, instead of retyping ~140 call sites for an equivalent guarantee. A *computed* key (`t(someVariable)`) is invisible to this script by construction, same as it always was — those are guarded at the data structure that carries the key (`plans.ts`, `legalHubData.ts`, etc.), which was already typed. |
| D3 — scheduled-call booking calendar decision                                     | Decided 2026-08-06 (Google Calendar, full loop) and built the same day — see OA12 for what's left to deploy it. [SUPPORT_CALL_SCHEDULING.md](SUPPORT_CALL_SCHEDULING.md). |
| D1 — law-change notifications' five open questions                                | Decided 2026-08-06 (internal-only, weekly, org jurisdiction wins, human review required) and built the same day — see OA13 for what's left to deploy it. [LAW_CHANGE_NOTIFICATIONS.md](LAW_CHANGE_NOTIFICATIONS.md). |
| EF5 — `inferCheckoutPrice`'s dead branch    | Deleted; server-set metadata is the checkout path's documented single source        |
| L1 — primary sources "unreachable"          | Not a network block — a bot filter on the fetching tool; run from a workstation     |
| L2 — WI1 federal leaves omission            | Pregnancy loss leave confirmed and added; "placement of a child" **does not exist** |
| L3 — WI3 Ontario minimum wage               | All four Oct-2026 special-category rates verified twice and added                   |
| L4 — WI2 CNESST URL normalization           | SHORT form is canonical (301 trace); fixed per-URL, never by prefix                 |
| V2 — `0021`'s "not yet applied" banner      | Both conditions had lapsed; banner rewritten with the real state                    |
| V3 — was PR #101's crisis framing lost?     | Not lost. Every change is on `main` as `214f0eb`; verified line by line             |
| Annual toggle advertised an unbuyable price | #96 — hidden while paid plans are disabled                                          |
| CASL consent not recorded at signup         | #109 — `0037_beta_signups_consent_record`                                           |
| `scan_status` documented an intention       | #115 — `support-attachment-scan` and the release rules                              |
| Support entry-point sweep, CAPTCHA          | #115                                                                                |
| `/blog` and `/guides` cards linked nowhere  | #113 — twelve bilingual article pages                                               |
| French corpus body missing on 40 rows       | #99 / `0032` — `content_fr` non-null on 42/42                                       |
| "Regenerate with `generate-doclib.mjs`"     | #128 — the generator does not run; headers now say hand-maintained                  |
| Rings 2, 3 and 4 listed as roadmap          | #121–#131 — all four rings complete                                                 |
| AI usage unmetered during an open beta      | #90 / #91 — guardrails live 2026-07-28                                              |
| Client error reporting inert                | #92 — `0019` applied, `report-error` deployed (but see OA6)                         |
| L1a — corpus tranche migration unapplied     | Applied `0042` 2026-08-05 via direct DB access; retrieval smoke test passing        |
| L1b — four federal leaves unauthored         | Added in `0044` 2026-08-05: court/jury duty, reserve force, work-related illness/injury, maternity-related reassignment |

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
