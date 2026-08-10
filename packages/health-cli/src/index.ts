/**
 * `@vantra-design/health-cli` — PLACEHOLDER.
 *
 * The scoring logic lands in a dedicated follow-up task. What exists here is the
 * shape the CI runner depends on: a `GovernanceTool` that accepts the shared
 * `AnalysisContext` and returns a `ToolResult`.
 *
 * @packageDocumentation
 */

import type { GovernanceTool, ToolResult } from '@vantra-design/governance-shared'
import type { AnalysisContext } from '@vantra-design/governance-shared/core'

export const TOOL_ID = 'health-cli' as const

/**
 * Health scorer. Currently a no-op that reports zero findings so the suite can be
 * wired end to end before the implementation exists.
 */
export const healthCli: GovernanceTool<AnalysisContext> = {
  id: TOOL_ID,
  run(_context: AnalysisContext): ToolResult {
    // TODO(health-cli): score adoption, token drift, orphaned components and API
    // churn from `_context.graph` and emit one finding per dimension.
    return { tool: TOOL_ID, findings: [], consumerImpacts: [], durationMs: 0 }
  },
}

export default healthCli
