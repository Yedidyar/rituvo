import { deleteUserById } from '../../../../../users/users-repository'

import type { UserDeletedWebhookEvent } from './user-webhook-events'

/**
 * Handles user.deleted — removes the stored user. Deleting a missing row
 * is a no-op, so retries are safe.
 */
export async function handleUserDeleted(
  event: UserDeletedWebhookEvent,
): Promise<void> {
  if (!event.data.id) {
    return
  }

  await deleteUserById(event.data.id)
}
