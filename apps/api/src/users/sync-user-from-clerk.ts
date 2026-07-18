import { clerkClient } from '@clerk/fastify'

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
 * @throws When the Clerk API call fails or DATABASE_URL is not configured.
 */
export async function syncUserFromClerk(userId: string): Promise<UserRow> {
  const clerkUser = await clerkClient.users.getUser(userId)
  return upsertUser(userId, profileFromClerkApiUser(clerkUser))
}
