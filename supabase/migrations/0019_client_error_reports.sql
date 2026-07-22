-- Client error telemetry. The website is fully prerendered static HTML plus a
-- client SPA with no serverless functions, so a crash caught in the browser is
-- invisible in production today. The report-error edge function (verify_jwt
-- off) receives privacy-scrubbed reports by `navigator.sendBeacon` and writes
-- them here with the service role. Reads are admin-only.
--
-- PRIVACY (see docs/ERROR_REPORTING.md): the client sends route *patterns*
-- (`/app/cases/:id`, never a resolved case id), a coarse user-agent (family +
-- major + OS, not the raw string), locale, the deployed commit SHA, and the
-- error message/stack. It never sends DOM snapshots, input values, breadcrumbs,
-- auth tokens, localStorage, or any persistent per-user id. The residual
-- exposure is free-text message/stack, which app code must not embed PII into;
-- both are length-capped here as a backstop.
--
-- ip_hash is a ONE-WAY salted SHA-256 of the request IP (never the raw IP),
-- stored only to rate-limit abuse of this public endpoint and to spot a flood
-- in triage — the same pattern as public support intake (migration 0016). It is
-- not personal data and rows are safe to purge on a short retention.
--
-- DEPENDENCY: the admin read policy calls is_admin(uuid), created directly on
-- the live project (not by a repo migration) — see migrations 0014 / 0016. It
-- must exist before a from-scratch replay of these migrations.
--
-- ROLLBACK: drop table if exists public.client_error_reports cascade;

create table if not exists public.client_error_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  -- Which deploy the crash came from. Preview reports are kept but tagged so
  -- they can be filtered out of production triage.
  env text check (env in ('production', 'preview')),
  -- Commit SHA of the build (maps to the relocated source maps).
  release text check (release is null or char_length(release) <= 64),
  -- Scrubbed route pattern, never a resolved path.
  route text check (route is null or char_length(route) <= 200),
  locale text check (locale is null or locale in ('en-CA', 'fr-CA')),
  -- Which handler fired: the React boundary, window.onerror, or a rejection.
  kind text check (kind is null or kind in ('route-boundary', 'window-error', 'unhandled-rejection')),
  message text check (message is null or char_length(message) <= 2000),
  stack text check (stack is null or char_length(stack) <= 8000),
  -- Coarse user-agent label (e.g. "Chrome/120 macOS").
  user_agent text check (user_agent is null or char_length(user_agent) <= 200),
  -- Salted one-way hash of the source IP — rate-limit / abuse triage only.
  ip_hash text
);

create index if not exists client_error_reports_created_idx
  on public.client_error_reports (created_at desc);
create index if not exists client_error_reports_release_idx
  on public.client_error_reports (release, created_at desc);
-- Supports the per-IP rate-limit window in the edge function.
create index if not exists client_error_reports_ip_idx
  on public.client_error_reports (ip_hash, created_at);

alter table public.client_error_reports enable row level security;

-- Admin read only. There is deliberately NO anon/authenticated INSERT policy:
-- all writes go through the service role inside the report-error edge function,
-- which validates and rate-limits first.
create policy "Admins read client error reports"
  on public.client_error_reports for select
  using (is_admin((select auth.uid())));
