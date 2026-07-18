import { eq } from 'drizzle-orm'

import { getDatabase } from '../db'
import { users } from '../db/schema'

import type { UserProfile } from './user-profile'

export type UserRow = typeof users.$inferSelect

/**
 * Returns the user row for the given Clerk user id, or undefined when
 * the user has not been persisted yet.
 */
export async function findUserById(
  userId: string,
): Promise<UserRow | undefined> {
  const [userRow] = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.id, userId))

  return userRow
}

/**
 * Creates the user row for the given Clerk user id, or refreshes its
 * profile when it already exists. Idempotent: calling it repeatedly
 * with the same input leaves a single, up-to-date row.
 */
export async function upsertUser(
  userId: string,
  profile: UserProfile,
): Promise<UserRow> {
  const [userRow] = await getDatabase()
    .insert(users)
    .values({ id: userId, ...profile })
    .onConflictDoUpdate({
      target: users.id,
      set: { ...profile, updatedAt: new Date() },
    })
    .returning()

  return userRow
}

/**
 * Deletes the user row for the given Clerk user id. Safe to call when
 * the row does not exist.
 */
export async function deleteUserById(userId: string): Promise<void> {
  await getDatabase().delete(users).where(eq(users.id, userId))
}
