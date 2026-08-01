import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it,
  vi,
} from 'vitest'
import type * as ClerkFastify from '@clerk/fastify'
import { ORPCError, createRouterClient } from '@orpc/server'
import { clerkClient } from '@clerk/fastify'

import { createDatabase } from '../src/db'
import type { Database, DatabaseConnection } from '../src/db'
import { router } from '../src/orpc/router'
import { findUserById, upsertUser } from '../src/users/users-repository'
import type { UserProfile } from '../src/users/user-profile'

import { truncateUsers } from './helpers/database'

vi.mock('@clerk/fastify', async (importOriginal) => {
  const actual = await importOriginal<typeof ClerkFastify>()
  const fastifyPlugin = (await import('fastify-plugin')).default
  return {
    ...actual,
    clerkPlugin: fastifyPlugin(async () => {}),
    getAuth: vi.fn(),
    clerkClient: { users: { getUser: vi.fn() } },
  }
})

const graceProfile: UserProfile = {
  email: 'grace@example.com',
  firstName: 'Grace',
  lastName: 'Hopper',
  imageUrl: 'https://img.example.com/grace.png',
}

function clerkApiUser() {
  return {
    primaryEmailAddressId: 'idn_primary',
    emailAddresses: [{ id: 'idn_primary', emailAddress: 'grace@example.com' }],
    firstName: 'Grace',
    lastName: 'Hopper',
    imageUrl: 'https://img.example.com/grace.png',
  } as Awaited<ReturnType<typeof clerkClient.users.getUser>>
}

function mockClerkGetUser(userId: string) {
  vi.mocked(clerkClient.users.getUser).mockImplementation(async (id) => {
    if (id !== userId) {
      throw new Error(`unexpected Clerk user id: ${id}`)
    }
    return clerkApiUser()
  })
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
  vi.mocked(clerkClient.users.getUser).mockReset()
})

describe('user.me', () => {
  it('returns the stored user for a signed-in request', async () => {
    await upsertUser(database, {
      userId: 'user_grace',
      profile: graceProfile,
    })

    const client = createTestClient(database, 'user_grace')
    const user = await client.user.me()

    expect(user).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
      firstName: 'Grace',
    })
  })

  it('syncs from Clerk and persists the row on a cache miss', async () => {
    mockClerkGetUser('user_grace')

    const client = createTestClient(database, 'user_grace')
    const user = await client.user.me()

    expect(user).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
    })
    expect(clerkClient.users.getUser).toHaveBeenCalledWith('user_grace')
    expect(await findUserById(database, 'user_grace')).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
    })
  })

  it('returns UNAUTHORIZED when the request is not signed in', async () => {
    const client = createTestClient(database, null)

    await expect(client.user.me()).rejects.toBeInstanceOf(ORPCError)
    await expect(client.user.me()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })
})
