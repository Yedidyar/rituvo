import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_API_URL: z.string().url().optional(),
    VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
    VITE_CLERK_SIGN_IN_URL: z.string().optional(),
    VITE_CLERK_SIGN_UP_URL: z.string().optional(),
    VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().optional(),
    VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
