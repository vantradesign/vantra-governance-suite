import { createVantraServiceClient } from '@vantra-design/governance-shared'

/**
 * Database connectivity probe.
 *
 * Reports whether the configured Supabase project is reachable and whether the
 * migrations have actually been applied to it. Worth having because an
 * unmigrated project fails in a confusing way: PostgREST answers 404
 * `PGRST205 - Could not find the table` rather than a connection error.
 */
export default defineEventHandler(async () => {
  const tables = ['repos', 'analysis_runs', 'findings', 'consumer_impacts'] as const

  let supabase: ReturnType<typeof createVantraServiceClient>
  try {
    supabase = createVantraServiceClient()
  } catch (error) {
    return {
      ok: false,
      reason: 'missing-credentials',
      detail: error instanceof Error ? error.message : String(error),
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
        return [table, { ok: false, code: error.code, message: error.message }] as const
      }

      // Belt and braces: a successful response must carry a numeric count. A null
      // count means the request did not actually reach a real table.
      if (typeof count !== 'number') {
        return [
          table,
          { ok: false, code: 'NO_COUNT', message: 'Query returned no row count; table may not exist.' },
        ] as const
      }

      return [table, { ok: true, rows: count }] as const
    }),
  )

  const tableStatus = Object.fromEntries(results)
  const ok = results.every(([, status]) => status.ok)

  return {
    ok,
    url: process.env.SUPABASE_URL ?? null,
    reason: ok ? null : 'schema-or-privileges',
    tables: tableStatus,
  }
})
