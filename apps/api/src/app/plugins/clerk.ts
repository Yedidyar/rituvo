import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { clerkPlugin } from '@clerk/fastify'

/**
 * This plugin authenticates incoming requests with Clerk.
 * Routes read the result with getAuth(request). clerkPlugin picks the
 * publishable and secret keys up from the environment, and those keys are
 * required and validated at startup, so authentication is always configured.
 *
 * @see https://clerk.com/docs/fastify/getting-started/quickstart
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(clerkPlugin)
})
