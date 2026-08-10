# Vantra Governance Suite

Five CI governance tools for design systems, plus a shared dashboard, in one
Turborepo monorepo.

The tools all answer variations of the same question — *what does this change do
to the people downstream?* — so they all need the same input: a parsed component
graph of the repository under analysis. That graph is expensive to build, so it is
built **once per CI run** by [`@vantra-design/core`](https://github.com/vantradesign/vantra-core)
and passed by reference to all five tools. Sharing that one parse is the reason
these five tools live together rather than in five repos.

Part of the [**vantradesign**](https://github.com/vantradesign) family.

---

## The five tools

| Package | Answers |
| --- | --- |
| [`health-cli`](packages/health-cli) | Is the design system getting healthier or worse? |
| [`breaking-change-analyzer`](packages/breaking-change-analyzer) | If I merge this, what breaks downstream? |
| [`deprecation-orchestrator`](packages/deprecation-orchestrator) | What is deprecated, and who still uses it? |
| [`zero-usage-gate`](packages/zero-usage-gate) | What did we ship that nobody adopted? |
| [`ownership-mapper`](packages/ownership-mapper) | Who owns this component? |

All five are **placeholders** right now: each exports a `GovernanceTool` with the
right shape and an empty result. Logic arrives in a dedicated task per tool.

Supporting workspaces:

| Workspace | Role |
| --- | --- |
| [`packages/shared`](packages/shared) | Zod contract, typed Supabase client, the `@vantra-design/core` wrapper |
| [`apps/dashboard`](apps/dashboard) | Nuxt 4 UI for all five tools |

---

## Repository layout

```text
vantra-governance-suite/
├── apps/
│   └── dashboard/                 # Nuxt 4 + Tailwind v4 + shadcn-vue + Supabase
├── packages/
│   ├── shared/                    # types, Zod schemas, Supabase client, core wrapper
│   ├── health-cli/
│   ├── breaking-change-analyzer/
│   ├── deprecation-orchestrator/
│   ├── zero-usage-gate/
│   └── ownership-mapper/
├── supabase/                      # config + schema migrations
├── turbo.json                     # build / lint / typecheck / test / dev pipeline
├── pnpm-workspace.yaml
├── tsconfig.base.json             # strict, extended by every workspace
├── DECISIONS.md                   # why things are the way they are
├── CONTRIBUTING.md
└── LICENSE                        # AGPL-3.0
```

---

## The `@vantra-design/core` dependency

`@vantra-design/core` is a **separate repository**
([`vantradesign/vantra-core`](https://github.com/vantradesign/vantra-core)),
published to npm. It owns three things, and this monorepo owns none of them:

- AST parsing of components (Vue SFC, React TSX, plain TypeScript)
- component-graph construction with reverse lookups
- design-token schema parsing

> **Never reimplement any of that here.** If you need it, import it.

Note the naming: the GitHub org is `vantradesign`, the npm scope is
`@vantra-design` (with a hyphen). See `DECISIONS.md` §1.

### One import boundary

`packages/shared/src/core.ts` is the only file in this repo that imports
`@vantra-design/core`. Everything else goes through it:

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared/core'

// Parsed once, memoized, then handed to all five tools.
const context = createAnalysisContext('/path/to/consumer-repo')
```

That single choke point is what lets the parse be memoized per run, and what makes
swapping a local checkout for the published package a one-line change.

The core wrapper lives behind the `/core` subpath rather than the package root
because `ts-morph` and `@vue/compiler-sfc` are Node-only and must never reach the
browser bundle. Details in `DECISIONS.md` §3.

### Developing against a local `vantra-core` checkout

By default core is installed from npm, so a fresh clone just works. If you are
changing both repos at once, clone them side by side:

```text
parent/
├── vantra-core/
└── vantra-governance-suite/
```

Then uncomment the override that is already waiting in `pnpm-workspace.yaml`:

```yaml
overrides:
  '@vantra-design/core': link:../vantra-core
```

```bash
pnpm install
pnpm --filter @vantra-design/core build   # run inside vantra-core
```

Leave that override commented out in commits — CI resolves from npm.

---

## Local setup

Prerequisites: **Node 24** (`nvm use`), **pnpm 11**, and — for the database —
the **Supabase CLI** with **Docker** running.

```bash
pnpm install
```

### Start the dashboard

```bash
pnpm dev
```

Serves on `http://localhost:3000` (or the next free port). This runs only the
dashboard; its workspace dependencies are built first. To watch the tool packages
while editing them, run `pnpm dev:packages` in a second terminal.

### Start the database

```bash
supabase start          # boots Postgres, applies migrations in supabase/migrations
supabase status         # prints the API URL and keys
```

Copy the credentials into the app's env file:

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
# set SUPABASE_URL and SUPABASE_KEY from `supabase status`
```

After changing a migration, regenerate the types — never hand-edit them:

```bash
pnpm run db:types       # -> packages/shared/src/types/database.ts
```

### Verify everything

```bash
pnpm verify             # lint + typecheck + build + test, cached by Turborepo
```

---

## Schema

Four tables, defined in `supabase/migrations/`:

| Table | Holds |
| --- | --- |
| `repos` | repositories under governance, each `design_system` or `consumer` |
| `analysis_runs` | one CI pass; all five tools share a run |
| `findings` | one observation, tagged with the `tool` that produced it |
| `consumer_impacts` | concrete call sites a change touches |

RLS is enabled on all four with deliberately permissive placeholder policies —
**not production-ready**, see `DECISIONS.md` §6.

---

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | dashboard dev server |
| `pnpm dev:packages` | watch-build the tool packages |
| `pnpm build` | build every workspace |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | across all workspaces |
| `pnpm verify` | all four of the above |
| `pnpm run db:types` | regenerate Supabase types |
| `pnpm run db:reset` | reset the local database |

---

## License

[AGPL-3.0](LICENSE).
