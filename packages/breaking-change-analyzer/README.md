# `@vantra-design/breaking-change-analyzer`

> **Status: placeholder.** Only the `GovernanceTool` shape exists. The full
> implementation is the next scheduled follow-up task for this repository.

## What this tool will do

Answer the question a design-system maintainer asks on every PR: *if I merge
this, what breaks downstream?*

Planned behaviour:

1. Build the public API surface of the design system at the **base** and **head**
   revisions, using `parseComponents` from `@vantra-design/core` via the shared
   `AnalysisContext`.
2. Diff the two surfaces and classify each change — removed export, removed or
   renamed prop, narrowed prop type, changed required-ness, changed function
   signature, removed token.
3. Resolve each breaking change against the component graph of every registered
   consumer repository to produce concrete call sites.
4. Assign a severity, and fail CI above a configurable threshold.

## Output

A `ToolResult` with `tool: 'breaking-change-analyzer'`, one `finding` per
classified API change, and one `consumerImpact` per affected call site
(`affectedExport`, `filePath`, `lineNumber`).

## Usage (planned)

```ts
import { createAnalysisContext } from '@vantra-design/governance-shared'
import { breakingChangeAnalyzer } from '@vantra-design/breaking-change-analyzer'

const result = await breakingChangeAnalyzer.run(createAnalysisContext(process.cwd()))
```
