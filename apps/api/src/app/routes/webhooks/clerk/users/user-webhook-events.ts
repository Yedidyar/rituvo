import type { WebhookEvent } from '@clerk/fastify/webhooks'

/**
 * The Clerk webhook events that concern the users table.
 *
 * Derived from the full WebhookEvent union so the payload types stay in
 * sync with the SDK. The `*JSON` payload types are not exported from
 * @clerk/fastify/webhooks, so the event data is reached through these.
 */
export type UserWebhookEvent = Extract<WebhookEvent, { type: `user.${string}` }>

/**
 * A user.created or user.updated event. Both carry the full user resource
 * and are handled by upserting the local row.
 */
export type UserUpsertedWebhookEvent = Exclude<
  UserWebhookEvent,
  { type: 'user.deleted' }
>

/**
 * A user.deleted event. Carries only the deleted user's id.
 */
export type UserDeletedWebhookEvent = Extract<
  UserWebhookEvent,
  { type: 'user.deleted' }
>
