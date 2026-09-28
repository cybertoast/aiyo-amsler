import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const FIXTURE = fileURLToPath(new URL('./fixtures/amsler-session.json', import.meta.url))

async function runSampleTest(page: Page, n: number, answers: string): Promise<void> {
  await page.getByTestId('scope-sample').check()
  await page.getByTestId('scope-sample-n').fill(String(n))
  await page.getByTestId('start-test').click()
  for (const key of answers) await page.keyboard.press(key)
  await expect(page).toHaveURL(/\/amsler\/review#s=/)
}

test('blood pressure is validated, stored in the session, and offered for reuse', async ({ page }) => {
  await page.goto('/amsler/test')
  await page.getByTestId('bp-record').check()
  await expect(page.getByTestId('start-test')).toBeDisabled()
  await page.getByTestId('bp-pulse').fill('70')
  await page.getByTestId('bp-diastolic').fill('82')
  await page.getByTestId('bp-systolic').fill('400')
  await expect(page.getByTestId('bp-errors')).toContainText('Systolic')
  // The field that makes the input valid is filled last (regression: the reading was lost in this case).
  await page.getByTestId('bp-systolic').fill('128')
  await expect(page.getByTestId('bp-errors')).toHaveCount(0)
  await runSampleTest(page, 2, '12')
  await expect(page.getByTestId('session-bp')).toContainText('128/82 mmHg, pulse 70')

  await page.goto('/amsler/test')
  await page.getByTestId('bp-use-recent').click()
  await expect(page.getByTestId('bp-systolic')).toHaveValue('128')
  await expect(page.getByTestId('bp-pulse')).toHaveValue('70')
})

test('review shows a results grid matching the answers', async ({ page }) => {
  await page.goto('/amsler/test')
  await runSampleTest(page, 4, '1233')
  await expect(page.locator('[data-result="clear"]')).toHaveCount(1)
  await expect(page.locator('[data-result="blurry"]')).toHaveCount(1)
  await expect(page.locator('[data-result="invisible"]')).toHaveCount(2)
})

test('next test opens setup with the same settings', async ({ page }) => {
  await page.goto('/amsler/review')
  await page.getByTestId('session-file').setInputFiles(FIXTURE)
  await page.getByTestId('next-test').click()
  await expect(page).toHaveURL('/amsler/test')
  await expect(page.getByTestId('eye-left')).toBeChecked()
  await expect(page.getByTestId('color-red')).toBeChecked()
  await expect(page.getByTestId('scope-sample')).toBeChecked()
  await expect(page.getByTestId('scope-sample-n')).toHaveValue('5')
})

test('compare lists sessions side by side and keeps them in the URL', async ({ page }) => {
  await page.goto('/amsler/test')
  await page.getByTestId('eye-right').check()
  await runSampleTest(page, 3, '111')
  const ownLink = await page.getByTestId('share-link').inputValue()
  await page.getByTestId('compare').click()
  await expect(page).toHaveURL(/\/amsler\/compare#s=/)
  await expect(page.getByTestId('compare-card')).toHaveCount(1)

  await page.getByTestId('session-file').setInputFiles(FIXTURE)
  await expect(page.getByTestId('compare-card')).toHaveCount(2)
  expect(new URL(page.url()).hash.match(/s=/g)).toHaveLength(2)

  await page.reload()
  await expect(page.getByTestId('compare-card')).toHaveCount(2)

  await page.getByTestId('compare-link-input').fill(ownLink)
  await page.getByTestId('compare-add-link').click()
  await expect(page.getByTestId('compare-card')).toHaveCount(2)

  await page.getByTestId('compare-link-input').fill('https://example.test/nothing')
  await page.getByTestId('compare-add-link').click()
  await expect(page.getByTestId('compare-error')).toHaveText('That text is not a fit-eyes share link.')

  await page.getByTestId('compare-card').first().getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByTestId('compare-card')).toHaveCount(1)
})

test('spoken prompts read instructions and cell names in label mode', async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: string[] = []
    ;(window as unknown as { __spoken: string[] }).__spoken = spoken
    class FakeUtterance {
      rate = 1
      constructor(public text: string) {}
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance })
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: (u: FakeUtterance) => spoken.push(u.text), cancel: () => {} },
    })
  })
  await page.goto('/amsler/test')
  await page.getByTestId('speech-enabled').check()
  await page.getByTestId('eye-right').check()
  await page.getByTestId('mode-label').check()
  await page.getByTestId('order-sequential').check()
  await page.getByTestId('scope-region').check()
  await page.getByTestId('scope-region-select').selectOption('NW')
  await page.getByTestId('start-test').click()
  await page.keyboard.press('1')
  await page.keyboard.press('Escape')
  const spoken = await page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken)
  expect(spoken[0]).toContain('Cover your left eye.')
  expect(spoken[0]).toContain('Press 1 for clear')
  expect(spoken[0]).toContain('Cell A 1.')
  expect(spoken[1]).toBe('Cell B 1.')
  expect(spoken[2]).toBe('Paused.')
})
