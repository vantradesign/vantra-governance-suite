<script setup lang="ts">
import { severitySchema } from '@vantra-design/governance-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const { t } = useI18n()

useHead({ title: `${t('settings.title')} · Vantra` })

/**
 * UI scaffold only — nothing is persisted yet. The severity options come from the
 * shared Zod schema so this form cannot drift from what the tools emit.
 */
const modelProviders = ['openai', 'anthropic', 'none'] as const
const modelProvider = ref<(typeof modelProviders)[number]>('none')

const severities = severitySchema.options
const failOn = ref<(typeof severities)[number]>('high')
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('settings.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ t('settings.subtitle') }}</p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t('settings.modelProvider') }}</CardTitle>
        <CardDescription>{{ t('settings.modelProviderHint') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="provider in modelProviders"
            :key="provider"
            type="button"
            class="rounded-md border px-3 py-1.5 text-sm transition-colors"
            :class="
              provider === modelProvider
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            "
            @click="modelProvider = provider"
          >
            {{ provider }}
          </button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t('settings.thresholds') }}</CardTitle>
        <CardDescription>{{ t('settings.thresholdsHint') }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <Badge
            v-for="severity in severities"
            :key="severity"
            :variant="severity === failOn ? 'default' : 'secondary'"
            class="cursor-pointer"
            @click="failOn = severity"
          >
            {{ severity }}
          </Badge>
        </div>
        <Button disabled>{{ t('settings.save') }}</Button>
      </CardContent>
    </Card>
  </div>
</template>
