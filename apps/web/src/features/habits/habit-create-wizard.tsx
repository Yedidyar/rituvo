import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Textarea } from '#/components/ui/textarea'
import {
  HABIT_CREATE_STEPS,
  WEEK_DAYS,
  createInitialHabitFormState,
  isHabitFormDirty,
  toCreateHabitInput,
  validateHabitStep,
} from '#/features/habits/habit-create-form'
import type {
  HabitCreateFieldErrors,
  HabitCreateFormState,
  HabitCreateStep,
} from '#/features/habits/habit-create-form'
import { UnsavedChangesDialog } from '#/features/habits/unsaved-changes-dialog'
import { useTranslation } from '#/i18n/locale-provider'
import type { TranslationKey } from '#/i18n/translate'
import { getOrpc } from '#/lib/orpc-client'
import type { Habit, WeekDay } from '@rituvo/api-contract'

const STEP_LABEL_KEYS: Record<HabitCreateStep, TranslationKey> = {
  name: 'habitCreate.stepName',
  description: 'habitCreate.stepDescription',
  frequency: 'habitCreate.stepFrequency',
  reminder: 'habitCreate.stepReminder',
  startDate: 'habitCreate.stepStartDate',
  target: 'habitCreate.stepTarget',
  partner: 'habitCreate.stepPartner',
  review: 'habitCreate.stepReview',
}

interface HabitCreateWizardProps {
  onCreated?: (habit: Habit) => void
}

export function HabitCreateWizard({ onCreated }: HabitCreateWizardProps) {
  const { translate } = useTranslation()
  const queryClient = useQueryClient()
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<HabitCreateFormState>(
    createInitialHabitFormState,
  )
  const [errors, setErrors] = useState<HabitCreateFieldErrors>({})
  const [createdHabit, setCreatedHabit] = useState<Habit | null>(null)

  const step = HABIT_CREATE_STEPS[stepIndex]
  const isDirty = useMemo(() => isHabitFormDirty(form), [form])

  const partnersQuery = useQuery({
    ...getOrpc().habit.listPartners.queryOptions(),
    enabled: step === 'partner' || step === 'review',
  })

  const createMutation = useMutation(
    getOrpc().habit.create.mutationOptions({
      onSuccess: async (habit) => {
        await queryClient.invalidateQueries({
          queryKey: getOrpc().habit.listActive.key(),
        })
        setCreatedHabit(habit)
        onCreated?.(habit)
      },
    }),
  )

  const validationMessages = useMemo(
    () => ({
      nameRequired: translate('habitCreate.validation.nameRequired'),
      daysRequired: translate('habitCreate.validation.daysRequired'),
      startDateInvalid: translate('habitCreate.validation.startDateInvalid'),
      targetValueInvalid: translate(
        'habitCreate.validation.targetValueInvalid',
      ),
      targetUnitRequired: translate(
        'habitCreate.validation.targetUnitRequired',
      ),
    }),
    [translate],
  )

  const updateField = useCallback(
    <K extends keyof HabitCreateFormState>(
      key: K,
      value: HabitCreateFormState[K],
    ) => {
      setForm((current) => ({ ...current, [key]: value }))
      setErrors((current) => {
        if (!(key in current)) {
          return current
        }
        const next = { ...current }
        delete next[key]
        return next
      })
    },
    [],
  )

  const toggleDay = useCallback((day: WeekDay) => {
    setForm((current) => {
      const exists = current.scheduleDays.includes(day)
      return {
        ...current,
        scheduleDays: exists
          ? current.scheduleDays.filter((value) => value !== day)
          : [...current.scheduleDays, day].sort((a, b) => a - b),
      }
    })
    setErrors((current) => {
      if (!current.scheduleDays) {
        return current
      }
      const next = { ...current }
      delete next.scheduleDays
      return next
    })
  }, [])

  const validateCurrentStep = useCallback(() => {
    const nextErrors = validateHabitStep(step, form, validationMessages)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [form, step, validationMessages])

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return
    }

    setStepIndex((current) =>
      Math.min(current + 1, HABIT_CREATE_STEPS.length - 1),
    )
  }, [validateCurrentStep])

  const goBack = useCallback(() => {
    setErrors({})
    setStepIndex((current) => Math.max(current - 1, 0))
  }, [])

  const skipStep = useCallback(() => {
    setErrors({})
    if (step === 'target') {
      setForm((current) => ({
        ...current,
        targetValue: '',
        targetUnit: '',
      }))
    }
    setStepIndex((current) =>
      Math.min(current + 1, HABIT_CREATE_STEPS.length - 1),
    )
  }, [step])

  const submit = useCallback(() => {
    if (!validateCurrentStep()) {
      return
    }

    createMutation.mutate(toCreateHabitInput(form))
  }, [createMutation, form, validateCurrentStep])

  useEffect(() => {
    if (!isDirty) {
      return
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  if (createdHabit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{translate('habitCreate.successTitle')}</CardTitle>
          <CardDescription>
            {translate('habitCreate.successDescription', {
              name: createdHabit.name,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={
              <Link
                to="/habits/$habitId"
                params={{ habitId: createdHabit.id }}
              />
            }
          >
            {translate('habitCreate.viewHabit')}
          </Button>
          <Button variant="outline" render={<Link to="/" />}>
            {translate('habitCreate.backToDashboard')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const canSkip =
    step === 'description' ||
    step === 'reminder' ||
    step === 'target' ||
    step === 'partner'

  return (
    <>
      <UnsavedChangesDialog when={isDirty && !createMutation.isPending} />

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {translate('habitCreate.title')} · {translate(STEP_LABEL_KEYS[step])}{' '}
          ({stepIndex + 1}/{HABIT_CREATE_STEPS.length})
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eaf1ec]">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${((stepIndex + 1) / HABIT_CREATE_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{translate(STEP_LABEL_KEYS[step])}</CardTitle>
          {step === 'name' ? (
            <CardDescription>
              {translate('habitCreate.subtitle')}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'name' ? (
            <Field
              id="habit-name"
              label={translate('habitCreate.nameLabel')}
              help={translate('habitCreate.nameHelp')}
              error={errors.name}
              required
            >
              <Input
                id="habit-name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder={translate('habitCreate.namePlaceholder')}
                aria-invalid={Boolean(errors.name)}
                autoFocus
              />
            </Field>
          ) : null}

          {step === 'description' ? (
            <Field
              id="habit-description"
              label={translate('habitCreate.descriptionLabel')}
              help={translate('habitCreate.descriptionHelp')}
              optionalLabel={translate('common.optional')}
            >
              <Textarea
                id="habit-description"
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                placeholder={translate('habitCreate.descriptionPlaceholder')}
                rows={4}
                autoFocus
              />
            </Field>
          ) : null}

          {step === 'frequency' ? (
            <div className="space-y-4">
              <Label>{translate('habitCreate.frequencyLabel')}</Label>
              <RadioGroup
                value={form.frequency}
                onValueChange={(value) =>
                  updateField(
                    'frequency',
                    value as HabitCreateFormState['frequency'],
                  )
                }
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="daily" className="mt-0.5" />
                  <span>
                    <span className="font-medium">
                      {translate('habitCreate.frequencyDaily')}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {translate('habitCreate.frequencyDailyHelp')}
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="specific_days" className="mt-0.5" />
                  <span>
                    <span className="font-medium">
                      {translate('habitCreate.frequencySpecificDays')}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {translate('habitCreate.frequencySpecificDaysHelp')}
                    </span>
                  </span>
                </label>
              </RadioGroup>

              {form.frequency === 'specific_days' ? (
                <div className="space-y-2">
                  <Label>{translate('habitCreate.daysLabel')}</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {WEEK_DAYS.map((day) => (
                      <label
                        key={day}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border p-2"
                      >
                        <Checkbox
                          checked={form.scheduleDays.includes(day)}
                          onCheckedChange={() => toggleDay(day)}
                        />
                        <span className="text-sm">
                          {translate(`weekdays.long.${day}` as TranslationKey)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.scheduleDays ? (
                    <p className="text-sm text-destructive">
                      {errors.scheduleDays}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'reminder' ? (
            <Field
              id="habit-reminder"
              label={translate('habitCreate.reminderLabel')}
              help={translate('habitCreate.reminderHelp')}
              optionalLabel={translate('common.optional')}
            >
              <Input
                id="habit-reminder"
                type="time"
                value={form.reminderTime}
                onChange={(event) =>
                  updateField('reminderTime', event.target.value)
                }
              />
            </Field>
          ) : null}

          {step === 'startDate' ? (
            <Field
              id="habit-start-date"
              label={translate('habitCreate.startDateLabel')}
              help={translate('habitCreate.startDateHelp')}
              error={errors.startDate}
              required
            >
              <Input
                id="habit-start-date"
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  updateField('startDate', event.target.value)
                }
                aria-invalid={Boolean(errors.startDate)}
              />
            </Field>
          ) : null}

          {step === 'target' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {translate('habitCreate.targetHelp')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="habit-target-value"
                  label={translate('habitCreate.targetValueLabel')}
                  error={errors.targetValue}
                  optionalLabel={translate('common.optional')}
                >
                  <Input
                    id="habit-target-value"
                    inputMode="decimal"
                    value={form.targetValue}
                    onChange={(event) =>
                      updateField('targetValue', event.target.value)
                    }
                    placeholder={translate(
                      'habitCreate.targetValuePlaceholder',
                    )}
                    aria-invalid={Boolean(errors.targetValue)}
                  />
                </Field>
                <Field
                  id="habit-target-unit"
                  label={translate('habitCreate.targetUnitLabel')}
                  error={errors.targetUnit}
                  optionalLabel={translate('common.optional')}
                >
                  <Input
                    id="habit-target-unit"
                    value={form.targetUnit}
                    onChange={(event) =>
                      updateField('targetUnit', event.target.value)
                    }
                    placeholder={translate('habitCreate.targetUnitPlaceholder')}
                    aria-invalid={Boolean(errors.targetUnit)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 'partner' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {translate('habitCreate.partnerHelp')}
              </p>

              {partnersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  {translate('common.loading')}
                </p>
              ) : null}

              {partnersQuery.isError ? (
                <p className="text-sm text-destructive">
                  {translate('habitCreate.errorDescription')}
                </p>
              ) : null}

              {partnersQuery.data && partnersQuery.data.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4">
                  <p className="font-medium">
                    {translate('habitCreate.noPartnersTitle')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {translate('habitCreate.noPartnersDescription')}
                  </p>
                </div>
              ) : null}

              {partnersQuery.data && partnersQuery.data.length > 0 ? (
                <RadioGroup
                  value={form.partnerUserId || 'none'}
                  onValueChange={(value) =>
                    updateField('partnerUserId', value === 'none' ? '' : value)
                  }
                >
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                    <RadioGroupItem value="none" />
                    <span>{translate('habitCreate.partnerNone')}</span>
                  </label>
                  {partnersQuery.data.map((partner) => (
                    <label
                      key={partner.userId}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    >
                      <RadioGroupItem value={partner.userId} />
                      <span>{partner.displayName}</span>
                    </label>
                  ))}
                </RadioGroup>
              ) : null}
            </div>
          ) : null}

          {step === 'review' ? (
            <>
              <ReviewSummary form={form} partners={partnersQuery.data ?? []} />
              {errors.targetValue || errors.targetUnit ? (
                <div
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                  role="alert"
                >
                  {errors.targetValue ? (
                    <p className="text-sm text-destructive">
                      {errors.targetValue}
                    </p>
                  ) : null}
                  {errors.targetUnit ? (
                    <p className="text-sm text-destructive">
                      {errors.targetUnit}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {createMutation.isError ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              role="alert"
            >
              <p className="font-medium">
                {translate('habitCreate.errorTitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {translate('habitCreate.errorDescription')}
              </p>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                onClick={() => createMutation.reset()}
              >
                {translate('common.retry')}
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              {stepIndex > 0 ? (
                <Button variant="outline" onClick={goBack}>
                  {translate('common.back')}
                </Button>
              ) : null}
              {canSkip ? (
                <Button variant="ghost" onClick={skipStep}>
                  {translate('common.skip')}
                </Button>
              ) : null}
            </div>

            {step === 'review' ? (
              <Button onClick={submit} disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? translate('habitCreate.creating')
                  : translate('habitCreate.createAction')}
              </Button>
            ) : (
              <Button onClick={goNext}>{translate('common.next')}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function Field({
  id,
  label,
  help,
  error,
  required,
  optionalLabel,
  children,
}: {
  id: string
  label: string
  help?: string
  error?: string
  required?: boolean
  optionalLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        {required ? (
          <span className="text-xs text-muted-foreground">*</span>
        ) : null}
        {optionalLabel ? (
          <span className="text-xs text-muted-foreground">{optionalLabel}</span>
        ) : null}
      </div>
      {help ? <p className="text-sm text-muted-foreground">{help}</p> : null}
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function ReviewSummary({
  form,
  partners,
}: {
  form: HabitCreateFormState
  partners: Array<{ userId: string; displayName: string }>
}) {
  const { translate } = useTranslation()

  const frequencyLabel =
    form.frequency === 'daily'
      ? translate('habitCreate.frequencyDaily')
      : form.scheduleDays
          .map((day) => translate(`weekdays.short.${day}` as TranslationKey))
          .join(', ')

  const partnerLabel =
    partners.find((partner) => partner.userId === form.partnerUserId)
      ?.displayName ?? translate('habitCreate.partnerNone')

  const targetLabel =
    form.targetValue.trim() && form.targetUnit.trim()
      ? `${form.targetValue} ${form.targetUnit}`
      : translate('common.none')

  const rows = [
    { label: translate('habitCreate.review.name'), value: form.name },
    {
      label: translate('habitCreate.review.description'),
      value: form.description.trim() || translate('common.none'),
    },
    { label: translate('habitCreate.review.frequency'), value: frequencyLabel },
    {
      label: translate('habitCreate.review.reminder'),
      value: form.reminderTime || translate('habitCreate.reminderPlaceholder'),
    },
    { label: translate('habitCreate.review.startDate'), value: form.startDate },
    { label: translate('habitCreate.review.target'), value: targetLabel },
    { label: translate('habitCreate.review.partner'), value: partnerLabel },
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {translate('habitCreate.reviewSubtitle')}
      </p>
      <dl className="divide-y rounded-lg border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr]"
          >
            <dt className="text-sm font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="text-sm">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
