import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it,
} from 'vitest'
import { eq } from 'drizzle-orm'

import { createDatabase } from '../src/db'
import type { Database, DatabaseConnection } from '../src/db'
import { users } from '../src/db/schema'
import {
  deleteUserById,
  findUserById,
  upsertUser,
} from '../src/users/users-repository'
import type { UserProfile } from '../src/users/user-profile'

import { truncateUsers } from './helpers/database'

const adaProfile: UserProfile = {
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  imageUrl: 'https://img.example.com/ada.png',
}

let connection: DatabaseConnection
let database: Database

beforeAll(() => {
  connection = createDatabase(inject('databaseUrl'))
  database = connection.database
})

afterAll(() => connection.close())

beforeEach(() => truncateUsers(database))

describe('users repository against real Postgres', () => {
  it('inserts a new row and reads it back', async () => {
    const inserted = await upsertUser(database, {
      userId: 'user_ada',
      profile: adaProfile,
    })

    expect(inserted).toMatchObject({ id: 'user_ada', ...adaProfile })
    expect(await findUserById(database, 'user_ada')).toMatchObject({
      id: 'user_ada',
      email: 'ada@example.com',
    })
  })

  it('upserts idempotently, refreshing the profile without duplicating', async () => {
    await upsertUser(database, { userId: 'user_ada', profile: adaProfile })
    const updated = await upsertUser(database, {
      userId: 'user_ada',
      profile: { ...adaProfile, firstName: 'Augusta Ada' },
    })

    expect(updated.firstName).toBe('Augusta Ada')

    const rows = await database
      .select()
      .from(users)
      .where(eq(users.id, 'user_ada'))
    expect(rows).toHaveLength(1)
  })

  it('deletes a row and treats deleting a missing row as a no-op', async () => {
    await upsertUser(database, { userId: 'user_ada', profile: adaProfile })

    await deleteUserById(database, 'user_ada')
    expect(await findUserById(database, 'user_ada')).toBeUndefined()

    await expect(deleteUserById(database, 'user_ada')).resolves.toBeUndefined()
  })

  it('returns undefined for an unknown id', async () => {
    expect(await findUserById(database, 'user_unknown')).toBeUndefined()
  })
})
