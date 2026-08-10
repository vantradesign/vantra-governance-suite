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
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      return [
        table,
        error ? { ok: false, code: error.code, message: error.message } : { ok: true, rows: count ?? 0 },
      ] as const
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
