-- Client error telemetry. The website is fully prerendered static HTML plus a
-- client SPA with no serverless functions, so a crash caught in the browser is
-- invisible in production today. The report-error edge function (verify_jwt
-- off) receives privacy-scrubbed reports by `navigator.sendBeacon` and hands
-- them to ingest_client_error_report() (below), which validates the rate limit
-- and stores the report atomically. Reads are admin-only.
--
-- PRIVACY (see docs/ERROR_REPORTING.md): the client sends route *patterns*
-- (`/app/cases/:id`, never a resolved case id), a coarse user-agent (family +
-- major + OS, not the raw string), locale, the deployed commit SHA, and the
-- error message/stack. It never sends DOM snapshots, input values, breadcrumbs,
-- auth tokens, localStorage, or any persistent per-user id. The residual
-- exposure is free-text message/stack, which app code must not embed PII into;
-- both are length-capped here as a backstop.
--
-- The retained report row carries NO IP-derived value at all. Rate-limit hashes
-- live in a SEPARATE short-retention table (client_error_rate_limit) that is
-- swept for all sources down to the limiter window, so no report is linkable to
-- a network beyond that window — the persistent pseudonymous identifier the
-- privacy design promises to avoid never exists.
--
-- RETENTION: report rows are bounded to 90 days — enforced opportunistically in
-- the ingest RPC and on a schedule by purge_client_error_data() — so the
-- free-form message/stack cannot accumulate indefinitely. Limiter rows live at
-- most ~one window (plus a 1-hour scheduled backstop).
--
-- DEPENDENCY: the admin read policies call is_admin(uuid), created directly on
-- the live project (not by a repo migration) — see migrations 0014 / 0016. It
-- must exist before a from-scratch replay of these migrations.
--
-- ROLLBACK:
--   select cron.unschedule('purge-client-error-data');  -- if pg_cron scheduled it
--   drop function if exists public.purge_client_error_data();
--   drop function if exists public.ingest_client_error_report(
--     text, text, text, text, text, text, text, text, text, integer, integer);
--   drop table if exists public.client_error_rate_limit cascade;
--   drop table if exists public.client_error_reports cascade;

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
  user_agent text check (user_agent is null or char_length(user_agent) <= 200)
);

create index if not exists client_error_reports_created_idx
  on public.client_error_reports (created_at desc);
create index if not exists client_error_reports_release_idx
  on public.client_error_reports (release, created_at desc);

alter table public.client_error_reports enable row level security;

-- Admin read only. There is deliberately NO anon/authenticated INSERT policy:
-- all writes go through ingest_client_error_report() under the service role.
create policy "Admins read client error reports"
  on public.client_error_reports for select
  using (is_admin((select auth.uid())));

-- ── Rate-limit log (short retention, decoupled from reports) ───────────────
-- One row per accepted report, holding ONLY a keyed hash of the source IP (the
-- edge function uses HMAC-SHA256 with a required secret pepper — never a
-- committed default). The ingest RPC sweeps expired rows for ALL sources on
-- every call (not just the calling IP's), so a hash lives at most ~one window
-- under any traffic; the scheduled purge_client_error_data() job below covers
-- the zero-traffic tail. This is not a store of personal data.
create table if not exists public.client_error_rate_limit (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists client_error_rate_limit_ip_idx
  on public.client_error_rate_limit (ip_hash, created_at);
-- Supports the all-sources sweep by age in the ingest RPC and the purge job.
create index if not exists client_error_rate_limit_created_idx
  on public.client_error_rate_limit (created_at);

alter table public.client_error_rate_limit enable row level security;

create policy "Admins read client error rate limit"
  on public.client_error_rate_limit for select
  using (is_admin((select auth.uid())));

-- ── Atomic ingest: rate-limit check + insert in one transaction ────────────
-- A transaction-scoped advisory lock keyed on the IP hash serializes concurrent
-- unauthenticated calls from the same source, so the check-then-insert cannot be
-- raced past the limit (the failure mode of a separate SELECT + INSERT). Returns
-- 'ok' when stored, 'rate_limited' when the window is full. SECURITY DEFINER so
-- it runs with a stable owner, but execute is granted to service_role only.
create or replace function public.ingest_client_error_report(
  p_ip_hash text,
  p_env text,
  p_release text,
  p_route text,
  p_locale text,
  p_kind text,
  p_message text,
  p_stack text,
  p_user_agent text,
  p_window_seconds integer,
  p_limit integer
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - make_interval(secs => greatest(p_window_seconds, 1));
  v_count integer;
begin
  -- Serialize per source hash for the life of this transaction.
  perform pg_advisory_xact_lock(hashtext(coalesce(p_ip_hash, '')));

  -- Sweep expired limiter rows for ALL sources (not just this one), so a
  -- one-shot sender's hash is removed by the next report from any source rather
  -- than lingering until that same source returns. Index-backed on created_at.
  delete from public.client_error_rate_limit where created_at < v_since;

  select count(*) into v_count
    from public.client_error_rate_limit
    where ip_hash = p_ip_hash and created_at >= v_since;

  if v_count >= greatest(p_limit, 1) then
    return 'rate_limited';
  end if;

  insert into public.client_error_rate_limit (ip_hash) values (p_ip_hash);

  insert into public.client_error_reports
    (env, release, route, locale, kind, message, stack, user_agent)
  values
    (p_env, p_release, p_route, p_locale, p_kind, p_message, p_stack, p_user_agent);

  -- Enforce bounded retention without depending on an external scheduler: on a
  -- small sample of ingests, purge reports past the 90-day window. message/stack
  -- are free-form and may contain PII, so they must not accumulate indefinitely.
  -- Amortized and index-backed (normally a no-op at steady state);
  -- purge_client_error_data() covers the zero-traffic tail on a schedule.
  if random() < 0.02 then
    delete from public.client_error_reports where created_at < now() - interval '90 days';
  end if;

  return 'ok';
end;
$$;

-- The endpoint is public (verify_jwt off); only the service role may ingest.
revoke all on function public.ingest_client_error_report(
  text, text, text, text, text, text, text, text, text, integer, integer) from public;
revoke all on function public.ingest_client_error_report(
  text, text, text, text, text, text, text, text, text, integer, integer) from anon, authenticated;
grant execute on function public.ingest_client_error_report(
  text, text, text, text, text, text, text, text, text, integer, integer) to service_role;

-- ── Retention purge ────────────────────────────────────────────────────────
-- Bounded retention for both tables, in one place: reports past 90 days (they
-- carry free-form message/stack that may hold PII) and any straggler limiter
-- rows. The ingest RPC already enforces this opportunistically under traffic;
-- this is the scheduled path that also covers a quiet endpoint.
create or replace function public.purge_client_error_data() returns void
language sql
security definer
set search_path = public
as $$
  delete from public.client_error_reports where created_at < now() - interval '90 days';
  delete from public.client_error_rate_limit where created_at < now() - interval '1 hour';
$$;

revoke all on function public.purge_client_error_data() from public, anon, authenticated;

-- Schedule the purge hourly via pg_cron. Guarded so a from-scratch replay on a
-- project without pg_cron enabled still succeeds — enable the extension and
-- re-run this block, or call public.purge_client_error_data() from any external
-- scheduler. Idempotent: cron.schedule upserts a job by name.
do $$
begin
  perform cron.schedule(
    'purge-client-error-data',
    '23 * * * *',
    'select public.purge_client_error_data()'
  );
exception
  when others then
    raise notice 'pg_cron unavailable (%); schedule public.purge_client_error_data() externally', sqlerrm;
end
$$;
