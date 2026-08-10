/**
 * `@vantra-design/governance-shared` — the single dependency every workspace in
 * this monorepo has in common.
 *
 * This root entry point is **browser-safe**: it carries the Zod contract, the
 * typed Supabase client factory and the generated database types, and the
 * dashboard imports from here.
 *
 * The `@vantra-design/core` wrapper is deliberately *not* re-exported. Core pulls
 * in `ts-morph`, `fast-glob` and `@vue/compiler-sfc`, which are Node-only; adding
 * them here would drag the entire AST toolchain into the browser bundle and fail
 * the Nuxt build. Tool packages that need the shared component graph import it
 * explicitly:
 *
 * ```ts
 * import { createAnalysisContext } from '@vantra-design/governance-shared/core'
 * ```
 *
 * @packageDocumentation
 */

export * from './schemas'
export * from './supabase'

export type { Database, Json, Tables, TablesInsert, TablesUpdate } from './types/database'
