import { oc } from '@orpc/contract'
import { z } from 'zod'

import {
  accountabilityPartnerSchema,
  createHabitInputSchema,
  habitSchema,
  habitSummarySchema,
} from './schemas/habit.js'
import { userSchema } from './schemas/user.js'

export {
  accountabilityPartnerSchema,
  createHabitInputSchema,
  habitFrequencySchema,
  habitSchema,
  habitSummarySchema,
  weekDaySchema,
  type AccountabilityPartner,
  type CreateHabitInput,
  type Habit,
  type HabitSummary,
  type WeekDay,
} from './schemas/habit.js'
export { userSchema, type User } from './schemas/user.js'

export const contract = {
  user: {
    me: oc.output(userSchema),
  },
  habit: {
    create: oc.input(createHabitInputSchema).output(habitSchema),
    listActive: oc
      .input(
        z
          .object({
            referenceDate: z.iso.date().optional(),
          })
          .optional(),
      )
      .output(z.array(habitSummarySchema)),
    listPartners: oc.output(z.array(accountabilityPartnerSchema)),
    get: oc.input(z.object({ habitId: z.uuid() })).output(habitSchema),
  },
} as const
