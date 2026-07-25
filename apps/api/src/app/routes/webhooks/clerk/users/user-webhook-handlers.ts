import type { Database } from '../../../../../db'

import { handleUserCreated } from './user-created'
import { handleUserDeleted } from './user-deleted'
import { handleUserUpdated } from './user-updated'
import type { UserWebhookEvent } from './user-webhook-events'

/**
 * Maps each Clerk user event to its handler. Supporting a new user event
 * means adding a key here and a sibling handler file — there is no
 * branching logic to edit.
 *
 * The mapped type ties every handler to the payload of its own event, so a
 * mismatched handler fails to compile.
 */
const userWebhookHandlers = {
  'user.created': handleUserCreated,
  'user.updated': handleUserUpdated,
  'user.deleted': handleUserDeleted,
} satisfies {
  [Event in UserWebhookEvent as Event['type']]: (
    database: Database,
    event: Event,
  ) => Promise<void>
}

type UserWebhookHandler = (
  database: Database,
  event: UserWebhookEvent,
) => Promise<void>

/**
 * Routes a user webhook event to its registered handler.
 *
 * @throws When no handler is registered — a user.* type newer than this SDK
 * version (the map is otherwise exhaustive at compile time).
 */
export async function handleUserWebhookEvent(
  database: Database,
  event: UserWebhookEvent,
): Promise<void> {
  const handler = userWebhookHandlers[event.type]

  if (!handler) {
    throw new Error(
      `No handler registered for Clerk webhook event: ${event.type}`,
    )
  }

  // The union-keyed lookup loses the event/handler correlation for TS; the
  // keys come from the same discriminant, so the assertion is sound.
  await (handler as UserWebhookHandler)(database, event)
}
