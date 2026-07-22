import type { FastifyInstance } from 'fastify'

export default async function rootRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, reply) =>
    reply.code(200).send({ status: 'ok' }),
  )
}
