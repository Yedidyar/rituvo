import { createFileRoute, Link } from '@tanstack/react-router'
import { Show, SignInButton } from '@clerk/tanstack-react-start'
import { useQuery, skipToken } from '@tanstack/react-query'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useTranslation } from '#/i18n/locale-provider'
import HeaderUser from '#/integrations/clerk/header-user'
import { getOrpc } from '#/lib/orpc-client'
import { todayIsoDate } from '#/features/habits/habit-create-form'
import type { HabitSummary } from '@rituvo/api-contract'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { translate } = useTranslation()

  return (
    <div className="page-wrap mx-auto min-h-dvh max-w-2xl p-4 pb-8 sm:p-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          {translate('home.title')}
        </h1>
        <HeaderUser />
      </header>

      <Show when="signed-out">
        <Card>
          <CardHeader>
            <CardTitle>{translate('home.title')}</CardTitle>
            <CardDescription>{translate('home.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <SignInButton>
              <Button>{translate('auth.signIn')}</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </Show>

      <Show when="signed-in">
        <div className="mb-6">
          <Button render={<Link to="/habits/new" />}>
            {translate('home.createHabit')}
          </Button>
        </div>
        <TodayDashboard />
      </Show>
    </div>
  )
}

function TodayDashboard() {
  const { translate } = useTranslation()
  const isClient = typeof window !== 'undefined'
  const listActive = isClient
    ? getOrpc().habit.listActive.queryOptions({
        input: { referenceDate: todayIsoDate() },
      })
    : undefined

  const habitsQuery = useQuery({
    queryKey: listActive?.queryKey ?? ['habit', 'listActive'],
    queryFn: listActive?.queryFn ?? skipToken,
    enabled: isClient,
  })

  if (habitsQuery.isLoading) {
    return (
      <p className="text-muted-foreground">{translate('common.loading')}</p>
    )
  }

  if (habitsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{translate('habitCreate.errorTitle')}</CardTitle>
          <CardDescription>
            {translate('habitCreate.errorDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => habitsQuery.refetch()}>
            {translate('common.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const habits = habitsQuery.data ?? []
  const dueToday = habits.filter((habit) => habit.isDueToday)
  const activeHabits = habits.filter((habit) => !habit.isDueToday)

  return (
    <div className="space-y-8">
      <section aria-labelledby="due-today-heading">
        <h2 id="due-today-heading" className="mb-3 text-lg font-semibold">
          {translate('home.dueToday')}
        </h2>
        {dueToday.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {activeHabits.length === 0
                  ? translate('home.noHabitsTitle')
                  : translate('home.noHabitsDueTitle')}
              </CardTitle>
              <CardDescription>
                {activeHabits.length === 0
                  ? translate('home.noHabitsDescription')
                  : translate('home.noHabitsDueDescription')}
              </CardDescription>
            </CardHeader>
            {activeHabits.length === 0 ? (
              <CardContent>
                <Button render={<Link to="/habits/new" />}>
                  {translate('home.createHabit')}
                </Button>
              </CardContent>
            ) : null}
          </Card>
        ) : (
          <div className="space-y-3">
            {dueToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </section>

      {activeHabits.length > 0 ? (
        <section aria-labelledby="active-habits-heading">
          <h2 id="active-habits-heading" className="mb-3 text-lg font-semibold">
            {translate('home.activeHabits')}
          </h2>
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} showStatus />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function HabitCard({
  habit,
  showStatus = false,
}: {
  habit: HabitSummary
  showStatus?: boolean
}) {
  const { translate } = useTranslation()

  const statusLabel = habit.isDueToday
    ? translate('home.dueToday')
    : !habit.isStarted
      ? translate('home.startsOn', { date: habit.startDate })
      : translate('home.notDueToday')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{habit.name}</CardTitle>
        {habit.description ? (
          <CardDescription>{habit.description}</CardDescription>
        ) : null}
        {showStatus ? (
          <p className="text-xs text-muted-foreground">{statusLabel}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          render={<Link to="/habits/$habitId" params={{ habitId: habit.id }} />}
        >
          {translate('home.viewDetails')}
        </Button>
      </CardContent>
    </Card>
  )
}
