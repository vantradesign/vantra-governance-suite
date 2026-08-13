import { createVantraServiceClient } from '@vantra-design/governance-shared'

import { requireDashboardUser } from '../../utils/requireDashboardUser'

/**
 * Database connectivity probe.
 *
 * Reports whether the configured Supabase project is reachable and whether the
 * migrations have actually been applied to it. Worth having because an
 * unmigrated project fails in a confusing way: PostgREST answers 404
 * `PGRST205 - Could not find the table` rather than a connection error.
 *
 * [Security] Authenticated-only, and deliberately terse. An open probe that
 * reports the project URL, which tables exist and how many rows they hold is an
 * infrastructure and schema map. Diagnostic detail goes to the server log; the
 * response carries only what an operator needs to see in the UI.
 */
export default defineEventHandler(async (event) => {
  await requireDashboardUser(event)

  const tables = ['repos', 'analysis_runs', 'findings', 'consumer_impacts'] as const

  let supabase: ReturnType<typeof createVantraServiceClient>
  try {
    supabase = createVantraServiceClient()
  } catch (error) {
    console.error(
      '[api/health/db] Missing Supabase credentials:',
      error instanceof Error ? error.message : String(error),
    )

    return {
      ok: false,
      reason: 'missing-credentials' as const,
      tables: {},
    }
  }

  const results = await Promise.all(
    tables.map(async (table) => {
      // Deliberately NOT `{ head: true }`. PostgREST answers a HEAD request for a
      // table that does not exist with `204 No Content` and no error body, so
      // supabase-js reports `error: null, count: null` — which made this probe
      // pass against a completely unmigrated project. A real GET returns the
      // expected `404 PGRST205`.
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact' })
        .limit(1)

      if (error) {
        console.error(`[api/health/db] ${table}:`, error.code, error.message)
        return [table, { ok: false }] as const
      }

      // Belt and braces: a successful response must carry a numeric count. A null
      // count means the request did not actually reach a real table.
      if (typeof count !== 'number') {
        console.error(
          `[api/health/db] ${table}: query returned no row count; table may not exist.`,
        )
        return [table, { ok: false }] as const
      }

      return [table, { ok: true }] as const
    }),
  )

  const tableStatus = Object.fromEntries(results)
  const ok = results.every(([, status]) => status.ok)

  return {
    ok,
    reason: ok ? null : ('schema-or-privileges' as const),
    tables: tableStatus,
  }
})
