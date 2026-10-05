// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  routeRules: { '/': { prerender: true } },
  app: {
    head: {
      title: 'SS — Servicio de Secretos',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Mensajes cifrados de persona a persona. Tus llaves no salen de tu dispositivo.' },
        { name: 'theme-color', content: '#fcfcf8' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'SS' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'SS — Servicio de Secretos',
      short_name: 'SS',
      id: '/',
      description: 'Mensajes cifrados de persona a persona, sin servidores.',
      lang: 'es',
      theme_color: '#fcfcf8',
      background_color: '#fcfcf8',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api/],
      runtimeCaching: []
    },
    devOptions: { enabled: false, type: 'module' }
  }
})