import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-react-start'

import { createApiClient } from '../orpc/client'

export type { CurrentUser } from '@rituvo/api-contract'

/**
 * Fetches the signed-in user's row via the oRPC user.current procedure.
 *
 * The row is normally kept in sync by Clerk webhooks; on a miss (right
 * after signup before the user.created webhook lands, or in environments
 * without webhooks) it is pulled from Clerk once and persisted.
 */
export function useCurrentUser() {
  const { isSignedIn, getToken } = useAuth()

  return useQuery({
    queryKey: ['current-user', getToken],
    enabled: Boolean(isSignedIn),
    staleTime: Infinity,
    queryFn: async () => {
      const client = createApiClient(getToken)
      return client.user.current()
    },
  })
}
