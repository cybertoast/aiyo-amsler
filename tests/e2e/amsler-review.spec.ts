import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const FIXTURE = fileURLToPath(new URL('./fixtures/amsler-session.json', import.meta.url))

async function uploadFixture(page: Page): Promise<void> {
  await page.goto('/amsler/review')
  await page.getByTestId('session-file').setInputFiles(FIXTURE)
  await expect(page.getByTestId('session-name')).toHaveText('left-red-2026-09-27-0930')
}

test('uploaded file shows session details and puts the session in the URL', async ({ page }) => {
  await uploadFixture(page)
  await expect(page.getByTestId('session-eye')).toHaveText('left')
  await expect(page.getByTestId('response-counts')).toHaveText(
    '5 cells tested: 2 clear, 2 blurry, 1 invisible.',
  )
  await expect(page.getByText('Blurry: B1, T20')).toBeVisible()
  await expect(page.getByText('Invisible: B2')).toBeVisible()
  await expect(page.getByText('128/82 mmHg, pulse 70')).toBeVisible()
  await expect(page.getByRole('note')).toContainText('not a medical device')
  expect(new URL(page.url()).hash).toMatch(/^#s=[A-Za-z0-9_-]+$/)
})

test('share link opened in a new page shows the same session', async ({ page, context }) => {
  await uploadFixture(page)
  const link = await page.getByTestId('share-link').inputValue()
  const other = await context.newPage()
  await other.goto(link)
  await expect(other.getByTestId('session-name')).toHaveText('left-red-2026-09-27-0930')
  await expect(other.getByTestId('response-counts')).toContainText('5 cells tested')
})

test('copy link writes the share link to the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await uploadFixture(page)
  await page.getByTestId('copy-link').click()
  await expect(page.getByTestId('actions-status')).toHaveText('Link copied.')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toBe(await page.getByTestId('share-link').inputValue())
})

test('downloaded file loads back to the same session', async ({ page }) => {
  await uploadFixture(page)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('download-session').click(),
  ])
  expect(download.suggestedFilename()).toBe('amsler-left-red-20260927-0930.json')
  const saved = JSON.parse(await readFile(await download.path(), 'utf-8'))
  const original = JSON.parse(await readFile(FIXTURE, 'utf-8'))
  expect(saved.url).toBe(await page.getByTestId('share-link').inputValue())
  delete saved.url
  expect(saved).toEqual(original)
})

test('invalid link shows an error', async ({ page }) => {
  await page.goto('/amsler/review#s=AAAA')
  await expect(page.getByTestId('load-error')).toHaveText('This link does not contain valid session data.')
})

test('invalid file shows an error', async ({ page }) => {
  await page.goto('/amsler/review')
  await page.getByTestId('session-file').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"v":2}'),
  })
  await expect(page.getByTestId('load-error')).toContainText('newer version')
})
