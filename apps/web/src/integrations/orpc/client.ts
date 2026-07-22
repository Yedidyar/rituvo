import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { ContractRouterClient } from '@orpc/contract'
import { contract } from '@rituvo/api-contract'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function createApiClient(
  getToken: () => Promise<string | null>,
): ContractRouterClient<typeof contract> {
  const link = new RPCLink({
    url: `${apiUrl}/rpc`,
    headers: async () => {
      const token = await getToken()
      if (!token) {
        return {}
      }

      return { Authorization: `Bearer ${token}` }
    },
  })

  return createORPCClient(link)
}
