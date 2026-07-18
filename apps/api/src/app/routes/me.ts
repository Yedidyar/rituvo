import type { FastifyInstance } from 'fastify'
import { getAuth } from '@clerk/fastify'

import { env } from '../../env'
import { getOrSyncUser } from '../../users/get-or-sync-user'

/**
 * GET /me — returns the signed-in user's row from the users table.
 *
 * The row is normally kept in sync by Clerk webhooks; on a miss (right
 * after signup before the user.created webhook lands, or in environments
 * without webhooks) it is pulled from Clerk once and persisted.
 *
 * Responses: 200 with the user row, 401 when not signed in,
 * 503 when Clerk is not configured.
 */
export default async (fastify: FastifyInstance) => {
  fastify.get('/me', async (request, reply) => {
    if (!env.CLERK_PUBLISHABLE_KEY || !env.CLERK_SECRET_KEY) {
      return reply.serviceUnavailable('Authentication is not configured')
    }

    const { userId } = getAuth(request)
    if (!userId) {
      return reply.unauthorized()
    }

    const { user, syncedFromClerk } = await getOrSyncUser(userId)
    if (syncedFromClerk) {
      request.log.info(
        { userId },
        'User row missing; synced from Clerk (expected right after signup — otherwise check webhook delivery)',
      )
    }

    return user
  })
}
