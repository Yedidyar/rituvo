import type { FastifyInstance, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { getAuth } from '@clerk/fastify'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fastify'

import { router } from '../../orpc/router'
import type { OrpcContext } from '../../orpc/router'

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})

function createContext(
  request: FastifyRequest,
  fastify: FastifyInstance,
): OrpcContext {
  const { userId } = getAuth(request)
  return {
    db: fastify.db,
    userId,
  }
}

/**
 * Mounts the typed oRPC API at /rpc. Product procedures live here;
 * health checks and webhooks stay on plain HTTP routes.
 */
export default fp(async function orpcPlugin(fastify: FastifyInstance) {
  await fastify.register(
    async (rpc) => {
      rpc.addContentTypeParser('*', (_request, _payload, done) => {
        done(null, undefined)
      })

      rpc.all('/*', async (request, reply) => {
        const { matched } = await handler.handle(request, reply, {
          prefix: '/rpc',
          context: createContext(request, fastify),
        })

        if (!matched) {
          reply.status(404).send('Not found')
        }
      })
    },
    { prefix: '/rpc' },
  )
})
