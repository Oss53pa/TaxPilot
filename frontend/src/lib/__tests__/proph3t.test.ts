import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Garanties de l'intégration Atlas « Proph3t core ».
 *
 * Le garde-fou clé : sans variables VITE_ATLAS_* (core non configuré), aucune
 * fuite silencieuse de données confidentielles vers un provider — on refuse
 * proprement (erreur explicite).
 *
 * IMPORTANT : `proph3t.ts` lit `import.meta.env` AU CHARGEMENT du module. Pour
 * que ces tests soient DÉTERMINISTES (qu'un `.env.local` définisse ou non
 * VITE_ATLAS_* sur la machine du dev), on force l'absence des variables via
 * `vi.stubEnv` + `vi.resetModules` puis on réimporte le module à chaque test.
 */
describe('Atlas « Proph3t core » integration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_ATLAS_SUPABASE_URL', '')
    vi.stubEnv('VITE_ATLAS_SUPABASE_ANON_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('utilise l\'id PRODUCT du catalogue « taxpilot » (alias core → liasspilot)', async () => {
    const { PRODUCT } = await import('../proph3t')
    expect(PRODUCT).toBe('taxpilot')
  })

  it('signale le core comme non configuré quand VITE_ATLAS_* est absent', async () => {
    const { isProph3tCoreConfigured } = await import('../proph3t')
    expect(isProph3tCoreConfigured).toBe(false)
  })

  it('askProph3t refuse proprement (throw) si le core n\'est pas configuré — jamais de fuite', async () => {
    const { askProph3t } = await import('../proph3t')
    await expect(
      askProph3t({ message: 'analyse ma liasse', sensitivity: 'confidential' }),
    ).rejects.toThrow(/non configuré/i)
  })

  it('getProph3t (Mode A) refuse proprement si le core n\'est pas configuré', async () => {
    const { getProph3t } = await import('../proph3t')
    await expect(getProph3t('society-1')).rejects.toThrow(/non configuré/i)
  })
})
