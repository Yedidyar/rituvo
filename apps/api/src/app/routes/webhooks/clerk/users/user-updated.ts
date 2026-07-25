import type { Database } from '../../../../../db'
import { profileFromWebhookUser } from '../../../../../users/user-profile'
import { upsertUser } from '../../../../../users/users-repository'

import type { UserUpsertedWebhookEvent } from './user-webhook-events'

/**
 * Handles user.updated — refreshes the stored profile. Upserts so the row
 * is recreated if a create event was missed.
 */
export async function handleUserUpdated(
  database: Database,
  event: UserUpsertedWebhookEvent,
): Promise<void> {
  await upsertUser(database, {
    userId: event.data.id,
    profile: profileFromWebhookUser(event.data),
  })
}
