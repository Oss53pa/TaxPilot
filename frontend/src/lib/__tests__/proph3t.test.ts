import { describe, it, expect } from 'vitest'
import {
  PRODUCT,
  isProph3tCoreConfigured,
  askProph3t,
  getProph3t,
} from '../proph3t'

/**
 * Garanties de l'intégration Atlas « Proph3t core ».
 * Ces tests tournent sans variables VITE_ATLAS_* (core non configuré),
 * ce qui vérifie le garde-fou clé : aucune fuite silencieuse de données
 * confidentielles vers un provider — on refuse proprement (erreur explicite).
 */
describe('Atlas « Proph3t core » integration', () => {
  it('utilise l\'id PRODUCT du catalogue « taxpilot » (alias core → liasspilot)', () => {
    expect(PRODUCT).toBe('taxpilot')
  })

  it('signale le core comme non configuré quand VITE_ATLAS_* est absent', () => {
    expect(isProph3tCoreConfigured).toBe(false)
  })

  it('askProph3t refuse proprement (throw) si le core n\'est pas configuré — jamais de fuite', async () => {
    await expect(
      askProph3t({ message: 'analyse ma liasse', sensitivity: 'confidential' }),
    ).rejects.toThrow(/non configuré/i)
  })

  it('getProph3t (Mode A) refuse proprement si le core n\'est pas configuré', async () => {
    await expect(getProph3t('society-1')).rejects.toThrow(/non configuré/i)
  })
})
