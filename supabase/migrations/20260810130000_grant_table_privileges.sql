-- Grant table privileges to the PostgREST roles.
--
-- Why this migration exists: the initial schema enabled RLS and created policies
-- but never granted table-level privileges. RLS and GRANTs are two independent
-- gates and a request must pass BOTH. Without the GRANT, every request failed at
-- the privilege check before RLS was ever consulted:
--
--   42501: permission denied for table repos
--
-- That applied to `service_role` too, so even server-side reads were blocked.
-- Tables created through the Supabase dashboard get these grants implicitly;
-- tables created by a raw SQL migration do not.

-- ---------------------------------------------------------------------------
-- Schema access
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- service_role — full access, used only by trusted server-side callers
-- (the CI runner and the dashboard's Nitro routes). This key must never reach
-- the browser. service_role also bypasses RLS.
-- ---------------------------------------------------------------------------

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- ---------------------------------------------------------------------------
-- authenticated — DML, still filtered by the RLS policies from the initial
-- migration (currently permissive; see DECISIONS.md §6).
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- anon — DELIBERATELY GRANTED NOTHING.
--
-- The publishable/anon key is shipped in the browser bundle, so anything `anon`
-- can read is readable by anyone who loads the dashboard. These tables describe
-- a private design system: component names, file paths, line numbers and team
-- ownership. The dashboard therefore reads through server-side routes using the
-- secret key rather than querying Supabase directly from the client.
--
-- Do not add `grant ... to anon` here without recording the decision.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Future tables inherit the same shape, so a later migration cannot silently
-- reintroduce the bug this migration fixes.
-- ---------------------------------------------------------------------------

alter default privileges in schema public
  grant all privileges on tables to service_role;

alter default privileges in schema public
  grant all privileges on sequences to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;
