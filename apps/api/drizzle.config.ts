import { defineConfig } from 'drizzle-kit'

import { loadConfig } from './src/config'

const { databaseUrl } = loadConfig()

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
