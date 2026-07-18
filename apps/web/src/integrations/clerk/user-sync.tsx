import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/tanstack-react-start'

import { clerkEnabled } from './clerk-enabled'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

/**
 * Syncs the signed-in Clerk user into the backend database.
 *
 * When a user is authenticated, this calls the API's /me endpoint once
 * (per user id) with their Clerk session token, which upserts their row
 * in the users table. Renders nothing.
 */
export default function UserSync() {
  const { isSignedIn, userId, getToken } = useAuth()
  const syncedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!clerkEnabled || !isSignedIn || !userId) {
      return
    }
    if (syncedUserId.current === userId) {
      return
    }
    syncedUserId.current = userId

    let active = true
    void (async () => {
      try {
        const token = await getToken()
        if (!token || !active) {
          return
        }
        const response = await fetch(`${apiUrl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new Error(`User sync failed with status ${response.status}`)
        }
      } catch {
        // Allow a later render to retry if the sync request failed.
        syncedUserId.current = null
      }
    })()

    return () => {
      active = false
    }
  }, [isSignedIn, userId, getToken])

  return null
}
