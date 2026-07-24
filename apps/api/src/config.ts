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
  readonly databaseUrl: string
  readonly clerk: {
    readonly publishableKey: string
    readonly secretKey: string
    // Optional only when NODE_ENV=development (webhooks can't reach localhost).
    readonly webhookSigningSecret?: string
  }
}

/**
 * Loads and validates configuration from the environment. Call once in
 * main.ts and thread the result through the app.
 *
 * nx runs the API from the workspace root and drizzle-kit runs it from
 * apps/api, so env file paths are listed relative to both; dotenv skips
 * whichever don't resolve.
 *
 * @throws When a required variable is missing or invalid.
 */
export function loadConfig(): AppConfig {
  loadDotenv({
    path: ['apps/api/.env.local', 'apps/api/.env', '.env.local', '.env'],
    quiet: true,
  })

  const isDevelopment = process.env.NODE_ENV === 'development'

  const env = createEnv({
    server: {
      HOST: z.string().min(1),
      PORT: z.coerce.number().int().min(1).max(65535),
      WEB_ORIGIN: z.string().url(),
      DATABASE_URL: z.url({
        protocol: /^postgres(ql)?$/,
        error: 'DATABASE_URL must use a PostgreSQL URL',
      }),
      CLERK_PUBLISHABLE_KEY: z.string().min(1),
      CLERK_SECRET_KEY: z.string().min(1),
      CLERK_WEBHOOK_SIGNING_SECRET: isDevelopment
        ? z.string().min(1).optional()
        : z.string().min(1),
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
