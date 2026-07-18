import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { clerkEnabled } from '#/integrations/clerk/clerk-enabled'

export const Route = createFileRoute('/sign-in/$')({
  // Without ClerkProvider (Clerk disabled) the SignIn component would crash,
  // so the page does not exist in that configuration.
  beforeLoad: () => {
    if (!clerkEnabled) {
      throw redirect({ to: '/' })
    }
  },
  component: Page,
})

function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
