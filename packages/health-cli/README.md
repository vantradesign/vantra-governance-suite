# `@vantra-design/health-cli`

> **Status: placeholder.** Only the `GovernanceTool` shape exists. The scoring
> logic arrives in a dedicated follow-up task.

## What this tool will do

Produce a single, trendable health score for a design system, so that "is the
system getting better or worse?" has a number behind it rather than a vibe.

Planned dimensions, all derived from the shared `AnalysisContext`:

- **Adoption** — share of consumer UI built from design-system components versus
  bespoke local markup.
- **Token drift** — hard-coded colours, spacing and typography values in consumer
  code where a token exists.
- **Orphaned surface** — exported components with no consumer usage (overlaps with
  `zero-usage-gate`, which gates; this one only scores).
- **API churn** — how often the public API changes, as a stability signal.

## Output

A `ToolResult` with `tool: 'health-cli'`, one `finding` per dimension that falls
below its configured threshold, and the aggregate score in the description.

## Usage (planned)

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared'
import { healthCli } from '@vantra-design/health-cli'

const result = await healthCli.run(createAnalysisContext(process.cwd()))
```
