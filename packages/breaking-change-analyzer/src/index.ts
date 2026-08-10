/**
 * `@vantra-design/breaking-change-analyzer` — PLACEHOLDER.
 *
 * The API-diffing logic lands in a dedicated follow-up task. What exists here is
 * the shape the CI runner depends on: a `GovernanceTool` that accepts the shared
 * `AnalysisContext` and returns a `ToolResult`.
 *
 * @packageDocumentation
 */

import type { GovernanceTool, ToolResult } from '@vantra-design/governance-shared'
import type { AnalysisContext } from '@vantra-design/governance-shared/core'

export const TOOL_ID = 'breaking-change-analyzer' as const

/**
 * Breaking-change analyzer. Currently a no-op that reports zero findings so the
 * suite can be wired end to end before the implementation exists.
 */
export const breakingChangeAnalyzer: GovernanceTool<AnalysisContext> = {
  id: TOOL_ID,
  run(_context: AnalysisContext): ToolResult {
    // TODO(breaking-change-analyzer): diff the base and head component APIs from
    // `_context`, classify each removal/signature change, and resolve the
    // affected consumer call sites into `consumerImpacts`.
    return { tool: TOOL_ID, findings: [], consumerImpacts: [], durationMs: 0 }
  },
}

export default breakingChangeAnalyzer
