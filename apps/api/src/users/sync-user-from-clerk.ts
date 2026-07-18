import { clerkClient } from '@clerk/fastify'

import type { Database } from '../db'

import { profileFromClerkApiUser } from './user-profile'
import { upsertUser } from './users-repository'
import type { UserRow } from './users-repository'

/**
 * Fetches a user's profile from the Clerk Backend API and upserts it
 * into the users table.
 *
 * Webhooks are the primary sync mechanism; this is the fallback for
 * environments they cannot reach, such as local dev without a tunnel.
 *
 * @throws When the Clerk API call fails or the database is unreachable.
 */
export async function syncUserFromClerk(
  database: Database,
  userId: string,
): Promise<UserRow> {
  const clerkUser = await clerkClient.users.getUser(userId)
  return upsertUser(database, {
    userId,
    profile: profileFromClerkApiUser(clerkUser),
  })
}
