import { describe, expect, it } from 'vitest'
import type { WeekDay } from '@rituvo/api-contract'

import {
  formatDateOnly,
  isHabitDueOnDate,
  isHabitStartedOnDate,
  parseDateOnly,
} from '../src/habits/habit-schedule'

describe('habit-schedule', () => {
  it('parses and formats date-only strings without timezone drift', () => {
    const date = parseDateOnly('2026-08-01')
    expect(formatDateOnly(date)).toBe('2026-08-01')
  })

  it('treats daily habits as due every day from the start date', () => {
    const habit = {
      frequency: 'daily' as const,
      scheduleDays: null,
      startDate: '2026-08-01',
    }

    expect(isHabitDueOnDate(habit, parseDateOnly('2026-07-31'))).toBe(false)
    expect(isHabitDueOnDate(habit, parseDateOnly('2026-08-01'))).toBe(true)
    expect(isHabitDueOnDate(habit, parseDateOnly('2026-08-02'))).toBe(true)
  })

  it('treats specific-day habits as due only on selected weekdays', () => {
    const habit = {
      frequency: 'specific_days' as const,
      scheduleDays: [1, 3, 5] satisfies WeekDay[],
      startDate: '2026-08-01',
    }

    // 2026-08-03 is a Monday (1)
    expect(isHabitDueOnDate(habit, parseDateOnly('2026-08-03'))).toBe(true)
    // 2026-08-04 is a Tuesday (2)
    expect(isHabitDueOnDate(habit, parseDateOnly('2026-08-04'))).toBe(false)
  })

  it('keeps future-start habits visible but not started before start date', () => {
    const habit = { startDate: '2026-08-10' }

    expect(isHabitStartedOnDate(habit, parseDateOnly('2026-08-09'))).toBe(false)
    expect(isHabitStartedOnDate(habit, parseDateOnly('2026-08-10'))).toBe(true)
  })
})
