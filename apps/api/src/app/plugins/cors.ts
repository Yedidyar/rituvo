import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import cors from '@fastify/cors'

/**
 * This plugin allows the web app to call the API from the browser,
 * including the Authorization header that carries the Clerk session token.
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp(async (fastify: FastifyInstance) => {
  fastify.register(cors, {
    origin: fastify.config.webOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
})
