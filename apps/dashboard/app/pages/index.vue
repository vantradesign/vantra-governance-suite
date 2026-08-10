<script setup lang="ts">
import { TOOL_IDS, type ToolId } from '@vantra-design/governance-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const { t } = useI18n()

useHead({ title: `${t('overview.title')} · Vantra` })

/**
 * Placeholder view. Once the CI runner persists analysis runs, this reads the
 * latest run per repository from Supabase and renders one card per tool.
 */
const tools = computed(() =>
  TOOL_IDS.map((id: ToolId) => ({
    id,
    label: t(`tools.${id}`),
  })),
)
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('overview.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ t('overview.subtitle') }}</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="tool in tools" :key="tool.id">
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-base">{{ tool.label }}</CardTitle>
            <Badge variant="secondary">{{ t('common.placeholder') }}</Badge>
          </div>
          <CardDescription>{{ tool.id }}</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-3xl font-semibold tabular-nums text-muted-foreground">&mdash;</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t('overview.emptyTitle') }}</CardTitle>
        <CardDescription>{{ t('overview.emptyBody') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button as-child>
          <NuxtLink to="/repos">{{ t('overview.emptyAction') }}</NuxtLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
