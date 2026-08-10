/**
 * `@vantra-design/ownership-mapper` — PLACEHOLDER.
 *
 * The ownership-resolution logic lands in a dedicated follow-up task. What exists
 * here is the shape the CI runner depends on: a `GovernanceTool` that accepts the
 * shared `AnalysisContext` and returns a `ToolResult`.
 *
 * @packageDocumentation
 */

import type { AnalysisContext, GovernanceTool, ToolResult } from '@vantra-design/governance-shared'

export const TOOL_ID = 'ownership-mapper' as const

/**
 * Ownership mapper. Currently a no-op that reports zero findings so the suite can
 * be wired end to end before the implementation exists.
 */
export const ownershipMapper: GovernanceTool<AnalysisContext> = {
  id: TOOL_ID,
  run(_context: AnalysisContext): ToolResult {
    // TODO(ownership-mapper): resolve every node in `_context.graph` against
    // CODEOWNERS and report unowned or ambiguously owned surface area.
    return { tool: TOOL_ID, findings: [], consumerImpacts: [], durationMs: 0 }
  },
}

export default ownershipMapper
