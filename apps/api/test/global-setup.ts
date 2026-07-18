import { PostgreSqlContainer } from '@testcontainers/postgresql'
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/node-postgres'
import { pushSchema } from 'drizzle-kit/api'
import { Pool } from 'pg'
import type { TestProject } from 'vitest/node'

import * as schema from '../src/db/schema'

// Lets test workers read the container's connection string through inject().
declare module 'vitest' {
  interface ProvidedContext {
    databaseUrl: string
  }
}

// Matches the Postgres major version the app runs in development (compose.yaml).
const postgresImage = 'postgres:18-alpine'

let container: StartedPostgreSqlContainer

/**
 * Boots a throwaway Postgres container and applies the current Drizzle
 * schema to it — the same push the app uses in development, so tests run
 * against the real table shape rather than a hand-written fixture.
 *
 * The connection string is handed to workers via provide/inject; env vars
 * set here would not survive the jump into the worker processes.
 */
export async function setup(project: TestProject): Promise<void> {
  container = await new PostgreSqlContainer(postgresImage).start()
  const databaseUrl = container.getConnectionUri()

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const { apply } = await pushSchema(schema, drizzle(pool, { schema }))
    await apply()
  } finally {
    await pool.end()
  }

  project.provide('databaseUrl', databaseUrl)
}

export async function teardown(): Promise<void> {
  await container?.stop()
}
