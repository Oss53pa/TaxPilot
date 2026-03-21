/**
 * dossierScopeService.ts — Isolation des données localStorage par dossier client
 *
 * En mode Entreprise : les clés restent inchangées (pas de préfixe)
 * En mode Cabinet    : les clés sont préfixées par "dossier_{id}_"
 *
 * Ce service lit directement localStorage pour éviter les dépendances circulaires
 * avec les stores zustand.
 */

/** Lit le mode utilisateur depuis le store zustand persisté */
function readModeState(): { userMode: string | null; activeDossierId: string | null } {
  try {
    const modeRaw = localStorage.getItem('fiscasync-mode')
    const modeState = modeRaw ? JSON.parse(modeRaw)?.state : null
    const userMode = modeState?.userMode || null

    const dossierRaw = localStorage.getItem('fiscasync-dossiers')
    const dossierState = dossierRaw ? JSON.parse(dossierRaw)?.state : null
    const activeDossierId = dossierState?.activeDossierId || null

    return { userMode, activeDossierId }
  } catch {
    return { userMode: null, activeDossierId: null }
  }
}

/** Retourne true si l'app est en mode cabinet */
export function isCabinetMode(): boolean {
  return readModeState().userMode === 'cabinet'
}

/** Retourne l'ID du dossier actif, ou null */
export function getActiveDossierId(): string | null {
  return readModeState().activeDossierId
}

/**
 * Retourne le préfixe de scope pour les clés localStorage.
 * - Mode entreprise → '' (pas de préfixe)
 * - Mode cabinet + dossier actif → 'dossier_{id}_'
 * - Mode cabinet sans dossier → '' (fallback sécurisé)
 */
export function getScopePrefix(): string {
  const { userMode, activeDossierId } = readModeState()
  if (userMode === 'cabinet' && activeDossierId) {
    return `dossier_${activeDossierId}_`
  }
  return ''
}

/**
 * Scope une clé localStorage avec le préfixe du dossier actif.
 * Ex: scopeKey('fiscasync_balance_latest') → 'dossier_abc123_fiscasync_balance_latest' en cabinet
 */
export function scopeKey(baseKey: string): string {
  return getScopePrefix() + baseKey
}

/**
 * Supprime toutes les données localStorage associées à un dossier.
 * Appelé lors de la suppression d'un dossier.
 */
export function cleanupDossierData(dossierId: string): void {
  const prefix = `dossier_${dossierId}_`
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
  if (keysToRemove.length > 0) {
    console.log(`[DossierScope] Cleaned up ${keysToRemove.length} keys for dossier ${dossierId}`)
  }
}
