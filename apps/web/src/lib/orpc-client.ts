import { createORPCClient } from '@orpc/client'
import type { ContractRouterClient } from '@orpc/contract'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { contract } from '@rituvo/api-contract'
import { createClientOnlyFn } from '@tanstack/react-start'

export type ApiClient = ContractRouterClient<typeof contract>

type TokenGetter = () => Promise<string | null>

const tokenGetterRef: { current: TokenGetter } = {
  current: async () => null,
}

/** Wire Clerk's `getToken` so every oRPC request includes the session JWT. */
export function setApiTokenGetter(getter: TokenGetter) {
  tokenGetterRef.current = getter
}

function createLink() {
  return new RPCLink({
    url: `${import.meta.env.VITE_API_URL}/rpc`,
    headers: async () => {
      const token = await tokenGetterRef.current()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  })
}

let orpcUtils:
  | ReturnType<typeof createTanstackQueryUtils<ApiClient>>
  | undefined

export const getOrpc = createClientOnlyFn(() => {
  if (!orpcUtils) {
    const client = createORPCClient<ApiClient>(createLink())
    orpcUtils = createTanstackQueryUtils(client)
  }

  return orpcUtils
})
