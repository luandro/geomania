import { test, expect, type Page } from '@playwright/test';

const getTotalQuestions = async (page: Page) => {
  const counter = page.getByText(/\d+\s*\/\s*\d+/).first();
  await expect(counter).toBeVisible({ timeout: 10000 });
  const text = await counter.textContent();
  const match = text?.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    throw new Error(`Could not read question counter from text: "${text ?? ''}"`);
  }
  return Number.parseInt(match[2], 10);
};

test.describe('Quiz Flow - Flag Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('geoquiz-language', 'en');
      localStorage.setItem('geomania:autoAdvance', 'false');
    });
  });

  test('should complete full quiz flow on easy difficulty', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    // Select Flag game mode
    await page.getByRole('button', { name: /flag/i }).click();

    // Select Easy difficulty
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: /select difficulty/i })).toBeVisible({ timeout: 10000 });
    await page.getByText(/^Easy$/).click();

    const totalQuestions = await getTotalQuestions(page);

    // Answer all questions
    for (let i = 0; i < totalQuestions; i++) {
      // Wait for question to load
      await expect(page.locator('img[alt*="flag"]')).toBeVisible({ timeout: 10000 });

      // Click the first answer option
      const answerButtons = page.locator('main').getByRole('button').filter({ hasText: /^[A-Z]/ });
      await answerButtons.first().click();

      // Wait for feedback/next button
      await page.waitForTimeout(500);

      const nextButton = page.locator('main').getByRole('button', { name: /next|see results/i });
      if (await nextButton.isVisible()) {
        await nextButton.waitFor({ state: 'attached', timeout: 5000 });
        await nextButton.click({ timeout: 10000 });
        await page.waitForTimeout(200);
      }
    }

    // Should see results screen
    await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/score/i)).toBeVisible();

    // Verify score and total are displayed
    await expect(page.getByText(/score/i)).toBeVisible();
    await expect(page.getByText(/questions/i)).toBeVisible();

    // Verify action buttons are available
    await expect(page.getByRole('button', { name: /play again/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /choose mode/i })).toBeVisible();
  });

  test('should navigate back to home from results', async ({ page }) => {
    await page.goto('/');

    // Complete a quick quiz
    await page.getByRole('button', { name: /flag/i }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: /select difficulty/i })).toBeVisible({ timeout: 10000 });
    await page.getByText(/^Easy$/).click();

    const totalQuestions = await getTotalQuestions(page);

    // Answer all questions quickly
    for (let i = 0; i < totalQuestions; i++) {
      await expect(page.locator('img[alt*="flag"]')).toBeVisible({ timeout: 10000 });
      const answerButtons = page.locator('main').getByRole('button').filter({ hasText: /^[A-Z]/ });
      await answerButtons.first().click();
      await page.waitForTimeout(300);
      const nextButton = page.locator('main').getByRole('button', { name: /next|see results/i });
      if (await nextButton.isVisible()) {
        await nextButton.waitFor({ state: 'attached', timeout: 5000 });
        await nextButton.click({ timeout: 10000 });
        await page.waitForTimeout(200);
      }
    }

    // Click home button
    await page.getByRole('button', { name: /choose mode/i }).click();

    // Should be back on home screen
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /flag/i })).toBeVisible();
  });

  test('should allow playing again after completing quiz', async ({ page }) => {
    await page.goto('/');

    // Complete first quiz
    await page.getByRole('button', { name: /flag/i }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: /select difficulty/i })).toBeVisible({ timeout: 10000 });
    await page.getByText(/^Easy$/).click();

    const totalQuestions = await getTotalQuestions(page);
    for (let i = 0; i < totalQuestions; i++) {
      await expect(page.locator('img[alt*="flag"]')).toBeVisible({ timeout: 10000 });
      const answerButtons = page.locator('main').getByRole('button').filter({ hasText: /^[A-Z]/ });
      await answerButtons.first().click();
      await page.waitForTimeout(300);
      const nextButton = page.locator('main').getByRole('button', { name: /next|see results/i });
      if (await nextButton.isVisible()) {
        await nextButton.waitFor({ state: 'attached', timeout: 5000 });
        await nextButton.click({ timeout: 10000 });
        await page.waitForTimeout(200);
      }
    }

    // Click play again
    await page.getByRole('button', { name: /play again/i }).click();

    // Should start a new quiz with same mode and difficulty
    await expect(page.locator('img[alt*="flag"]')).toBeVisible({ timeout: 10000 });

    // Should be on question 1/<total>
    await expect(page.getByText(new RegExp(`1\\s*\\/\\s*${totalQuestions}`))).toBeVisible();
  });

  test('should show back button during quiz and allow returning to home', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /flag/i }).click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('heading', { name: /select difficulty/i })).toBeVisible({ timeout: 10000 });
    await page.getByText(/^Easy$/).click();

    // Wait for first question
    await expect(page.locator('img[alt*="flag"]')).toBeVisible({ timeout: 10000 });

    // Click back button in header
    const backButton = page.getByRole('button', { name: /back/i }).first();
    await backButton.click();

    // Should be back on home screen
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();
  });
});
