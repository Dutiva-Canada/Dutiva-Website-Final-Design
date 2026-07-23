# Client error reporting

The site builds to fully prerendered static HTML plus a client SPA, with **no
serverless functions** in front of it. Vercel therefore captures no runtime
logs, and any error caught in the browser — including anything that reaches the
branded `RouteErrorPage` boundary — is completely invisible in production. This
subsystem closes that gap **without weakening the product's privacy posture.**

Dutiva handles employee data and is positioned as PIPEDA-conscious and Quebec
Law 25-aware, so error telemetry is designed as privacy-first, not
privacy-as-afterthought.

## What is sent

Exactly these fields, and nothing else, per report:

| Field       | Example                          | Why it's safe |
| ----------- | -------------------------------- | ------------- |
| `message`   | `Cannot read properties of null` | Error text. Free-form — see residual risk below. |
| `stack`     | minified stack, ≤ 4 KB           | Resolved with source maps kept off the public server. |
| `route`     | `/app/cases/:id`                 | Route **pattern** — never a resolved path (see scrubbing). |
| `release`   | commit SHA                       | Ties a trace to the exact deploy + its source maps. |
| `locale`    | `en-CA` / `fr-CA`                | From `<html lang>`; not identifying. |
| `kind`      | `route-boundary`                 | Which handler fired. |
| `ua`        | `Chrome/120 macOS`               | **Coarse** UA — family + major + OS only. |
| `env`       | `production` / `preview`         | So preview noise can be filtered from prod triage. |

### What is deliberately **not** sent

- **No DOM snapshots, no input-value capture, no session replay.**
- **No breadcrumbs** of any kind — nothing records user-entered text.
- **No Supabase auth token, session, or any `localStorage`/cookie data.**
- **No persistent per-user / install id.** We considered a random install id for
  grouping and rejected it: dedupe is done in-memory client-side, and grouping is
  done server-side on `route` + `message` + stack. A persisted id in
  `localStorage` would be a *new identifier* we'd have to justify under Law 25 for
  no benefit, so it isn't collected.
- **No full user-agent string.** The raw UA is a high-entropy fingerprinting
  vector; it's reduced to `family/major OS` before sending.

### URL scrubbing (the core PII control)

The `/app` surface carries employee, case, document, person, and conversation
identifiers directly in the path (`/app/employees/:employeeId`,
`/app/cases/:caseId`, …). `src/lib/errorReporting/scrubRoute.ts` reduces any
pathname to its **pattern** before it leaves the browser:

- The query string and hash are dropped entirely (they can carry search text or
  tokens).
- Public policy/help slugs collapse to their named pattern (`/legal/:slug`).
- Any segment following a known entity collection, or one that looks like an
  identifier, becomes `:id`. This catches opaque UUIDs **and** the human-readable
  slugs demo fixtures use (e.g. a person's name), which a pure "looks like an id"
  heuristic would miss.

**Residual risk, stated honestly:** `message` and `stack` are free-form. If app
code throws `new Error('failed for jane@corp.ca')`, that text is sent. We can't
scrub free text without destroying its usefulness, so the mitigations are: both
fields are length-capped (client and DB), nothing else is attached, and the
engineering guideline is *don't embed PII in thrown error messages.*

## Where the data lives (residency)

Reports go to a **Supabase edge function** and table — infrastructure Dutiva
**already discloses as a subprocessor.** This was a deliberate choice over a
hosted error-tracking vendor (Sentry/Datadog/Bugsnag/etc.): those would add a
**new third-party data processor** to the privacy policy, and **no major
error-tracking vendor offers Canadian data residency** — traces would land in the
US or EU. Keeping reports inside Supabase adds zero new processors.

> **Residency requirement:** this only holds if the Supabase project is pinned to
> a Canadian region (`ca-central-1`). If the project is hosted elsewhere, that is
> the residency fact to disclose — surface it, don't assume it.

## How it runs (and when it doesn't)

Reporting is **inert** unless every gate passes (`src/lib/errorReporting/index.ts`):

1. running in a browser (never during SSR/prerender);
2. `VERCEL_ENV` is `production` or `preview` — it's baked into the bundle via
   `vite.config.ts` `define` and collapses to `''` locally and under Vitest, so
   **nothing is sent in dev or tests**;
3. `VITE_SUPABASE_URL` is configured (the endpoint derives from it).

**Preview reporting is on, by design.** Catching a crash in a preview build —
before it reaches a customer — is strictly more valuable than catching it after,
and the payload is equally privacy-minimized either way (the residual free-text
risk below applies the same to both). The only cost is noise, mitigated by the
`env` column so preview can be filtered out in triage.

### Sources of errors

- **`RouteErrorPage`** (the existing React error boundary) reports in an effect,
  so never during SSR and never before first paint.
- **`window.onerror` / `unhandledrejection`** handlers, installed from
  `src/main.tsx`, cover errors outside React's tree.

### Fail-safe behaviour

- Transport is `navigator.sendBeacon` with a plain-string body (`text/plain`,
  CORS-safelisted → no preflight, no headers needed), falling back to
  `fetch(..., { keepalive: true })`.
- Everything is wrapped so **reporting never throws, never blocks paint, and
  never surfaces its own failure** to the user.
- **Dedupe + rate-limit** (`reporter.ts`): a per-fingerprint dedupe window, a
  rolling-window cap, and a hard per-session cap, so one broken render loop can't
  flood the endpoint. Server-side, `ingest_client_error_report()` enforces a
  per-IP window **atomically** — a transaction-scoped advisory lock keyed on the
  IP hash serializes concurrent calls so the check-then-insert can't be raced
  past the limit — and a storage failure returns **500** (visible in the function
  logs) rather than a silent 204.

### IP handling (rate-limit only)

The source IP is used **only** to rate-limit the open endpoint, and never lands
on a retained report row:

- It's keyed with **HMAC-SHA256 under a required secret pepper**
  (`ERROR_REPORT_SALT`, falling back to `SUPPORT_NOTIFY_SECRET`) — never a
  committed default, so IPv4's low entropy can't be brute-forced from table
  access without also holding the secret. The function **fails closed** (500) if
  the pepper is unset.
- The hash lives in a **separate short-retention table**
  (`client_error_rate_limit`). The ingest RPC sweeps expired rows for **all
  sources** on every call — not just the calling IP — so a one-shot sender's hash
  is removed by the next report from anyone rather than lingering until that same
  source returns; `purge_client_error_data()` covers a quiet endpoint on a
  schedule. So the "no persistent pseudonymous identifier" promise holds: nothing
  links a report to a network beyond the ~1-minute window.

### Retention

`message` and `stack` are **privacy-minimized, not PII-free** — free text can
still carry a name, email, or URL (see the residual-risk note above). So report
rows are **bounded to 90 days**, enforced two ways: opportunistically inside the
ingest RPC (a sampled, index-backed delete, so it needs no scheduler) and by
`purge_client_error_data()`, scheduled hourly via pg_cron where available. The
migration's pg_cron block is guarded, so a project without the extension still
applies cleanly — enable pg_cron, or run `purge_client_error_data()` from any
external scheduler.

## Source maps

Minified stacks are useless, so `build.sourcemap` is `'hidden'`:

- `'hidden'` emits `.map` files but **omits the `sourceMappingURL` comment**, so
  browsers and crawlers never auto-fetch them.
- `scripts/relocate-sourcemaps.mjs` then **moves every `dist/**/*.map` out of
  `dist/`** into a git-ignored `sourcemaps/<sha>/` — *before* the service worker
  precaches assets and before `dist/` is deployed — so the maps are **never
  publicly served**. They're kept as a build artifact (CI can archive them; the
  build is deterministic, so they can also be regenerated at the same commit) to
  symbolicate a release's traces.

## Service worker

The reporting endpoint is a **cross-origin POST** to the Supabase function. The
offline service worker (`scripts/generate-sw.mjs`) only handles same-origin GETs,
so the beacon is **never intercepted or cached**; `.map` files are also excluded
from the precache defensively.

## Deploying the endpoint

- Deploy `supabase/functions/report-error` with **`verify_jwt` off** (as with
  `resend-webhook`), so `sendBeacon` can reach it without an auth header.
- **Required:** set `ERROR_REPORT_SALT` (or `SUPPORT_NOTIFY_SECRET`) — the pepper
  for the rate-limit IP HMAC. The function fails closed without it.
- Retention (90-day reports, 1-hour limiter) is enforced automatically by the
  ingest RPC and by `purge_client_error_data()`. For the scheduled path, enable
  **pg_cron** (the migration schedules it, guarded) or run
  `purge_client_error_data()` from any external scheduler.
- Reports land in `public.client_error_reports`; reads are admin-only (RLS).

## Files

| File | Role |
| ---- | ---- |
| `src/lib/errorReporting/scrubRoute.ts`     | Path → route pattern (PII control) |
| `src/lib/errorReporting/coarseUserAgent.ts`| Raw UA → coarse label |
| `src/lib/errorReporting/reporter.ts`       | Payload, dedupe/rate-limit, transport |
| `src/lib/errorReporting/index.ts`          | Gate + install + boundary hook |
| `src/lib/release.ts`                       | Commit SHA (baked at build) |
| `supabase/functions/report-error/`         | Beacon sink (service role) |
| `supabase/migrations/0019_client_error_reports.sql` | Table + RLS |
| `scripts/relocate-sourcemaps.mjs`          | Move maps out of `dist/` |
