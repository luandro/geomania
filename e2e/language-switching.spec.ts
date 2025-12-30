import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('should switch language from English to Portuguese on home screen', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    const englishOption = page.getByRole('button', { name: /english/i });
    const portugueseOption = page.getByRole('button', { name: /português/i });

    await expect(englishOption).toBeVisible();
    await expect(portugueseOption).toBeVisible();

    await portugueseOption.click();

    // Verify text changed to Portuguese
    await expect(page.getByRole('button', { name: /Adivinhe a Bandeira/i })).toBeVisible({ timeout: 3000 });
  });

  test('should persist language choice during quiz flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    const portugueseOption = page.getByRole('button', { name: /português/i });
    await expect(portugueseOption).toBeVisible();
    await portugueseOption.click();

    // Start a quiz
    const flagButton = page.getByRole('button', { name: /Adivinhe a Bandeira/i });
    await expect(flagButton).toBeVisible();
    await flagButton.click();

    // Select difficulty (should be in Portuguese)
    await expect(page.getByRole('heading', { name: /Selecione a Dificuldade/i })).toBeVisible();
    await page.getByText(/^Fácil$/).click();

    // Wait for question
    await expect(page.getByRole('heading', { name: /A qual país pertence esta bandeira/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should switch between multiple languages', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to geomania/i })).toBeVisible();

    const englishOption = page.getByRole('button', { name: /english/i });
    const portugueseOption = page.getByRole('button', { name: /português/i });

    await expect(englishOption).toBeVisible();
    await expect(portugueseOption).toBeVisible();

    // Switch to Portuguese
    await portugueseOption.click();
    await expect(page.getByRole('button', { name: /Adivinhe a Bandeira/i })).toBeVisible({ timeout: 3000 });

    // Switch back to English
    await englishOption.click();
    await expect(page.getByRole('button', { name: /Flag Guess/i })).toBeVisible({ timeout: 3000 });
  });
});
