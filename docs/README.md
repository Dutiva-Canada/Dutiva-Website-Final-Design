# Dutiva Web — documentation index

Twenty documents live here. This index exists so the important ones are found
by someone who doesn't already know they exist — start with **Canonical
facts**, which outranks every other document in this folder on any question of
fact.

Repo-root entry points: [README.md](../README.md) (what the project is and how
to run it), [AGENTS.md](../AGENTS.md) (AI coding agents start here),
[CONVENTIONS.md](../CONVENTIONS.md) (full engineering conventions).

## Start here

| Document                                 | What it settles                                                                                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [CANONICAL_FACTS.md](CANONICAL_FACTS.md) | **Source of record for every load-bearing fact** — counts, pricing, jurisdictions, company details, and the claims that must not be made. Read before writing any customer-facing or investor-facing number. |

Its rule — _where this file disagrees with the code, the code wins_ — is
enforced by `npm run check`, in two halves: `src/canonicalFacts.test.ts` for
the rows backed by TypeScript values, and `scripts/check-canonical-facts.mjs`
(`npm run check:facts`) for the brand rows, which live in CSS that Vitest
cannot read. Adding a code-backed fact means adding its check.

## What is true, and how we keep it true

Dutiva is a compliance product, so a wrong fact is a product defect. These
govern what the product is allowed to assert.

| Document                                                                       | What it settles                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [AI_USAGE_STRATEGY.md](AI_USAGE_STRATEGY.md)                                   | Where an LLM is used and where it deliberately is not — "the LLM proposes, deterministic code disposes". Statutory clauses, notice math and crisis text are never model-authored. |
| [LAW_MONITORING.md](LAW_MONITORING.md)                                         | How law-change monitoring works, the 2026-07-30 coverage audit, and why sweeping a page is not detecting an amendment on it.                                                      |
| [LAW_CHANGE_NOTIFICATIONS.md](LAW_CHANGE_NOTIFICATIONS.md)                     | Design + decision brief for notifications. Nothing sends yet, deliberately.                                                                                                       |
| [advisor-guidance-corpus-2026-07-26.md](advisor-guidance-corpus-2026-07-26.md) | Grounding corpus seed — ON/QC/FED termination notice. Machine-curated, pending human review.                                                                                      |
| [advisor-guidance-corpus-2026-07-27.md](advisor-guidance-corpus-2026-07-27.md) | Second tranche — leaves, public holidays, hours of work, accommodation.                                                                                                           |
| [advisor-guidance-corpus-2026-07-29.md](advisor-guidance-corpus-2026-07-29.md) | Third tranche — pay & deductions, records retention, layoffs & recall, constructive dismissal, workplace injury.                                                                  |

Editorial rule for public articles — no statutory figures, ever — is stated in
`src/features/marketing/articles/articleModel.ts` and enforced by
`src/features/marketing/articles/articles.test.ts`.

## Privacy, security and data

| Document                                                                     | What it settles                                                                                          |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [ERROR_REPORTING.md](ERROR_REPORTING.md)                                     | First-party crash reporting, the privacy scrubbing rules, and source-map handling.                       |
| [EXPORT_PROTECTION.md](EXPORT_PROTECTION.md)                                 | Watermarking, fingerprinting, velocity limits, audit trail, and the runbook for tracing a leak.          |
| [do-residency-confirmation-request.md](do-residency-confirmation-request.md) | Open data-residency question with the inference provider. Blocks the PIPEDA claim in CANONICAL_FACTS §2. |

## Data and platform

| Document                                       | What it settles                                                |
| ---------------------------------------------- | -------------------------------------------------------------- |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)       | How the live Supabase schema is tracked against the repo.      |
| [DATA_MODEL.md](DATA_MODEL.md)                 | HR Documents Library data model, transcribed from the handoff. |
| [AUTH_MAGIC_LINK.md](AUTH_MAGIC_LINK.md)       | Magic-link sign-in and the Supabase configuration it needs.    |
| [BILLING_BETA_AUDIT.md](BILLING_BETA_AUDIT.md) | Stripe billing and beta-signup audit, with remediation status. |
| [OFFLINE_PWA.md](OFFLINE_PWA.md)               | Service worker, offline behaviour, and how to test it.         |

## Web surface

| Document                                               | What it settles                                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [SEO_GEO_IMPLEMENTATION.md](SEO_GEO_IMPLEMENTATION.md) | Search- and answer-engine visibility: prerendering, per-locale routes, structured data. |
| [SEO_ROUTE_MATRIX.md](SEO_ROUTE_MATRIX.md)             | Every route, classified. Derived from the router.                                       |
| [DEV_ANNOTATIONS.md](DEV_ANNOTATIONS.md)               | The in-app annotation overlay for AI-assisted editing. Dev and preview only.            |

## Support

| Document                                           | What it settles                                         |
| -------------------------------------------------- | ------------------------------------------------------- |
| [SUPPORT_ARCHITECTURE.md](SUPPORT_ARCHITECTURE.md) | The digital-first support model and how its pieces fit. |
| [SUPPORT_RUNBOOK.md](SUPPORT_RUNBOOK.md)           | Operating support solo, in structured review blocks.    |

## Design handoffs

Feature work is driven by high-fidelity handoffs, committed alongside the code
they produced (AGENTS.md § Design handoffs):

- [design-handoff-hr-documents-library/](design-handoff-hr-documents-library/) — Document Studio, template detail, repository, generate wizard.
- [design-handoff-advisor-chat/](design-handoff-advisor-chat/) — Advisor response experience, memory, engineering roadmap. Its `AGENT.md` is the contract for how the Advisor communicates.

## Adding a document

Add the file, then add its row here — an unlisted document is one nobody
finds. If it asserts a fact that also lives in code, say which file wins and
add the check alongside the others (`src/canonicalFacts.test.ts`, or
`scripts/check-canonical-facts.mjs` if the value lives in CSS).
