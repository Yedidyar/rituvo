import { and, eq } from 'drizzle-orm'

import type { CreateHabitInput } from '@rituvo/api-contract'

import type { Database } from '../db'
import { accountabilityPartnerships, habits, users } from '../db/schema'

export type HabitRow = typeof habits.$inferSelect

export async function insertHabit(
  database: Database,
  ownerId: string,
  input: CreateHabitInput,
): Promise<HabitRow> {
  const [habit] = await database
    .insert(habits)
    .values({
      ownerId,
      name: input.name,
      description: input.description ?? null,
      frequency: input.frequency,
      scheduleDays:
        input.frequency === 'specific_days' ? (input.scheduleDays ?? []) : null,
      reminderTime: input.reminderTime ?? null,
      startDate: input.startDate,
      targetValue:
        input.targetValue !== undefined ? String(input.targetValue) : null,
      targetUnit: input.targetUnit ?? null,
      partnerUserId: input.partnerUserId ?? null,
    })
    .returning()

  return habit
}

export async function findHabitByIdForOwner(
  database: Database,
  habitId: string,
  ownerId: string,
): Promise<HabitRow | null> {
  const [habit] = await database
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.ownerId, ownerId)))

  return habit ?? null
}

export async function listActiveHabitsForOwner(
  database: Database,
  ownerId: string,
): Promise<HabitRow[]> {
  return database
    .select()
    .from(habits)
    .where(and(eq(habits.ownerId, ownerId), eq(habits.status, 'active')))
    .orderBy(habits.createdAt)
}

export async function listAccountabilityPartnersForUser(
  database: Database,
  userId: string,
) {
  const rows = await database
    .select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      imageUrl: users.imageUrl,
    })
    .from(accountabilityPartnerships)
    .innerJoin(users, eq(accountabilityPartnerships.partnerUserId, users.id))
    .where(
      and(
        eq(accountabilityPartnerships.userId, userId),
        eq(accountabilityPartnerships.status, 'active'),
      ),
    )

  return rows
}

export async function isActivePartnerForUser(
  database: Database,
  userId: string,
  partnerUserId: string,
): Promise<boolean> {
  const [row] = await database
    .select({ id: accountabilityPartnerships.id })
    .from(accountabilityPartnerships)
    .where(
      and(
        eq(accountabilityPartnerships.userId, userId),
        eq(accountabilityPartnerships.partnerUserId, partnerUserId),
        eq(accountabilityPartnerships.status, 'active'),
      ),
    )
    .limit(1)

  return Boolean(row)
}
