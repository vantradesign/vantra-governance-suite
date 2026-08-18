# Governance Dashboard

Shared UI for the five Vantra governance tools.

Nuxt 4 · Tailwind CSS v4 · shadcn-vue (reka-ui) · Supabase · i18n (en/de)

## Running it

From the monorepo root:

```bash
pnpm dev            # http://localhost:3000
```

Requires the Supabase credentials in `.env` — copy `.env.example` and fill in the
values from `supabase status`. See the [root README](../../README.md) for full
local-database setup.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the built output |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `nuxt typecheck` |
| `pnpm test` | Vitest |

## Security

The dashboard is a private operator surface, not a public site:

- `X-Robots-Tag: noindex, nofollow` is set on every route.
- `style-src 'unsafe-inline'` is required by shadcn/reka-ui for floating
  element positioning.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only via `useRuntimeConfig()` — never
  exposed at build time.

## License

[AGPL-3.0](../../LICENSE)
