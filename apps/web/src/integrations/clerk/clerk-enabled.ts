const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export const clerkEnabled =
  import.meta.env.VITE_CLERK_ENABLED !== 'false' &&
  typeof publishableKey === 'string' &&
  publishableKey.startsWith('pk_')
