/**
 * Service de persistance localStorage pour les paramètres entreprise
 * Pattern identique à balanceStorageService.ts
 */

import type { Entreprise } from './entrepriseService'
import { scopeKey } from './dossierScopeService'

const BASE_KEY = 'fiscasync_entreprise_settings'

export function saveEntreprise(data: Partial<Entreprise>): void {
  try {
    localStorage.setItem(scopeKey(BASE_KEY), JSON.stringify(data))
    // Notify other components (e.g. liasse fiscale) that enterprise data changed
    window.dispatchEvent(new Event('fiscasync:entreprise-saved'))
  } catch {
    // localStorage full or unavailable
  }
}

export function getEntreprise(): Partial<Entreprise> | null {
  try {
    const raw = localStorage.getItem(scopeKey(BASE_KEY))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearEntreprise(): void {
  localStorage.removeItem(scopeKey(BASE_KEY))
}
