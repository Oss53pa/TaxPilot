/**
 * Service central de workflow - Gestion de l'etat du workflow entre tous les modules
 * Cle localStorage : fiscasync_workflow_state_{annee} (scope par exercice)
 * Migration automatique depuis l'ancienne cle globale fiscasync_workflow_state
 */

import { useExerciceStore } from '../store/exerciceStore'

export interface WorkflowState {
  configurationDone: boolean
  balanceImported: boolean
  controleDone: boolean
  controleScore: number
  controleBloquants: number
  controleResult: 'not_run' | 'passed' | 'passed_with_warnings' | 'failed'
  generationDone: boolean
  generationDate: string | null
  generationRegime: string | null
  lastExportDate: string | null
  lastExportFormat: string | null
  teledeclarationStatus: 'not_started' | 'draft' | 'submitted' | 'accepted'
  teledeclarationDate: string | null
  teledeclarationReference: string | null
}

const STORAGE_KEY_PREFIX = 'fiscasync_workflow_state'
const LEGACY_KEY = 'fiscasync_workflow_state'
const MIGRATION_DONE_KEY = 'fiscasync_workflow_migrated'

const DEFAULT_STATE: WorkflowState = {
  configurationDone: false,
  balanceImported: false,
  controleDone: false,
  controleScore: 0,
  controleBloquants: 0,
  controleResult: 'not_run',
  generationDone: false,
  generationDate: null,
  generationRegime: null,
  lastExportDate: null,
  lastExportFormat: null,
  teledeclarationStatus: 'not_started',
  teledeclarationDate: null,
  teledeclarationReference: null,
}

function getActiveAnnee(): string | null {
  try {
    return useExerciceStore.getState().activeExercice?.annee || null
  } catch {
    return null
  }
}

function storageKey(exercice?: string): string {
  const annee = exercice || getActiveAnnee()
  if (annee) return `${STORAGE_KEY_PREFIX}_${annee}`
  return LEGACY_KEY
}

/** Migration one-shot: copie l'ancienne cle globale vers la cle de l'exercice courant */
function migrateIfNeeded(exercice?: string): void {
  if (localStorage.getItem(MIGRATION_DONE_KEY)) return
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY)
    if (legacyRaw) {
      const annee = exercice || getActiveAnnee()
      if (annee) {
        const key = `${STORAGE_KEY_PREFIX}_${annee}`
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, legacyRaw)
        }
      }
    }
    localStorage.setItem(MIGRATION_DONE_KEY, new Date().toISOString())
  } catch { /* ignore */ }
}

export function getWorkflowState(exercice?: string): WorkflowState {
  migrateIfNeeded(exercice)

  const key = storageKey(exercice)
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      return { ...DEFAULT_STATE, ...JSON.parse(raw) }
    }
  } catch { /* ignore */ }

  // Auto-detect configuration and balance from existing localStorage keys
  const state = { ...DEFAULT_STATE }
  try {
    const ent = localStorage.getItem('fiscasync_entreprise_settings')
    if (ent) state.configurationDone = true
  } catch { /* ignore */ }
  try {
    const bal = localStorage.getItem('fiscasync_balance_latest')
    if (bal) {
      const parsed = JSON.parse(bal)
      if (Array.isArray(parsed?.entries) && parsed.entries.length > 0) {
        state.balanceImported = true
      }
    }
  } catch { /* ignore */ }

  return state
}

export function updateWorkflowState(partial: Partial<WorkflowState>, exercice?: string): WorkflowState {
  const current = getWorkflowState(exercice)
  const updated = { ...current, ...partial }
  const key = storageKey(exercice)
  localStorage.setItem(key, JSON.stringify(updated))
  // Also write to legacy key for backward compatibility
  localStorage.setItem(LEGACY_KEY, JSON.stringify(updated))
  return updated
}

export function resetWorkflow(exercice?: string): WorkflowState {
  const key = storageKey(exercice)
  localStorage.setItem(key, JSON.stringify(DEFAULT_STATE))
  return { ...DEFAULT_STATE }
}
