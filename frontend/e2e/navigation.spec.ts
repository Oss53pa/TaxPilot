import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('unauthenticated routes redirect to login', async ({ page }) => {
    // All protected routes should redirect
    const protectedRoutes = ['/dashboard', '/balance', '/audit', '/liasse-fiscale', '/dossiers']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    }
  })

  test('auth pages load without errors', async ({ page }) => {
    await page.goto('/login')
    // No console errors
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.waitForTimeout(2000)
    // Filter out expected errors (e.g., Supabase connection in test env)
    const unexpectedErrors = errors.filter(e => !e.includes('Supabase') && !e.includes('fetch'))
    expect(unexpectedErrors).toHaveLength(0)
  })

  test('404 redirects to home', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page).toHaveURL(/\/(login)?$/)
  })
})
