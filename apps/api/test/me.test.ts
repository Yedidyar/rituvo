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
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { clerkClient, getAuth } from '@clerk/fastify'

import { createDatabase } from '../src/db'
import type { Database, DatabaseConnection } from '../src/db'
import { findUserById, upsertUser } from '../src/users/users-repository'
import type { UserProfile } from '../src/users/user-profile'

import { buildTestApp } from './helpers/build-test-app'
import { truncateUsers } from './helpers/database'
import { testConfig } from './helpers/test-config'

// Clerk token verification (getAuth) and the Backend API (clerkClient) are
// genuine network boundaries, so they are the only things mocked here. The
// users table the route reads and writes stays a real Postgres database.
vi.mock('@clerk/fastify', async () => {
  const { default: fastifyPlugin } = await import('fastify-plugin')
  return {
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

// The user.current procedure reads only userId off the auth object; getAuth's
// full return type cannot be inferred for a partial mock, so it is asserted here.
function authFor(userId: string | null) {
  return { userId } as ReturnType<typeof getAuth>
}

// profileFromClerkApiUser consumes a small subset of the Clerk user resource;
// the full Backend API type cannot be inferred for a partial mock.
function clerkApiUser() {
  return {
    primaryEmailAddressId: 'idn_primary',
    emailAddresses: [{ id: 'idn_primary', emailAddress: 'grace@example.com' }],
    firstName: 'Grace',
    lastName: 'Hopper',
    imageUrl: 'https://img.example.com/grace.png',
  } as Awaited<ReturnType<typeof clerkClient.users.getUser>>
}

function createTestClient(fastify: FastifyInstance) {
  const link = new RPCLink({
    url: 'http://localhost:3001/rpc',
    fetch: async (request, init) => {
      const body = init?.body ?? (await request.arrayBuffer())

      const result = await fastify.inject({
        method: request.method,
        url: new URL(request.url).pathname + new URL(request.url).search,
        headers: Object.fromEntries(request.headers.entries()),
        payload: body.byteLength > 0 ? Buffer.from(body) : undefined,
      })

      return new Response(result.payload, {
        status: result.statusCode,
        headers: result.headers,
      })
    },
  })

  return createORPCClient(link)
}

let fastify: FastifyInstance
let connection: DatabaseConnection
let database: Database

beforeAll(async () => {
  const databaseUrl = inject('databaseUrl')
  connection = createDatabase(databaseUrl)
  ;({ database } = connection)
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

describe('user.current oRPC procedure against real Postgres', () => {
  it('returns the stored user for a signed-in request', async () => {
    await upsertUser(database, {
      userId: 'user_grace',
      profile: graceProfile,
    })
    vi.mocked(getAuth).mockReturnValue(authFor('user_grace'))

    const client = createTestClient(fastify)
    const user = await client.user.current()

    expect(user).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
      firstName: 'Grace',
    })
    expect(vi.mocked(clerkClient.users.getUser)).not.toHaveBeenCalled()
  })

  it('syncs from Clerk and persists the row on a cache miss', async () => {
    vi.mocked(getAuth).mockReturnValue(authFor('user_grace'))
    vi.mocked(clerkClient.users.getUser).mockResolvedValue(clerkApiUser())

    const client = createTestClient(fastify)
    const user = await client.user.current()

    expect(user).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
    })
    expect(vi.mocked(clerkClient.users.getUser)).toHaveBeenCalledWith(
      'user_grace',
    )
    expect(await findUserById(database, 'user_grace')).toMatchObject({
      id: 'user_grace',
      email: 'grace@example.com',
    })
  })

  it('returns 401 when the request is not signed in', async () => {
    vi.mocked(getAuth).mockReturnValue(authFor(null))

    const client = createTestClient(fastify)

    await expect(client.user.current()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    })
  })
})
