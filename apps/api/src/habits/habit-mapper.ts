import type { Habit, HabitSummary } from '@rituvo/api-contract'

import type { HabitRow } from './habits-repository'
import {
  isHabitDueOnDate,
  isHabitStartedOnDate,
  parseDateOnly,
} from './habit-schedule'

export function toHabitDto(habit: HabitRow): Habit {
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    scheduleDays: (habit.scheduleDays ?? null) as Habit['scheduleDays'],
    reminderTime: habit.reminderTime,
    startDate: habit.startDate,
    targetValue: habit.targetValue !== null ? Number(habit.targetValue) : null,
    targetUnit: habit.targetUnit,
    partnerUserId: habit.partnerUserId,
    status: habit.status,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  }
}

export function toHabitSummaryDto(
  habit: HabitRow,
  referenceDate: string,
): HabitSummary {
  const date = parseDateOnly(referenceDate)
  const dto = toHabitDto(habit)

  return {
    ...dto,
    isDueToday: isHabitDueOnDate(
      {
        frequency: habit.frequency,
        scheduleDays: (habit.scheduleDays ??
          null) as HabitSummary['scheduleDays'],
        startDate: habit.startDate,
      },
      date,
    ),
    isStarted: isHabitStartedOnDate({ startDate: habit.startDate }, date),
  }
}

export function partnerDisplayName(
  firstName: string | null,
  lastName: string | null,
  email: string | null,
): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (fullName) {
    return fullName
  }

  return email ?? 'Partner'
}
