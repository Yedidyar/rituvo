import { profileFromWebhookUser } from '../../../../../users/user-profile'
import { upsertUser } from '../../../../../users/users-repository'

import type { UserUpsertedWebhookEvent } from './user-webhook-events'

/**
 * Handles user.created — persists the new user. Upserts rather than
 * inserts so a Svix retry (or an out-of-order update) stays correct.
 */
export async function handleUserCreated(
  event: UserUpsertedWebhookEvent,
): Promise<void> {
  await upsertUser(event.data.id, profileFromWebhookUser(event.data))
}
