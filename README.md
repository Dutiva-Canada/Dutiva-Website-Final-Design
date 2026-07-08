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

- `/` — marketing landing page
- `/app/welcome` — app entry stage
- `/app/home` — the workspace

Both surfaces are fully bilingual (EN/FR toggle, persisted as `dutiva-lang`) and
themed (light/dark, persisted as `dutiva-theme`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` (strict) |
| `npm run lint` | oxlint |
| `npm run test` | Vitest (jsdom + Testing Library) |
| `npm run format` | Prettier |
| `npm run check` | typecheck + lint + test |

## Architecture

See [CONVENTIONS.md](CONVENTIONS.md) for the full engineering conventions:
directory layout, route map, theming/surface model, i18n rules, data layer, and
the quality bar. In short:

- **React 19 + TypeScript (strict) + Vite + Tailwind v4.**
- **Design tokens** ported from the Dutiva design system live in `src/styles/`;
  two themed surface scopes (`.surface-marketing`, `.surface-app`) feed Tailwind
  utilities via `@theme inline`.
- **i18n**: every user-facing string is a `{ en, fr }` pair — parity is enforced
  by the type system.
- **Data**: realistic sample fixtures in `src/data/` behind typed modules,
  designed to be swapped for a real backend (Supabase) without touching views.

## Legal

Dutiva provides practical HR workflow support and compliance-oriented guidance.
It does not provide legal advice.
