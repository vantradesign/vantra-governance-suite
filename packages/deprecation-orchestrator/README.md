# `@vantra-design/deprecation-orchestrator`

> **Status: placeholder.** Only the `GovernanceTool` shape exists. The lifecycle
> logic arrives in a dedicated follow-up task.

## What this tool will do

Turn deprecation from a JSDoc comment nobody reads into a tracked, time-boxed
migration.

Planned behaviour:

1. Collect `@deprecated` markers on components, props and tokens from the shared
   `AnalysisContext`.
2. Attach a lifecycle to each one — announced, in migration, past deadline — with
   the target removal version.
3. Count remaining consumer usage per deprecated export, so a removal is only
   green-lit once usage reaches zero.
4. Escalate severity as a deadline approaches, and fail CI on usage of anything
   already past its removal date.

## Output

A `ToolResult` with `tool: 'deprecation-orchestrator'`, one `finding` per
deprecated export still in use, and `consumerImpacts` for the call sites that
still need migrating.

## Usage (planned)

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared/core'
import { deprecationOrchestrator } from '@vantra-design/deprecation-orchestrator'

const result = await deprecationOrchestrator.run(createAnalysisContext(process.cwd()))
```
