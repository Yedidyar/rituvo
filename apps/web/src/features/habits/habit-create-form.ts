import type { CreateHabitInput, WeekDay } from '@rituvo/api-contract'

export type HabitCreateStep =
  | 'name'
  | 'description'
  | 'frequency'
  | 'reminder'
  | 'startDate'
  | 'target'
  | 'partner'
  | 'review'

export const HABIT_CREATE_STEPS: HabitCreateStep[] = [
  'name',
  'description',
  'frequency',
  'reminder',
  'startDate',
  'target',
  'partner',
  'review',
]

export interface HabitCreateFormState {
  name: string
  description: string
  frequency: 'daily' | 'specific_days'
  scheduleDays: WeekDay[]
  reminderTime: string
  startDate: string
  targetValue: string
  targetUnit: string
  partnerUserId: string
}

export type HabitCreateFieldErrors = Partial<
  Record<keyof HabitCreateFormState | 'submit', string>
>

export function createInitialHabitFormState(): HabitCreateFormState {
  return {
    name: '',
    description: '',
    frequency: 'daily',
    scheduleDays: [],
    reminderTime: '',
    startDate: todayIsoDate(),
    targetValue: '',
    targetUnit: '',
    partnerUserId: '',
  }
}

export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isHabitFormDirty(
  state: HabitCreateFormState,
  initial = createInitialHabitFormState(),
): boolean {
  return (
    state.name !== initial.name ||
    state.description !== initial.description ||
    state.frequency !== initial.frequency ||
    state.scheduleDays.join(',') !== initial.scheduleDays.join(',') ||
    state.reminderTime !== initial.reminderTime ||
    state.startDate !== initial.startDate ||
    state.targetValue !== initial.targetValue ||
    state.targetUnit !== initial.targetUnit ||
    state.partnerUserId !== initial.partnerUserId
  )
}

export function validateHabitStep(
  step: HabitCreateStep,
  state: HabitCreateFormState,
  messages: {
    nameRequired: string
    daysRequired: string
    startDateInvalid: string
    targetValueInvalid: string
    targetUnitRequired: string
  },
): HabitCreateFieldErrors {
  const errors: HabitCreateFieldErrors = {}

  if (step === 'name' || step === 'review') {
    if (!state.name.trim()) {
      errors.name = messages.nameRequired
    }
  }

  if (step === 'frequency' || step === 'review') {
    if (
      state.frequency === 'specific_days' &&
      state.scheduleDays.length === 0
    ) {
      errors.scheduleDays = messages.daysRequired
    }
  }

  if (step === 'startDate' || step === 'review') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.startDate)) {
      errors.startDate = messages.startDateInvalid
    }
  }

  if (step === 'target' || step === 'review') {
    const hasValue = state.targetValue.trim().length > 0
    const hasUnit = state.targetUnit.trim().length > 0

    if (hasValue) {
      const parsed = Number(state.targetValue)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        errors.targetValue = messages.targetValueInvalid
      }
    }

    if (hasUnit && !hasValue) {
      errors.targetValue = messages.targetValueInvalid
    }

    if (hasValue && !hasUnit) {
      errors.targetUnit = messages.targetUnitRequired
    }
  }

  return errors
}

export function toCreateHabitInput(
  state: HabitCreateFormState,
): CreateHabitInput {
  const input: CreateHabitInput = {
    name: state.name.trim(),
    frequency: state.frequency,
    startDate: state.startDate,
  }

  if (state.description.trim()) {
    input.description = state.description.trim()
  }

  if (state.frequency === 'specific_days') {
    input.scheduleDays = state.scheduleDays
  }

  if (state.reminderTime) {
    input.reminderTime = state.reminderTime
  }

  if (state.targetValue.trim()) {
    input.targetValue = Number(state.targetValue)
    input.targetUnit = state.targetUnit.trim()
  }

  if (state.partnerUserId) {
    input.partnerUserId = state.partnerUserId
  }

  return input
}

export const WEEK_DAYS: WeekDay[] = [0, 1, 2, 3, 4, 5, 6]
