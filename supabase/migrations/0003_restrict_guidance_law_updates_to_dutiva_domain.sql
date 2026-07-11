-- Restrict read access to the real legal-sources feature (guidance_sources,
-- guidance_chunks, law_updates) to @dutiva.ca accounts. This is an internal
-- team feature (real AI Advisor backend), not meant for arbitrary
-- authenticated users who might sign up via the app's magic-link flow.
--
-- law_updates had two exact-duplicate "allow all authenticated" SELECT
-- policies (RLS policies for the same role/command are OR'd together, so
-- leaving one unrestricted would have defeated the other) -- the redundant
-- one is dropped and the remaining one is tightened.
--
-- Applied directly to the live project (khtwpxnvziiyplaflwru) via the
-- Supabase MCP with Martin's authorization; committed here to keep the
-- schema history reproducible, matching 0001-0003.

alter policy "Authenticated can read active public guidance sources" on public.guidance_sources
  using (
    (auth.jwt() ->> 'email') like '%@dutiva.ca'
    and (status = 'active' or is_admin((select auth.uid())))
  );

alter policy "Members can read guidance chunks" on public.guidance_chunks
  using (
    (auth.jwt() ->> 'email') like '%@dutiva.ca'
    and (
      is_admin((select auth.uid()))
      or organization_id is null
      or is_org_member(organization_id, (select auth.uid()))
    )
  );

drop policy "Anyone authenticated can read law updates" on public.law_updates;

alter policy "Authenticated users can read law updates" on public.law_updates
  using ((auth.jwt() ->> 'email') like '%@dutiva.ca');
