import { expect, test } from '@playwright/test'

test('home page shows title, disclaimer, and experience list', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('fit-eyes')
  await expect(page.getByRole('note')).toContainText('not a medical device')
  await expect(page.getByRole('main').getByRole('link', { name: 'Amsler grid' })).toBeVisible()
})

test('unknown path redirects to home', async ({ page }) => {
  await page.goto('/does-not-exist')
  await expect(page).toHaveURL('/')
})
