-- Revoke anon EXECUTE on SECURITY DEFINER functions that should not be
-- callable by unauthenticated demo traffic.
--
-- CONTEXT: the doclib demo schema (0001/0002) shares this Supabase project
-- with the production product's own `public` schema. A security review
-- flagged these SECURITY DEFINER functions in `public` as still having
-- EXECUTE granted to `anon` — Postgres grants EXECUTE to PUBLIC (which anon
-- inherits) by default when a function is created, unless it's explicitly
-- revoked. Each one either checks/confers elevated privilege or runs
-- privileged background maintenance, so anonymous demo traffic should never
-- be able to invoke them directly:
--
--   is_super_admin, is_admin_user            — privilege-check helpers
--   get_signature_by_token,
--   submit_signature_by_token                — token-gated signature flow
--   process_expired_data_deletions,
--   archive_old_document_versions,
--   cleanup_old_activity_logs                — scheduled maintenance jobs
--
-- ⚠ DO NOT APPLY THIS TO PRODUCTION WITHOUT REVIEW. It has not been run
-- against the live project. Before applying:
--   1. Confirm none of these are called directly by anon/browser client
--      code (grep the production frontend for supabase.rpc(...) calls to
--      each name) — if one is, it needs an authenticated caller or a
--      narrower rewrite instead of a blanket revoke, or this will break it.
--   2. Apply via the Supabase SQL editor or `supabase db push`, ideally
--      against a staging project first.
--
-- Longer term: this public, anon-readable demo sharing a Supabase project
-- with the real product's tables is itself the underlying risk — a
-- misconfiguration on one side can expose the other. Recommend moving the
-- doclib demo (0001/0002) to its own dedicated Supabase project so the two
-- trust boundaries can't collide.
--
-- Written defensively: functions are looked up by name in pg_proc, so this
-- does not error if a name has already been revoked, renamed, dropped, or
-- has an overload with a different argument signature than expected.

do $$
declare
  fn record;
  target_names text[] := array[
    'is_super_admin',
    'is_admin_user',
    'get_signature_by_token',
    'submit_signature_by_token',
    'process_expired_data_deletions',
    'archive_old_document_versions',
    'cleanup_old_activity_logs'
  ];
begin
  for fn in
    select p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(target_names)
  loop
    execute format('revoke execute on function public.%I(%s) from anon', fn.proname, fn.args);
    raise notice 'revoked anon execute on public.%(%)', fn.proname, fn.args;
  end loop;
end
$$;
