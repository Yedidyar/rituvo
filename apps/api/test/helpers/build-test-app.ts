import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'

import { app } from '../../src/app/app'
import type { AppConfig } from '../../src/config'

/**
 * Builds a fully wired Fastify instance for component tests — the same plugin
 * and route tree main.ts registers — configured with the given config and
 * ready to receive inject() requests. Callers own its lifecycle and must
 * close it when done.
 */
export async function buildTestApp(
  config: AppConfig,
): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: false })
  await fastify.register(app, { config })
  await fastify.ready()
  return fastify
}
