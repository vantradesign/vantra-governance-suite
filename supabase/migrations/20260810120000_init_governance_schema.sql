-- Base schema for the Vantra governance suite.
--
-- One analysis run corresponds to one CI pass over a repository. The component
-- graph is parsed once by @vantra-design/core, then all five tools append their
-- observations to `findings` (and, where a change propagates outward, to
-- `consumer_impacts`) under the same `analysis_run_id`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.repo_role as enum ('design_system', 'consumer');

create type public.analysis_run_status as enum ('pending', 'running', 'succeeded', 'failed');

create type public.governance_tool as enum (
  'health-cli',
  'breaking-change-analyzer',
  'deprecation-orchestrator',
  'zero-usage-gate',
  'ownership-mapper'
);

create type public.finding_severity as enum ('info', 'low', 'medium', 'high', 'critical');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.repos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  github_url text not null,
  role public.repo_role not null,
  created_at timestamptz not null default now(),
  constraint repos_github_url_key unique (github_url)
);

comment on table public.repos is
  'Repositories under governance. Exactly one design_system repo is expected per installation; the rest are consumers.';

create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references public.repos (id) on delete cascade,
  pr_number integer,
  status public.analysis_run_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint analysis_runs_pr_number_positive check (pr_number is null or pr_number > 0)
);

comment on table public.analysis_runs is
  'One CI pass. All five tools share a single run row so their findings can be reported together.';

create index analysis_runs_repo_id_created_at_idx
  on public.analysis_runs (repo_id, created_at desc);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references public.analysis_runs (id) on delete cascade,
  tool public.governance_tool not null,
  type text not null,
  severity public.finding_severity not null default 'info',
  description text not null,
  -- 0..1. Static AST-derived findings report 1; heuristic or model-assisted
  -- findings report their own confidence so the dashboard can filter noise.
  confidence numeric(4, 3) not null default 1.000,
  created_at timestamptz not null default now(),
  constraint findings_confidence_range check (confidence >= 0 and confidence <= 1)
);

comment on table public.findings is
  'Tool observations for a run. `type` is tool-owned free text (e.g. removed-prop, orphan-component).';

create index findings_analysis_run_id_tool_idx
  on public.findings (analysis_run_id, tool);

create index findings_severity_idx on public.findings (severity);

create table public.consumer_impacts (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references public.analysis_runs (id) on delete cascade,
  consumer_repo_id uuid not null references public.repos (id) on delete cascade,
  affected_export text not null,
  file_path text not null,
  line_number integer,
  created_at timestamptz not null default now(),
  constraint consumer_impacts_line_number_positive check (line_number is null or line_number > 0)
);

comment on table public.consumer_impacts is
  'Concrete call sites in consumer repos that a design-system change touches.';

create index consumer_impacts_analysis_run_id_idx
  on public.consumer_impacts (analysis_run_id);

create index consumer_impacts_consumer_repo_id_idx
  on public.consumer_impacts (consumer_repo_id);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- PLACEHOLDER: every authenticated user may read and write everything. This is
-- deliberately permissive so the dashboard scaffold works end to end. Before any
-- real deployment these must be narrowed to per-organisation / per-repo access
-- (tracked in DECISIONS.md).
-- ---------------------------------------------------------------------------

alter table public.repos enable row level security;
alter table public.analysis_runs enable row level security;
alter table public.findings enable row level security;
alter table public.consumer_impacts enable row level security;

create policy "authenticated full access" on public.repos
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on public.analysis_runs
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on public.findings
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on public.consumer_impacts
  for all to authenticated using (true) with check (true);
