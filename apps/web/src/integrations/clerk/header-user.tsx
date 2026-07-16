import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'

const CLERK_ENABLED =
  import.meta.env.VITE_CLERK_ENABLED !== 'false' &&
  typeof import.meta.env.VITE_CLERK_PUBLISHABLE_KEY === 'string' &&
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_')

export default function HeaderUser() {
  if (!CLERK_ENABLED) {
    return null
  }

  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  )
}
