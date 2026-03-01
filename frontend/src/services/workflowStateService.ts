/**
 * Service central de workflow - Gestion de l'etat du workflow entre tous les modules
 * Cle localStorage : fiscasync_workflow_state
 */

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

const STORAGE_KEY = 'fiscasync_workflow_state'

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

export function getWorkflowState(): WorkflowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_STATE, ...JSON.parse(raw) }
    }
  } catch { /* ignore */ }

  // Auto-detect configuration and balance from existing localStorage keys
  const state = { ...DEFAULT_STATE }
  try {
    const ent = localStorage.getItem('fiscasync_entreprise_settings') || localStorage.getItem('fiscasync_db_entreprise_settings')
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

export function updateWorkflowState(partial: Partial<WorkflowState>): WorkflowState {
  const current = getWorkflowState()
  const updated = { ...current, ...partial }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function resetWorkflow(): WorkflowState {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE))
  return { ...DEFAULT_STATE }
}
