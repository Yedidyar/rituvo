import { ORPCError, implement } from '@orpc/server'
import { contract } from '@rituvo/api-contract'

import type { Database } from '../db'
import { getOrSyncUser } from '../users/get-or-sync-user'
import type { UserRow } from '../users/users-repository'

export interface OrpcContext {
  db: Database
  userId: string | null
}

const os = implement(contract).$context<OrpcContext>()

function toUserDto(user: UserRow) {
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

const authed = os.use(({ context, next }) => {
  if (!context.userId) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({
    context: {
      ...context,
      userId: context.userId,
    },
  })
})

export const userMe = authed.user.me.handler(async ({ context }) => {
  const { user } = await getOrSyncUser(context.db, context.userId)
  return toUserDto(user)
})

export const router = os.router({
  user: {
    me: userMe,
  },
})
