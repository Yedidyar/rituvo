# Decision: Use oRPC with Fastify for service communication

## Status

Accepted

## Context

The web app and API need a type-safe communication layer that can grow with demo
features without duplicating request/response schemas. The API already runs on
Fastify, and the monorepo has room for a shared contract package.

## Decision

Adopt oRPC with a contract-first workflow:

- Define API contracts in `@rituvo/api-contract` using `@orpc/contract`
- Implement procedures in the API with `@orpc/server` and mount them via the
  native Fastify adapter (`RPCHandler` from `@orpc/server/fastify`) at `/rpc`
- Consume procedures from the web app with `@orpc/client` and `RPCLink`

REST remains for operational endpoints (health checks) and third-party webhooks
(Clerk). Application procedures move to oRPC.

## Consequences

- Shared input/output types flow from contract to server and clients
- New demo APIs should add procedures to the contract package first
- The API must build `@rituvo/api-contract` before bundling
- Clerk webhooks and health checks stay outside oRPC

## Alternatives considered

- **Plain REST + hand-written Zod schemas**: Already in use for `/me`; duplicates
  types between apps and lacks end-to-end procedure typing
- **tRPC**: Similar ergonomics, but oRPC also supports OpenAPI and fits the
  Fastify-native adapter requirement
- **GraphQL**: Heavier than needed for the demo scope

## Date

2026-07-22
