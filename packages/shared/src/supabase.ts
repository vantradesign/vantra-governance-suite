/**
 * Typed Supabase client factory.
 *
 * Everything in the suite — the dashboard, the CI runner and any future worker —
 * obtains its client from here so that the generated `Database` types are always
 * applied and credentials are read from one place. Do not call
 * `createClient()` from `@supabase/supabase-js` anywhere else.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './types/database'

/** A `SupabaseClient` already bound to our generated schema types. */
export type VantraSupabaseClient = SupabaseClient<Database>

export interface SupabaseCredentials {
  url: string
  key: string
}

export class MissingSupabaseCredentialsError extends Error {
  constructor(missing: readonly string[]) {
    super(
      `Missing Supabase credentials: ${missing.join(', ')}. ` +
        'Copy apps/dashboard/.env.example to .env and fill in the values from `supabase status`.',
    )
    this.name = 'MissingSupabaseCredentialsError'
  }
}

/**
 * Read credentials from the environment.
 *
 * Used by CLI tools and CI. The Nuxt app passes its runtime config explicitly to
 * {@link createVantraSupabaseClient} instead, because `process.env` is not
 * available in the browser bundle.
 */
export function readSupabaseCredentialsFromEnv(
  env: Record<string, string | undefined> = process.env,
): SupabaseCredentials {
  const url = env.SUPABASE_URL
  const key = env.SUPABASE_KEY ?? env.SUPABASE_ANON_KEY

  const missing: string[] = []
  if (!url) missing.push('SUPABASE_URL')
  if (!key) missing.push('SUPABASE_KEY')
  if (!url || !key) throw new MissingSupabaseCredentialsError(missing)

  return { url, key }
}

/**
 * Create a typed client. Prefer this over `createClient` so the `Database`
 * generic is never forgotten.
 */
export function createVantraSupabaseClient(
  credentials: SupabaseCredentials,
): VantraSupabaseClient {
  return createClient<Database>(credentials.url, credentials.key, {
    auth: {
      // Tool packages run headless in CI; there is no browser session to persist.
      persistSession: false,
    },
  })
}

/** Convenience wrapper for headless contexts (CI tools, scripts). */
export function createVantraSupabaseClientFromEnv(
  env: Record<string, string | undefined> = process.env,
): VantraSupabaseClient {
  return createVantraSupabaseClient(readSupabaseCredentialsFromEnv(env))
}
