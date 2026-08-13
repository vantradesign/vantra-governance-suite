import { createVantraServiceClient } from '@vantra-design/governance-shared'

import { requireDashboardUser } from '../utils/requireDashboardUser'

/**
 * List configured repositories.
 *
 * Runs server-side with the service-role key. The browser never receives a key
 * that can read these tables — `anon` is granted no table privileges on purpose,
 * because the publishable key is public and these rows describe a private design
 * system. See `supabase/migrations/*_grant_table_privileges.sql`.
 *
 * [Security] The service-role key bypasses RLS, so the authorisation check that
 * `anon` used to provide has to happen here instead. It runs before the client
 * is constructed, so an unauthenticated request never reaches Supabase.
 */
export default defineEventHandler(async (event) => {
  await requireDashboardUser(event)

  const supabase = createVantraServiceClient()

  const { data, error } = await supabase
    .from('repos')
    .select('id, name, github_url, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    // [Security] Detail stays in the server log. PostgREST error codes and
    // messages describe the schema, which is not the client's business.
    console.error('[api/repos] Supabase query failed:', error.code, error.message)

    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load repositories',
    })
  }

  return data
})
