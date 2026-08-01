import { createGeneralUtils } from '@orpc/tanstack-query'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-react-start'

import { getOrpc } from '#/lib/orpc-client'

const userMeKey = createGeneralUtils<undefined>(['user', 'me']).key({
  type: 'query',
})

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

  return useQuery({
    queryKey: userMeKey,
    queryFn: () => getOrpc().user.me.call(),
    enabled: isClient && Boolean(isSignedIn),
    staleTime: Infinity,
  })
}
