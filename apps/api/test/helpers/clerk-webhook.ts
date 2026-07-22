import { Webhook } from 'svix'

export interface SvixHeaders {
  'svix-id': string
  'svix-timestamp': string
  'svix-signature': string
}

let messageCounter = 0

/**
 * Produces the Svix headers Clerk sends alongside a webhook payload, signed
 * with the given secret. Because the secret matches the one the route
 * verifies against, the route's real signature check passes — no mocking of
 * verification involved.
 *
 * @param signingSecret the whsec_-prefixed secret shared with the route
 * @param payload the exact request body string that will be sent
 * @returns the svix-id / svix-timestamp / svix-signature headers to attach
 */
export function signClerkWebhook(
  signingSecret: string,
  payload: string,
): SvixHeaders {
  const webhook = new Webhook(signingSecret)
  messageCounter += 1
  const messageId = `msg_test_${messageCounter}`
  const timestamp = new Date()
  const signature = webhook.sign(messageId, timestamp, payload)

  return {
    'svix-id': messageId,
    'svix-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
    'svix-signature': signature,
  }
}
