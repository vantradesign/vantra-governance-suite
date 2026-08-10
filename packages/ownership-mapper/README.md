# `@vantra-design/ownership-mapper`

> **Status: placeholder.** Only the `GovernanceTool` shape exists. The resolution
> logic arrives in a dedicated follow-up task.

## What this tool will do

Make sure every component and token has a name attached to it, so that a breaking
change or a deprecation has somebody to route to.

Planned behaviour:

1. Resolve every node in the shared component graph against `CODEOWNERS` (and, if
   present, an explicit ownership manifest).
2. Flag unowned surface area, and surface area with so many owners that ownership
   is effectively undefined.
3. Enrich the findings of the other four tools with an owner, so the dashboard can
   group a report by team rather than by file.
4. Report ownership concentration — a bus-factor signal per area of the system.

## Output

A `ToolResult` with `tool: 'ownership-mapper'` and one `finding` per unowned or
ambiguously owned export.

## Usage (planned)

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared/core'
import { ownershipMapper } from '@vantra-design/ownership-mapper'

const result = await ownershipMapper.run(createAnalysisContext(process.cwd()))
```
