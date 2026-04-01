import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('login page has proper heading structure', async ({ page }) => {
    await page.goto('/login')
    const headings = page.getByRole('heading')
    await expect(headings.first()).toBeVisible()
  })

  test('login form is keyboard navigable', async ({ page }) => {
    await page.goto('/login')
    // Tab through form elements
    await page.keyboard.press('Tab')
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    const passwordInput = page.getByLabel(/mot de passe|password/i)
    await expect(passwordInput).toBeFocused()
  })

  test('interactive elements have accessible names', async ({ page }) => {
    await page.goto('/login')
    const buttons = page.getByRole('button')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      const name = await buttons.nth(i).getAttribute('aria-label') || await buttons.nth(i).textContent()
      expect(name).toBeTruthy()
    }
  })
})
