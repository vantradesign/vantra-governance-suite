<script setup lang="ts">
/**
 * Minimal locale toggle. Exists mainly to prove the i18n wiring works — the
 * German catalogue is intentionally partial and falls back to English.
 */
const { locale, locales, setLocale } = useI18n()

const available = computed(() =>
  locales.value.map((entry) =>
    typeof entry === 'string' ? { code: entry, name: entry } : { code: entry.code, name: entry.name ?? entry.code },
  ),
)
</script>

<template>
  <div class="flex items-center gap-1 rounded-md border border-border p-0.5">
    <button
      v-for="option in available"
      :key="option.code"
      type="button"
      class="rounded px-2 py-0.5 text-xs uppercase transition-colors"
      :class="
        option.code === locale
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:text-foreground'
      "
      @click="setLocale(option.code)"
    >
      {{ option.code }}
    </button>
  </div>
</template>
