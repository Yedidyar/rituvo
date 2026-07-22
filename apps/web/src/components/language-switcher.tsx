import { localeLabels, locales } from '#/i18n/config'
import { useTranslation } from '#/i18n/locale-provider'
import { cn } from '#/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, translate } = useTranslation()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="sr-only">{translate('common.language')}</span>
      <div
        className="border-border bg-background inline-flex rounded-lg border p-0.5"
        role="group"
        aria-label={translate('common.language')}
      >
        {locales.map((value) => {
          const isActive = locale === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setLocale(value)}
              aria-pressed={isActive}
              aria-label={translate('common.switchTo', {
                language: localeLabels[value],
              })}
              className={cn(
                'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {localeLabels[value]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
