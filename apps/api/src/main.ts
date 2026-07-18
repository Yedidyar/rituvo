import Fastify from 'fastify'
import { app } from './app/app'
import { env } from './env'

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
})

// Register your application as a normal plugin.
server.register(app)

// Start listening.
server.listen({ port: env.PORT, host: env.HOST }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  } else {
    console.log(`[ ready ] http://${env.HOST}:${env.PORT}`)
  }
})
