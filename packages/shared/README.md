# `@vantra-design/governance-shared`

The one package every other workspace depends on. It exists so that the five
governance tools and the dashboard agree on three things.

## 1. The `@vantra-design/core` boundary (`src/core.ts`)

This is the **only** module in the monorepo that imports
[`@vantra-design/core`](https://github.com/vantradesign/vantra-core). AST parsing,
component-graph building and token-schema parsing are never reimplemented here —
they are imported.

`createAnalysisContext(repoRoot, options)` runs the parse once and memoizes the
result, producing the `AnalysisContext` that is passed by reference into all five
tools. That is the whole reason this monorepo uses Turborepo: one parse per CI
run, not five.

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared'

const context = createAnalysisContext('/path/to/consumer-repo')
console.log(context.components.length, context.parseDurationMs)
```

## 2. The tool ↔ dashboard contract (`src/schemas.ts`)

Zod schemas for what a tool emits and what the dashboard renders:

- `toolResultSchema` — what a single tool returns.
- `analysisRunPayloadSchema` — five `ToolResult`s merged into one run.
- `findingSchema`, `consumerImpactSchema`, `severitySchema`.
- `GovernanceTool` — the interface each of the five packages implements, so the CI
  runner can invoke them uniformly.

## 3. The typed Supabase client (`src/supabase.ts`)

`createVantraSupabaseClient()` and `createVantraSupabaseClientFromEnv()` return a
`SupabaseClient<Database>` bound to the generated schema types in
`src/types/database.ts`. Nothing else in the repo calls `createClient` directly.

Regenerate the types after every migration, from the repo root:

```bash
pnpm run db:types
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm build` | Bundle to `dist/` with tsup (ESM + CJS + d.ts) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint against the shared flat config |
| `pnpm test` | Vitest |
