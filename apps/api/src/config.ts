import { config as loadDotenv } from 'dotenv'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Validated application configuration. Produced once by loadConfig() at the
 * composition root and passed down; no other module reads the environment.
 */
export interface AppConfig {
  readonly host: string
  readonly port: number
  readonly webOrigin: string
  readonly databaseUrl?: string
  readonly clerk: {
    readonly publishableKey?: string
    readonly secretKey?: string
    readonly webhookSigningSecret?: string
  }
}

/**
 * Loads and validates configuration from the environment, returning a typed,
 * immutable config object. Call this once in main.ts and thread the result
 * through the app rather than reaching for the environment elsewhere.
 *
 * nx runs the API from the workspace root and drizzle-kit runs it from
 * apps/api, so this app's env files are listed relative to both; dotenv skips
 * the ones that don't resolve. In production the files are absent and values
 * come from the process environment.
 *
 * @throws When a required variable fails validation — surfaced eagerly so
 * misconfiguration fails at startup rather than at first use. HOST, PORT, and
 * WEB_ORIGIN fall back to local defaults when unset.
 */
export function loadConfig(): AppConfig {
  loadDotenv({
    path: ['apps/api/.env.local', 'apps/api/.env', '.env.local', '.env'],
  })

  const env = createEnv({
    server: {
      HOST: z.string().min(1).default('127.0.0.1'),
      PORT: z.coerce.number().int().min(1).max(65535).default(3001),
      WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
      DATABASE_URL: z.string().url().optional(),
      CLERK_PUBLISHABLE_KEY: z.string().optional(),
      CLERK_SECRET_KEY: z.string().optional(),
      CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  })

  return {
    host: env.HOST,
    port: env.PORT,
    webOrigin: env.WEB_ORIGIN,
    databaseUrl: env.DATABASE_URL,
    clerk: {
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
      webhookSigningSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    },
  }
}
