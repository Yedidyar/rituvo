import { useCurrentUser } from './use-current-user'

/**
 * Mounts the current-user query at the app root so the signed-in user is
 * synced into the backend on load. Renders nothing.
 *
 * This exists only because nothing else reads the user yet; once a screen
 * needs it, call useCurrentUser() there and this component can be dropped.
 */
export default function UserSync() {
  useCurrentUser()
  return null
}
