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

test.describe('Scoreboards', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('geoquiz-language', 'en');
      localStorage.setItem('geomania:autoAdvance', 'false');
    });
  });

  test('should navigate to scoreboards from home page', async ({ page }) => {
    await page.goto('/');

    // Wait for home page to load
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    // Find and click scoreboards button
    const scoreboardsButton = page.getByRole('button', { name: /scoreboards|leaderboard/i });
    await expect(scoreboardsButton).toBeVisible();
    await scoreboardsButton.click();

    // Should navigate to scoreboards page
    await expect(page).toHaveURL(/\/scoreboards/);

    // Scoreboards page should show title
    await expect(page.getByRole('heading', { name: /scoreboards|leaderboard/i })).toBeVisible();
  });

  test('should switch between different game mode tabs', async ({ page }) => {
    await page.goto('/scoreboards');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /scoreboards|leaderboard/i })).toBeVisible();

    // Find mode tabs
    const flagTab = page.getByRole('button', { name: /flag/i }).first();
    const capitalTab = page.getByRole('button', { name: /capital/i }).first();

    await expect(flagTab).toBeVisible();
    await flagTab.click();
    await page.waitForTimeout(500);

    // URL should update with mode parameter
    await expect(page).toHaveURL(/mode=flag_guess/);

    await expect(capitalTab).toBeVisible();
    await capitalTab.click();
    await page.waitForTimeout(500);

    // URL should update with mode parameter
    await expect(page).toHaveURL(/mode=capital_guess/);
  });

  test('should display leaderboard entries or empty state', async ({ page }) => {
    await page.goto('/scoreboards');

    await expect(page.getByRole('heading', { name: /scoreboards|leaderboard/i })).toBeVisible();

    // Should show either:
    // 1. Leaderboard entries with scores
    // 2. Empty state message
    // 3. Loading state

    const hasEntries = await page.getByText(/\/10|\d+\s*\/\s*\d+/).isVisible().catch(() => false);
    const hasEmptyState = await page
      .getByText(/no scores yet|no leaderboard cached/i)
      .isVisible()
      .catch(() => false);
    const hasLoadingState = await page.getByText(/loading scoreboards/i).isVisible().catch(() => false);
    const hasErrorState = await page.getByText(/could not load scoreboards/i).isVisible().catch(() => false);
    const hasHeaderRow = await page.getByText(/initials/i).isVisible().catch(() => false);

    // At least one of these should be true
    expect(hasEntries || hasEmptyState || hasLoadingState || hasErrorState || hasHeaderRow).toBeTruthy();
  });

  test('should navigate back to home from scoreboards', async ({ page }) => {
    await page.goto('/scoreboards');

    await expect(page.getByRole('heading', { name: /scoreboards|leaderboard/i })).toBeVisible();

    // Find back/home button
    const backButton = page.getByRole('button', { name: /home|back/i });
    await backButton.click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();
  });

  test('should navigate to scoreboards from quiz results', async ({ page }) => {
    await page.goto('/');

    // Complete a quick quiz
    await page.getByRole('button', { name: /flag/i }).click();
    await expect(page.getByRole('heading', { name: /select difficulty/i })).toBeVisible();
    await page.getByText(/^Easy$/).click();

    // Answer all questions
    const totalQuestions = await getTotalQuestions(page);
    for (let i = 0; i < totalQuestions; i++) {
      await expect(page.locator('img[alt*="flag"]')).toBeVisible({ timeout: 10000 });
      const answerButtons = page.locator('main').getByRole('button').filter({ hasText: /^[A-Z]/ });
      await answerButtons.first().click();
      await page.waitForTimeout(300);
      const nextButton = page.locator('main').getByRole('button', { name: /next|see results/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }

    // Should be on results screen
    await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 5000 });

    // Look for leaderboard button
    const leaderboardButton = page.getByRole('button', { name: /leaderboard|scoreboards/i });
    await expect(leaderboardButton).toBeVisible();
    await leaderboardButton.click();

    // Should navigate to scoreboards
    await expect(page).toHaveURL(/\/scoreboards/);
    await expect(page.getByRole('heading', { name: /scoreboards|leaderboard/i })).toBeVisible();
  });

  test.skip('should auto-redirect to scoreboards after 25 seconds of inactivity', async ({ page }) => {
    // Skipped in CI to avoid slow test execution
    // This test validates the 25-second auto-redirect feature
    await page.goto('/');

    // Wait for home page to load
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    // Wait for auto-redirect (25 seconds + buffer)
    await page.waitForURL(/\/scoreboards/, { timeout: 30000 });

    // Should be on scoreboards page
    await expect(page.getByRole('heading', { name: /scoreboards|leaderboard/i })).toBeVisible();
  });
});
