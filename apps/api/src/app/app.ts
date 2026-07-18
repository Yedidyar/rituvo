import * as path from 'path'
import type { FastifyInstance } from 'fastify'
import AutoLoad from '@fastify/autoload'

export interface AppOptions {}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    // A webhook route file sits at routes/webhooks/<provider>/; the event
    // handlers it dispatches to live in family folders below it (e.g.
    // webhooks/clerk/users/). Those are imported by the route, not mounted
    // as routes, so anything nested two levels under webhooks is skipped.
    ignoreFilter: /\/webhooks\/[^/]+\/[^/]+\//,
    options: { ...opts },
  })
}
