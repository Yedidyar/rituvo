import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-react-start'
import { z } from 'zod'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

/**
 * React Query key for the signed-in user's row. Shared so any screen can read
 * the cached user or invalidate it (e.g. after a profile update) without
 * duplicating the key string.
 */
export const currentUserQueryKey = ['current-user'] as const

const currentUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CurrentUser = z.infer<typeof currentUserSchema>

/**
 * Fetches the signed-in user's row from the API's /me endpoint.
 *
 * /me is a read-through cache: the first call upserts the user from Clerk,
 * so mounting this query also bootstraps the row in local dev, where
 * webhooks cannot reach localhost. The row is read once per session
 * (staleTime: Infinity); webhooks keep it fresh afterward.
 */
export function useCurrentUser() {
  const { isSignedIn, getToken } = useAuth()

  return useQuery({
    queryKey: currentUserQueryKey,
    enabled: Boolean(isSignedIn),
    staleTime: Infinity,
    queryFn: async (): Promise<CurrentUser> => {
      const token = await getToken()
      if (!token) {
        throw new Error('Cannot load the current user without a session token')
      }

      const response = await fetch(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error(`Failed to load the current user (${response.status})`)
      }

      return currentUserSchema.parse(await response.json())
    },
  })
}
