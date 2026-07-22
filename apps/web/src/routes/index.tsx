import { createFileRoute } from '@tanstack/react-router'

import { LanguageSwitcher } from '#/components/language-switcher'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/i18n/locale-provider'
import HeaderUser from '#/integrations/clerk/header-user'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { translate } = useTranslation()

  return (
    <div className="page-wrap p-8">
      <div className="mb-8 flex items-center justify-end gap-4">
        <LanguageSwitcher />
        <HeaderUser />
      </div>
      <h1 className="display-title text-4xl font-bold">
        {translate('home.title')}
      </h1>
      <p className="mt-4 text-lg">{translate('home.description')}</p>
      <p className="text-muted-foreground mt-4">
        {translate('home.editHintBefore')} <code>src/routes/index.tsx</code>{' '}
        {translate('home.editHintAfter')}
      </p>
      <Button className="mt-6">{translate('home.getStarted')}</Button>
    </div>
  )
}
