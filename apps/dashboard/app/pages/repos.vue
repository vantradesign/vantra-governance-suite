<script setup lang="ts">
import type { Tables } from '@vantra-design/governance-shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const { t } = useI18n()

useHead({ title: `${t('repos.title')} · Vantra` })

/**
 * Placeholder view: the query is typed against the generated schema but the
 * table is empty until the CI runner registers repositories.
 */
const repos = ref<Tables<'repos'>[]>([])
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('repos.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ t('repos.subtitle') }}</p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ t('repos.title') }}</CardTitle>
        <CardDescription>{{ repos.length }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('repos.columns.name') }}</TableHead>
              <TableHead>{{ t('repos.columns.role') }}</TableHead>
              <TableHead>{{ t('repos.columns.githubUrl') }}</TableHead>
              <TableHead>{{ t('repos.columns.createdAt') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmpty v-if="repos.length === 0" :colspan="4">
              {{ t('repos.empty') }}
            </TableEmpty>
            <TableRow v-for="repo in repos" :key="repo.id">
              <TableCell class="font-medium">{{ repo.name }}</TableCell>
              <TableCell>{{ t(`repos.roles.${repo.role}`) }}</TableCell>
              <TableCell class="text-muted-foreground">{{ repo.github_url }}</TableCell>
              <TableCell class="text-muted-foreground">{{ repo.created_at }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
