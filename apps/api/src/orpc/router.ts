import { getAuth } from '@clerk/fastify'
import { contract } from '@rituvo/api-contract'
import type { CurrentUser } from '@rituvo/api-contract'
import { implement, ORPCError } from '@orpc/server'

import { getOrSyncUser } from '../users/get-or-sync-user'
import type { UserRow } from '../users/users-repository'

import type { AuthedRpcContext, RpcContext } from './context'

const os = implement(contract).$context<RpcContext>()

const authed = os.use(async ({ context, next }) => {
  const { publishableKey, secretKey } = context.config.clerk
  if (!publishableKey || !secretKey) {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Authentication is not configured',
    })
  }

  const { userId } = getAuth(context.request)
  if (!userId) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({
    context: { ...context, userId } satisfies AuthedRpcContext,
  })
})

function toCurrentUser(user: UserRow): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export const getCurrentUser = authed.user.current.handler(
  async ({ context }) => {
    const { user, syncedFromClerk } = await getOrSyncUser(
      context.db,
      context.userId!,
    )

    if (syncedFromClerk) {
      context.request.log.info(
        { userId: context.userId },
        'User row missing; synced from Clerk (expected right after signup — otherwise check webhook delivery)',
      )
    }

    return toCurrentUser(user)
  },
)

export const router = authed.router({
  user: {
    current: getCurrentUser,
  },
})
