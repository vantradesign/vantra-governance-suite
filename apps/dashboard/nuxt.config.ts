import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-10',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', 'shadcn-nuxt', '@nuxtjs/supabase', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  vite: {
    // Tailwind v4 is a Vite plugin, not a Nuxt module. `@nuxtjs/tailwindcss` is
    // deliberately NOT used: it targets Tailwind v3 and would pull in the old
    // PostCSS-based pipeline plus a tailwind.config.js we do not want.
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  supabase: {
    // No auth flow exists yet, so the module's default "redirect every
    // unauthenticated visitor to /login" behaviour would make the scaffold
    // unreachable. Re-enable once the login page lands.
    redirect: false,
    // Re-exported from packages/shared, which owns the generated schema types.
    types: '~/types/database.ts',
  },

  i18n: {
    // UI ships in English; German is scaffolded but intentionally incomplete.
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
    ],
  },

  runtimeConfig: {
    public: {
      githubOrgUrl: 'https://github.com/vantradesign',
    },
  },

  /**
   * [Security] This app is server-rendered, so headers are set here rather than
   * in a Pages `_headers` file — that is only read for static output.
   *
   * `X-Robots-Tag: noindex` because this is a private operator surface; the
   * `public/robots.txt` disallow is a request, this is an instruction.
   *
   * `style-src 'unsafe-inline'` is required by shadcn/reka-ui, which sets
   * positioning styles inline on floating elements.
   */
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'X-Frame-Options': 'DENY',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  },

  typescript: {
    typeCheck: false,
  },
})
