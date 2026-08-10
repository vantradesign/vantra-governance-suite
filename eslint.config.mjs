import js from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Shared flat config for every workspace in the suite.
 *
 * The dashboard does NOT extend this file directly: Nuxt generates its own flat
 * config through `@nuxt/eslint` (see `apps/dashboard/eslint.config.mjs`), which
 * needs to know about `.vue` files, auto-imported globals and the Nuxt-specific
 * rule set. Everything under `packages/*` is plain TypeScript and uses the
 * config below.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.nuxt/**',
      '**/.output/**',
      'apps/**',
      'supabase/**',
      '**/src/types/database.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },
)
