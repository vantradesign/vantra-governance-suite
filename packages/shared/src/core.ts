/**
 * The single entry point through which this monorepo touches
 * `@vantra-design/core`.
 *
 * Rationale: all five governance tools run in the same analysis pass against the
 * same consumer repository, so the component graph must be parsed exactly once
 * and then handed to every tool. Funnelling the core imports through this module
 * gives us one place to
 *
 * - enforce that nobody re-implements AST parsing / graph building / token
 *   parsing locally (see `CONTRIBUTING.md`),
 * - memoize the expensive parse for the duration of a CI run,
 * - swap the local `link:` checkout for the published package without touching
 *   any call site.
 *
 * Never import `@vantra-design/core` directly from a tool package or from the
 * dashboard — always go through here.
 */

import {
  buildComponentGraph,
  parseComponents,
  parseTokenSchema,
  DEFAULT_EXCLUDE_PATTERNS,
} from '@vantra-design/core'

export {
  buildComponentGraph,
  parseComponents,
  parseTokenSchema,
  DEFAULT_EXCLUDE_PATTERNS,
}

export type {
  ComponentGraph,
  ComponentGraphData,
  ComponentGraphEdge,
  ComponentGraphIndex,
  ComponentGraphNode,
  ComponentKind,
  DesignToken,
  ExportedFunction,
  ExportedType,
  ExportedTypeKind,
  ExportedValue,
  FunctionParameter,
  GraphEdgeKind,
  GraphNodeKind,
  GraphQueryOptions,
  GraphWarning,
  ModuleReference,
  ParseComponentsOptions,
  ParsedComponent,
  ParseTokenSchemaOptions,
  PropDefinition,
  SourceLocation,
  TokenCategory,
  TokenParseWarning,
  TokenSchema,
  TokenSourceFile,
  TokenSourceFormat,
  TokenVariant,
  TypeMember,
} from '@vantra-design/core'

import type {
  ComponentGraph,
  ParseComponentsOptions,
  ParsedComponent,
} from '@vantra-design/core'

/**
 * The result of the one-and-only parsing pass over a consumer repository.
 *
 * A single `AnalysisContext` is built at the start of a CI run and passed by
 * reference into each of the five tools, which keeps the cost of AST parsing
 * linear in repositories rather than linear in tools.
 */
export interface AnalysisContext {
  /** Absolute path of the repository that was parsed. */
  readonly repoRoot: string
  /** Every component discovered in `repoRoot`. */
  readonly components: readonly ParsedComponent[]
  /** Dependency graph derived from `components`, with reverse lookups. */
  readonly graph: ComponentGraph
  /** Wall-clock milliseconds the parse took, for CI reporting. */
  readonly parseDurationMs: number
}

/**
 * Parse a repository once and produce the {@link AnalysisContext} shared by all
 * five governance tools.
 *
 * `parseComponents` from `@vantra-design/core` is synchronous, so this is too.
 * Results are memoized per `repoRoot` + options for the lifetime of the process,
 * so a task graph that fans out to five tools still pays for exactly one parse.
 */
const contextCache = new Map<string, AnalysisContext>()

export function createAnalysisContext(
  repoRoot: string,
  options: ParseComponentsOptions = {},
): AnalysisContext {
  const cacheKey = `${repoRoot}::${JSON.stringify(options)}`

  const cached = contextCache.get(cacheKey)
  if (cached) return cached

  const startedAt = Date.now()
  const components = parseComponents(repoRoot, options)
  const graph = buildComponentGraph(components)

  const context: AnalysisContext = {
    repoRoot,
    components,
    graph,
    parseDurationMs: Date.now() - startedAt,
  }

  contextCache.set(cacheKey, context)
  return context
}

/** Clear the memoized contexts. Intended for tests and long-lived workers. */
export function clearAnalysisContextCache(): void {
  contextCache.clear()
}
