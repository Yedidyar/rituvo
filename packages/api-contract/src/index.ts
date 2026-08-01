import { oc } from '@orpc/contract'

import { userSchema } from './schemas/user.js'

export { userSchema, type User } from './schemas/user.js'

export const contract = {
  user: {
    me: oc.output(userSchema),
  },
} as const
