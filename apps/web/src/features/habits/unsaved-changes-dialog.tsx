import { useBlocker } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useTranslation } from '#/i18n/locale-provider'

interface UnsavedChangesDialogProps {
  when: boolean
}

export function UnsavedChangesDialog({ when }: UnsavedChangesDialogProps) {
  const { translate } = useTranslation()
  const blocker = useBlocker({
    shouldBlockFn: () => when,
    withResolver: true,
  })

  if (blocker.status !== 'blocked') {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>{translate('habitCreate.unsavedTitle')}</CardTitle>
          <CardDescription>
            {translate('habitCreate.unsavedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => blocker.reset()}>
            {translate('common.stay')}
          </Button>
          <Button variant="destructive" onClick={() => blocker.proceed()}>
            {translate('common.discard')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
