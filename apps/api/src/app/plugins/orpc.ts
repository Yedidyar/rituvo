import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fastify'

import { router } from '../../orpc/router'
import type { RpcContext } from '../../orpc/context'

const RPC_PREFIX = '/rpc'

/**
 * Mounts the oRPC handler on Fastify using the native adapter so procedures
 * can access the full request/reply surface (Clerk auth, logging, etc.).
 */
export default fp(async (fastify: FastifyInstance) => {
  const handler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        fastify.log.error(error)
      }),
    ],
  })

  await fastify.register(
    async (instance) => {
      instance.addContentTypeParser('*', (_request, _payload, done) => {
        // oRPC reads the raw stream when body is undefined; see orpc Fastify docs.
        // oxlint-disable-next-line unicorn/no-useless-undefined -- undefined keeps Fastify from consuming the body.
        done(null, undefined)
      })

      instance.all('/*', async (request, reply) => {
        const result = await handler.handle(request, reply, {
          prefix: RPC_PREFIX,
          context: {
            request,
            config: fastify.config,
            db: fastify.db,
          } satisfies RpcContext,
        })

        if (!result.matched) {
          reply.status(404).send('Not found')
        }
      })
    },
    { prefix: RPC_PREFIX },
  )
})
