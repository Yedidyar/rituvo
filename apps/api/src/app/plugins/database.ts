import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import { closeDatabase } from '../../db'

/**
 * Closes the shared database pool when the server shuts down.
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.addHook('onClose', async () => {
    await closeDatabase()
  })
})
