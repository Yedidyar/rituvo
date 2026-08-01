import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '#/components/auth-layout'

export const Route = createFileRoute('/sign-in/$')({
  component: Page,
})

function Page() {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  )
}
