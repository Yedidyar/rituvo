import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

export type Database = NodePgDatabase<typeof schema>

/**
 * A live database connection: the Drizzle instance to query through, and a
 * close function that drains the underlying pool on shutdown.
 */
export interface DatabaseConnection {
  readonly database: Database
  readonly close: () => Promise<void>
}

/**
 * Opens a connection pool for the given URL and returns a Drizzle instance
 * bound to it. The caller owns the lifecycle — create one per application at
 * the composition root and call close() on shutdown.
 *
 * @param connectionString a PostgreSQL connection URL
 */
export function createDatabase(connectionString: string): DatabaseConnection {
  const pool = new Pool({ connectionString })
  const database = drizzle(pool, { schema })

  return {
    database,
    close: () => pool.end(),
  }
}
