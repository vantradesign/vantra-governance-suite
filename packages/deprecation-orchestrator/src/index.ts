/**
 * `@vantra-design/deprecation-orchestrator` — PLACEHOLDER.
 *
 * The lifecycle-tracking logic lands in a dedicated follow-up task. What exists
 * here is the shape the CI runner depends on: a `GovernanceTool` that accepts the
 * shared `AnalysisContext` and returns a `ToolResult`.
 *
 * @packageDocumentation
 */

import type { AnalysisContext, GovernanceTool, ToolResult } from '@vantra-design/governance-shared'

export const TOOL_ID = 'deprecation-orchestrator' as const

/**
 * Deprecation orchestrator. Currently a no-op that reports zero findings so the
 * suite can be wired end to end before the implementation exists.
 */
export const deprecationOrchestrator: GovernanceTool<AnalysisContext> = {
  id: TOOL_ID,
  run(_context: AnalysisContext): ToolResult {
    // TODO(deprecation-orchestrator): read `@deprecated` markers from
    // `_context.components`, track each one against its removal deadline, and
    // report remaining consumer usage as migration work.
    return { tool: TOOL_ID, findings: [], consumerImpacts: [], durationMs: 0 }
  },
}

export default deprecationOrchestrator
