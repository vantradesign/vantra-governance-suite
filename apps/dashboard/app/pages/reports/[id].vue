<script setup lang="ts">
import { DEFAULT_TOOL_ID, TOOL_IDS, type Tables, type ToolId } from '@vantra-design/governance-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const route = useRoute()
const { t } = useI18n()

const runId = computed(() => String(route.params.id))

useHead({ title: `${t('report.title')} ${runId.value} · Vantra` })

/** One tab per tool, so a single run is readable tool by tool. */
const activeTool = ref<ToolId>(DEFAULT_TOOL_ID)

/**
 * Placeholder view: typed against the generated `findings` row shape, empty
 * until the CI runner writes results.
 */
const findings = ref<Tables<'findings'>[]>([])

const visibleFindings = computed(() =>
  findings.value.filter((finding) => finding.tool === activeTool.value),
)

const severityVariant = (severity: Tables<'findings'>['severity']) =>
  severity === 'critical' || severity === 'high' ? 'destructive' : 'secondary'
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">{{ t('report.title') }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ t('report.runId') }} <code class="font-mono">{{ runId }}</code>
        </p>
      </div>

      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline" size="sm">{{ t('common.comingSoon') }}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ t('common.comingSoon') }}</DialogTitle>
            <DialogDescription>
              Raw analysis payloads and consumer impacts will be shown here once the
              five tools are implemented.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>

    <div class="flex flex-wrap gap-1 border-b border-border pb-2">
      <button
        v-for="tool in TOOL_IDS"
        :key="tool"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm transition-colors"
        :class="
          tool === activeTool
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeTool = tool"
      >
        {{ t(`tools.${tool}`) }}
      </button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t(`tools.${activeTool}`) }}</CardTitle>
        <CardDescription>{{ activeTool }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('report.columns.type') }}</TableHead>
              <TableHead>{{ t('report.columns.severity') }}</TableHead>
              <TableHead>{{ t('report.columns.description') }}</TableHead>
              <TableHead class="text-right">{{ t('report.columns.confidence') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty v-if="visibleFindings.length === 0" :colspan="4">
              {{ t('report.empty') }}
            </TableEmpty>
            <TableRow v-for="finding in visibleFindings" :key="finding.id">
              <TableCell class="font-medium">{{ finding.type }}</TableCell>
              <TableCell>
                <Badge :variant="severityVariant(finding.severity)">
                  {{ finding.severity }}
                </Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ finding.description }}</TableCell>
              <TableCell class="text-right tabular-nums">{{ finding.confidence }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
