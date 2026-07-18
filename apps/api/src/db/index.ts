import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '../env'

import * as schema from './schema'

export type Database = NodePgDatabase<typeof schema>

let pool: Pool | null = null
let database: Database | null = null

/**
 * Returns the shared Drizzle instance, opening the connection pool on first
 * use. Lazy singleton — every caller shares one pool.
 *
 * @throws When DATABASE_URL is not configured.
 */
export function getDatabase(): Database {
  if (database) {
    return database
  }

  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Add it to apps/api/.env.local.',
    )
  }

  pool = new Pool({ connectionString: env.DATABASE_URL })
  database = drizzle(pool, { schema })
  return database
}

/**
 * Closes the shared connection pool. Safe to call when no pool was created.
 */
export async function closeDatabase(): Promise<void> {
  if (!pool) {
    return
  }

  await pool.end()
  pool = null
  database = null
}
