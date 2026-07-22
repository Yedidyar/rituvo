const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export const clerkEnabled =
  typeof publishableKey === 'string' && publishableKey.startsWith('pk_')
