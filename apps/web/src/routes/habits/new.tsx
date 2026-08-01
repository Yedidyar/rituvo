import { createFileRoute, Link } from '@tanstack/react-router'
import { Show, SignInButton } from '@clerk/tanstack-react-start'

import { Button } from '#/components/ui/button'
import { HabitCreateWizard } from '#/features/habits/habit-create-wizard'
import { useTranslation } from '#/i18n/locale-provider'
import HeaderUser from '#/integrations/clerk/header-user'

export const Route = createFileRoute('/habits/new')({
  component: CreateHabitPage,
})

function CreateHabitPage() {
  const { translate } = useTranslation()

  return (
    <div className="page-wrap mx-auto min-h-dvh max-w-2xl p-4 pb-8 sm:p-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          {translate('common.back')}
        </Button>
        <HeaderUser />
      </header>

      <Show when="signed-out">
        <div className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            {translate('auth.signInToCreate')}
          </p>
          <SignInButton>
            <Button className="mt-4">{translate('auth.signIn')}</Button>
          </SignInButton>
        </div>
      </Show>

      <Show when="signed-in">
        <HabitCreateWizard />
      </Show>
    </div>
  )
}
