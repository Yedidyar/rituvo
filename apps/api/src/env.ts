import { config } from 'dotenv'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

config({ path: ['.env.local', '.env'] })

export const env = createEnv({
  server: {
    HOST: z.string().min(1).default('localhost'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
