import { defineConfig } from 'drizzle-kit'

import { loadConfig } from './src/config'

const { databaseUrl } = loadConfig()

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not configured. Add it to apps/api/.env.local.',
  )
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
