import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import AppClerkProvider from '../integrations/clerk/provider'
import UserSync from '../integrations/clerk/user-sync'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import { LocaleProvider } from '../i18n/locale-provider'
import { localeBootstrapScript } from '../i18n/locale-bootstrap'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

export interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Rituvo',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrapScript }} />
        <HeadContent />
      </head>
      <body>
        <LocaleProvider>
          <AppClerkProvider>
            <UserSync />
            {children}
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
          </AppClerkProvider>
        </LocaleProvider>
        <Scripts />
      </body>
    </html>
  )
}
