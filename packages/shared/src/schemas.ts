/**
 * The wire contract between the five governance tools and the dashboard.
 *
 * Each tool emits an {@link AnalysisRunPayload} at the end of a CI run; the
 * dashboard reads rows written from that payload. Validating with Zod on both
 * sides means a tool cannot silently ship a shape the dashboard cannot render.
 */

import { z } from 'zod'

/** Identifier of each tool in the suite. Mirrors the `findings.tool` enum in Postgres. */
export const toolIdSchema = z.enum([
  'health-cli',
  'breaking-change-analyzer',
  'deprecation-orchestrator',
  'zero-usage-gate',
  'ownership-mapper',
])

export type ToolId = z.infer<typeof toolIdSchema>

/** All tool ids, in the order they are displayed in the dashboard. */
export const TOOL_IDS = toolIdSchema.options

/**
 * Tool selected by default in the dashboard.
 *
 * Declared explicitly rather than as `TOOL_IDS[0]`, which `noUncheckedIndexedAccess`
 * widens to `ToolId | undefined`.
 */
export const DEFAULT_TOOL_ID: ToolId = 'health-cli'

/** Human-readable labels, used for dashboard tabs and CI summaries. */
export const TOOL_LABELS: Record<ToolId, string> = {
  'health-cli': 'Health',
  'breaking-change-analyzer': 'Breaking Changes',
  'deprecation-orchestrator': 'Deprecations',
  'zero-usage-gate': 'Zero-Usage',
  'ownership-mapper': 'Ownership',
}

/** Role a repository plays in the analysis. */
export const repoRoleSchema = z.enum(['design_system', 'consumer'])
export type RepoRole = z.infer<typeof repoRoleSchema>

/** Lifecycle of a single analysis run. */
export const analysisRunStatusSchema = z.enum([
  'pending',
  'running',
  'succeeded',
  'failed',
])
export type AnalysisRunStatus = z.infer<typeof analysisRunStatusSchema>

/** Severity ladder shared by every tool so findings can be sorted globally. */
export const severitySchema = z.enum(['info', 'low', 'medium', 'high', 'critical'])
export type Severity = z.infer<typeof severitySchema>

/** A single location in a consumer repository. */
export const sourceRefSchema = z.object({
  filePath: z.string().min(1),
  lineNumber: z.number().int().positive().nullable().default(null),
})
export type SourceRef = z.infer<typeof sourceRefSchema>

/**
 * One observation produced by a tool.
 *
 * `type` is intentionally a free-form string: each tool owns its own taxonomy
 * (e.g. `removed-prop` for the breaking-change analyzer, `orphan-component` for
 * the zero-usage gate) and the dashboard renders it as a label without needing
 * to know the full set up front.
 */
export const findingSchema = z.object({
  tool: toolIdSchema,
  type: z.string().min(1),
  severity: severitySchema,
  description: z.string().min(1),
  /** 0..1 — how sure the tool is. Static AST results should report 1. */
  confidence: z.number().min(0).max(1).default(1),
})
export type Finding = z.infer<typeof findingSchema>

/** How a change in the design system lands in one specific consumer repo. */
export const consumerImpactSchema = z.object({
  consumerRepoId: z.string().uuid(),
  affectedExport: z.string().min(1),
  filePath: z.string().min(1),
  lineNumber: z.number().int().positive().nullable().default(null),
})
export type ConsumerImpact = z.infer<typeof consumerImpactSchema>

/**
 * The complete result of one analysis pass, aggregated across all five tools.
 *
 * Produced once per PR: the component graph is parsed a single time via
 * `@vantra-design/core`, each tool contributes its findings, and the whole
 * payload is persisted in one transaction.
 */
export const analysisRunPayloadSchema = z.object({
  repoId: z.string().uuid(),
  prNumber: z.number().int().positive().nullable().default(null),
  status: analysisRunStatusSchema,
  findings: z.array(findingSchema).default([]),
  consumerImpacts: z.array(consumerImpactSchema).default([]),
  /** Milliseconds spent in the shared `@vantra-design/core` parse. */
  parseDurationMs: z.number().nonnegative().optional(),
  /** Which tools actually ran, so partial passes are distinguishable from clean ones. */
  toolsRun: z.array(toolIdSchema).default([]),
})
export type AnalysisRunPayload = z.infer<typeof analysisRunPayloadSchema>

/**
 * The slice of an analysis run a single tool returns.
 *
 * The runner merges five of these into one {@link AnalysisRunPayload}.
 */
export const toolResultSchema = z.object({
  tool: toolIdSchema,
  findings: z.array(findingSchema).default([]),
  consumerImpacts: z.array(consumerImpactSchema).default([]),
  durationMs: z.number().nonnegative().optional(),
})
export type ToolResult = z.infer<typeof toolResultSchema>

/**
 * Contract every tool package implements, so the CI runner can invoke all five
 * uniformly over one shared analysis context.
 */
export interface GovernanceTool<TContext = unknown, TOptions = unknown> {
  readonly id: ToolId
  run(context: TContext, options?: TOptions): Promise<ToolResult> | ToolResult
}
