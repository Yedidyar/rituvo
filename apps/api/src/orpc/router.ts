import { ORPCError, implement } from '@orpc/server'
import { contract } from '@rituvo/api-contract'

import type { Database } from '../db'
import { getOrSyncUser } from '../users/get-or-sync-user'
import type { UserRow } from '../users/users-repository'

import {
  partnerDisplayName,
  toHabitDto,
  toHabitSummaryDto,
} from '../habits/habit-mapper'
import { todayDateOnly } from '../habits/habit-schedule'
import {
  findHabitByIdForOwner,
  insertHabit,
  isActivePartnerForUser,
  listAccountabilityPartnersForUser,
  listActiveHabitsForOwner,
} from '../habits/habits-repository'

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

export const habitCreate = authed.habit.create.handler(
  async ({ context, input }) => {
    if (input.partnerUserId) {
      const isPartner = await isActivePartnerForUser(
        context.db,
        context.userId,
        input.partnerUserId,
      )

      if (!isPartner) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Selected accountability partner is not available',
        })
      }
    }

    const habit = await insertHabit(context.db, context.userId, input)
    return toHabitDto(habit)
  },
)

export const habitListActive = authed.habit.listActive.handler(
  async ({ context, input }) => {
    const referenceDate = input?.referenceDate ?? todayDateOnly()
    const rows = await listActiveHabitsForOwner(context.db, context.userId)

    return rows.map((habit) => toHabitSummaryDto(habit, referenceDate))
  },
)

export const habitListPartners = authed.habit.listPartners.handler(
  async ({ context }) => {
    const partners = await listAccountabilityPartnersForUser(
      context.db,
      context.userId,
    )

    return partners.map((partner) => ({
      userId: partner.userId,
      displayName: partnerDisplayName(
        partner.firstName,
        partner.lastName,
        null,
      ),
      imageUrl: partner.imageUrl,
    }))
  },
)

export const habitGet = authed.habit.get.handler(async ({ context, input }) => {
  const habit = await findHabitByIdForOwner(
    context.db,
    input.habitId,
    context.userId,
  )

  if (!habit) {
    throw new ORPCError('NOT_FOUND')
  }

  return toHabitDto(habit)
})

export const router = os.router({
  user: {
    me: userMe,
  },
  habit: {
    create: habitCreate,
    listActive: habitListActive,
    listPartners: habitListPartners,
    get: habitGet,
  },
})
