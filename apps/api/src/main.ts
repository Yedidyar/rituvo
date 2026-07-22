import Fastify from 'fastify'

import { app } from './app/app'
import { loadConfig } from './config'

// The composition root: load configuration once and thread it through the app.
const config = loadConfig()

const server = Fastify({
  logger: true,
})

server.register(app, { config })

server.listen({ port: config.port, host: config.host }, (err) => {
  if (err) {
    server.log.error(err)
    throw err
  }

  server.log.info(`[ ready ] http://${config.host}:${config.port}`)
})
