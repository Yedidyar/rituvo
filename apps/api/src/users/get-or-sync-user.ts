import type { Database } from '../db'

import { syncUserFromClerk } from './sync-user-from-clerk'
import { findUserById } from './users-repository'
import type { UserRow } from './users-repository'

export interface GetOrSyncUserResult {
  user: UserRow
  /**
   * True when the row was absent and had to be pulled from Clerk. Expected
   * briefly after signup (before the user.created webhook lands) and always
   * in environments without webhooks. A sustained rate in production means
   * the webhook pipeline is not delivering.
   */
  syncedFromClerk: boolean
}

/**
 * Returns the stored user, pulling the profile from Clerk and persisting it
 * on a miss — a read-through cache over the users table.
 *
 * Webhooks keep the row current over its lifetime; this only covers the
 * window where the row does not exist yet. Reporting whether a sync
 * happened is left to the caller so this stays free of logging side effects.
 *
 * @throws When the row is absent and the Clerk fetch fails, or when the
 * database is unreachable.
 */
export async function getOrSyncUser(
  database: Database,
  userId: string,
): Promise<GetOrSyncUserResult> {
  const existingUser = await findUserById(database, userId)
  if (existingUser) {
    return { user: existingUser, syncedFromClerk: false }
  }

  const user = await syncUserFromClerk(database, userId)
  return { user, syncedFromClerk: true }
}
