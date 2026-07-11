# Dutiva Web — Engineering Conventions

This codebase implements the high-fidelity design handoff in
`C:\Users\Marti\Downloads\# HR Compliance AI Advisor\design_handoff_dutiva_hr_platform\`
(start with its `README.md`). The prototype HTML files are the **source of truth for
every pixel and every string (EN + FR)** — when in doubt, read the prototype.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · react-router v7 ·
lucide-react · Vitest + Testing Library · oxlint · Prettier.

Scripts: `npm run dev | build | typecheck | lint | test | format | check`.

## Directory layout

```text
src/
  app/            App root, providers, router, route tables
  components/     Cross-feature shared UI (Disclaimer, chip tone/status classes)
  data/           Entity types + realistic sample fixtures (swap for Supabase later)
  features/
    marketing/    Landing page (dutiva.ca) — sections + its i18n module
    app/
      shell/      EntryStage, AppShell (sidebar, topbar, mobile drawer)
      views/      One folder per workspace view
      advisor/    Shared chat core (bubbles, tone cards, streaming engine)
      search/     Global search overlay
      rail/       Advisor rail (contextual right panel)
      toasts/     Toast context + host
      docstudio/  Guided document-generation overlay (right-hand drawer, live preview)
      documents/  HR Documents Library — repository, template, and studio screens
      workspaceContext/  "Advisor is using …" pinned-entity banner state
  i18n/           Language provider + message catalogue
  lib/            prefs, theme, generic hooks/utils
  styles/         tokens.css, surfaces.css, patterns.css, animations.css, base.css
  test/           Vitest setup
```

## Routes

| Path | Renders |
| --- | --- |
| `/` | Marketing landing page |
| `/about · /faq · /blog` | Marketing subpages (dutiva.ca content migration) |
| `/guides/template-usage · /known-limitations` | Marketing subpages |
| `/legal` → `/legal/:slug` | Policy index → one of 26 policy documents |
| `/app/welcome` | App entry stage (sign-in preview) |
| `/app` → `/app/home` | Workspace shell redirect |
| `/app/home · advisor · workflows · cases · employees · compliance · policies · templates · tasks · calendar · reports · knowledge · communications · compensation · wellbeing · settings` | The 16 views |
| `/app/memory` | Advisor Memory manager |
| `/app/memory/people/:personId · cases/:caseId · conversations/:threadId` | Memory person / case / chat-recall surfaces |
| `/app/cases/:caseId` | Case detail |
| `/app/employees/:employeeId` | Employee profile |

Navigation between entities (e.g. an Advisor tone-card action "Open case") uses
these routes — never view-state flags.

## Theming & surfaces

- The active theme is `data-theme="dark" | "light"` on `<html>`, set before first
  paint by `index.html` and kept in sync by `ThemeProvider` (persist key
  `dutiva-theme`). Never read `prefers-color-scheme` directly.
- Two token scopes (`src/styles/surfaces.css`): `.surface-marketing` (design-system
  ramp, dark-first) wraps the landing page; `.surface-app` (App v2 ramp,
  light-first) wraps the workspace. Both define `--bg`, `--text`, `--border`, … so
  the same utility (`bg-bg`, `text-text-2`) resolves per surface.
- **Never hardcode a colour that exists as a token.** Use the mapped Tailwind
  utilities (`bg-surface`, `text-gold-fg`, `border-risk-border`, …) or
  `var(--token)` in rare inline styles. Prototype-exact pixel values without a
  token use arbitrary values: `rounded-[12px]`, `text-[14.5px]`, `px-[18px]`.
- Signature marketing classes (`.premium-card`, `.gold-button`, `.badge`,
  `.dutiva-pill`, `.gradient-text`, `.dutiva-surface`) live in
  `src/styles/patterns.css` — use them, don't re-implement.

## i18n (bilingual everything)

- Every user-facing string ships EN + FR. UI-chrome strings live in per-feature
  modules under `src/i18n/messages/<feature>.ts` using `defineMessages({ key:
  { en, fr } })`; keys are prefixed by feature (`home_`, `advisor_`, `landing_`,
  `shell_` …). Register new modules in `src/i18n/messages/index.ts` (single
  spread — coordinate, don't duplicate keys).
- Entity/sample data carries bilingual fields typed as `Bi` (`{ en, fr }`) from
  `src/i18n/core.ts` — built with `bi('English', 'Français')`.
- Components consume via `const { t, L, x, lang } = useI18n()`:
  `t('home_title')` for catalogue keys, `x(employee.role)` for data fields,
  `L('inline EN', 'FR inline')` sparingly for one-offs.
- French translations come **from the prototype** (its `buildI18n()`, `frDict()`
  and `L(en, fr)` calls) — never machine-translate ad hoc when the prototype has
  the string.
- The language toggle persists to `dutiva-lang` and must update `<html lang>`.

## Data

- Types in `src/data/types.ts`; fixtures per domain (`employees.ts`, `cases.ts`,
  …) exporting typed constants. Views never inline entity data — they import
  fixtures, so a future Supabase provider can replace the module wholesale.
- Sample people/cases (Jordan Mensah, etc.) are realistic fixtures, not shippable
  content — keep them clearly grouped under `src/data/`.

## Icons & assets

- **lucide-react only** (pinned `^0.542.0`), stroke width per prototype (app uses
  1.7–1.9, round caps). **No emoji anywhere.**
- Brand mark: `public/brand/dutiva-leaf.png` (never redraw); app icon
  `public/brand/icon-app.svg`. Wordmark is text: "Duti" in `var(--text)` + "va"
  in gold, Montserrat 700.

## Accessibility & motion

- Icon-only buttons carry `aria-label`; hit targets ≥ 44px on mobile;
  `:focus-visible` outline comes from `base.css` — don't suppress it.
- House motion: `cubic-bezier(.4,0,.2,1)` ~160ms; entrances ~450ms; keyframes in
  `animations.css` (`fadeInUp`, `pulseDot`, `blinkCursor`, `toastIn`,
  `slideInRight`, `shimmer`). Respect `prefers-reduced-motion` (already global).

## Legal disclaimer

The standing disclaimer — "Dutiva provides practical HR workflow support and
compliance-oriented guidance. It does not provide legal advice." — must ship near
CTAs, generated documents, and Advisor output. Use the shared `Disclaimer`
component / `t('disclaimer')`.

## Quality bar

- `npm run check` (typecheck + lint + tests) must pass before every commit.
- Colocate tests as `*.test.ts(x)` next to the unit under test.
- Prefer semantic tokens and shared primitives over copy-pasted styles; keep
  components small and per-view folders self-contained.
