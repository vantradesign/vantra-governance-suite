import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Authorisation gate for every route that touches the service-role client.
 *
 * [Security] The service-role key bypasses RLS and holds full table privileges
 * (see `supabase/migrations/*_grant_table_privileges.sql`). Moving reads from the
 * browser to the server removed the `anon` restriction without putting anything
 * in its place, which made these routes an unauthenticated read of a private
 * design system. This restores the missing gate.
 *
 * Deny by default: no session means 401, and the service client is never
 * constructed. Call this as the FIRST statement of any handler under
 * `server/api/`, before creating a client.
 *
 * There is no login page yet, so the dashboard will return 401 until one lands —
 * that is the correct failure direction. For local work against a seeded stack,
 * set `DASHBOARD_ALLOW_ANONYMOUS=true` in `.env`; it is honoured only when Nuxt
 * is running in dev mode, so it cannot weaken a deployed build even if the
 * variable leaks into a production environment.
 */
export async function requireDashboardUser(event: H3Event): Promise<void> {
  if (import.meta.dev && process.env.DASHBOARD_ALLOW_ANONYMOUS === 'true') return

  const user = await serverSupabaseUser(event).catch(() => null)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }
}
