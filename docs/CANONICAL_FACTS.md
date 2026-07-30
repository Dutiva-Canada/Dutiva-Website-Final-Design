# Canonical facts — Dutiva Canada

**Version 2026-07** · compiled 30 July 2026 · source of record

A July 2026 audit of the company Google Drive found seven load-bearing facts about
Dutiva each recorded several different ways across the business plans, the media kit
and the launch brief, with no document marked as authoritative. This file is the
resolution, and it lives in the repo deliberately: the facts below are *derived from
this codebase*, so keeping them next to the code is what stops them drifting again.

**The rule.** Where any Dutiva document disagrees with this file, this file wins.
Where this file disagrees with the code, **the code wins** and this file gets
corrected. When you change one of the values below, update this file in the same PR.

A mirror of this document lives in Drive as `Dutiva_Canonical_Facts_2026-07` for
people who don't read the repo. Re-export it when this file changes.

## Verified against the product

| Fact | Value | Source of truth |
| --- | --- | --- |
| Templates shipped | **16** — T01…T16 | `src/features/app/documents/data/templates/` |
| Jurisdictions | **3** — ON (ESA 2000), QC (LNT), FED (Canada Labour Code Part III) | jurisdiction codes `ON`, `QC`, `FED` |
| Pricing | Free · Starter **$24** · Growth **$49** · Pro **$99** CAD/mo | `src/config/plans.ts` → `PLANS` |
| Annual billing | 10 of 12 months charged (two months free) | `ANNUAL_MONTHS_BILLED` |
| Beta state | Paid plans **shown but not sold** | `PAID_PLANS_DISABLED_DURING_BETA` |
| Rings live | **Ring 1 only.** Rings 2–4 are roadmap. | `src/features/app/` |
| Contact address | **support@dutiva.ca** | 76 occurrences site-wide |
| Languages | EN + FR, both surfaces, prerendered per locale | `src/i18n/` — EN unprefixed, FR under `/fr` |
| Brand gold | `#b98512 → #d4af37 → #f4c54b → #ffe37a`; on dark `#e9c877` | `src/styles/tokens.css` |
| Brand navy | `#0d1b2a` ground, `#081019` deep | `src/styles/tokens.css` |

## Company and legal

Confirmed by the founder, July 2026. Rows marked **unverified** come from Business
Plan v1.6 only and have not been checked against a filing.

| Fact | Value | Confidence |
| --- | --- | --- |
| Legal name | Dutiva Canada Inc. | consistent everywhere |
| Registered office | 2967 Dundas St. W., Suite 1485, Toronto, ON M6P 1Z2 | confirmed — use in legal/corporate contexts |
| Operating city | Ottawa, Ontario | confirmed — use in marketing/press contexts |
| Founder | Martin Constantineau, Founder & CEO — always full name | confirmed |
| Incorporation | Federal (CBCA), 27 March 2026 | **unverified** |
| Trademark | CIPO application, classes 009/035/041/042/044 | **unverified** |
| Business phone | 1 (800) 349-0297 | **unverified** — absent from the site |

## Launch status

May 2026 and September 2026 have both been published as launch dates and both have
passed. **Do not publish a new calendar date.** Tie the language to product state:
Dutiva is *in beta, and launches when paid plans open*. That stays true until
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

**16** templates — not 20, "20+" or 47. **3** jurisdictions — not 4 or 14.
Federally regulated remote work is a supported *scenario* under `FED`, not a fourth
jurisdiction. Alberta and BC stay labelled roadmap.

### 4. Rings 2–4 as shipped

Only Ring 1 exists. Present the rest as roadmap.

### 5. Contact and brand

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
