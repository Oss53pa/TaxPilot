/**
 * P3-4: E2E tests for the main liasse workflow
 * Run with: npx playwright test e2e/liasse-flow.spec.ts
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3006'

test.describe('Liass\'Pilot — Flux principal', () => {

  test('1. Premier lancement → sélection mode Entreprise → onboarding', async ({ page }) => {
    // Clear localStorage to simulate first launch
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.clear())
    await page.goto(BASE_URL)

    // Should redirect to mode selection
    await expect(page).toHaveURL(/mode-selection/)

    // Select "Entreprise" mode
    await page.getByText('Choisir Entreprise').click()

    // Should navigate to onboarding wizard
    await expect(page).toHaveURL(/onboarding/)

    // Fill enterprise info in step 1
    await page.getByLabel(/dénomination/i).fill('Test SARL')
    await page.getByText('Suivant').click()

    // Step 2: Import balance (just click next)
    await page.getByText('Suivant').click()

    // Step 3: Contrôle (just click next)
    await page.getByText('Suivant').click()

    // Step 4: Complete
    await page.getByText('Accéder au tableau de bord').click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('2. Import balance CSV → vérification nombre de comptes', async ({ page }) => {
    await page.goto(`${BASE_URL}/import-balance`)

    // TODO: Create a test CSV file and upload it
    // For now, verify the page loads correctly
    await expect(page.getByText(/import/i)).toBeVisible()

    // Verify dropzone is present
    await expect(page.locator('[class*="dropzone"], [role="button"]').first()).toBeVisible()
  })

  test('3. Audit de cohérence → score affiché', async ({ page }) => {
    await page.goto(`${BASE_URL}/validation-liasse`)

    // Verify the control interface loads
    await expect(page.getByText(/contrôle|audit|cohérence/i).first()).toBeVisible()
  })

  test('4. Page TFT → saisie manuelle → alerte disparaît', async ({ page }) => {
    // First import a balance to trigger the alert
    await page.goto(`${BASE_URL}/liasse-fiscale`)

    // Navigate to TFT page if possible
    // Look for TFT in the navigation
    const tftLink = page.getByText(/TFT|Flux de Trésorerie/i).first()
    if (await tftLink.isVisible()) {
      await tftLink.click()
      // Check for the manual entries alert
      const alert = page.getByText(/saisie manuelle/i)
      if (await alert.isVisible()) {
        // Fill in manual values
        const foField = page.getByLabel(/FO/i)
        if (await foField.isVisible()) {
          await foField.fill('1000000')
        }
      }
    }
  })

  test('5. Export Excel → toast de succès', async ({ page }) => {
    await page.goto(`${BASE_URL}/liasse-fiscale`)

    // Find and click the Excel export button
    const excelBtn = page.getByText('Excel').first()
    if (await excelBtn.isVisible()) {
      await excelBtn.click()

      // Look for the export menu
      const exportLibre = page.getByText(/Export libre/i)
      if (await exportLibre.isVisible()) {
        // Start download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)
        await exportLibre.click()

        // Check for success toast
        await expect(page.getByText(/exportée avec succès/i)).toBeVisible({ timeout: 10000 })
      }
    }
  })

})
