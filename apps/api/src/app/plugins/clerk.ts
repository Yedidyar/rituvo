import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { clerkPlugin } from '@clerk/fastify'

/**
 * This plugin authenticates incoming requests with Clerk.
 * Routes read the result with getAuth(request).
 * Registration is skipped when Clerk keys are missing so the API
 * can still boot in environments without auth configured.
 *
 * @see https://clerk.com/docs/fastify/getting-started/quickstart
 */
export default fp(async function (fastify: FastifyInstance) {
  const { publishableKey, secretKey } = fastify.config.clerk
  if (!publishableKey || !secretKey) {
    fastify.log.warn(
      'CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY missing — Clerk authentication is disabled',
    )
    return
  }

  fastify.register(clerkPlugin)
})
