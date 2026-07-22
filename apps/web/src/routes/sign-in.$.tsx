import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { clerkEnabled } from '#/integrations/clerk/clerk-enabled'

export const Route = createFileRoute('/sign-in/$')({
  // Without a Clerk publishable key, SignIn would crash, so redirect home.
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
