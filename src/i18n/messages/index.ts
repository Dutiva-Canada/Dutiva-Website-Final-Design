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
 * ## The eager-graph win, and what is still NOT here
 *
 * This split now *does* reduce what a marketing visitor downloads —
 * `vite.config.ts`'s `codeSplitting.groups` mirrors this file's boundary
 * (`messages-marketing` / `messages-workspace`), and the eager graph
 * measured 671.3kB → 539.9kB (-131.4kB) once it did. Getting there needed
 * one more fix beyond this file: two modules (`shell.ts`, `workspaceMode.ts`)
 * are imported directly by files that are eager for an unrelated reason
 * (`navLabels.ts`, `ProductionEmptyState.tsx`, both in
 * `check-entry-graph.mjs`'s `ALLOWED_APP_MODULES`) — excluding them from the
 * grouping rule's `test` alone did nothing, because rolldown's
 * `includeDependenciesRecursively` (default `true`) pulls a matched
 * module's dependencies in regardless of what their own id would exclude.
 * Setting it to `false` on the workspace group was the actual fix; see
 * `vite.config.ts` for the mechanics and TODO.md **EF6a** for the full
 * account.
 *
 * `t()` itself is still typed `MessageKey` at `useI18n()` — the scoped
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
