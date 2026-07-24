-- Remove the anon-readable doclib demo from the shared production project.
--
-- The demo Documents Library used to be exposed as anon-readable
-- `public.doclib_*` views over the `doclib.*` fixture tables (0001/0002), so
-- an unauthenticated visitor could read every demo row and — more to the
-- point — the fictional demo shared one Supabase project (and one anon key)
-- with the real `public.*` product tables, meaning a misconfiguration on one
-- side could bridge into the other.
--
-- The client no longer reads these views: src/features/app/documents/api.ts
-- now serves the library from bundled fixtures (identical content). This
-- migration drops the read surface and the demo schema so the demo↔real
-- trust boundary is removed entirely rather than merely narrowed.
--
-- ⚠ APPLY ORDER: apply this only AFTER the fixtures-only read layer is
-- deployed to production, so nothing is still querying public.doclib_*.
-- (The read layer already fell back to fixtures on error, so this is
-- non-breaking either way, but deploy-then-drop is the safe sequence.)
-- STATUS: not yet applied — apply via the Supabase MCP (apply_migration)
-- once the deploy is live.
--
-- Idempotent + defensive: drops by pattern with IF EXISTS, so a re-run or a
-- fresh replay (where these objects may already be absent) is a no-op.

do $$
declare
  v record;
begin
  for v in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'v'
      and c.relname like 'doclib\_%'
  loop
    execute format('drop view if exists public.%I cascade', v.relname);
    raise notice 'dropped view public.%', v.relname;
  end loop;
end
$$;

drop schema if exists doclib cascade;
