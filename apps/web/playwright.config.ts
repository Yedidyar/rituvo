import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '../..')

for (const envPath of [
  path.join(workspaceRoot, 'apps/web/.env.local'),
  path.join(workspaceRoot, 'apps/web/.env'),
  path.join(workspaceRoot, 'apps/api/.env.local'),
  path.join(workspaceRoot, 'apps/api/.env'),
]) {
  dotenv.config({ path: envPath, quiet: true })
}

// Clerk testing helpers read CLERK_PUBLISHABLE_KEY; the web app uses VITE_ prefix.
if (
  !process.env.CLERK_PUBLISHABLE_KEY &&
  process.env.VITE_CLERK_PUBLISHABLE_KEY
) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const webPort = process.env.WEB_PORT ?? '3000'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${webPort}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    locale: 'en-US',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'pnpm nx serve api',
          cwd: workspaceRoot,
          url: 'http://localhost:3001/health',
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'pnpm nx dev web',
          cwd: workspaceRoot,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
})
