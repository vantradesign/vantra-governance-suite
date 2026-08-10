/**
 * `@vantra-design/zero-usage-gate` — PLACEHOLDER.
 *
 * The gating logic lands in a dedicated follow-up task. What exists here is the
 * shape the CI runner depends on: a `GovernanceTool` that accepts the shared
 * `AnalysisContext` and returns a `ToolResult`.
 *
 * @packageDocumentation
 */

import type { AnalysisContext, GovernanceTool, ToolResult } from '@vantra-design/governance-shared'

export const TOOL_ID = 'zero-usage-gate' as const

/**
 * Zero-usage gate. Currently a no-op that reports zero findings so the suite can
 * be wired end to end before the implementation exists.
 */
export const zeroUsageGate: GovernanceTool<AnalysisContext> = {
  id: TOOL_ID,
  run(_context: AnalysisContext): ToolResult {
    // TODO(zero-usage-gate): walk the reverse edges of `_context.graph` to find
    // exports with no inbound consumer usage and fail the run above a threshold.
    return { tool: TOOL_ID, findings: [], consumerImpacts: [], durationMs: 0 }
  },
}

export default zeroUsageGate
