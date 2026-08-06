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

**OA1 — Done.** The `law_monitor_service_key` Vault secret was created on
2026-08-06. The nightly sweep at 07:00 UTC now fires `trigger_law_monitor()`,
which reads the key and POSTs to the edge function. Verified via
`law_monitor_status()`: `secret_configured: true`, `hours_since_check: 0.0`.

**OA2 — Done.** The first successful federal sweep ran on 2026-08-06, fetching
both Justice Canada XML pages (Canada Labour Code, Canadian Human Rights Act)
and recording `first_seen` events. `monitoringCoverage.ts` flipped Federal from
`unverified` to `active`, `COVERAGE_AUDITED_ON` updated to 2026-08-06, and
`CANONICAL_FACTS.md §5` updated to reflect that Federal detection is confirmed
working while ON/QC remain unavailable. (PR #162)

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

**OA6 — Done.** Verified 2026-08-06 via Supabase MCP: the `report-error`
function is not failing closed (48 rows in `client_error_reports`, latest
2026-08-06 12:12 UTC), confirming `ERROR_REPORT_SALT` or its
`SUPPORT_NOTIFY_SECRET` fallback is set. The `purge-client-error-data` cron
job is scheduled hourly at :23 and running successfully (5/5 recent runs
succeeded). Retention is bounded.

**OA7 — Done.** Supabase Auth dashboard settings for magic links. Verified
2026-08-06 in the dashboard, all three settings in
[AUTH_MAGIC_LINK.md](AUTH_MAGIC_LINK.md) §1–§3:
- §2 **Site URL** was already `https://dutiva.ca`.
- §3 **Magic link template** was already on
  `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=magiclink`, so the
  scanner-burn failure mode is gone.
- §1 **Redirect URLs** was the gap and was fixed the same day. The list held
  three stale entries from the old `/auth` callback path
  (`http://localhost:5173/auth`, `https://dutiva.ca/auth`,
  `https://dutiva.vercel.app/auth`) that matched nothing the app requests;
  local dev and the `dutiva.vercel.app` alias were therefore falling back to
  the Site URL. Added `http://localhost:5173/**` and
  `https://dutiva.vercel.app/**`, removed the three stale entries. 19 entries
  now; production was already covered by `https://dutiva.ca/**`. (PR #52)

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

**OA12 — Partially done.** D3 was decided 2026-08-06 (Google Calendar, full
loop) and built the same day. Verified 2026-08-06 via Supabase MCP:
- (2) **Done.** All three edge functions deployed: `support-agent-action`
  (v11, extended with `propose_call`), `support-confirm-call` (v1),
  `support-call-scheduler` (v1). Manual trigger of
  `trigger_support_call_scheduler()` returned 200.
- (3) **Done.** `support_scheduler_service_key` Vault secret created.
  `support_call_scheduler_status()` shows `secret_configured: true`,
  `job_scheduled: true`.
- (1) **Still owner.** Google Cloud service account + three Calendar secrets
  (`GOOGLE_CALENDAR_CLIENT_EMAIL` / `GOOGLE_CALENDAR_PRIVATE_KEY` /
  `GOOGLE_CALENDAR_ID`). Without them, confirmation still works — just no
  automatic calendar invite. See
  [SUPPORT_CALL_SCHEDULING.md](SUPPORT_CALL_SCHEDULING.md).

**OA13 — Partially done.** D1 was decided 2026-08-06 (internal-only, weekly,
human-reviewed) and built the same day. Verified 2026-08-06 via Supabase MCP:
- (1) **Done.** OA1/OA2 completed — the monitor is running and Federal
  detection is confirmed working.
- (2) **Done.** `send-law-updates` edge function deployed (v1). Manual trigger
  of `trigger_law_update_digest()` returned 200. `RESEND_API_KEY` /
  `SUPPORT_OPERATOR_EMAIL` still need to be set (OA3) for emails to actually
  send — until then, reviewed rows are left unrecorded, not dropped.
- (3) **Done.** `law_update_digest_service_key` Vault secret created.
  `law_update_digest_status()` shows `secret_configured: true`,
  `job_scheduled: true`, `unreviewed_count: 18`.
- Reviewing a row is direct SQL for now (`update law_updates set
  review_status = 'reviewed' where id = '<uuid>'`) — there is no admin UI, on
  purpose, for a low-volume internal pilot. See
  [LAW_CHANGE_NOTIFICATIONS.md § 7](LAW_CHANGE_NOTIFICATIONS.md).

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

**D2 — Support analytics: the privacy model comes first.** Decided
2026-08-06 (full support funnel, workspace-scoped, 90-day raw / forever
aggregate, first-party Supabase sink + GA4 plumbing) and built the same day —
migration `0047`, `support-analytics-event` edge function, client module
wired into all six event points, privacy/cookie/retention docs concretized.
See [SUPPORT_ANALYTICS.md](SUPPORT_ANALYTICS.md). What's left: (1) deploy the
edge function; (2) the GA4 consent banner (needs a design handoff — the
loader and consent gate are built, but the banner UI that sets consent is
not). (PR #153)

**D4 — Training-crawler policy.** Decided 2026-08-06: opted in.
`GPTBot` (OpenAI), `ClaudeBot` (Anthropic), `CCBot` (Common Crawl),
`Amazonbot` (Amazon), and `Google-Extended` (Google Gemini/Vertex) are now
allowed with the same private-path exclusions as search crawlers.
`scripts/prerender.mjs` updated; `docs/SEO_GEO_IMPLEMENTATION.md` § Crawler
& AI policy updated. Reversible — move a bot back to `Disallow: /` to opt
out of a specific provider's training. (PR #154)

**D5 — Which business plan is the plan of record.** Decided 2026-08-06: the
Beta Launch Brief (2026-07-20) is the plan of record. CANONICAL_FACTS §
Positioning and § Open items 3 updated. _Owner action remaining (OA15):_
mark the other business plan superseded in Drive, and correct the privacy
claim in the Beta Launch Brief itself (it predates the architecture change
that made "sensitive employee data is never stored on Dutiva servers" false
— see CANONICAL_FACTS § Claims to stop making 1). (PR #155)

**D6 — Is a non-figure linkable asset worth building.** Decided 2026-08-06:
yes — a jurisdiction-scoping questionnaire. Three questions determine
whether Ontario (ESA), Quebec (LNT), or federal (Canada Labour Code)
employment standards likely apply. No statutory figures (notice periods,
thresholds, deadlines) — names the statute and links to the official text.
Live at `/tools/jurisdiction-check` (EN) and `/fr/outils/verification-juridiction`
(FR), prerendered and in the sitemap. The termination-notice calculator
remains ruled out (publishing notice periods violates the editorial rule in
`articleModel.ts`). (PR #156)

**D7 — `/guides` vs `/blog` positioning.** Decided 2026-08-06: no publishing
cadence is planned; the current positioning holds. `/guides` = documents an
employer produces (contracts, probation, accommodation, termination).
`/blog` = obligations that apply before drafting (employment regime, required
policies, records, leaves). Neither is dated, neither is "news" — a stale
timestamp on a compliance page is worse than none. If a cadence is ever
planned, the blog should become dated and the strings should change; the
`articleModel.ts` comment already says to change the rule deliberately rather
than letting one article quietly become the exception. (PR #157)

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

**EF3 — Done.** Three follow-ups from the export protection system, all
closed 2026-08-06:

1. **Admin viewer.** Live at `/app/support/admin/exports` — reads
   `export_events` through the `export-audit-trail` edge function
   (service-role, `is_admin`-gated server-side). The table stays
   service-role-only with zero client policies — the edge function is the
   only read path. Supports filtering by surface/kind, pagination, and
   forensic lookup of a single export id (the "resolve a leaked artifact"
   use case). Linked from the support admin dashboard.
2. **Copy button watermarking.** The Advisor chat Copy button now runs
   through `authorizeExport` (`surface='advisor'`, `kind='text'`), so every
   copied message carries an invisible zero-width tag that resolves to an
   `export_events` row. A velocity denial shows the same retry toast as a
   refused document export. On-screen text remains unwatermarked (the analog
   hole); the Copy button is the boundary where content leaves the product.
3. **Signed URLs.** Not applicable — exports are generated client-side as
   Blob downloads, not stored in Supabase Storage. The conditional ("if
   Supabase Storage ever holds real files") is not met.

The audit table's security posture was decided: admin-gated edge function,
not an admin RLS policy. The table never becomes client-readable, even if
`is_admin()` is compromised — the edge function is the only read path.
[EXPORT_PROTECTION.md](EXPORT_PROTECTION.md). (PR #158)

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

**EF7 — Done.** The five unmatched legacy templates have been authored into
the doclib catalogue as T47–T50 (the legacy "Onboarding Package (Français)"
was a separate entry only because the prototype shipped the French body for
both languages; the doclib's bilingual `Bi` model handles both in one
template, so T49 covers it). The five are:

- **T47** — Candidate rejection letter (hiring, low risk)
- **T48** — Expense reimbursement policy (policies, low risk)
- **T49** — Onboarding package (hiring, low risk, QC Charter note)
- **T50** — Policy template (policies, low risk, Advisor-tailored shell)

The legacy fixture (`src/data/documents.ts`) still holds the 10 templates that
have doclib matches by tid — they remain as string-key fallbacks for callers
that pass title strings (e.g. `PoliciesView` passes `p.title.en`). The search
corpus now uses the doclib catalogue directly (`allTemplates`), passing tids.
The canonical template count is now **50** (T01…T50). Per
[FOUR_RING_FRAMEWORK.md](FOUR_RING_FRAMEWORK.md), these are legal-adjacent
documents in a compliance product and need review budget — the `review` field
on each is set to `hr_review_required` or `not_reviewed` as appropriate, and
none are marked `approved_for_use`. (PR #159)

**EF8 — Done (engineering half).** Plan gating is now wired into `/app`:
`PlanProvider` is in `AppProviders` (reads the signed-in account's plan from
`profiles`), `PlanGate` enforces plan requirements in production mode, and two
premium features are gated:

1. **Save & export documents** (growth+) — the PDF/Word/Copy-link buttons in
   Document Studio are wrapped in `<PlanGate required="growth">`.
2. **Workspace preview & guidance** (growth+) — `HomeProductionView` is
   wrapped in `<PlanGate required="growth">`.

`PlanGate` respects workspace mode: demo mode bypasses the gate entirely
(the demo experience is the marketing surface — every visitor sees the full
product). Production mode enforces the plan check, with an upgrade nudge
linking to `/pricing?upgrade={required}` when access is denied. Internal
`@dutiva.ca` accounts always bypass via `isAdmin`.

`PAID_PLANS_DISABLED_DURING_BETA` remains `true` — the gates exist and are
wired, but every signed-in beta user resolves to `free` (the webhook never
grants a paid plan), so gates show the upgrade nudge in production mode
without blocking anything in demo mode. The owner action to start selling
is: flip the flag to `false`, apply migration 0043, and create the annual
Stripe price objects (EF8a below). (PR #161)

**EF9 — Ring 2 Pillar B's two design-blocked tools are built; the pattern is
not.** The duty-to-accommodate workflow and the functional-limitations guide
needed a decision-tree runner and a reference-content surface, and both surfaces
now exist (`flows/data/`, `reference/data/`). Nothing is outstanding — this
entry exists so the next tool goes into one of the three established shapes
rather than inventing a fourth.
[FOUR_RING_FRAMEWORK.md](FOUR_RING_FRAMEWORK.md). (PRs #121, #123, #125)

**EF10 — Done.** The raised "Ask" tab on the mobile nav now uses a `Sparkle`
icon, aligning it with the 18+ other Advisor/AI surfaces that use Sparkle
(brief card, advisor home, advisor rail, chat avatar, memory views, doc
studio, topbar, entry stage, etc.). The in-repo advisor chat handoff uses
`sparkFill` for all Advisor touchpoints and `star` only for pinned threads;
the external mobile nav handoff that supposedly specified a star is no
longer accessible, so the inconsistency could not be verified as
intentional. `Star` remains in use for pinned threads (matching the handoff)
and workflow impact indicators. (PR #160)

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
