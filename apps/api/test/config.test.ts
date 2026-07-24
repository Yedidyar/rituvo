import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadConfig } from '../src/config'

// loadConfig() reads process.env directly, and dotenv only fills in keys
// that aren't already set — so every key the schema reads is stubbed here,
// never left to fall through to this machine's real .env/.env.local files.
const validEnv = {
  HOST: 'localhost',
  PORT: '3001',
  WEB_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  CLERK_PUBLISHABLE_KEY: 'pk_test_x',
  CLERK_SECRET_KEY: 'sk_test_x',
  CLERK_WEBHOOK_SIGNING_SECRET: 'whsec_test_x',
  NODE_ENV: 'test',
}

function stubEnv(overrides: Partial<Record<keyof typeof validEnv, string>>) {
  const env = { ...validEnv, ...overrides }
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value)
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('loadConfig', () => {
  it('loads a valid configuration', () => {
    stubEnv({})

    expect(loadConfig()).toMatchObject({
      host: 'localhost',
      port: 3001,
      webOrigin: 'http://localhost:3000',
      databaseUrl: validEnv.DATABASE_URL,
      clerk: {
        publishableKey: 'pk_test_x',
        secretKey: 'sk_test_x',
        webhookSigningSecret: 'whsec_test_x',
      },
    })
  })

  it('rejects a DATABASE_URL with a non-PostgreSQL protocol', () => {
    stubEnv({ DATABASE_URL: 'https://example.com/db' })

    expect(() => loadConfig()).toThrow('Invalid environment variables')
  })

  it('rejects a DATABASE_URL that is not a URL at all, without crashing', () => {
    stubEnv({ DATABASE_URL: 'not-a-url-at-all' })

    expect(() => loadConfig()).toThrow('Invalid environment variables')
  })

  it('allows CLERK_WEBHOOK_SIGNING_SECRET to be omitted in development', () => {
    stubEnv({ NODE_ENV: 'development', CLERK_WEBHOOK_SIGNING_SECRET: '' })

    expect(loadConfig().clerk.webhookSigningSecret).toBeUndefined()
  })

  it('still requires CLERK_WEBHOOK_SIGNING_SECRET in production', () => {
    stubEnv({ NODE_ENV: 'production', CLERK_WEBHOOK_SIGNING_SECRET: '' })

    expect(() => loadConfig()).toThrow('Invalid environment variables')
  })

  // A distinct, unrelated value (not just "production") — this is what
  // actually proves the check is `=== 'development'` and not some other
  // condition that happens to also cover the production case.
  it('still requires CLERK_WEBHOOK_SIGNING_SECRET for any non-development value', () => {
    stubEnv({ NODE_ENV: 'staging', CLERK_WEBHOOK_SIGNING_SECRET: '' })

    expect(() => loadConfig()).toThrow('Invalid environment variables')
  })
})

describe('loadConfig path resolution', () => {
  // Every test above stubs each key directly, so dotenv's file read never has
  // anything to do. This one instead clears process.env and writes a real
  // .env file to a throwaway directory, proving loadConfig() actually picks
  // values up from disk — not just from whatever the schema is handed.
  it('reads values from a real .env file in the working directory', () => {
    const requiredKeys = Object.keys(validEnv) as (keyof typeof validEnv)[]
    const originalValues = Object.fromEntries(
      requiredKeys.map((key) => [key, process.env[key]]),
    )
    const originalCwd = process.cwd()
    const tempDir = mkdtempSync(join(tmpdir(), 'rituvo-config-test-'))
    const fileEnv = {
      ...validEnv,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/from-file',
    }

    try {
      requiredKeys.forEach((key) => delete process.env[key])
      writeFileSync(
        join(tempDir, '.env'),
        requiredKeys.map((key) => `${key}=${fileEnv[key]}`).join('\n'),
      )
      process.chdir(tempDir)

      expect(loadConfig().databaseUrl).toBe(fileEnv.DATABASE_URL)
    } finally {
      process.chdir(originalCwd)
      rmSync(tempDir, { recursive: true, force: true })
      requiredKeys.forEach((key) => {
        if (originalValues[key] === undefined) {
          delete process.env[key]
        } else {
          process.env[key] = originalValues[key]
        }
      })
    }
  })
})
