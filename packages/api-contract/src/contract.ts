import { oc } from '@orpc/contract'

import { currentUserSchema } from './schemas/user.js'

export const currentUserContract = oc.output(currentUserSchema)

export const contract = {
  user: {
    current: currentUserContract,
  },
}
