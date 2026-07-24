import type { WebhookEvent } from '@clerk/fastify/webhooks'

import type { Database } from '../../../../db'

import { handleUserWebhookEvent } from './users/user-webhook-handlers'
import type { UserWebhookEvent } from './users/user-webhook-events'

type WebhookFamilyHandler = (
  database: Database,
  event: WebhookEvent,
) => Promise<void>

/**
 * Maps a Clerk webhook event family (the segment of `type` before the
 * first dot, e.g. "user" for "user.created") to the module that owns it.
 *
 * Supporting a new family means adding a key here and pointing it at that
 * family's own handler module — there is no branching logic to edit.
 * Families with no entry (e.g. "session", "organization") are acknowledged
 * without action; nothing has opted in to handling them yet.
 */
const webhookHandlersByFamily: Record<string, WebhookFamilyHandler> = {
  // A family string carries no payload type, so each entry asserts the
  // event to the type its module expects.
  user: (database, event) =>
    handleUserWebhookEvent(database, event as UserWebhookEvent),
}

function webhookFamilyOf(event: WebhookEvent): string {
  return event.type.split('.')[0]
}

/**
 * Classifies a verified Clerk webhook event by family and dispatches it
 * to that family's handler.
 *
 * @throws Whatever the family handler throws — e.g. handleUserWebhookEvent
 * throws for a user.* type its own dictionary does not recognize. Callers
 * are expected to catch this, since it is not the caller's own bug.
 */
export async function handleWebhook(
  database: Database,
  event: WebhookEvent,
): Promise<void> {
  const handler = webhookHandlersByFamily[webhookFamilyOf(event)]

  if (!handler) {
    return
  }

  await handler(database, event)
}
