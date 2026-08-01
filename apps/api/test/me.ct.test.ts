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
import type { FastifyInstance } from 'fastify'
import type * as ClerkFastify from '@clerk/fastify'
import { clerkClient, getAuth } from '@clerk/fastify'

import { createDatabase } from '../src/db'
import type { Database, DatabaseConnection } from '../src/db'
import { findUserById, upsertUser } from '../src/users/users-repository'
import type { UserProfile } from '../src/users/user-profile'

import { buildTestApp } from './helpers/build-test-app'
import { truncateUsers } from './helpers/database'
import { testConfig } from './helpers/test-config'

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

function authFor(userId: string | null) {
  return { userId } as ReturnType<typeof getAuth>
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

async function getMe(fastify: FastifyInstance) {
  return fastify.inject({ method: 'GET', url: '/me' })
}

let fastify: FastifyInstance
let connection: DatabaseConnection
let database: Database

beforeAll(async () => {
  const databaseUrl = inject('databaseUrl')
  connection = createDatabase(databaseUrl)
  database = connection.database
  fastify = await buildTestApp(testConfig(databaseUrl))
})

afterAll(async () => {
  await fastify.close()
  await connection.close()
})

beforeEach(async () => {
  await truncateUsers(database)
  vi.mocked(getAuth).mockReset()
  vi.mocked(clerkClient.users.getUser).mockReset()
})

describe('GET /me', () => {
  it('returns the stored user for a signed-in request', async () => {
    await upsertUser(database, {
      userId: 'user_grace',
      profile: graceProfile,
    })
    vi.mocked(getAuth).mockReturnValue(authFor('user_grace'))

    const response = await getMe(fastify)

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
      firstName: 'Grace',
    })
  })

  it('syncs from Clerk and persists the row on a cache miss', async () => {
    vi.mocked(getAuth).mockReturnValue(authFor('user_grace'))
    mockClerkGetUser('user_grace')

    const response = await getMe(fastify)

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
    })
    expect(clerkClient.users.getUser).toHaveBeenCalledWith('user_grace')
    expect(await findUserById(database, 'user_grace')).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
    })
  })

  it('returns 401 when the request is not signed in', async () => {
    vi.mocked(getAuth).mockReturnValue(authFor(null))

    const response = await getMe(fastify)

    expect(response.statusCode).toBe(401)
  })
})
