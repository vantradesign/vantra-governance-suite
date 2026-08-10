# Contributing

## Ground rules

Two that matter more than the rest:

1. **Never reimplement `@vantra-design/core` logic here.** AST parsing,
   component-graph building and token-schema parsing belong to
   [`vantradesign/vantra-core`](https://github.com/vantradesign/vantra-core). If
   something is missing, add it there and bump the dependency. In this repo, the
   only file allowed to import it is `packages/shared/src/core.ts`.
2. **Never hand-edit `packages/shared/src/types/database.ts`.** It is generated.
   Change the migration, then run `pnpm run db:types`.

Code and comments are written in **English**. The dashboard UI defaults to English;
German translations live in `apps/dashboard/i18n/locales/de.json` and may be
partial — untranslated keys fall back to English.

## Setup

```bash
nvm use          # Node 24, per .nvmrc
pnpm install
pnpm dev         # dashboard
```

See the [README](README.md) for the database and local-core-linking setup.

## Branches

```text
<type>/<short-kebab-description>
```

Types match the commit types below — `feat/breaking-change-analyzer-api-diff`,
`fix/dashboard-locale-fallback`, `docs/core-linking`.

Branch off `main`. `main` is expected to stay green.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`.

**Scopes** are the workspace directory name, or `repo` for cross-cutting changes:
`shared`, `dashboard`, `health-cli`, `breaking-change-analyzer`,
`deprecation-orchestrator`, `zero-usage-gate`, `ownership-mapper`, `supabase`,
`repo`.

Subject in the imperative mood, lower case, no trailing period:

```text
feat(breaking-change-analyzer): classify removed props as high severity
fix(dashboard): fall back to English for missing German keys
chore(repo): pin Node 24 in engines
```

Explain *why* in the body when the reason is not obvious from the diff. Breaking
changes get a `!` (`feat(shared)!: ...`) and a `BREAKING CHANGE:` footer.

## Before you push

```bash
pnpm verify      # lint + typecheck + build + test
```

CI runs exactly this. Turborepo caches it, so a re-run after a small change is
usually a few seconds.

## Adding a tool package

The five tool packages are intentionally uniform. When filling one in:

- Implement the `GovernanceTool` interface from
  `@vantra-design/governance-shared`; do not invent a parallel shape.
- Accept the shared `AnalysisContext` and **do not parse the repository yourself** —
  that defeats the single-parse design.
- Return findings that validate against `toolResultSchema`. If you need a new
  field, add it to the Zod schema in `packages/shared/src/schemas.ts` so the
  dashboard and the tool cannot drift.
- Report `confidence: 1` for anything derived statically from the AST. Lower values
  are for heuristics and model-assisted classification.
- Keep `type` values stable once released — they show up in the dashboard and in
  saved reports.

## Adding a shadcn-vue component

```bash
cd apps/dashboard
npx shadcn-vue@latest add <component>
```

Components land in `app/components/ui/` and are **excluded from linting** — they
are vendored upstream code, so keep local modifications out of them.

## Database changes

```bash
supabase migration new <description>   # write SQL in supabase/migrations/
supabase db reset                      # re-apply from scratch
pnpm run db:types                      # regenerate types
```

Commit the migration and the regenerated types together.

## Decisions

Non-obvious choices are recorded in [DECISIONS.md](DECISIONS.md). If you make a
judgement call a future reader would question, add an entry rather than leaving it
implicit in the diff.
