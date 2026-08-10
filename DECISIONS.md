# Decisions

Reasoned defaults taken while scaffolding this repository, with the follow-ups
each one implies. Recorded here instead of blocking on a question.

---

## 1. The core package is `@vantra-design/core`, not `@vantradesign/core`

**Decision.** Depend on `@vantra-design/core` (npm scope with a hyphen).

The original brief referred to `@vantradesign/core`. That package does not exist
on npm — it 404s. The real package published from
`github.com/vantradesign/vantra-core` is **`@vantra-design/core`**, currently at
`0.1.2`. The GitHub *organisation* is `vantradesign` (no hyphen); the npm *scope*
is `@vantra-design` (with one). Both spellings are correct in their own namespace,
which is exactly why this is easy to get wrong.

The same split applies to the packages in this repo: they are published under the
`@vantra-design/*` scope while living in the `vantradesign` org.

**Follow-up.** If the `@vantradesign` npm scope is ever registered and preferred,
this is a rename across all eight `package.json` files plus the imports in
`packages/shared/src/core.ts`.

---

## 2. `@vantra-design/core` is resolved from npm, not linked locally

**Decision.** Declare a normal semver dependency, `^0.1.2`, in
`packages/shared/package.json`.

The brief asked for a local `workspace:`/`pnpm link` setup against a sibling
`vantra-core` checkout, on the assumption that core was unpublished. It is
published, so a plain registry dependency is the better default: `pnpm install`
works on a fresh clone and in CI with no extra setup, and the version is pinned
and auditable.

Local linking remains available and is documented in the README. The override is
pre-written but commented out in `pnpm-workspace.yaml`:

```yaml
overrides:
  '@vantra-design/core': link:../vantra-core
```

**Follow-up.** When core reaches `1.0.0`, tighten the range. Until then `^0.1.2`
is deliberately permissive because both repos move together.

---

## 3. Core is reachable only via the `./core` subpath

**Decision.** `packages/shared/src/index.ts` does **not** re-export the core
wrapper. Tool packages import from `@vantra-design/governance-shared/core`.

This was found the hard way: the initial version did `export * from './core'` from
the package root, and the Nuxt production build failed with

```text
Rolldown failed to resolve import "velocityjs" from @vue/compiler-sfc
```

Core depends on `ts-morph`, `fast-glob` and `@vue/compiler-sfc` — all Node-only.
Re-exporting it from the root meant the dashboard's browser bundle transitively
pulled in the entire AST toolchain.

The split is now explicit and enforced by the module graph:

| Entry point | Contents | Safe in browser |
| --- | --- | --- |
| `@vantra-design/governance-shared` | Zod schemas, Supabase client, DB types | yes |
| `@vantra-design/governance-shared/core` | `AnalysisContext`, `createAnalysisContext` | no, Node only |
| `@vantra-design/governance-shared/supabase` | Supabase client factory only | yes |

---

## 4. Turborepo over plain pnpm workspace scripts

**Decision.** Turborepo, with `test`, `lint`, `typecheck` and `build` all
declaring `dependsOn: ["^build"]`.

The five tools run in one analysis pass over one component graph. Caching the
build of `packages/shared` once per CI run rather than five times is the point.
Measured on this repo: a warm `turbo run lint typecheck build test` replays 28
tasks in **40 ms** versus ~9 s cold.

**Cache strategy: local only for now.** No `remoteCache` block and no
`TURBO_TOKEN` in CI. Remote caching needs either Vercel or a self-hosted cache
server, which is not worth provisioning for a repo with one contributor. The CI
workflow caches `.turbo/` through `actions/cache` instead, which gets most of the
benefit across runs on the same branch.

**Follow-up.** Add remote caching when more than one person or more than one CI
runner is in play.

---

## 5. `pnpm dev` starts only the dashboard

**Decision.** Root `dev` script is `turbo run dev --filter=@vantra-design/dashboard`.

An unfiltered `turbo run dev` starts six `tsup --watch` processes alongside Nuxt.
On macOS with this working copy on iCloud Drive that exhausts file watchers, and
Nuxt enters a restart loop:

```text
Restarting Nuxt due to error: Error: EMFILE: too many open files, watch
```

`nuxt dev` alone is fine, so the fix is to scope the task rather than to fight the
watcher. Dependencies are still built first via `^build`. Use `pnpm dev:packages`
to watch the tool packages when actively editing them.

---

## 6. `anon` gets no table privileges; the dashboard reads server-side

**Decision.** RLS is on for all four tables with permissive `authenticated`
policies. Table privileges are granted to `service_role` and `authenticated`
only — **never to `anon`** — and the dashboard reads through Nitro server routes
using the secret key.

### The bug that produced this entry

The initial migration enabled RLS and created policies but granted no table
privileges at all. RLS and `GRANT` are two independent gates and a request must
pass both, so *every* request failed before RLS was consulted — including
`service_role`:

```text
42501: permission denied for table repos
  hint: Grant the required privileges to the current role with:
        GRANT SELECT ON public.repos TO service_role;
```

Tables created through the Supabase dashboard get these grants implicitly; tables
created by a raw SQL migration do not. This was invisible because the tables
existed, `supabase gen types` worked, and the dashboard pages were placeholders
that never issued a query. Fixed in
`supabase/migrations/20260810130000_grant_table_privileges.sql`, which also sets
`alter default privileges` so a future table cannot silently reintroduce it.

### Why `anon` stays closed

The publishable key ships in the browser bundle — it is public by design, and RLS
is what protects the data behind it. These tables hold a map of a private design
system: component names, `file_path`, `line_number`, ownership. Granting `anon`
read access would publish all of it to anyone who loads the dashboard.

So reads go through `server/api/*` using `createVantraServiceClient()`. The
browser never receives a key that can read these tables.

**Follow-up.** `authenticated` currently has blanket access via
`using (true)`. Scope per organisation/repository once real auth exists, at which
point some reads can move back to the client.

---

## 6a. Never provide `SUPABASE_SERVICE_ROLE_KEY` at build time

**Decision.** The secret key is a **runtime** variable only.

`@nuxtjs/supabase` reads it into *private* `runtimeConfig.supabase.secretKey`.
That never reaches the browser — verified by grepping `.output/public` for the key
value, which is absent. But Nitro **inlines runtimeConfig into the server bundle
at build time**, so building with the variable set bakes the secret into
`.output/` (and therefore into the Turborepo cache artifact):

```json
"supabase": { "serviceKey": "", "secretKey": "sb_secret_..." }
```

The build artifact then becomes a credential. CI is unaffected because it builds
without any Supabase environment at all. Supply the key to the *running server*
instead, and treat any artifact built with it as sensitive.

Note that `server/api/*` reads `process.env` per request through
`createVantraServiceClient()`, so it does not depend on the baked value.

---

## 7. Placeholder tools implement a real interface

**Decision.** Each of the five packages exports a `GovernanceTool` whose `run()`
returns an empty `ToolResult`, rather than a bare `export const name = '...'`.

This makes the CI runner writable before any tool has logic, and means each
follow-up task fills in a body against a fixed contract instead of also having to
design the seam. The Zod schemas in `packages/shared/src/schemas.ts` are the
contract; `confidence` defaults to `1` so purely static AST findings do not have
to think about it.

---

## 8. Node 24, pinned via `.nvmrc` and `engines`

**Decision.** `.nvmrc` is `24`; `engines.node` is `>=24.0.0`.

Node 24 is the current Active LTS. Note that `@vantra-design/core` declares
`>=18.18.0` — it is deliberately more permissive because it is a published
library consumed by other people's repos, whereas this monorepo controls its own
runtime.

---

## 9. Tailwind v4 via `@tailwindcss/vite`, not `@nuxtjs/tailwindcss`

**Decision.** Register Tailwind as a Vite plugin in `nuxt.config.ts`.

`@nuxtjs/tailwindcss` targets Tailwind v3 and brings the PostCSS pipeline and a
`tailwind.config.js` with it. Under v4 the theme lives in CSS
(`app/assets/css/main.css`, via `@theme inline`), and there is no JS config file
at all. Mixing the two is the most common way to end up with a broken v4 setup.

---

## 10. i18n: English complete, German partial

**Decision.** `strategy: 'no_prefix'`, `defaultLocale: 'en'`, both catalogues
present but `de.json` covers only the shell.

The brief asked for a scaffold, not a translation. Untranslated keys fall back to
English, so the German locale is usable immediately and can be filled in
incrementally without a code change. Routes stay unprefixed because the
alternative changes every URL for a feature that is not finished.
