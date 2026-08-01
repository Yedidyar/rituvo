import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clerkClient } from '@clerk/fastify'

import type { Database } from '../src/db'
import { syncUserFromClerk } from '../src/users/sync-user-from-clerk'
import { upsertUser } from '../src/users/users-repository'

vi.mock('@clerk/fastify', () => ({
  clerkClient: { users: { getUser: vi.fn() } },
}))

vi.mock('../src/users/users-repository', () => ({
  upsertUser: vi.fn(),
}))

const database = {} as Database

const clerkUser = {
  primaryEmailAddressId: 'idn_primary',
  emailAddresses: [{ id: 'idn_primary', emailAddress: 'grace@example.com' }],
  firstName: 'Grace',
  lastName: 'Hopper',
  imageUrl: 'https://img.example.com/grace.png',
} as Awaited<ReturnType<typeof clerkClient.users.getUser>>

const persistedRow = {
  id: 'user_grace',
  email: 'grace@example.com',
  firstName: 'Grace',
  lastName: 'Hopper',
  imageUrl: 'https://img.example.com/grace.png',
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.mocked(clerkClient.users.getUser).mockReset()
  vi.mocked(upsertUser).mockReset()
})

describe('syncUserFromClerk', () => {
  it('fetches the Clerk profile and upserts it', async () => {
    vi.mocked(clerkClient.users.getUser).mockResolvedValue(clerkUser)
    vi.mocked(upsertUser).mockResolvedValue(persistedRow)

    const result = await syncUserFromClerk(database, 'user_grace')

    expect(clerkClient.users.getUser).toHaveBeenCalledWith('user_grace')
    expect(upsertUser).toHaveBeenCalledWith(database, {
      userId: 'user_grace',
      profile: {
        email: 'grace@example.com',
        firstName: 'Grace',
        lastName: 'Hopper',
        imageUrl: 'https://img.example.com/grace.png',
      },
    })
    expect(result).toBe(persistedRow)
  })
})
