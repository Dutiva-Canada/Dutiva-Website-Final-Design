# Scoring logic — where every number in the product comes from

This is the reference for how Dutiva's scores and derived numbers are
computed: the compliance score in both of its modes, the flow-assessment
scoring, the Advisor's risk and confidence figures, and the aggregation
rules behind the Analytics cards. It exists so the reasoning is written
down in one place rather than reconstructed from the code each time.

Standing rule, same as everywhere in this repo: **where this document
disagrees with the code, the code wins** and this file gets corrected in
the same PR. Load-bearing public facts stay governed by
[CANONICAL_FACTS.md](CANONICAL_FACTS.md); this document explains
mechanisms, not marketing claims. Verified against the code on
2026-08-07.

## 1. The two data worlds

Every number below has to be read against which world it lives in:

- **Demo workspace** (the diorama every visitor and trial user sees):
  numbers are hand-authored fixtures in `src/data/`, transcribed from the
  design prototype. They are internally consistent storytelling — not
  computed, and not pretending to be.
- **Production workspace** (a signed-in organization on Supabase):
  numbers are computed live from the org's real rows through each module's
  `productionApi` boundary, with row-level security scoping everything to
  the organization.

The same views render both worlds; `workspaceMode` decides which. A
number that is a constant in the demo can therefore be genuine arithmetic
in production — the compliance score is exactly that case.

## 2. The compliance score

### 2.1 Demo mode — authored fixtures

The demo's headline `82/100` is a constant:
`complianceScore` in `src/data/compliance.ts`. Around it:

- The five **category scores** (Termination & notice 61 · Leave &
  accommodation 84 · Policies & documentation 72 · Language &
  jurisdiction 96 · Data & privacy 90) are fixtures with authored tones
  and open-item counts. They do not average to 82 and are not meant to —
  they exist so the diorama shows a healthy company with one visibly weak
  area.
- The six-month **score trend** in `src/data/analytics.ts` is
  74 → 76 → 79 → 78 → 81 → `complianceScore`, ending on the same 82 so
  the Compliance view and Analytics can never disagree.
- The **per-jurisdiction scores** are authored so their
  headcount-weighted blend returns approximately the overall score, with
  Quebec deliberately sitting well below it — the weak jurisdiction a
  strong overall number would otherwise hide.
- The demo's "today" is fixed (`demoTodayISO`, derived from the July 2026
  calendar fixture) so every date-relative number in the diorama is
  stable and testable.

### 2.2 Production mode — the real computation

Production Analytics computes the score in
`src/features/app/views/analytics/AnalyticsProductionView.tsx` from pure
functions in `aggregation.ts` (unit-tested in `aggregation.test.ts`):

1. Three **components**, each a done/total pair:
   - **Policies** — policies with status `up_to_date`, over all policies
     (`needs_review` and `missing` count against).
   - **Tasks** — tasks marked done, over all tasks.
   - **Findings** — compliance findings resolved, over all findings.
2. `scoreComponent` turns each pair into a rounded 0–100 percentage —
   `null` when the component has no rows yet, so absence of data is
   never scored.
3. `blendScore` takes the **unweighted mean of the components that have
   data**, rounded. No component has rows → no score; the card shows an
   empty state instead of a number.

Worked example: 3/4 policies current (75), 8/10 tasks done (80), 1/2
findings resolved (50) → (75 + 80 + 50) / 3 = **68**.

The breakdown meters under the hero figure flag the **lowest** component
(only once two or more components have data) — the same "a strong
average hides a weak factor" honesty rule the flow assessments and the
demo's jurisdiction breakdown apply.

### 2.3 History — write-on-read snapshots

The score is a function of *current* rows, so last quarter's score is
gone unless it was written down at the time. That is the entire reason
`public.compliance_score_snapshots` exists (migrations 0062/0063): one
row per organization per month carrying the blended score, the
per-component done/total breakdown (jsonb, for future drill-down), and
the active headcount at that point.

- Whenever production Analytics computes a live score, it **upserts the
  current month's row** (once per page view, fire-and-forget — a failed
  write never degrades the dashboard). Past months freeze.
- The trend chart shows the last **6 months**: frozen snapshots plus the
  live current month.
- The **delta chip** ("+8 vs February") is current score minus the
  oldest point in that window — it needs at least two points.
- The month column is constrained to month-start dates and the score to
  0–100 in the schema itself; RLS gives org members read and org
  owners/admins write.

The same snapshots carry headcount history, which is what the turnover
denominator (§4) reads.

### 2.4 Known properties — deliberate v1 simplifications

These are design facts to keep in mind, not bugs; they are also the
levers §8 proposes to evolve.

- **Equal weighting.** A workspace with 1 finding and 40 policies weighs
  that single finding as a full third of the score.
- **Severity-blind.** A critical finding counts the same as an info
  finding — resolution ratio is all that is measured.
- **The tasks component counts all tasks**, not only compliance-related
  ones, which dilutes what "compliance score" means as general task
  usage grows.
- **Snapshots depend on visits.** History is only written when someone
  opens Analytics that month; a month nobody visits leaves a gap.
- **No judgment bands.** Production renders the score neutrally — there
  is no "good above X" threshold coloring. The demo's tones are authored
  fixtures.
- The demo's **obligation register and category scores have no
  production counterpart yet**; production Compliance is a findings
  register (`ComplianceProductionView.tsx` states this in code).

## 3. Flow assessments

Guided flows can end in a scored result (e.g. the psychological-safety
assessment). Scoring is `scoreRun` in
`src/features/app/flows/flowEngine.ts`:

- Each rated question's chosen option carries a point value; the
  question's available maximum is its highest-valued option.
- The percent is total over **the maximum available on the path actually
  answered** — a flow that branches past some rated questions must not
  report a percentage the reader could never have reached, which would
  read as a failing grade for taking a different route.
- Zero is a real score (a completed run scoring nothing reports 0%, not
  an absence).
- Results land in **bands** authored per flow (psychological safety:
  ≥70% "largely established", ≥40% "real in places, informal in others",
  else "early — start with the legal obligations"), each with its own
  guidance and recommended templates.
- A **per-domain breakdown** aggregates questions sharing a domain and is
  rendered weakest-first — the single number says how you are doing, the
  breakdown says what to do.

## 4. Analytics aggregation rules

All of these live in
`src/features/app/views/analytics/aggregation.ts`, which is deliberately
pure: no `Date.now()` anywhere — callers inject "today" (the demo passes
the fixed diorama date, production passes the real one), so the demo is
stable and every path is unit-testable.

- **Needs attention** (`rankAttention`): open tasks and unresolved cases
  with due dates, plus expiry escalations (expired certifications;
  documents expired or due within 30 days — an expiring work permit is a
  compliance event). Sorted ascending by due date, which puts most
  overdue first, then soonest-due; ties break on id. Status: overdue
  (past due), due soon (≤14 days), upcoming. The card shows the top 5.
- **Expiry buckets** (`expiryBuckets`): expired · ≤30 · 31–60 · 61–90
  days, soonest first; records more than 90 days out are excluded — the
  cards look one quarter ahead.
- **Case aging** (`caseAging`): open cases with days-open (clamped at 0),
  oldest first; average rounded. The "oldest" tile alerts when the
  oldest case exceeds 14 days.
- **Turnover** (`turnoverRatePct`): rolling 12 months — terminations
  dated inside the window over the **average snapshot headcount** in
  that window, as a percentage to one decimal. Returns `null` when the
  denominator is missing or zero: *no rate is better than a fictional
  one*. The delta compares against the window ending at the previous
  month-end.
- **Acknowledgment progress** (`ackProgress`): signed/total with
  clamping, rounded percent, 0 when the denominator is 0. In production
  the acknowledgments card is an honest empty state — no tracking data
  source exists yet, and the card says so instead of hiding.
- **Axis windowing** (`windowAxis`): trend axes window to the data
  instead of zero — pad the range, snap to clean ticks (5s for narrow
  ranges, 10s for wide), clamp to the scale (data 74–82 → axis 70–85).
  A score axis clamps at 100.

Each production card fetches only the modules it needs and carries its
own skeleton/empty/error states, so a failing module degrades one card,
never the page.

## 5. Advisor risk, routing and confidence

The structured panel around every Advisor reply — risk, jurisdiction,
legal basis, confidence — is built by
`supabase/functions/advisor-chat/responsePayload.ts`, and it is
**entirely deterministic**. The model writes prose; rules decide
consequences ([AI_USAGE_STRATEGY.md](AI_USAGE_STRATEGY.md) §4/§6). No
statutory claim, risk level, or confidence figure originates in the
model.

- **Crisis intercept** (fail-safe-on): first-person crisis phrases are
  matched against a maintained list mirrored on client and server —
  both run, the union wins. A crisis turn switches to supportive mode,
  shuts every gate (workspace, retrieval, legal basis, documents), and
  reports safety risk `critical`.
- **Compliance risk** is keyword-classified from the user's message:
  high-exposure topics (termination, discipline, accommodation, and all
  escalation terms) → `high`; everyday entitlements (overtime, vacation,
  leave, pay…) → `medium`; otherwise `low`. English and French terms
  both match.
- **Escalation** (third-party safety/rights: harassment, violence,
  discrimination, reprisal…) forces escalation mode — never supportive —
  and sets safety risk to `watch`. Escalation or high compliance risk
  recommends employment counsel; a crisis suggests the EAP instead.
- **Jurisdiction** is detected from explicit mentions (ON/QC/Federal
  patterns; bare two-letter codes are deliberately excluded — "on" is a
  common word, and a false jurisdiction read is worse than an unknown
  one). It defaults to `unknown` and is never assumed.
- **The legal-basis gate is fail-safe-closed**: citations render only
  when jurisdiction is confirmed AND curated corpus chunks actually
  grounded the turn. A citation is marked *valid* only once its chunk is
  human-reviewed; machine-curated rows honestly read as "needs review".
- **Confidence is a formula, not a feeling**:
  `min(88, 20 + 30·(jurisdiction confirmed) + 10·min(chunks, 4))` —
  labeled High at ≥70, Moderate at ≥45, else Low. It tracks what
  grounded the answer (jurisdiction certainty, corpus coverage) and is
  capped at 88 so the product can never claim near-certainty.

## 6. Smaller scoring surfaces

- **Help-centre search** (`src/features/support/help/helpSearch.ts`):
  per-term field weights — title 3, summary 2, body 1 — summed across
  terms; a term missing everywhere disqualifies the article in `all`
  mode (the search box), while `any` mode (first-line assist over
  whole-sentence questions) requires one match and ignores terms shorter
  than 3 characters. Ties keep the authored category order.
- **Wellbeing deliberately has no score.** Inferred "team signals" with
  confidence scores are not persisted, because inferred health data
  about identifiable people is a liability, not a feature
  (`views/wellbeing/productionApi.ts`).

## 7. The through-line

Four principles show up in every system above; new numeric features
should hold to them.

1. **Deterministic and injectable.** Every screenshot-able number is
   computed by a pure function from injected inputs — no clock reads or
   randomness inside the math, no model-originated figures. This is what
   makes the demo stable and the logic unit-testable.
2. **Honest nulls.** Missing data yields `null` and an empty state that
   says so — never a fabricated number, never a hidden card. "No rate is
   better than a fictional one."
3. **The weak component is surfaced,** not averaged away: lowest score
   component flagged, weakest flow domain first, the weak jurisdiction
   made visible.
4. **The two worlds never blur.** Demo numbers are honest fixtures;
   production numbers are honest arithmetic; a fixture never leaks into
   a signed-in workspace.

## 8. Proposed evolution of the production score — NOT BUILT

Design proposal, 2026-08-07 — recorded here for decision, none of it
implemented. Each item targets a limitation in §2.4.

1. **Severity-weighted findings.** Weight the findings component by
   severity (illustrative: info 1 · low 2 · medium 3 · high 5 ·
   critical 8), scoring resolved-weight over total-weight, so a critical
   exposure moves the score more than a note. Weights are a product
   decision to make once, then freeze and version.
2. **A severity floor.** An org with an unresolved *critical* finding
   should not read as healthy regardless of averages — cap the blended
   score (e.g. at 69, below any "healthy" reading) while one is open.
   This is the "weak factor is surfaced" principle applied with teeth.
3. **Scope or split the tasks component.** Count only compliance-linked
   tasks (a tag or source-module linkage), or drop tasks from the blend
   once a better third signal exists — general to-do completion is not
   compliance posture.
4. **Obligation register as a fourth component** when obligations land
   in production: the demo's register statuses (evidence on file · in
   progress · needs evidence · overdue) map naturally to done/total,
   with overdue items also feeding the attention queue.
5. **Scheduled snapshots.** Move history off write-on-read: a monthly
   `pg_cron` → edge-function job (the same in-database scheduling
   pattern as `monitor-law-changes`, for the same reason — a hosting
   move can't silently kill it) writes every org's snapshot on the 1st.
   Write-on-read stays as a freshness top-up.
6. **Version the formula.** The snapshot rows already store per-component
   done/total; add a formula-version marker (a column or a components
   key) when the blend changes, so a trend crossing formula versions is
   labeled rather than silently mixed.

Sequencing: (6) first — it is the safety net for every other change —
then (1)+(2) together since both are findings-semantics, then (3), with
(4) and (5) landing whenever their prerequisites (production
obligations; ops appetite for another scheduled job) arrive.

## 9. Keeping this document true

When scoring logic changes, the same PR updates this file — the
enforcement pattern is the same as CANONICAL_FACTS.md, minus the
automated check: the tests that pin the behaviors described here live in
`aggregation.test.ts`, `flowEngine.test.ts`, `FlowRunner.test.tsx`,
`responsePayload.test.ts` and `AnalyticsView.test.tsx`. If a change
passes those tests but contradicts this file, this file is what's wrong.
