import type { WeekDay } from '@rituvo/api-contract'

export interface HabitSchedule {
  frequency: 'daily' | 'specific_days'
  scheduleDays: WeekDay[] | null
  startDate: string
}

/** Parse YYYY-MM-DD as a local calendar date (no timezone drift). */
export function parseDateOnly(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isHabitStartedOnDate(
  habit: Pick<HabitSchedule, 'startDate'>,
  date: Date,
): boolean {
  const start = parseDateOnly(habit.startDate)
  return date >= start
}

export function isHabitDueOnDate(habit: HabitSchedule, date: Date): boolean {
  if (!isHabitStartedOnDate(habit, date)) {
    return false
  }

  if (habit.frequency === 'daily') {
    return true
  }

  return habit.scheduleDays?.includes(date.getDay() as WeekDay) ?? false
}

export function todayDateOnly(): string {
  return formatDateOnly(new Date())
}
