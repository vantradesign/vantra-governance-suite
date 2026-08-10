/**
 * `@vantra-design/governance-shared` — the single dependency every workspace in
 * this monorepo has in common.
 *
 * It provides three things:
 *
 * 1. The `@vantra-design/core` wrapper (`./core`) that builds the one shared
 *    component graph per analysis pass.
 * 2. The Zod contract (`./schemas`) that the five tools write and the dashboard
 *    reads.
 * 3. The typed Supabase client factory (`./supabase`) plus the generated
 *    database types.
 *
 * @packageDocumentation
 */

export * from './core'
export * from './schemas'
export * from './supabase'

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from './types/database'
