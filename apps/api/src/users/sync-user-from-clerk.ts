import { clerkClient } from '@clerk/fastify'

import type { Database } from '../db'

import { profileFromClerkApiUser } from './user-profile'
import { upsertUser } from './users-repository'
import type { UserRow } from './users-repository'

/** Fetches a Clerk profile and upserts it into the users table. */
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
