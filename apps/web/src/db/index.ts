import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { serverEnv } from '#/env.server'

import * as schema from './schema.ts'

export const db: NodePgDatabase<typeof schema> = drizzle(
  serverEnv.DATABASE_URL,
  {
    schema,
  },
)
