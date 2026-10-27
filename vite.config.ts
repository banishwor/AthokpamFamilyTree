import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      // Installable PWA. The service worker precaches only the app
      // shell (HTML/JS/CSS/icons) and auto-updates it. FAMILY DATA
      // IS NEVER CACHED: the Google Apps Script API is NetworkOnly,
      // so the installed app always shows live records, exactly
      // like the website.
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png'],
        manifest: {
          name: 'Athokpam Family Tree',
          short_name: 'Family Tree',
          description: "Shamu Athokpam's Family Tree — heritage & genealogy portal",
          lang: 'en',
          start_url: '.',
          scope: '.',
          display: 'standalone',
          background_color: '#FDFBF6',
          theme_color: '#B45309',
          icons: [
            {src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              // Family records: always live from the backend.
              urlPattern: /^https:\/\/script\.google\.com\//,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/script\.googleusercontent\.com\//,
              handler: 'NetworkOnly',
            },
            {
              // Portraits: a replaced photo gets a new URL, so
              // caching by URL can never serve a stale portrait.
              urlPattern: /^https:\/\/lh3\.googleusercontent\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'portraits',
                expiration: {maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'StaleWhileRevalidate',
              options: {cacheName: 'google-fonts-css'},
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
