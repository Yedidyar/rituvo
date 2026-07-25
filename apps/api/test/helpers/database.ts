import { sql } from 'drizzle-orm'

import type { Database } from '../../src/db'

/**
 * Empties the users table so each test starts from a known, empty state.
 * Tests share one Postgres container and run with fileParallelism disabled.
 */
export async function truncateUsers(database: Database): Promise<void> {
  await database.execute(sql`TRUNCATE TABLE users`)
}
