import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Starts one Postgres container for the whole run and applies the schema;
    // its connection URL reaches the tests via provide/inject.
    globalSetup: ['test/global-setup.ts'],
    // A single container backs every test, so files must not write to it
    // concurrently. Run them one at a time and truncate between tests.
    fileParallelism: false,
    // Pulling the Postgres image and booting the container on a cold cache
    // can take a while; give the global setup room before failing.
    hookTimeout: 120000,
    testTimeout: 30000,
    server: {
      deps: {
        // @fastify/autoload dynamically imports the plugin and route files.
        // Left external, those imports run through Node's native ESM loader,
        // which cannot resolve the app's extensionless/directory imports.
        // Inlining autoload routes them through Vite so they resolve.
        inline: [/@fastify\/autoload/],
      },
    },
  },
})
