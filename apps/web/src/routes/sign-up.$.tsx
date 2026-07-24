import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '#/components/auth-layout'

export const Route = createFileRoute('/sign-up/$')({
  component: Page,
})

function Page() {
  return (
    <AuthLayout>
      <SignUp />
    </AuthLayout>
  )
}
