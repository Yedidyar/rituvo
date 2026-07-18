import { defineConfig } from 'drizzle-kit'

import { env } from './src/env'

if (!env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not configured. Add it to apps/api/.env.local.',
  )
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
