import { expect, test } from '@playwright/test'

const CARD_WIDTH_MM = 85.6

test('calibration sets the grid to 100 mm', async ({ page }) => {
  await page.goto('/calibrate')
  const card = page.getByTestId('card-outline')
  const before = (await card.boundingBox())!.width
  await page.getByTestId('wider-10').click()
  await page.getByTestId('wider-10').click()
  await page.getByTestId('wider-1').click()
  const after = (await card.boundingBox())!.width
  expect(after).toBeCloseTo(before + 21, 0)
  await page.getByTestId('save-calibration').click()
  await expect(page.getByRole('status')).toContainText('Saved')

  await page.goto('/amsler')
  await expect(page.getByText('not calibrated')).toHaveCount(0)
  const area = (await page.getByTestId('grid-area').boundingBox())!
  const expected = (after / CARD_WIDTH_MM) * 100
  expect(area.width).toBeCloseTo(expected, 0)
  expect(area.height).toBeCloseTo(expected, 0)
})

test('grid warns when not calibrated', async ({ page }) => {
  await page.goto('/amsler')
  await expect(page.getByText('not calibrated')).toBeVisible()
})

test('labels toggle shows row numbers and column letters', async ({ page }) => {
  await page.goto('/amsler')
  const grid = page.getByRole('img', { name: /Amsler grid/ })
  await expect(grid.locator('text')).toHaveCount(0)
  await page.getByTestId('toggle-labels').check()
  await expect(grid.locator('text')).toHaveCount(40)
  await expect(grid.locator('text', { hasText: /^T$/ })).toHaveCount(1)
  await expect(grid.locator('text', { hasText: /^20$/ })).toHaveCount(1)
})

test('theme toggle switches grid colors and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/amsler')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-theme', 'light')
  const lineColor = () =>
    page.locator('.amsler-grid line').first().evaluate((el) => getComputedStyle(el).stroke)
  expect(await lineColor()).toBe('rgb(0, 0, 0)')
  await page.getByTestId('toggle-theme').click()
  await expect(html).toHaveAttribute('data-theme', 'dark')
  expect(await lineColor()).toBe('rgb(255, 255, 255)')
  await page.reload()
  await expect(html).toHaveAttribute('data-theme', 'dark')
})
