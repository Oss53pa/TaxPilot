import { test, expect } from '@playwright/test';

test.describe('Liasse Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[name="email"]', 'admin@fiscasync.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to generation page', async ({ page }) => {
    await page.click('text=Génération');
    await expect(page).toHaveURL(/\/generation/);
    await expect(page.locator('h1')).toContainText(/Génération de Liasse/);
  });

  test('should create new liasse', async ({ page }) => {
    await page.goto('/generation/new');

    // Select entreprise
    await page.click('[data-testid="entreprise-select"]');
    await page.click('text=SARL Test');

    // Select exercice
    await page.click('[data-testid="exercice-select"]');
    await page.click('text=2024');

    // Select type liasse
    await page.click('[data-testid="type-liasse-select"]');
    await page.click('text=SYSCOHADA');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to liasse detail
    await expect(page).toHaveURL(/\/generation\/\d+/);
    await expect(page.locator('text=Liasse générée avec succès')).toBeVisible();
  });

  test('should display liasse list', async ({ page }) => {
    await page.goto('/generation');

    // Should display table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Entreprise")')).toBeVisible();
    await expect(page.locator('th:has-text("Exercice")')).toBeVisible();
    await expect(page.locator('th:has-text("Statut")')).toBeVisible();
  });

  test('should validate liasse', async ({ page }) => {
    await page.goto('/generation/1');

    await page.click('button:has-text("Valider")');

    // Validation modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Validation de la liasse')).toBeVisible();

    // Confirm validation
    await page.click('button:has-text("Confirmer")');

    // Success message
    await expect(page.locator('text=Liasse validée')).toBeVisible();
  });

  test('should export liasse to PDF', async ({ page }) => {
    await page.goto('/generation/1');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exporter PDF")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
