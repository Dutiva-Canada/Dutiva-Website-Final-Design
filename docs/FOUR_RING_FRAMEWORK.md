# The four rings — scope, and what is actually built

**In-repo record of the Four-Ring Platform Framework.** Reconciled against
`CANONICAL_FACTS.md` and the code, August 2026.

Dutiva's product scope is organised as four rings. Until now the only
description of them lived in a Drive document,
`Dutiva_FourRing_Platform_Framework_v1.0.docx` (April 2026), and the only
mention in this repo was one line of `CANONICAL_FACTS.md` saying Rings 2–4
were roadmap. That is how a scope document drifts: the plan and the product
had no shared surface, so nobody could tell which tools existed.

This file is that surface. It carries the framework's structure forward and
records, tool by tool, what is built.

**Precedence.** `CANONICAL_FACTS.md` outranks this file, and the code outranks
both. Where this file and the April Drive document disagree, this one wins —
the corrections are listed at the end, and they are not small.

## The rings

| Ring | Pillar                            | The question it answers                     |
| ---- | --------------------------------- | ------------------------------------------- |
| 1    | HR Compliance Core                | What do I legally have to do?               |
| 2    | Workplace Wellness                | How do I support my employees properly?     |
| 3    | Internal Communications           | How do I communicate this to my team?       |
| 4    | Compensation & Financial Literacy | Am I paying fairly, and explaining it well? |

The rings are a sequencing and packaging device: each one is meant to make the
previous rings more useful. They are not tiers of a price list, and no plan in
`src/config/plans.ts` is scoped by ring today.

## What is built

**Ring 1 — the document catalogue, 24 templates** (`catalogue.ts`, T01…T24).
Plus the Advisor, the compliance register, cases, employees, policies and
tasks. This is the product.

**Ring 2 — Pillar B only, and not all of it.** The accommodation documents
below. Pillars A, C and D do not exist.

**Rings 3 and 4 — nothing.**

The `/app/communications`, `/app/compensation` and `/app/wellbeing` modules
are **not** Rings 3, 4 and 2. They are prototype surfaces ported from the App
v2 design handoff, running on demo fixtures, wrapped in `gated(…)` at
`src/app/appViews.tsx` so a production workspace renders an empty state.
Nothing in them is a ring tool, none is wired to persistence, and describing
them as shipped capability is the specific claim `CANONICAL_FACTS.md` §4
forbids.

## Ring 2, Pillar B — Accommodation

The highest legal exposure area, and the pillar the framework marks Critical.
It is also where Ring 1 had a hole: the framework listed an **Accommodation
Response** among Ring 1's tools and called it the document this whole process
produces, and it was not in the catalogue. It is now.

| Tool                            | tid | State                           |
| ------------------------------- | --- | ------------------------------- |
| Accommodation request form      | T21 | **Built**                       |
| Accommodation response (Ring 1) | T22 | **Built**                       |
| Accommodation plan              | T23 | **Built**                       |
| Undue hardship assessment       | T24 | **Built**                       |
| Duty to accommodate workflow    | —   | Not built — needs a new surface |
| Functional limitations guide    | —   | Not built — needs a new surface |

Two ported legacy documents sit in the same category and complete the
workflow: **Accommodation documentation** (T19) and **Medical information
request letter** (T20), both in `customTemplates.ts`. They were filed under
`discipline`, which misstates what they are; they are now under
`accommodation` with the rest.

Read in process order the category is: request form (T21) → medical
information request (T20) → response (T22) → plan (T23) → record (T19), with
the undue hardship assessment (T24) as the internal worksheet behind a
refusal.

### What the two remaining tools need

Neither fits the Document Studio engine, which renders a linear question set
into merge-field blocks (`data/types.ts`, `engine.ts`):

- **Duty to accommodate workflow** is a decision tree — receive disclosure →
  assess → explore options → implement → document. `ClauseGate` gates blocks
  on jurisdiction, headcount and union, not on answers, so branching on what
  the user just said is not expressible. This needs a flow runner.
- **Functional limitations guide** is a reference document. There is no
  surface for reference content: the Knowledge view holds titles and tags
  with no bodies (`src/data/knowledge.ts`), and Document Studio generates
  documents rather than publishing them.

Both are product-design questions with no handoff. Per AGENTS.md, feature
work here is driven by high-fidelity handoffs — so these two are blocked on
design, not on engineering capacity.

## The rest of Rings 2–4

Nothing below is built. Counts are the framework's own.

**Ring 2, remaining pillars — 12 tools.** Pillar A, Mental Health & EAP
readiness (4): support checklist, EAP referral guide, return-to-work after
mental health leave, manager conversation guide. Pillar C, Psychological
Safety (4): CSA Z1003-13 self-assessment, respectful workplace policy,
bystander intervention guide, wellness action plan. Pillar D, Leave
Management (4): leave of absence checklist, leave request form, parental leave
guide, sick day policy.

**Ring 3, Internal Communications — 9 tools.** Layoff & restructuring (3):
announcement script, team restructuring announcement, employee FAQ. Policy
rollout (3): introduction memo, acknowledgement form, update notification.
Crisis communications (3): investigation notice, sudden departure
announcement, incident communication.

**Ring 4, Compensation & Financial Literacy — 4 tools.** Total compensation
summary, salary review letter, pay stub guide, RRSP & TFSA guide.

### Grouped by what they cost to build

The ring split describes the product; this split describes the work.

27 tools remain across the four rings — the 25 listed above plus Pillar B's
two.

| Shape                                             | Count | Where it goes                                    |
| ------------------------------------------------- | ----- | ------------------------------------------------ |
| Generated templates                               | 15    | `data/templates/`, the shape T21–T24 established |
| Reference guides / guidance notes                 | 8     | Nowhere yet — needs a reference-content surface  |
| Interactive checklists, flows, scored assessments | 4     | Nowhere yet — needs new machinery                |

So a little over half of what remains is content authoring against a pattern
that now exists. The rest is blocked on two surfaces that do not: one for
reference content, one for interactive assessment. Building those two unblocks
12 tools across three rings, which makes them the highest-leverage thing to
design next.

## Standing constraints on any ring tool

1. **Three jurisdictions: ON, QC, FED.** Not 14. A tool the framework scopes
   to "all 14" ships for three, and its copy must not imply otherwise
   (`CANONICAL_FACTS.md` §3). The framework's sick-day policy tool names BC —
   BC is out of scope.
2. **EN + FR, both complete.** French with no handoff source is marked
   `[FR self-authored]` at the definition site.
3. **The standing disclaimer** ships with generated documents, via the
   template's `note` block or the shared `Disclaimer` component — never
   retyped.
4. **Compliance-oriented, never compliant.** No "legally compliant",
   "guaranteed compliant", or "legal advice".
5. **Figures.** Public editorial content states no statutory figures
   (AGENTS.md). In-product tools are not covered by that rule, but Ring 4's
   pay-stub and RRSP/TFSA guides and Ring 2's parental-leave guide are
   inherently figure-heavy and would need annual maintenance. **Decide the
   policy before authoring them**, not after.

## Corrections to the April 2026 Drive document

The framework predates the July canonical-facts audit and contradicts it in
four places. Treat the Drive document as superseded on all four.

| The Drive document says                         | Actually                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| All 14 jurisdictions, every ring                | Three — ON, QC, FED                                                                                                                    |
| $39/month flat                                  | Free · Starter $24 · Growth $49 · Pro $99, and paid plans are not sold during beta                                                     |
| 47 tools at launch                              | 24 templates ship; the 47 counted a launch state that did not happen                                                                   |
| Month-numbered build schedule off a launch date | Both published launch dates have passed. Tie sequencing to product state, never a calendar date (`CANONICAL_FACTS.md` § Launch status) |

Its Ring 1 inventory also does not match what shipped: of the 18 tools it
lists, 9 have no template (probationary period review, promotion & salary
adjustment, return from leave confirmation, attendance policy, ROE preparation
guide, reference letter, investigation report, layoff notice as distinct from
the group termination notice — and the accommodation response, now T22). Seven
shipped templates are absent from its list (employment agreement, employee
handbook, restrictive covenants, Québec offer letter, vacation & leave policy,
code of conduct, group termination notice). **"Ring 1 is complete at launch"
is not true against the framework's own list**, and the eight remaining gaps
are the cheapest ring work available — they are all plain templates.

## Adding a ring tool

1. Check this file and `CANONICAL_FACTS.md` first.
2. If it is a generated document, author it under `data/templates/` following
   T21–T24. Numbering continues from the highest tid in `catalogue.ts` —
   **check both sources**, because `data/templates/` and `customTemplates.ts`
   share one tid space and doclib silently wins the lookup in
   `DocStudioProvider`. `src/canonicalFacts.test.ts` fails on a duplicate.
3. Update the template count row in `CANONICAL_FACTS.md` in the same PR; the
   test derives it from `catalogue.ts` and fails on drift.
4. Update the state tables here.
