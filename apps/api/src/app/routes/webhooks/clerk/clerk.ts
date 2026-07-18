import type { FastifyInstance } from 'fastify'
import { verifyWebhook } from '@clerk/fastify/webhooks'

import { env } from '../../../../env'

import { handleWebhook } from './webhook-classifier'

/**
 * POST /webhooks/clerk — keeps our data in sync with Clerk.
 *
 * Clerk delivers Svix-signed lifecycle events here. The signature is
 * verified with CLERK_WEBHOOK_SIGNING_SECRET before anything is applied;
 * handleWebhook then classifies the event by family and dispatches it.
 * Family handlers are idempotent, so Svix retries and replays are safe.
 *
 * Responses: 200 when processed, 400 on signature failure,
 * 500 when a handler fails (Svix retries), 503 when the signing secret
 * is not configured.
 */
export default async (fastify: FastifyInstance) => {
  fastify.post('/', async (request, reply) => {
    if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
      return reply.serviceUnavailable('Clerk webhooks are not configured')
    }

    const event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
    }).catch((error: unknown) => {
      request.log.warn({ err: error }, 'Clerk webhook verification failed')
      return null
    })

    if (!event) {
      return reply.badRequest('Webhook signature verification failed')
    }

    try {
      await handleWebhook(event)
    } catch (error) {
      request.log.error(
        { err: error, eventType: event.type },
        'Failed to handle Clerk webhook event',
      )
      return reply.internalServerError('Failed to handle webhook event')
    }

    return { received: true }
  })
}
