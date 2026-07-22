import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import { createDatabase } from '../../db'

/**
 * Opens the database connection from configuration, exposes the Drizzle
 * instance as `fastify.db`, and drains the pool when the server shuts down.
 *
 * When no DATABASE_URL is configured the server still boots — mirroring the
 * Clerk plugin — and routes that need the database fail when exercised.
 */
export default fp(async (fastify: FastifyInstance) => {
  const { databaseUrl } = fastify.config
  if (!databaseUrl) {
    fastify.log.warn('DATABASE_URL missing — database features are disabled')
    return
  }

  const { database, close } = createDatabase(databaseUrl)
  fastify.decorate('db', database)
  fastify.addHook('onClose', close)
})
