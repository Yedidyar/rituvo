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

import { createDatabase } from '../src/db'
import type { Database, DatabaseConnection } from '../src/db'
import { findUserById } from '../src/users/users-repository'

import { buildTestApp } from './helpers/build-test-app'
import { truncateUsers } from './helpers/database'
import { signClerkWebhook } from './helpers/clerk-webhook'
import { CLERK_WEBHOOK_TEST_SECRET, testConfig } from './helpers/test-config'

// Replace only Clerk's request-auth surface so the app boots without real
// keys or network. Signature verification lives in '@clerk/fastify/webhooks',
// a separate module left untouched — so the webhook route verifies for real.
vi.mock('@clerk/fastify', async () => {
  const { default: fastifyPlugin } = await import('fastify-plugin')
  return {
    clerkPlugin: fastifyPlugin(async () => {}),
    getAuth: vi.fn(),
    clerkClient: { users: { getUser: vi.fn() } },
  }
})

interface WebhookUserData {
  id: string
  primary_email_address_id: string | null
  email_addresses: { id: string; email_address: string }[]
  first_name: string | null
  last_name: string | null
  image_url: string
}

function userCreatedEvent(overrides: Partial<WebhookUserData> = {}) {
  return {
    type: 'user.created',
    data: {
      id: 'user_ada',
      primary_email_address_id: 'idn_primary',
      email_addresses: [
        { id: 'idn_primary', email_address: 'ada@example.com' },
      ],
      first_name: 'Ada',
      last_name: 'Lovelace',
      image_url: 'https://img.example.com/ada.png',
      ...overrides,
    },
  }
}

function userUpdatedEvent(overrides: Partial<WebhookUserData> = {}) {
  return { ...userCreatedEvent(overrides), type: 'user.updated' }
}

async function postWebhook(fastify: FastifyInstance, event: unknown) {
  const payload = JSON.stringify(event)
  return fastify.inject({
    method: 'POST',
    url: '/webhooks/clerk',
    headers: {
      'content-type': 'application/json',
      ...signClerkWebhook(CLERK_WEBHOOK_TEST_SECRET, payload),
    },
    payload,
  })
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

beforeEach(() => truncateUsers(database))

describe('POST /webhooks/clerk against real Postgres', () => {
  it('persists the user on a signed user.created event', async () => {
    const response = await postWebhook(fastify, userCreatedEvent())

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ received: true })
    expect(await findUserById(database, 'user_ada')).toMatchObject({
      id: 'user_ada',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
  })

  it('refreshes the stored profile on user.updated', async () => {
    await postWebhook(fastify, userCreatedEvent())
    const response = await postWebhook(
      fastify,
      userUpdatedEvent({ first_name: 'Augusta Ada' }),
    )

    expect(response.statusCode).toBe(200)
    expect(await findUserById(database, 'user_ada')).toMatchObject({
      firstName: 'Augusta Ada',
    })
  })

  it('removes the stored user on user.deleted', async () => {
    await postWebhook(fastify, userCreatedEvent())

    const response = await postWebhook(fastify, {
      type: 'user.deleted',
      data: { id: 'user_ada', deleted: true },
    })

    expect(response.statusCode).toBe(200)
    expect(await findUserById(database, 'user_ada')).toBeUndefined()
  })

  it('rejects a payload whose signature does not match with 400 and no write', async () => {
    const payload = JSON.stringify(userCreatedEvent())
    const headers = signClerkWebhook(CLERK_WEBHOOK_TEST_SECRET, payload)

    // Send a different body than the one that was signed.
    const tamperedPayload = JSON.stringify(
      userCreatedEvent({ id: 'user_injected' }),
    )
    const response = await fastify.inject({
      method: 'POST',
      url: '/webhooks/clerk',
      headers: { 'content-type': 'application/json', ...headers },
      payload: tamperedPayload,
    })

    expect(response.statusCode).toBe(400)
    expect(await findUserById(database, 'user_injected')).toBeUndefined()
    expect(await findUserById(database, 'user_ada')).toBeUndefined()
  })
})
