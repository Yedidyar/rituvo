/// <reference types="vitest/config" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_WEB_PORT = 3000

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test' || !!process.env.VITEST
  // '' loads every var, not just VITE_-prefixed ones, for config-only values
  // like EXPOSE_DEV_SERVER below. Safe: this runs in Node at config time and
  // never reaches the client bundle unless explicitly forwarded via `define`.
  const env = loadEnv(mode, __dirname, '')
  const webPort =
    Number(env.WEB_PORT ?? process.env.WEB_PORT) || DEFAULT_WEB_PORT

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/web',
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      outDir: './dist',
    },
    server: {
      port: webPort,
      strictPort: true,
      // Bind to localhost by default; expose on the LAN (0.0.0.0) only when
      // explicitly opted in (e.g. EXPOSE_DEV_SERVER=true for mobile/device testing).
      host: env.EXPOSE_DEV_SERVER === 'true' ? true : 'localhost',
    },
    preview: {
      port: webPort,
      host: 'localhost',
    },
    plugins: [
      !isTest && devtools(),
      !isTest && nitro({ rollupConfig: { external: [/^@sentry\//] } }),
      tailwindcss(),
      !isTest && tanstackStart(),
      viteReact(),
      babel({ presets: [reactCompilerPreset()] }),
    ].filter((plugin) => Boolean(plugin)),
    test: {
      name: '@rituvo/web',
      globals: true,
      environment: 'jsdom',
      passWithNoTests: true,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/apps/web',
        provider: 'v8',
      },
    },
  }
})
