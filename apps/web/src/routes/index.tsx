import { createFileRoute } from '@tanstack/react-router'

import { LanguageSwitcher } from '#/components/language-switcher'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/i18n/locale-provider'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { t } = useTranslation()

  return (
    <div className="page-wrap p-8">
      <div className="mb-8 flex items-center justify-end">
        <LanguageSwitcher />
      </div>
      <h1 className="display-title text-4xl font-bold">{t('home.title')}</h1>
      <p className="mt-4 text-lg">{t('home.description')}</p>
      <p className="mt-4 text-muted-foreground">
        {t('home.editHintBefore')} <code>src/routes/index.tsx</code>{' '}
        {t('home.editHintAfter')}
      </p>
      <Button className="mt-6">{t('home.getStarted')}</Button>
    </div>
  )
}
