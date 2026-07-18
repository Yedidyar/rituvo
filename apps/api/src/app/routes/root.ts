import type { FastifyInstance } from 'fastify'

export default async (fastify: FastifyInstance) => {
  fastify.get('/health', async (_request, reply) =>
    reply.code(200).send({ status: 'ok' }),
  )
}
