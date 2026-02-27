import { test, expect } from '@playwright/test';

test.describe('Balance Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="email"]', 'admin@fiscasync.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to balance import', async ({ page }) => {
    await page.click('text=Balance');
    await page.click('text=Importer');
    await expect(page).toHaveURL(/\/balance\/import/);
  });

  test('should upload balance file', async ({ page }) => {
    await page.goto('/balance/import');

    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Choisir un fichier")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('test-data/balance-test.xlsx');

    // File should be selected
    await expect(page.locator('text=balance-test.xlsx')).toBeVisible();

    // Start import
    await page.click('button:has-text("Importer")');

    // Progress should show
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Wait for completion
    await expect(page.locator('text=Import terminé')).toBeVisible({ timeout: 30000 });
  });

  test('should map accounts', async ({ page }) => {
    await page.goto('/balance/1/mapping');

    // Should display mapping table
    await expect(page.locator('table')).toBeVisible();

    // Map a compte
    await page.click('tr:nth-child(1) button:has-text("Mapper")');
    await page.click('text=6011 - Achats de marchandises');
    await page.click('button:has-text("Confirmer")');

    // Should show as mapped
    await expect(page.locator('tr:nth-child(1) text=6011')).toBeVisible();
  });

  test('should validate balance', async ({ page }) => {
    await page.goto('/balance/1');

    await page.click('button:has-text("Valider")');

    // Validation should run
    await expect(page.locator('text=Validation en cours')).toBeVisible();

    // Results should show
    await expect(page.locator('text=/Validation réussie|Anomalies détectées/')).toBeVisible({ timeout: 15000 });
  });

  test('should display balance statistics', async ({ page }) => {
    await page.goto('/balance/1');

    // Stats cards should be visible
    await expect(page.locator('text=Total Débit')).toBeVisible();
    await expect(page.locator('text=Total Crédit')).toBeVisible();
    await expect(page.locator('text=Équilibre')).toBeVisible();

    // Charts should render
    await expect(page.locator('canvas')).toBeVisible();
  });
});
