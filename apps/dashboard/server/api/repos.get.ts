import { createVantraServiceClient } from '@vantra-design/governance-shared'

/**
 * List configured repositories.
 *
 * Runs server-side with the service-role key. The browser never receives a key
 * that can read these tables — `anon` is granted no table privileges on purpose,
 * because the publishable key is public and these rows describe a private design
 * system. See `supabase/migrations/*_grant_table_privileges.sql`.
 */
export default defineEventHandler(async () => {
  const supabase = createVantraServiceClient()

  const { data, error } = await supabase
    .from('repos')
    .select('id, name, github_url, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load repositories',
      data: { code: error.code, message: error.message },
    })
  }

  return data
})
