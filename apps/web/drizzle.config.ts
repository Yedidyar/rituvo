import { defineConfig } from 'drizzle-kit'

import { serverEnv } from './src/env.server.ts'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
})
