import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/FiscaSync/);
    await expect(page.locator('h1')).toContainText(/Connexion|Login/);
  });

  test('should register new user', async ({ page }) => {
    await page.click('text=Inscription');

    // Fill registration form
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="organization_name"]', 'Test Company');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should login existing user', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@fiscasync.com');
    await page.fill('input[name="password"]', 'admin123');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Should display user info
    await expect(page.locator('text=Tableau de bord')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/Invalid credentials|Identifiants invalides/')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@fiscasync.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Déconnexion');

    // Should redirect to login
    await expect(page).toHaveURL('/');
  });
});
