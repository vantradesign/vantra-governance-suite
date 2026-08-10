import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts', 'src/supabase.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node22',
  // `@vantra-design/core` and the Supabase SDK stay external: they are resolved
  // by the consumer (tool package or Nuxt app) so that a single instance is
  // shared across the whole analysis pass.
  external: ['@vantra-design/core', '@supabase/supabase-js', 'zod'],
})
