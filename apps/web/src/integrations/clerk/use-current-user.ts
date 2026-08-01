import { skipToken, useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-react-start'

import { getOrpc } from '#/lib/orpc-client'

/**
 * Fetches the signed-in user's row via the oRPC user.me procedure.
 *
 * user.me is a read-through cache: the first call upserts the user from Clerk,
 * so mounting this query also bootstraps the row in local dev, where
 * webhooks cannot reach localhost. The row is read once per session
 * (staleTime: Infinity); webhooks keep it fresh afterward.
 */
export function useCurrentUser() {
  const { isSignedIn } = useAuth()
  const isClient = typeof window !== 'undefined'
  const userMe = isClient ? getOrpc().user.me.queryOptions() : undefined

  return useQuery({
    queryKey: userMe?.queryKey ?? ['user', 'me'],
    queryFn: userMe?.queryFn ?? skipToken,
    enabled: isClient && Boolean(isSignedIn),
    staleTime: Infinity,
  })
}
