import { existsSync } from 'fs'
import * as path from 'path'
import { config } from 'dotenv'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

loadEnvFiles(['.env.local', '.env'])

export const env = createEnv({
  server: {
    HOST: z.string().min(1).default('localhost'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().url().optional(),
    CLERK_PUBLISHABLE_KEY: z.string().optional(),
    CLERK_SECRET_KEY: z.string().optional(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
    WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

/**
 * Loads the given env files from the nearest ancestor directory that
 * contains them, starting at this module's location.
 *
 * The build nests compiled output under dist/, so neither __dirname nor
 * the working directory reliably points at the app root. Walking up finds
 * apps/api/.env.local in development and no-ops in container environments
 * where configuration comes from the process environment instead.
 */
function loadEnvFiles(fileNames: string[]): void {
  const resolvedPaths = fileNames
    .map((fileName) => findFileUpwards(fileName))
    .filter((filePath): filePath is string => filePath !== undefined)

  if (resolvedPaths.length > 0) {
    config({ path: resolvedPaths })
  }
}

function findFileUpwards(fileName: string): string | undefined {
  let directory = __dirname

  while (true) {
    const candidate = path.join(directory, fileName)
    if (existsSync(candidate)) {
      return candidate
    }

    const parent = path.dirname(directory)
    if (parent === directory) {
      return undefined
    }
    directory = parent
  }
}
