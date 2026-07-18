import { sql } from 'drizzle-orm'

import type { Database } from '../../src/db'

/**
 * Empties the users table so each test starts from a known, empty state.
 */
export async function truncateUsers(database: Database): Promise<void> {
  await database.execute(sql`TRUNCATE TABLE users`)
}
