import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

import { clerkEnabled } from './integrations/clerk/clerk-enabled'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: clerkEnabled ? [clerkMiddleware()] : [],
  }
})
