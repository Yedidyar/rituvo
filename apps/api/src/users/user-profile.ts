export interface UserProfile {
  email: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}

/**
 * The subset of a Clerk Backend API user resource that profile mapping
 * consumes. Declared structurally so this module does not depend on
 * @clerk/backend directly.
 */
export interface ClerkApiUser {
  primaryEmailAddressId: string | null
  emailAddresses: { id: string; emailAddress: string }[]
  firstName: string | null
  lastName: string | null
  imageUrl: string
}

export function profileFromClerkApiUser(clerkUser: ClerkApiUser): UserProfile {
  const primaryEmail = clerkUser.emailAddresses.find(
    (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
  )

  return {
    email: primaryEmail?.emailAddress ?? null,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  }
}

/**
 * The subset of a Clerk webhook user payload (snake_case JSON) that
 * profile mapping consumes. Declared structurally for the same reason
 * as ClerkApiUser.
 */
export interface ClerkWebhookUser {
  primary_email_address_id: string | null
  email_addresses: { id: string; email_address: string }[]
  first_name: string | null
  last_name: string | null
  image_url: string
}

export function profileFromWebhookUser(
  userData: ClerkWebhookUser,
): UserProfile {
  const primaryEmail = userData.email_addresses.find(
    (emailAddress) => emailAddress.id === userData.primary_email_address_id,
  )

  return {
    email: primaryEmail?.email_address ?? null,
    firstName: userData.first_name,
    lastName: userData.last_name,
    imageUrl: userData.image_url,
  }
}
