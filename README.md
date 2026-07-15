# Dutiva Web

Dutiva is a Canadian HR-compliance platform — AI-assisted, jurisdiction-aware,
bilingual EN/FR. This repo implements the redesigned marketing landing page
(dutiva.ca) and the full product workspace (AI Advisor, cases, employees,
compliance, policies, document studio, and supporting modules) from the
high-fidelity design handoff.

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

- `/` — marketing landing page (`/fr` in French)
- `/pricing` — plan comparison + Stripe checkout (`/fr/tarifs`)
- `/templates` — template catalogue preview (`/fr/modeles`)
- `/app/welcome` — app entry stage
- `/app/home` — the workspace

Both surfaces are fully bilingual and themed (light/dark, persisted as
`dutiva-theme`). Public pages are language-scoped by URL (English unprefixed,
French under `/fr`) and prerendered to static HTML at build time for SEO;
the app surface follows the persisted `dutiva-lang` preference. See
`docs/SEO_GEO_IMPLEMENTATION.md`.

## Scripts

| Command             | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Vite dev server                                            |
| `npm run build`     | Typecheck + client/SSR builds + prerender + SEO validation |
| `npm run preview`   | Serve the production build                                 |
| `npm run typecheck` | `tsc -b` (strict)                                          |
| `npm run lint`      | oxlint                                                     |
| `npm run test`      | Vitest (jsdom + Testing Library)                           |
| `npm run format`    | Prettier                                                   |
| `npm run check`     | typecheck + lint + test                                    |

## Architecture

Working on this repo with an AI coding agent? Start with
[AGENTS.md](AGENTS.md). See [CONVENTIONS.md](CONVENTIONS.md) for the full
engineering conventions: directory layout, route map, theming/surface model,
i18n rules, data layer, and the quality bar. In short:

- **React 19 + TypeScript (strict) + Vite + Tailwind v4.**
- **Design tokens** ported from the Dutiva design system live in `src/styles/`;
  two themed surface scopes (`.surface-marketing`, `.surface-app`) feed Tailwind
  utilities via `@theme inline`.
- **i18n**: every user-facing string is a `{ en, fr }` pair — parity is enforced
  by the type system.
- **Data**: realistic sample fixtures in `src/data/` behind typed modules,
  designed to be swapped for a real backend (Supabase) without touching views.

## Fidelity notes

The design handoff (`design_handoff_dutiva_hr_platform/`) is the source of
truth for pixels and copy. Documented deviations, each marked with a comment
at the site:

- **Two prototype bugs fixed**: open-task titles used `var(--ink)` (a border
  tone, near-invisible in both themes) and toasts used `var(--ink)` fills
  (illegible in the light theme). Titles use `var(--text)`; toasts pin the
  dark-ink pill in both themes.
- **Advisor thread list** renders as a column inside the Advisor view; the
  prototype injected chat groups into the app sidebar (kept generic here).
- **Responsive breakpoints** are 768/1024px (Tailwind md/lg); the prototype's
  device frames switched at 640/900px.
- **Beta form** disables native email validation (`noValidate`) so the
  prototype's own regex + styled error actually run.
- The prototype's Desktop/Tablet/Mobile preview switchers are prototype
  affordances and were intentionally not built.

Self-authored Québec French (strings with no FR anywhere in the prototype) is
marked `[FR self-authored]` in the `src/i18n/messages/` modules.

## Legal

Dutiva provides practical HR workflow support and compliance-oriented guidance.
It does not provide legal advice.
