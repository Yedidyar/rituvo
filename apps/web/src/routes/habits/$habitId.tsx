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
import type { TranslationKey } from '#/i18n/translate'
import HeaderUser from '#/integrations/clerk/header-user'
import { getOrpc } from '#/lib/orpc-client'
import type { Habit } from '@rituvo/api-contract'

export const Route = createFileRoute('/habits/$habitId')({
  component: HabitDetailPage,
})

function HabitDetailPage() {
  const { habitId } = Route.useParams()
  const { translate } = useTranslation()
  const isClient = typeof window !== 'undefined'
  const habitGet = isClient
    ? getOrpc().habit.get.queryOptions({ input: { habitId } })
    : undefined

  const habitQuery = useQuery({
    queryKey: habitGet?.queryKey ?? ['habit', habitId],
    queryFn: habitGet?.queryFn ?? skipToken,
    enabled: isClient,
  })

  return (
    <div className="page-wrap mx-auto min-h-dvh max-w-2xl p-4 pb-8 sm:p-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" render={<Link to="/" />}>
          {translate('habitDetail.backToToday')}
        </Button>
        <HeaderUser />
      </header>

      <Show when="signed-out">
        <div className="rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            {translate('home.signInPrompt')}
          </p>
          <SignInButton>
            <Button className="mt-4">{translate('auth.signIn')}</Button>
          </SignInButton>
        </div>
      </Show>

      <Show when="signed-in">
        {habitQuery.isLoading ? (
          <p className="text-muted-foreground">{translate('common.loading')}</p>
        ) : null}

        {habitQuery.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>{translate('habitDetail.notFound')}</CardTitle>
            </CardHeader>
          </Card>
        ) : null}

        {habitQuery.data ? <HabitDetail habit={habitQuery.data} /> : null}
      </Show>
    </div>
  )
}

function HabitDetail({ habit }: { habit: Habit }) {
  const { translate } = useTranslation()
  const isClient = typeof window !== 'undefined'
  const listPartners = isClient
    ? getOrpc().habit.listPartners.queryOptions()
    : undefined

  const partnersQuery = useQuery({
    queryKey: listPartners?.queryKey ?? ['habit', 'listPartners'],
    queryFn: listPartners?.queryFn ?? skipToken,
    enabled: isClient && Boolean(habit.partnerUserId),
  })

  const scheduleLabel =
    habit.frequency === 'daily'
      ? translate('habitDetail.daily')
      : (habit.scheduleDays ?? [])
          .map((day) => translate(`weekdays.long.${day}` as TranslationKey))
          .join(', ')

  const partnerLabel = habit.partnerUserId
    ? (partnersQuery.data?.find(
        (partner) => partner.userId === habit.partnerUserId,
      )?.displayName ?? habit.partnerUserId)
    : translate('habitDetail.noPartner')

  const targetLabel =
    habit.targetValue && habit.targetUnit
      ? `${habit.targetValue} ${habit.targetUnit}`
      : translate('common.none')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{habit.name}</CardTitle>
        {habit.description ? (
          <CardDescription>{habit.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <dl className="divide-y rounded-lg border">
          <DetailRow
            label={translate('habitDetail.schedule')}
            value={scheduleLabel}
          />
          <DetailRow
            label={translate('habitDetail.startDate')}
            value={habit.startDate}
          />
          <DetailRow
            label={translate('habitDetail.target')}
            value={targetLabel}
          />
          <DetailRow
            label={translate('habitDetail.partner')}
            value={partnerLabel}
          />
        </dl>
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr]">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}
