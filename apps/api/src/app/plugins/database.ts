import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import { createDatabase } from '../../db'

/**
 * Opens the database connection from configuration, exposes the Drizzle
 * instance as `fastify.db`, and drains the pool when the server shuts down.
 */
export default fp(async function (fastify: FastifyInstance) {
  const { databaseUrl } = fastify.config

  const { database, close } = createDatabase(databaseUrl)
  fastify.decorate('db', database)
  fastify.addHook('onClose', close)
})
