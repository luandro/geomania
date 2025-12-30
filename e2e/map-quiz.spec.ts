import { test, expect, type Page } from '@playwright/test';

const waitForMapDifficulty = async (page: Page) => {
  const downloadTitle = page.getByText(/downloading offline map/i);
  const selectDifficulty = page.getByRole('heading', { name: /select difficulty/i });

  if (await downloadTitle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(downloadTitle).toBeVisible();
    await expect(downloadTitle).toBeHidden({ timeout: 120000 });
  }

  await expect(selectDifficulty).toBeVisible({ timeout: 120000 });
};

test.describe('Map Quiz Flow', () => {
  test.slow('should load map assets and start map country quiz', async ({ page }) => {
    // Mark as slow test - Playwright will triple the timeout
    // Map asset loading requires extra time

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    // Select Map game mode
    const mapModeButton = page.getByRole('button', { name: /map guess/i });
    await expect(mapModeButton).toBeVisible();
    await mapModeButton.click();

    await waitForMapDifficulty(page);

    // Should show map variant selection
    const countryVariant = page.getByRole('button', { name: /country/i });
    const capitalVariant = page.getByRole('button', { name: /capital/i });
    await expect(countryVariant).toBeVisible();
    await expect(capitalVariant).toBeVisible();

    // Select country variant
    await countryVariant.click();

    // Select difficulty
    const easyButton = page.getByText(/^Easy$/);
    await expect(easyButton).toBeVisible();
    await easyButton.click();

    // Map container should be visible
    await expect(page.locator('.map-immersive')).toBeVisible({ timeout: 10000 });

    // Question counter should show
    await expect(page.getByText(/\d+\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });
  });

  test.slow('should allow switching between map variants before starting quiz', async ({ page }) => {
    // Mark as slow test due to map asset loading

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    const mapModeButton = page.getByRole('button', { name: /map guess/i });
    await expect(mapModeButton).toBeVisible();
    await mapModeButton.click();

    await waitForMapDifficulty(page);

    const countryVariant = page.getByRole('button', { name: /country/i });
    const capitalVariant = page.getByRole('button', { name: /capital/i });
    await expect(countryVariant).toBeVisible();
    await expect(capitalVariant).toBeVisible();

    // Click country variant
    await countryVariant.click();

    // Click capital variant
    await capitalVariant.click();
  });

  // Skip: PWA is disabled in E2E builds (VITE_DISABLE_PWA=true), so no service worker
  // is available to serve cached assets offline. This test requires PWA functionality.
  // To test offline behavior, run a separate test suite with PWA enabled.
  test.skip('should handle offline map assets gracefully', async ({ page, context }) => {
    // Set offline mode
    await context.setOffline(true);

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    // Try to select map mode
    const mapModeButton = page.getByRole('button', { name: /map guess/i });
    await expect(mapModeButton).toBeVisible();
    await mapModeButton.click();

    // Should show offline notice (or difficulty selector if assets cached)
    const offlineTitle = page.getByText(/map data not ready|downloading offline map/i);
    const difficultyHeading = page.getByRole('heading', { name: /select difficulty/i });
    const offlineVisible = await offlineTitle.isVisible({ timeout: 5000 }).catch(() => false);
    const difficultyVisible = await difficultyHeading.isVisible({ timeout: 5000 }).catch(() => false);
    expect(offlineVisible || difficultyVisible).toBeTruthy();

    // Restore online mode
    await context.setOffline(false);
  });

  test.slow('should complete map quiz by clicking on map', async ({ page }) => {
    // Mark as slow test due to map asset loading and multiple interactions

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    const mapModeButton = page.getByRole('button', { name: /map guess/i });
    await expect(mapModeButton).toBeVisible();
    await mapModeButton.click();

    await waitForMapDifficulty(page);

    const countryVariant = page.getByRole('button', { name: /country/i });
    await expect(countryVariant).toBeVisible();
    await countryVariant.click();

    const easyButton = page.getByText(/^Easy$/);
    await expect(easyButton).toBeVisible();
    await easyButton.click();

    // Wait for map to load
    const mapElement = page.locator('.leaflet-container').first();
    await expect(mapElement).toBeVisible({ timeout: 10000 });

    // Try to answer a few questions
    for (let i = 0; i < 3; i++) {
      // Wait for question to load
      await expect(page.getByText(/\d+\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });

      // Click somewhere on the map (center of the viewport)
      const bbox = await mapElement.boundingBox();
      if (!bbox) throw new Error('Map bounds not available');
      await page.mouse.click(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
      await page.waitForTimeout(1000);

      // Check if next button appears
      const nextButton = page.getByRole('button', { name: /next/i });
      if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify we progressed through some questions
    const questionNumber = await page.getByText(/[2-9]\s*\/\s*\d+/).isVisible({ timeout: 3000 }).catch(() => false);
    expect(questionNumber).toBeTruthy();
  });
});
