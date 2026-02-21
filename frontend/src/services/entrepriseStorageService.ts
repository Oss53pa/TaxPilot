/**
 * Service de persistance localStorage pour les paramètres entreprise
 * Pattern identique à balanceStorageService.ts
 */

import type { Entreprise } from './entrepriseService'

const STORAGE_KEY = 'fiscasync_entreprise_settings'

export function saveEntreprise(data: Partial<Entreprise>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage full or unavailable
  }
}

export function getEntreprise(): Partial<Entreprise> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearEntreprise(): void {
  localStorage.removeItem(STORAGE_KEY)
}
