import { ClerkProvider } from '@clerk/tanstack-react-start'
import { heIL } from '@clerk/localizations'

import { useLocale } from '#/i18n/locale-provider'

import { clerkEnabled } from './clerk-enabled'

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale } = useLocale()

  if (!clerkEnabled) {
    return children
  }

  return (
    <ClerkProvider
      afterSignOutUrl="/"
      localization={locale === 'he' ? heIL : undefined}
    >
      {children}
    </ClerkProvider>
  )
}
