import { createFileRoute, Link } from '@tanstack/react-router'
import { Show, SignInButton } from '@clerk/tanstack-react-start'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { localeLabels, locales } from '#/i18n/config'
import type { Locale } from '#/i18n/config'
import { useTranslation } from '#/i18n/locale-provider'
import HeaderUser from '#/integrations/clerk/header-user'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { translate, locale, setLocale } = useTranslation()

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
        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">
              {translate('settings.title')}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{translate('settings.languageLabel')}</CardTitle>
              <CardDescription>
                {translate('settings.languageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguagePreference locale={locale} onChange={setLocale} />
            </CardContent>
          </Card>
        </div>
      </Show>
    </div>
  )
}

function LanguagePreference({
  locale,
  onChange,
}: {
  locale: Locale
  onChange: (locale: Locale) => void
}) {
  const { translate } = useTranslation()

  return (
    <RadioGroup
      value={locale}
      onValueChange={(value) => onChange(value as Locale)}
      aria-label={translate('settings.languageLabel')}
    >
      {locales.map((value) => (
        <label
          key={value}
          htmlFor={`locale-${value}`}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors',
            locale === value
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40',
          )}
        >
          <RadioGroupItem id={`locale-${value}`} value={value} />
          <Label
            htmlFor={`locale-${value}`}
            className="cursor-pointer font-medium"
          >
            {localeLabels[value]}
          </Label>
        </label>
      ))}
    </RadioGroup>
  )
}
