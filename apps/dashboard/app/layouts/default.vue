<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const navigation = computed(() => [
  { to: '/', label: t('nav.overview') },
  { to: '/repos', label: t('nav.repos') },
  { to: '/settings', label: t('nav.settings') },
])
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-6">
        <NuxtLink to="/" class="flex items-baseline gap-2">
          <span class="text-lg font-semibold tracking-tight">{{ t('brand.name') }}</span>
          <span class="text-sm text-muted-foreground">{{ t('brand.suite') }}</span>
        </NuxtLink>

        <nav class="flex items-center gap-1 text-sm">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            active-class="bg-accent text-accent-foreground"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-3">
          <LocaleSwitcher />
          <a
            :href="config.public.githubOrgUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <slot />
    </main>

    <footer class="border-t border-border">
      <div
        class="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>{{ t('brand.name') }} &middot; {{ t('brand.tagline') }}</p>
        <p class="flex items-center gap-3">
          <span>{{ t('footer.license') }}</span>
          <a
            :href="config.public.githubOrgUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-foreground"
          >
            {{ t('footer.org') }}
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>
