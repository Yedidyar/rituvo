import { eq } from 'drizzle-orm'

import type { Database } from '../db'
import { users } from '../db/schema'

import type { UserProfile } from './user-profile'

export type UserRow = typeof users.$inferSelect

/** The identity and profile to persist for a user. */
export interface UpsertUserInput {
  userId: string
  profile: UserProfile
}

/**
 * Returns the user row for the given Clerk user id, or undefined when
 * the user has not been persisted yet.
 */
export async function findUserById(
  database: Database,
  userId: string,
): Promise<UserRow | undefined> {
  const [userRow] = await database
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
  database: Database,
  input: UpsertUserInput,
): Promise<UserRow> {
  const [userRow] = await database
    .insert(users)
    .values({ id: input.userId, ...input.profile })
    .onConflictDoUpdate({
      target: users.id,
      set: { ...input.profile, updatedAt: new Date() },
    })
    .returning()

  return userRow
}

/**
 * Deletes the user row for the given Clerk user id. Safe to call when
 * the row does not exist.
 */
export async function deleteUserById(
  database: Database,
  userId: string,
): Promise<void> {
  await database.delete(users).where(eq(users.id, userId))
}
