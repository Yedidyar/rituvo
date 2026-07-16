import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CLERK_ENABLED =
  import.meta.env.VITE_CLERK_ENABLED !== 'false' &&
  typeof PUBLISHABLE_KEY === 'string' &&
  PUBLISHABLE_KEY.startsWith('pk_')

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  if (!CLERK_ENABLED) {
    return children
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}
