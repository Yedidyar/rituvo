import { z } from 'zod'

export const weekDaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
])

export type WeekDay = z.infer<typeof weekDaySchema>

export const habitFrequencySchema = z.enum(['daily', 'specific_days'])

export const createHabitInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a name for your habit'),
    description: z.string().trim().optional(),
    frequency: habitFrequencySchema,
    scheduleDays: z.array(weekDaySchema).optional(),
    reminderTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Choose a valid reminder time')
      .optional(),
    startDate: z.iso.date('Choose a valid start date'),
    targetValue: z
      .number()
      .positive('Enter a target greater than zero')
      .optional(),
    targetUnit: z
      .string()
      .trim()
      .min(1, 'Add a unit for your target')
      .optional(),
    partnerUserId: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.frequency === 'specific_days') {
      if (!value.scheduleDays || value.scheduleDays.length === 0) {
        context.addIssue({
          code: 'custom',
          message: 'Select at least one day',
          path: ['scheduleDays'],
        })
      }
    }

    const hasTargetValue = value.targetValue !== undefined
    const hasTargetUnit =
      value.targetUnit !== undefined && value.targetUnit.length > 0

    if (hasTargetValue && !hasTargetUnit) {
      context.addIssue({
        code: 'custom',
        message: 'Add a unit for your target',
        path: ['targetUnit'],
      })
    }

    if (hasTargetUnit && !hasTargetValue) {
      context.addIssue({
        code: 'custom',
        message: 'Enter a target greater than zero',
        path: ['targetValue'],
      })
    }
  })

export type CreateHabitInput = z.infer<typeof createHabitInputSchema>

export const habitSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  frequency: habitFrequencySchema,
  scheduleDays: z.array(weekDaySchema).nullable(),
  reminderTime: z.string().nullable(),
  startDate: z.iso.date(),
  targetValue: z.number().nullable(),
  targetUnit: z.string().nullable(),
  partnerUserId: z.string().nullable(),
  status: z.enum(['active', 'paused', 'archived']),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type Habit = z.infer<typeof habitSchema>

export const habitSummarySchema = habitSchema.extend({
  isDueToday: z.boolean(),
  isStarted: z.boolean(),
})

export type HabitSummary = z.infer<typeof habitSummarySchema>

export const accountabilityPartnerSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  imageUrl: z.string().nullable(),
})

export type AccountabilityPartner = z.infer<typeof accountabilityPartnerSchema>
