import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it,
} from 'vitest'
import { ORPCError, createRouterClient } from '@orpc/server'

import { createDatabase } from '../src/db'
import type { Database, DatabaseConnection } from '../src/db'
import { accountabilityPartnerships } from '../src/db/schema'
import { router } from '../src/orpc/router'
import { upsertUser } from '../src/users/users-repository'
import type { UserProfile } from '../src/users/user-profile'

import { truncateUsers } from './helpers/database'

const ownerProfile: UserProfile = {
  email: 'owner@example.com',
  firstName: 'Taylor',
  lastName: 'Owner',
  imageUrl: null,
}

const partnerProfile: UserProfile = {
  email: 'partner@example.com',
  firstName: 'Alex',
  lastName: 'Partner',
  imageUrl: null,
}

function createTestClient(database: Database, userId: string | null) {
  return createRouterClient(router, {
    context: { db: database, userId },
  })
}

let connection: DatabaseConnection
let database: Database

beforeAll(async () => {
  const databaseUrl = inject('databaseUrl')
  connection = createDatabase(databaseUrl)
  database = connection.database
})

afterAll(async () => {
  await connection.close()
})

beforeEach(async () => {
  await truncateUsers(database)
})

describe('habit.create', () => {
  it('creates a daily habit with required fields only', async () => {
    await upsertUser(database, {
      userId: 'user_owner',
      profile: ownerProfile,
    })

    const client = createTestClient(database, 'user_owner')
    const habit = await client.habit.create({
      name: 'Read for 20 minutes',
      frequency: 'daily',
      startDate: '2026-08-01',
    })

    expect(habit).toMatchObject({
      name: 'Read for 20 minutes',
      frequency: 'daily',
      description: null,
      reminderTime: null,
      targetValue: null,
      partnerUserId: null,
      status: 'active',
    })
  })

  it('creates a specific-days habit with optional fields', async () => {
    await upsertUser(database, {
      userId: 'user_owner',
      profile: ownerProfile,
    })
    await upsertUser(database, {
      userId: 'user_partner',
      profile: partnerProfile,
    })
    await database.insert(accountabilityPartnerships).values({
      userId: 'user_owner',
      partnerUserId: 'user_partner',
    })

    const client = createTestClient(database, 'user_owner')
    const habit = await client.habit.create({
      name: 'Practice English',
      description: 'Speak out loud for clarity',
      frequency: 'specific_days',
      scheduleDays: [1, 3, 5],
      reminderTime: '09:00',
      startDate: '2026-08-05',
      targetValue: 20,
      targetUnit: 'minutes',
      partnerUserId: 'user_partner',
    })

    expect(habit).toMatchObject({
      name: 'Practice English',
      frequency: 'specific_days',
      scheduleDays: [1, 3, 5],
      reminderTime: '09:00',
      targetValue: 20,
      targetUnit: 'minutes',
      partnerUserId: 'user_partner',
    })
  })

  it('returns UNAUTHORIZED when not signed in', async () => {
    const client = createTestClient(database, null)

    await expect(
      client.habit.create({
        name: 'Walk after lunch',
        frequency: 'daily',
        startDate: '2026-08-01',
      }),
    ).rejects.toBeInstanceOf(ORPCError)
  })

  it('rejects a partner who is not in active partnerships', async () => {
    await upsertUser(database, {
      userId: 'user_owner',
      profile: ownerProfile,
    })
    await upsertUser(database, {
      userId: 'user_stranger',
      profile: partnerProfile,
    })

    const client = createTestClient(database, 'user_owner')

    await expect(
      client.habit.create({
        name: 'Walk after lunch',
        frequency: 'daily',
        startDate: '2026-08-01',
        partnerUserId: 'user_stranger',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
})

describe('habit.listActive', () => {
  it('marks future-start habits as not due and not started', async () => {
    await upsertUser(database, {
      userId: 'user_owner',
      profile: ownerProfile,
    })

    const client = createTestClient(database, 'user_owner')
    await client.habit.create({
      name: 'Morning stretch',
      frequency: 'daily',
      startDate: '2026-08-10',
    })

    const habits = await client.habit.listActive({
      referenceDate: '2026-08-01',
    })

    expect(habits).toHaveLength(1)
    expect(habits[0]).toMatchObject({
      isDueToday: false,
      isStarted: false,
    })
  })

  it('marks specific-day habits due only on selected days', async () => {
    await upsertUser(database, {
      userId: 'user_owner',
      profile: ownerProfile,
    })

    const client = createTestClient(database, 'user_owner')
    await client.habit.create({
      name: 'Walk after lunch',
      frequency: 'specific_days',
      scheduleDays: [1],
      startDate: '2026-08-01',
    })

    const monday = await client.habit.listActive({
      referenceDate: '2026-08-03',
    })
    const tuesday = await client.habit.listActive({
      referenceDate: '2026-08-04',
    })

    expect(monday[0]?.isDueToday).toBe(true)
    expect(tuesday[0]?.isDueToday).toBe(false)
  })
})
