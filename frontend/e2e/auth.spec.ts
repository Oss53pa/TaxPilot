import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows login page for unauthenticated user', async ({ page }) => {
    await page.goto('/')
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading')).toContainText(/Connexion|Login/)
  })

  test('login form has required fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe|password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /connexion|login/i })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('invalid@test.com')
    await page.getByLabel(/mot de passe|password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /connexion|login/i }).click()
    // Should show error
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 })
  })

  test('register page is accessible', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/prénom|first name/i)).toBeVisible()
  })

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })
})
