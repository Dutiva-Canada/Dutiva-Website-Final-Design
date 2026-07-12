# AGENTS.md

Instructions for AI coding agents working in this repository (Claude Code,
Codex, Cursor, Copilot, etc.). See [CONVENTIONS.md](CONVENTIONS.md) for the
full engineering conventions this file summarizes — read it before making any
non-trivial change.

## Project

Dutiva Web — a Canadian HR-compliance platform (dutiva.ca marketing site +
the AI-Advisor product workspace). React 19 + TypeScript (strict) + Vite +
Tailwind v4 + react-router v7. Proprietary; see [LICENSE.md](LICENSE.md).

## Setup

```bash
npm install
npm run dev        # start the dev server
```

## Commands

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run typecheck` | `tsc -b` (strict)                                           |
| `npm run lint`      | oxlint                                                      |
| `npm run test`      | Vitest (jsdom + Testing Library)                            |
| `npm run format`    | Prettier                                                    |
| `npm run check`     | typecheck + lint + test — **must pass before every commit** |
| `npm run build`     | typecheck + production build                                |

## Non-negotiables

- **Bilingual everything.** Every user-facing string ships as an `{ en, fr }`
  pair (`Bi` / `defineMessages`) — never hardcode English-only UI copy or
  entity data. French comes from the design handoff's own French content
  when present; otherwise mark it `[FR self-authored]` at the definition
  site — never machine-translate silently over an existing prototype string.
- **Design tokens, not hardcoded colors.** If a color exists as a token
  (`bg-surface`, `text-gold-fg`, `border-risk-border`, `var(--token)`), use
  it — don't inline a hex value that duplicates one.
- **lucide-react only** for icons; **no emoji** anywhere in the app or its
  content.
- **Data fixtures, not inline entity data.** Views import from `src/data/`;
  never inline sample people/cases/etc. directly in a component.
- **Colocate tests** as `*.test.ts(x)` next to the unit under test.
- **The standing legal disclaimer** ("Dutiva provides practical HR workflow
  support and compliance-oriented guidance. It does not provide legal
  advice.") must ship near CTAs, generated documents, and Advisor output —
  via the shared `Disclaimer` component, never re-typed.
- **Workspace mode.** The app defaults to a demo experience (Northgate
  Logistics Inc. fixtures) for everyone; a signed-in admin can switch to a
  real, empty "production" workspace via `useWorkspaceMode()`. See
  CONVENTIONS.md's Workspace mode section before wiring a module's fixtures
  to real persistence — the pattern (and the module-by-module rollout it's
  part of) is already established.

## Design handoffs

Feature work in this repo is driven by high-fidelity design handoffs
(prototype HTML + spec docs + screenshots). Prototypes are the source of
truth for pixels and copy — when in doubt, read the prototype, not this
file. Handoffs used to build a feature belong in the repo, not just in the
upload/chat that produced the PR: commit them under
`docs/design-handoff-<slug>/`, following the existing examples
(`docs/design-handoff-hr-documents-library/`,
`docs/design-handoff-advisor-chat/`). Scan any handoff package for
credentials/tokens before committing it.

## Before committing

Run `npm run check`. If you add or change a route, update the route table in
CONVENTIONS.md. If you touch anything user-facing, verify both languages and
both themes (light/dark) render correctly.
