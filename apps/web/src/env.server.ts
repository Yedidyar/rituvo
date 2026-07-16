import { config } from 'dotenv'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

config({ path: ['.env.local', '.env'] })

export const server = {
  DATABASE_URL: z.string().url(),
  SERVER_URL: z.string().url().optional(),
}

export const serverEnv = createEnv({
  server,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
