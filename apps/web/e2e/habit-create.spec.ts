import { clerk } from '@clerk/testing/playwright'
import { expect, test } from '@playwright/test'

const LOCALE_STORAGE_KEY = 'rituvo-locale'

const e2eEmail = process.env.E2E_CLERK_USER_EMAIL
const hasE2eCredentials = Boolean(
  e2eEmail &&
  process.env.CLERK_SECRET_KEY &&
  (process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY),
)

test.describe('create habit', () => {
  test.beforeAll(() => {
    if (process.env.CI && !hasE2eCredentials) {
      throw new Error(
        'CI is missing E2E env. Add GitHub secrets: CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, E2E_CLERK_USER_EMAIL',
      )
    }
  })

  test.skip(
    !hasE2eCredentials && !process.env.CI,
    'Set E2E_CLERK_USER_EMAIL plus Clerk keys in apps/web or apps/api env files',
  )

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((storageKey) => {
      localStorage.setItem(storageKey, 'en')
    }, LOCALE_STORAGE_KEY)

    await page.goto('/')
    await clerk.signIn({
      page,
      emailAddress: e2eEmail!,
    })
  })

  test('creates a daily habit and shows it on today', async ({ page }) => {
    const habitName = `Read for 20 minutes ${Date.now()}`

    await page.goto('/habits/new')
    await expect(
      page.getByRole('heading', { name: 'Name', exact: true }),
    ).toBeVisible()

    await page.locator('#habit-name').fill(habitName)
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(
      page.getByRole('heading', { name: 'Description', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click()

    await expect(
      page.getByRole('heading', { name: 'Frequency', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(
      page.getByRole('heading', { name: 'Reminder', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click()

    await expect(
      page.getByRole('heading', { name: 'Start date', exact: true }),
    ).toBeVisible()
    await expect(page.locator('#habit-start-date')).not.toHaveValue('')
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(
      page.getByRole('heading', { name: 'Target', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click()

    await expect(
      page.getByRole('heading', { name: 'Partner', exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click()

    await expect(
      page.getByRole('heading', { name: 'Review', exact: true }),
    ).toBeVisible()
    await expect(page.getByText(habitName)).toBeVisible()
    await page.getByRole('button', { name: 'Create habit' }).click()

    await expect(
      page.getByRole('heading', { name: 'Habit created' }),
    ).toBeVisible()
    await expect(page.getByText(habitName)).toBeVisible()

    await page.getByRole('button', { name: 'Back to today' }).click()
    await expect(
      page.getByRole('heading', { name: 'Today', exact: true }),
    ).toBeVisible()
    await expect(
      page
        .getByRole('region', { name: 'Due today' })
        .getByRole('heading', { name: habitName }),
    ).toBeVisible()
  })
})
