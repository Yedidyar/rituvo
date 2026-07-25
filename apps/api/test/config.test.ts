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

function expectInvalidConfig(
  overrides: Partial<Record<keyof typeof validEnv, string>>,
) {
  stubEnv(overrides)
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => loadConfig()).toThrow('Invalid environment variables')

  consoleError.mockRestore()
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
    expectInvalidConfig({ DATABASE_URL: 'https://example.com/db' })
  })

  it('rejects a DATABASE_URL that is not a URL at all, without crashing', () => {
    expectInvalidConfig({ DATABASE_URL: 'not-a-url-at-all' })
  })

  it('allows CLERK_WEBHOOK_SIGNING_SECRET to be omitted in development', () => {
    stubEnv({ NODE_ENV: 'development', CLERK_WEBHOOK_SIGNING_SECRET: '' })

    expect(loadConfig().clerk.webhookSigningSecret).toBeUndefined()
  })

  it('still requires CLERK_WEBHOOK_SIGNING_SECRET in production', () => {
    expectInvalidConfig({
      NODE_ENV: 'production',
      CLERK_WEBHOOK_SIGNING_SECRET: '',
    })
  })

  // A distinct, unrelated value (not just "production") — this is what
  // actually proves the check is `=== 'development'` and not some other
  // condition that happens to also cover the production case.
  it('still requires CLERK_WEBHOOK_SIGNING_SECRET for any non-development value', () => {
    expectInvalidConfig({
      NODE_ENV: 'staging',
      CLERK_WEBHOOK_SIGNING_SECRET: '',
    })
  })
})
