import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/tanstack-react-start'
import { Settings } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { useTranslation } from '#/i18n/locale-provider'

export default function HeaderUser() {
  const { translate } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton>
          <Button variant="ghost">{translate('auth.signIn')}</Button>
        </SignInButton>
        <SignUpButton>
          <Button>{translate('auth.signUp')}</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label={translate('settings.title')}
              labelIcon={<Settings className="size-4" />}
              href="/settings"
            />
          </UserButton.MenuItems>
        </UserButton>
      </Show>
    </div>
  )
}
