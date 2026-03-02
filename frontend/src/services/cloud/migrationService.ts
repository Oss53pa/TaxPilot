/**
 * Migration Service — localStorage to Supabase
 * Detects existing localStorage data and migrates to Supabase tables.
 * Supports dual-mode: localStorage fallback when Supabase is not configured.
 */

import { supabase } from '@/config/supabase'
import { isSupabaseEnabled } from '@/types/cloud'

// ============================================================
// Types
// ============================================================

interface MigrationStatus {
  started_at: string
  completed_at: string | null
  entities_migrated: number
  balances_migrated: number
  exercices_migrated: number
  audit_entries_migrated: number
  errors: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

interface LocalStorageData {
  entreprise: Record<string, unknown> | null
  balances: Array<Record<string, unknown>>
  exercices: Array<Record<string, unknown>>
  workflow: Record<string, unknown> | null
  auditResults: Array<Record<string, unknown>>
  archives: Array<Record<string, unknown>>
}

const MIGRATION_KEY = 'fiscasync_migration_status'

// ============================================================
// Detection: what localStorage data exists?
// ============================================================

export function detectLocalStorageData(): LocalStorageData {
  const prefix = 'fiscasync_db_'

  // Entreprise config
  const entrepriseRaw = localStorage.getItem(`${prefix}entreprise`)
  let entreprise: Record<string, unknown> | null = null
  if (entrepriseRaw) {
    try {
      const parsed = JSON.parse(entrepriseRaw)
      entreprise = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed
    } catch { /* empty */ }
  }

  // Balances
  const balances: Array<Record<string, unknown>> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('fiscasync_balance_')) {
      try {
        const val = JSON.parse(localStorage.getItem(key) || '{}')
        if (val && typeof val === 'object') {
          balances.push({ ...val, _storage_key: key })
        }
      } catch { /* empty */ }
    }
  }

  // Exercices
  const exercicesRaw = localStorage.getItem('fiscasync_exercices')
  let exercices: Array<Record<string, unknown>> = []
  if (exercicesRaw) {
    try {
      exercices = JSON.parse(exercicesRaw)
    } catch { /* empty */ }
  }

  // Workflow state(s)
  const workflow: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('fiscasync_workflow_state')) {
      try {
        workflow[key] = JSON.parse(localStorage.getItem(key) || '{}')
      } catch { /* empty */ }
    }
  }

  // Audit results
  const auditResults: Array<Record<string, unknown>> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('fiscasync_audit_')) {
      try {
        auditResults.push(JSON.parse(localStorage.getItem(key) || '{}'))
      } catch { /* empty */ }
    }
  }

  // Archives
  const archives: Array<Record<string, unknown>> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('fiscasync_archive_')) {
      try {
        archives.push(JSON.parse(localStorage.getItem(key) || '{}'))
      } catch { /* empty */ }
    }
  }

  return { entreprise, balances, exercices, workflow, auditResults, archives }
}

export function hasLocalStorageData(): boolean {
  const data = detectLocalStorageData()
  return !!(data.entreprise || data.balances.length > 0 || data.exercices.length > 0)
}

// ============================================================
// Migration status
// ============================================================

export function getMigrationStatus(): MigrationStatus | null {
  const raw = localStorage.getItem(MIGRATION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveMigrationStatus(status: MigrationStatus): void {
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(status))
}

// ============================================================
// Core: run migration
// ============================================================

export async function runMigration(tenantId: string, entityId?: string): Promise<MigrationStatus> {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase not configured — cannot migrate')
  }

  const status: MigrationStatus = {
    started_at: new Date().toISOString(),
    completed_at: null,
    entities_migrated: 0,
    balances_migrated: 0,
    exercices_migrated: 0,
    audit_entries_migrated: 0,
    errors: [],
    status: 'in_progress',
  }
  saveMigrationStatus(status)

  const data = detectLocalStorageData()

  try {
    // 1. Migrate entreprise → tenant_entity
    let targetEntityId = entityId
    if (data.entreprise && !entityId) {
      try {
        const ent = data.entreprise
        const { data: entity, error } = await supabase
          .from('tenant_entities')
          .insert({
            tenant_id: tenantId,
            raison_sociale: (ent.nom as string) || (ent.raison_sociale as string) || 'Entreprise migrée',
            forme_juridique: (ent.formeJuridique as string) || (ent.forme_juridique as string) || null,
            numero_contribuable: (ent.numeroContribuable as string) || null,
            rccm: (ent.rccm as string) || null,
            ville: (ent.ville as string) || 'Non spécifié',
            pays: (ent.pays as string) || 'CI',
            regime_imposition: (ent.regimeImposition as string) || 'REEL_NORMAL',
            email: (ent.email as string) || null,
            telephone: (ent.telephone as string) || null,
            nom_dirigeant: (ent.nomDirigeant as string) || null,
          })
          .select()
          .single()
        if (error) throw error
        targetEntityId = entity.id
        status.entities_migrated++
      } catch (e) {
        status.errors.push(`Entity migration failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    if (!targetEntityId) {
      status.errors.push('No entity ID — skipping exercice/balance migration')
      status.status = 'failed'
      status.completed_at = new Date().toISOString()
      saveMigrationStatus(status)
      return status
    }

    // 2. Migrate exercices
    const exerciceMap = new Map<string, string>() // local code → supabase ID
    for (const ex of data.exercices) {
      try {
        const code = (ex.annee as string) || (ex.code as string) || String(new Date().getFullYear())
        const { data: exercice, error } = await supabase
          .from('exercices')
          .insert({
            tenant_id: tenantId,
            entity_id: targetEntityId,
            code,
            date_debut: (ex.dateDebut as string) || `${code}-01-01`,
            date_fin: (ex.dateFin as string) || `${code}-12-31`,
            duree_mois: (ex.duree_mois as number) || 12,
            statut: (ex.statut as string) || 'en_cours',
            is_current: (ex.is_current as boolean) ?? false,
          })
          .select()
          .single()
        if (error) throw error
        exerciceMap.set(code, exercice.id)
        status.exercices_migrated++
      } catch (e) {
        status.errors.push(`Exercice migration failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // 3. Migrate balances
    for (const bal of data.balances) {
      try {
        const exerciceCode = (bal.exercice as string) || String(new Date().getFullYear())
        let exerciceId = exerciceMap.get(exerciceCode)

        // Auto-create exercice if not found
        if (!exerciceId) {
          const { data: newEx, error: exErr } = await supabase
            .from('exercices')
            .insert({
              tenant_id: tenantId,
              entity_id: targetEntityId,
              code: exerciceCode,
              date_debut: `${exerciceCode}-01-01`,
              date_fin: `${exerciceCode}-12-31`,
              duree_mois: 12,
              statut: 'en_cours',
            })
            .select()
            .single()
          if (!exErr && newEx) {
            exerciceId = newEx.id
            exerciceMap.set(exerciceCode, exerciceId!)
            status.exercices_migrated++
          }
        }

        if (!exerciceId) continue

        const entries = (bal.entries as Array<Record<string, unknown>>) || []

        // Create balance header
        const totalDebit = entries.reduce((s, e) => s + ((e.debit_solde as number) || (e.debitSolde as number) || 0), 0)
        const totalCredit = entries.reduce((s, e) => s + ((e.credit_solde as number) || (e.creditSolde as number) || 0), 0)

        const { data: balance, error: balErr } = await supabase
          .from('balances')
          .insert({
            tenant_id: tenantId,
            exercice_id: exerciceId,
            nom_fichier: (bal.fileName as string) || 'migration',
            nb_lignes: entries.length,
            total_debit: totalDebit,
            total_credit: totalCredit,
            equilibree: Math.abs(totalDebit - totalCredit) < 1,
          })
          .select()
          .single()
        if (balErr) throw balErr

        // Insert balance lines in batches
        if (entries.length > 0 && balance) {
          const lignes = entries.map(e => ({
            balance_id: balance.id,
            tenant_id: tenantId,
            numero_compte: (e.numero_compte as string) || (e.numeroCompte as string) || '',
            libelle: (e.libelle as string) || '',
            debit_ouverture: (e.debit_ouverture as number) || (e.debitOuverture as number) || 0,
            credit_ouverture: (e.credit_ouverture as number) || (e.creditOuverture as number) || 0,
            debit_mouvement: (e.debit_mouvement as number) || (e.debitMouvement as number) || 0,
            credit_mouvement: (e.credit_mouvement as number) || (e.creditMouvement as number) || 0,
            debit_solde: (e.debit_solde as number) || (e.debitSolde as number) || 0,
            credit_solde: (e.credit_solde as number) || (e.creditSolde as number) || 0,
          }))

          for (let i = 0; i < lignes.length; i += 500) {
            const batch = lignes.slice(i, i + 500)
            const { error: ligneErr } = await supabase.from('lignes_balance').insert(batch)
            if (ligneErr) {
              status.errors.push(`Balance lines batch ${i} failed: ${ligneErr.message}`)
            }
          }
        }

        status.balances_migrated++
      } catch (e) {
        status.errors.push(`Balance migration failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    status.status = status.errors.length > 0 ? 'completed' : 'completed'
    status.completed_at = new Date().toISOString()
    saveMigrationStatus(status)
    return status
  } catch (e) {
    status.status = 'failed'
    status.errors.push(`Migration failed: ${e instanceof Error ? e.message : String(e)}`)
    status.completed_at = new Date().toISOString()
    saveMigrationStatus(status)
    return status
  }
}

// ============================================================
// Dual-mode helper: use Supabase if enabled, localStorage otherwise
// ============================================================

export function getStorageMode(): 'supabase' | 'local' {
  return isSupabaseEnabled() ? 'supabase' : 'local'
}
