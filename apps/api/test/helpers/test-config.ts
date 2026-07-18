import type { AppConfig } from '../../src/config'

/**
 * The Svix signing secret used on both sides of the webhook tests: it is put
 * into the config the app is built with (so the route verifies against it) and
 * imported by the tests to sign payloads with the same value.
 */
export const CLERK_WEBHOOK_TEST_SECRET =
  'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw'

/**
 * Builds the application configuration for a test run, pointed at the given
 * throwaway database. Clerk network calls are mocked in the tests, so the keys
 * only need to be present for the routes to treat authentication as configured.
 */
export function testConfig(databaseUrl: string): AppConfig {
  return {
    host: 'localhost',
    port: 3001,
    webOrigin: 'http://localhost:3000',
    databaseUrl,
    clerk: {
      publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      secretKey: 'sk_test_clerk_secret_key_placeholder',
      webhookSigningSecret: CLERK_WEBHOOK_TEST_SECRET,
    },
  }
}
