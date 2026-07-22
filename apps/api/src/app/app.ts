import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import AutoLoad from '@fastify/autoload'

import type { AppConfig } from '../config'
import type { Database } from '../db'

declare module 'fastify' {
  interface FastifyInstance {
    // Injected once by app(); read off the instance instead of a global.
    config: AppConfig
    db: Database
  }
}

export interface AppOptions {
  config: AppConfig
}

const webhookIgnoreFilter = /\/webhooks\/([^/]+)\/(?!\1\.[^/]+$)/

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  fastify.decorate('config', opts.config)

  fastify.register(AutoLoad, {
    // oxlint-disable-next-line unicorn/prefer-module -- API builds to CommonJS where __dirname is available.
    dir: path.join(__dirname, 'plugins'),
  })

  fastify.register(AutoLoad, {
    // oxlint-disable-next-line unicorn/prefer-module -- API builds to CommonJS where __dirname is available.
    dir: path.join(__dirname, 'routes'),
    // Mount only each provider's entry route (webhooks/<provider>/<provider>.ts,
    // e.g. webhooks/clerk/clerk.ts); skip every sibling it imports (the
    // classifier, the users/ handlers). Matching "not the entry file" also stops
    // autoload from registering those default-less modules, which throws under
    // an ESM loader.
    ignoreFilter: webhookIgnoreFilter,
  })
}
