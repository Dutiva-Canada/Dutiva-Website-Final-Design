import { workspaceMessages } from './workspace'
import { marketingMessages } from './marketing'

export type { WorkspaceMessageKey } from './workspace'
export type { MarketingMessageKey } from './marketing'
export type { SharedMessageKey } from './shared'

/**
 * Merged message catalogue. Each feature contributes one module keyed by
 * message id with `{ en, fr }` values; prefix keys by feature (e.g. `home_`,
 * `advisor_`, `landing_`, `shell_`) to avoid collisions.
 *
 * ## Why the modules are grouped by surface
 *
 * The catalogue used to be one eager chunk on every page, including
 * marketing landings that can reach only a tenth of it (TODO.md **EF6a**).
 * That was not a chunking problem — the provider seam already existed — it
 * was a *typing* problem: `t()` is called with computed keys read out of data
 * structures, so "what can this surface reach" was not a set anyone could
 * enumerate, and `t()` on a missing key throws rather than degrading, which
 * would make a wrong split a runtime crash.
 *
 * The catalogue now lives in three module-level groups — `workspace.ts`,
 * `marketing.ts`, `shared.ts` — each with its own imports. `ForcedLangProvider`
 * and `src/seo/routes.ts` import `marketing.ts` directly rather than this
 * merged index, so at the *source* level a marketing-only consumer no longer
 * needs to reference the 29 workspace-only modules at all. This file merges
 * everything back into `messages` for anything that legitimately needs the
 * whole catalogue (tests, `LangProvider.tsx` — see why there, not here).
 *
 * The three groups are derived from the modules — never hand-listed — so
 * adding a module to a group is the only edit needed, and the compiler
 * re-checks every call site. **The grouping is empirical.** It was derived by
 * matching every key in every module against every non-test source file and
 * classifying the consumers by path. Two rules decide placement:
 *
 * - A module read from `src/features/app/**` only is workspace (`workspace.ts`).
 * - A module read from `src/features/marketing/**` only is marketing (`marketing.ts`).
 * - Anything genuinely read from both is shared (`shared.ts`) — and the bar
 *   for "genuinely" is a real consumer, not a guess.
 *
 * **Adding a key to the wrong group is a type error at the call site, not a
 * blank string at runtime.** That is the whole point.
 *
 * ## What is NOT here yet, and why
 *
 * **This split does not yet reduce what a marketing visitor downloads** —
 * see TODO.md **EF6a**'s 2026-08-05 update for the full account. Splitting
 * `vite.config.ts`'s chunk grouping to match measured zero bytes moved: two
 * modules (`shell.ts`, `workspaceMode.ts`) are imported directly by files
 * that are eager for an unrelated reason (`navLabels.ts`,
 * `ProductionEmptyState.tsx`, both in `check-entry-graph.mjs`'s
 * `ALLOWED_APP_MODULES`), and excluding just those two from the grouping
 * rule didn't stop the bundler pulling them back in — unresolved, and
 * `vite.config.ts` still bundles everything under `src/i18n/messages/` as one
 * chunk as a result. The source-level split above is still worth having
 * (it's what let `routes.ts` stop depending on workspace keys, and it's the
 * foundation the next attempt should build on), but don't cite it as a bytes
 * win until the vite side actually is one.
 *
 * `t()` itself is also still typed `MessageKey` at `useI18n()` — the scoped
 * types constrain structures that *carry* keys (`plans.ts`,
 * `planComparison.ts`, `legalHubData.ts`, the About/FAQ/Known-Limitations/
 * Pricing/Template-Usage pages, the two Documents screens), not yet a direct
 * `t('some_key')` call from an arbitrary component. Making `t()` itself
 * surface-aware means threading the scope through `useI18n()` at every call
 * site — the genuinely large half of EF6a, not attempted here.
 *
 * Because of that gap, `buildLangContextValue()` degrades instead of
 * throwing when a key is missing from the catalogue it was given (`lang.ts`)
 * — a real scope violation logs loudly and shows the raw key rather than
 * crashing the page. Today's empirical audit found zero such violations; this
 * is the safety net for the day one is introduced by mistake, not evidence
 * that one exists.
 */

export const messages = {
  ...workspaceMessages,
  ...marketingMessages,
} as const

/** Every key in the catalogue. Prefer a surface-scoped type where one applies. */
export type MessageKey = keyof typeof messages
