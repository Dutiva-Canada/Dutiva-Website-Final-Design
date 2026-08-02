# Canonical facts — Dutiva Canada

**Version 2026-07** · compiled 30 July 2026 · source of record

A July 2026 audit of the company Google Drive found seven load-bearing facts about
Dutiva each recorded several different ways across the business plans, the media kit
and the launch brief, with no document marked as authoritative. This file is the
resolution, and it lives in the repo deliberately: the facts below are _derived from
this codebase_, so keeping them next to the code is what stops them drifting again.

**The rule.** Where any Dutiva document disagrees with this file, this file wins.
Where this file disagrees with the code, **the code wins** and this file gets
corrected. When you change one of the values below, update this file in the same PR.

**Most of the rule is enforced.** `npm run check` derives these rows from the
code and fails when the two disagree, so they cannot quietly decay the way the
Drive documents they replaced did:

- **Templates shipped**, **Jurisdictions**, **Pricing**, **Annual billing**,
  **Beta state**, **Law-change monitoring** (both the audit date and the
  "not confirmed working" claim itself) — `src/canonicalFacts.test.ts`.
- **Brand gold**, **Brand navy** — `scripts/check-canonical-facts.mjs`
  (`npm run check:facts`), separate because their values live in CSS that
  Vitest cannot read.
- **Contact address** — partly. The retired addresses in §6 are enforced; that
  `support@` is the published one is not.

**Rings live** and **Languages** are maintained by hand — no check would catch
them drifting. Treat them the way you treat the "Company and legal" table
below: true because someone confirmed it, not because CI did. Adding a
code-backed fact here means adding its check to one of the two files above,
and adding it to this list.

A mirror of this document lives in Drive as `Dutiva_Canonical_Facts_2026-07` for
people who don't read the repo. Re-export it when this file changes.

## Verified against the product

| Fact                  | Value                                                                       | Source of truth                                                         |
| --------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Templates shipped     | **46** — T01…T46                                                            | `src/features/app/documents/catalogue.ts`                               |
| Jurisdictions         | **3** — ON (ESA 2000), QC (LNT), FED (Canada Labour Code Part III)          | jurisdiction codes `ON`, `QC`, `FED`                                    |
| Pricing               | Free · Starter **$24** · Growth **$49** · Pro **$99** CAD/mo                | `src/config/plans.ts` → `PLANS`                                         |
| Annual billing        | 10 of 12 months charged (two months free)                                   | `ANNUAL_MONTHS_BILLED`                                                  |
| Beta state            | Paid plans **shown but not sold**                                           | `PAID_PLANS_DISABLED_DURING_BETA`                                       |
| Rings live            | **All four rings complete.**                                                | `docs/FOUR_RING_FRAMEWORK.md`                                           |
| Law-change monitoring | **Not confirmed working for any supported jurisdiction** (audit 2026-07-30) | `src/features/app/guidance/monitoringCoverage.ts`                       |
| Contact address       | **support@dutiva.ca**                                                       | the published support address; retired ones stay retired (§6, enforced) |
| Languages             | EN + FR, both surfaces, prerendered per locale                              | `src/i18n/` — EN unprefixed, FR under `/fr`                             |
| Brand gold            | `#b98512 → #d4af37 → #f4c54b → #ffe37a`; on dark `#e9c877`                  | `tokens.css` `--gold-gradient`, `--gold-on-dark`                        |
| Brand navy            | `#0d1b2a` ground, `#081019` deep                                            | `tokens.css` `--dutiva-navy`; `surfaces.css` `.surface-marketing --bg`  |

## Company and legal

Confirmed by the founder, July 2026. Rows marked **unverified** come from Business
Plan v1.6 only and have not been checked against a filing.

| Fact              | Value                                                  | Confidence                                  |
| ----------------- | ------------------------------------------------------ | ------------------------------------------- |
| Legal name        | Dutiva Canada Inc.                                     | consistent everywhere                       |
| Registered office | 2967 Dundas St. W., Suite 1485, Toronto, ON M6P 1Z2    | confirmed — use in legal/corporate contexts |
| Operating city    | Ottawa, Ontario                                        | confirmed — use in marketing/press contexts |
| Founder           | Martin Constantineau, Founder & CEO — always full name | confirmed                                   |
| Incorporation     | Federal (CBCA), 27 March 2026                          | **unverified**                              |
| Trademark         | CIPO application, classes 009/035/041/042/044          | **unverified**                              |
| Business phone    | 1 (800) 349-0297                                       | **unverified** — absent from the site       |

## Launch status

May 2026 and September 2026 have both been published as launch dates and both have
passed. **Do not publish a new calendar date.** Tie the language to product state:
Dutiva is _in beta, and launches when paid plans open_. That stays true until
`PAID_PLANS_DISABLED_DURING_BETA` is flipped, at which point it becomes true in the
other direction by itself.

## Claims to stop making

Each of these appears in at least one Drive document and is contradicted by the
product as built. Most consequential first.

### 1. "Sensitive employee data is never stored on Dutiva servers"

**This is a privacy representation and it is wrong.** Both business plans and the
April media kit state that sensitive data is processed browser-side and never reaches
Dutiva servers. The schema stores it: `employees`, `hr_cases`, `hr_case_notes`,
`hr_employee_notes`, `hr_policies`, `doclib`, `profiles`.

The claim was likely true of an earlier browser-only build. The architecture moved;
the documents didn't. Remove the claim and describe what is actually true — Postgres
with row-level security, 180-day telemetry retention (`0031_ai_telemetry_retention`),
first-party privacy-scrubbed error reporting (`docs/ERROR_REPORTING.md`).

### 2. "PIPEDA-compliant by design"

Don't assert compliance as settled. Data residency for AI inference was still being
confirmed with the provider as of 2026-07-26 — see
`docs/do-residency-confirmation-request.md`, which notes the serverless endpoint has
no region selector and that failover outside Canada is unconfirmed. Describe the work,
not the outcome, until that resolves.

### 3. Counts

**46** templates — not 47, and no longer 16 either: the count has moved, so state
it from `catalogue.ts` rather than from memory or from any Drive document. **3**
jurisdictions — not 4 or 14. Federally regulated remote work is a supported
_scenario_ under `FED`, not a fourth jurisdiction. Alberta and BC stay labelled
roadmap.

### 4. Rings 2–4 as shipped

Ring 1 exists, and as of August 2026 covers every tool the April framework
listed for it (T25–T32 closed the last eight gaps). **Ring 2 is complete** —
all four pillars:

- **Pillar A, Mental Health & EAP readiness** — the mental health response
  checklist at `/app/workflows/mental-health-response`, and three guides at
  `/app/knowledge/`: `eap-referral`, `manager-conversations`, and
  `return-after-mental-health-leave`.
- **Pillar B, Accommodation** — the accommodation documents (T21–T24, plus the
  ported T19/T20) in Document Studio's Accommodation category, the
  duty-to-accommodate flow at `/app/workflows/duty-to-accommodate`, and the
  functional limitations guide at `/app/knowledge/functional-limitations`.
- **Pillar D, Leave Management** — the leave request form (T33) and sick leave
  policy (T34), the leave of absence checklist at
  `/app/workflows/leave-of-absence`, and the parental leave guide at
  `/app/knowledge/parental-leave`.

- **Pillar C, Psychological Safety** — the self-check at
  `/app/workflows/psychological-safety-check`, the respectful workplace policy
  (T13, widened to cover inclusion), the bystander intervention guide at
  `/app/knowledge/bystander-intervention`, and the wellness action plan (T44).

None of Pillar A is clinical, and it must not be described as though it were.
The flow triages what an employer should do next; it does not screen, assess
or diagnose anyone, and it says so.

That self-check is **not** an audit against CSA Z1003-13 and not a measure of
conformance with it. It is an original self-assessment organised around the
thirteen psychosocial factors the Standard names. Never describe it as
CSA-certified, CSA-compliant, or an assessment against the Standard.

The parental leave guide states no durations, notice periods or benefit
amounts, by design (§6). The same applies to the two Ring 4 guides: the pay
statement guide states no rates, maximums or thresholds, and the RRSP/TFSA
guide states no contribution limits, penalty rates or ages. Do not add figures
to any of the three.

The wellness action plan (T44) **requests no diagnosis and is not an
accommodation** — that is the claim to make, and it is narrower than it looks.
The template asks nothing about a condition and issues blank for the employee
to complete, but nothing stops someone volunteering health information in free
text, so a completed plan must not be described as guaranteed non-medical.
Treat every returned plan as sensitive personal information. It is filed under
`wellbeing` rather than `accommodation` because completing one implies neither
a disability nor a request.

**Ring 3, Internal Communications, is complete** — nine templates (T35–T43) in
Document Studio's Internal communications category, covering layoff and
restructuring, policy rollout, and crisis communications.

**Ring 4, Compensation & Financial Literacy, is complete** — the total
compensation summary (T45) and salary review letter (T46) in Document Studio's
Compensation category, the pay statement guide at `/app/knowledge/pay-statement`,
and the RRSP/TFSA guide at `/app/knowledge/retirement-savings`.

The RRSP/TFSA guide is **educational, not financial advice**, and that is the
claim to make about it. It explains how the two accounts are taxed and what a
group plan commits an employer to; it does not recommend an account, an amount
or an investment, and it says in its own copy that the employer is not the
reader's adviser. Never describe it, or the product, as offering financial
advice or financial planning.

The Compensation, Communications and Wellbeing modules in the app remain
prototype surfaces on demo fixtures, gated off in a production workspace.
**They are still not Rings 3 and 4**, even now that both exist: the
`/app/communications` and `/app/compensation` modules are ported prototypes,
and the rings are the templates and guides. Do not describe those modules as
shipped capability. `docs/FOUR_RING_FRAMEWORK.md` holds the tool-by-tool state.

### 5. "Dutiva monitors the law and tells you when it changes"

**By severity this belongs second, right after the privacy claim** — it is kept
here only so the §2 cross-reference in Open items stays valid.

The monitoring exists and now runs on a schedule, but a 2026-07-30 audit found
that **no supported jurisdiction has confirmed working change detection**.
Ontario's source serves a JavaScript shell whose statute text never reaches a
server-side fetch; Québec's refuses automated requests; Federal is unconfirmed.
The monitor sweeps 19 pages, but sweeping a page is not detecting an amendment
on it — and until 2026-07-30 the health data could not tell the difference,
because a blocked page answering HTTP 200 recorded as healthy.

Say what is true: Dutiva tracks official sources and surfaces changes **where
detection is confirmed**, and the product names which jurisdictions those are.
Do not say Dutiva will notify anyone of a change — nothing notifies; entries
land in a panel and wait to be read. Coverage is stated in
`monitoringCoverage.ts` and the audit is in `docs/LAW_MONITORING.md`; update
both in the same change when a source strategy lands.

### 6. Contact and brand

Publish **support@dutiva.ca** only; retire `info@`, `hello@`, `DutivaCanada@`. The
accent is **gold `#d4af37`**, not amber `#E8A020` — the Drive logo kit is already
correct, only its written description drifted.

## Positioning that holds up

From the Beta Launch Brief (2026-07-20), the most current document in Drive:

- **Differentiator:** Dutiva names the statute, not just the province.
- **Credibility:** built by a Canadian HR and payroll operator who has processed
  payroll, prepared ROEs and drafted termination letters across federal and
  provincial standards.
- **The boundary, never softened:** compliance-oriented workflow support, not legal
  advice.
- **Vocabulary:** "compliance-oriented", "jurisdiction-specific", "review-ready".
- **Never:** "legally compliant", "guaranteed compliant", "legal advice"; fabricated
  metrics; customer names without written permission; implied provincial coverage
  that doesn't exist.

CASL governs any outbound campaign — opt-in, burden of proving consent on the sender,
penalties to $10M. Follow the Beta Launch Brief on this.

## Open items

1. Confirm incorporation date, trademark status and business phone against filings.
2. Resolve the DigitalOcean residency ticket; update "Claims to stop making" §2.
3. Decide the plan of record — two business plans are live, neither marked superseded.
4. Return T01/T02/T04 to the Drive `ON/EN` template folder, or flag them as out for
   legal review.
5. Deduplicate the Drive HR template tree — every template exists twice from two
   uploads on 2026-06-16.
