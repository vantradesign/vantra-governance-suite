# `@vantra-design/zero-usage-gate`

> **Status: placeholder.** Only the `GovernanceTool` shape exists. The gating
> logic arrives in a dedicated follow-up task.

## What this tool will do

Stop a design system from accumulating surface area nobody uses. Every unused
export is documentation to write, tests to maintain and a breaking change waiting
to happen for no benefit.

Planned behaviour:

1. Walk the reverse edges of the shared component graph to find design-system
   exports with zero inbound usage from any registered consumer repository.
2. Distinguish *never adopted* (shipped, never used) from *abandoned* (usage
   dropped to zero) — the two call for different responses.
3. Respect an allowlist for intentionally public-but-unused API.
4. Fail CI when a PR adds new public surface that no consumer picks up within a
   configured grace period.

## Output

A `ToolResult` with `tool: 'zero-usage-gate'` and one `finding` per unused export,
severity scaled by how long it has been unused.

## Usage (planned)

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared/core'
import { zeroUsageGate } from '@vantra-design/zero-usage-gate'

const result = await zeroUsageGate.run(createAnalysisContext(process.cwd()))
```
