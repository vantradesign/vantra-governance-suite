/**
 * Re-export only. The generated Supabase schema types live in
 * `packages/shared/src/types/database.ts` and are produced by
 * `pnpm run db:types` at the repo root.
 *
 * `@nuxtjs/supabase` needs a path inside the app directory to type its own
 * client, so this file bridges to the shared package rather than duplicating the
 * generated output.
 */

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from '@vantra-design/governance-shared'
