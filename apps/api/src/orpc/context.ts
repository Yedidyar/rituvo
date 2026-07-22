import type { FastifyRequest } from 'fastify'

import type { AppConfig } from '../config'
import type { Database } from '../db'

export interface RpcContext {
  request: FastifyRequest
  config: AppConfig
  db: Database
  userId?: string
}

export interface AuthedRpcContext extends RpcContext {
  userId: string
}
