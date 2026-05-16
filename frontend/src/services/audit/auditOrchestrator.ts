/**
 * Orchestrateur d'audit
 * Pont entre l'UI et le moteur d'execution
 * Persists results to Supabase when available.
 */

import {
  SessionAudit,
  AuditContext,
  AuditProgressCallback,
  RapportCorrection,
} from '@/types/audit.types'
import { BalanceEntry, SYSCOHADA_MAPPING } from '@/services/liasseDataService'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { logger } from '@/utils/logger'
import { getFiscalConfig, type FiscalConfig } from '@/services/fiscalConfigService'
import { scopeKey } from '@/services/dossierScopeService'
import { PLAN_SYSCOHADA_REVISE } from '@/data/SYSCOHADARevisePlan'
import { controlRegistry } from './controlRegistry'
import { executePhase1, executePhase3, computeResume, generateCorrectionReport } from './auditEngine'
import {
  saveSession,
  getSession,
  saveSnapshot,
  getSnapshot,
  saveArchive,
  getAllArchives,
  saveCorrectionReport,
} from './auditStorage'

// Imports d'enregistrement des controles
import { registerLevel0Controls } from './controls/level0-structural'
import { registerLevel1Controls } from './controls/level1-fundamental'
import { registerLevel2Controls } from './controls/level2-ohada-conformity'
import { registerLevel3Controls } from './controls/level3-balance-sense'
import { registerLevel4Controls } from './controls/level4-inter-account'
import { registerLevel5Controls } from './controls/level5-year-over-year'
import { registerLevel6Controls } from './controls/level6-financial-statements'
import { registerLevel7Controls } from './controls/level7-fiscal'
import { registerLevel8Controls } from './controls/level8-archive'
import { registerComparisonControls } from './controls/comparisonControls'

let controlsRegistered = false

function ensureControlsRegistered(): void {
  if (controlsRegistered) return
  registerLevel0Controls()
  registerLevel1Controls()
  registerLevel2Controls()
  registerLevel3Controls()
  registerLevel4Controls()
  registerLevel5Controls()
  registerLevel6Controls()
  registerLevel7Controls()
  registerLevel8Controls()
  registerComparisonControls()
  controlsRegistered = true
}

function generateSessionId(): string {
  return `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Persist audit results to Supabase audit_results table
 */
async function persistAuditResults(
  session: SessionAudit,
  dossierId?: string
): Promise<void> {
  if (!isSupabaseEnabled || !supabase || !dossierId) return
  try {
    const { error } = await supabase.from('audit_results').insert({
      dossier_id: dossierId,
      exercice: parseInt(session.exercice) || new Date().getFullYear(),
      results: session.resultats,
      total_controls: session.resume.totalControles,
      passed: session.resume.parSeverite.OK,
      failed: session.resume.totalControles - session.resume.parSeverite.OK,
      blocking: session.resume.bloquantsRestants,
    })
    if (error) {
      logger.error('Failed to persist audit results:', error)
    }
  } catch (err) {
    logger.error('Error persisting audit results:', err)
  }
}

class AuditOrchestrator {
  /**
   * Phase 1 : Audit de la balance (niveaux 0-5, 8)
   */
  async startPhase1Audit(
    balanceN: BalanceEntry[],
    balanceN1?: BalanceEntry[],
    exercice?: string,
    callbacks?: Partial<AuditProgressCallback>,
    typeLiasse?: import('@/types').TypeLiasse,
    dossierId?: string
  ): Promise<SessionAudit> {
    ensureControlsRegistered()

    const sessionId = generateSessionId()
    const balanceId = `BAL-${Date.now()}`

    // Creer snapshot
    await saveSnapshot(balanceId, balanceN)

    // Creer session
    const session: SessionAudit = {
      id: sessionId,
      balanceId,
      exercice: exercice || new Date().getFullYear().toString(),
      phase: 'PHASE_1',
      statut: 'EN_COURS',
      dateDebut: new Date().toISOString(),
      progression: { niveauCourant: 0, controleCourant: 0, totalControles: controlRegistry.activeCount, pourcentage: 0 },
      resultats: [],
      resume: { totalControles: 0, parSeverite: { BLOQUANT: 0, MAJEUR: 0, MINEUR: 0, INFO: 0, OK: 0 }, parNiveau: {}, scoreGlobal: 0, bloquantsRestants: 0 },
    }

    saveSession(session)

    // Pré-fetch fiscal config par pays — lit `entreprise.pays_code` depuis
    // localStorage (scopé par dossier), fallback CI si absent. Permet à
    // level7-fiscal d'utiliser les bons taux IS/IMF/TVA selon le pays
    // OHADA du dossier (Sénégal, Cameroun, Burkina, etc.).
    let fiscalConfig: FiscalConfig | undefined
    let countryCode: string | undefined
    try {
      const entRaw = localStorage.getItem(scopeKey('fiscasync_entreprise_settings'))
      if (entRaw) {
        const ent = JSON.parse(entRaw)
        countryCode = String(ent?.pays_code || ent?.country_code || 'CI').toUpperCase()
        fiscalConfig = await getFiscalConfig(countryCode)
      }
    } catch (err) {
      logger.warn('[Audit] Failed to prefetch fiscalConfig — falling back to CI', err)
    }

    // Contexte d'execution
    const context: AuditContext = {
      balanceN,
      balanceN1,
      planComptable: PLAN_SYSCOHADA_REVISE,
      liassesArchivees: getAllArchives(),
      exercice: session.exercice,
      mappingSyscohada: SYSCOHADA_MAPPING,
      typeLiasse: typeLiasse || 'SN',
      countryCode,
      fiscalConfig,
    }

    // Wrapping des callbacks pour mettre a jour la progression
    const wrappedCallbacks: Partial<AuditProgressCallback> = {
      onProgress: (niveau, index, total, ref) => {
        session.progression.niveauCourant = niveau
        session.progression.controleCourant = index
        const totalDone = session.resultats.length + index
        session.progression.pourcentage = Math.round((totalDone / Math.max(session.progression.totalControles, 1)) * 100)
        callbacks?.onProgress?.(niveau, index, total, ref)
      },
      onLevelStart: (niveau, nom) => {
        callbacks?.onLevelStart?.(niveau, nom)
      },
      onLevelEnd: (niveau, resultats) => {
        callbacks?.onLevelEnd?.(niveau, resultats)
      },
      isCancelled: () => callbacks?.isCancelled?.() || false,
    }

    try {
      const resultats = await executePhase1(context, wrappedCallbacks)
      session.resultats = resultats
      session.resume = computeResume(resultats)
      session.statut = 'TERMINEE'
      session.dateFin = new Date().toISOString()
    } catch (err) {
      session.statut = 'ERREUR'
      session.dateFin = new Date().toISOString()
    }

    saveSession(session)
    await persistAuditResults(session, dossierId)
    callbacks?.onComplete?.(session.resume)

    return session
  }

  /**
   * Phase 3 : Controles sur les etats financiers (niveaux 6-7)
   */
  async startPhase3Audit(
    balanceN: BalanceEntry[],
    existingSession?: SessionAudit,
    callbacks?: Partial<AuditProgressCallback>,
    dossierId?: string
  ): Promise<SessionAudit> {
    ensureControlsRegistered()

    const session: SessionAudit = existingSession ? { ...existingSession } : {
      id: generateSessionId(),
      balanceId: `BAL-${Date.now()}`,
      exercice: new Date().getFullYear().toString(),
      phase: 'PHASE_3',
      statut: 'EN_COURS',
      dateDebut: new Date().toISOString(),
      progression: { niveauCourant: 6, controleCourant: 0, totalControles: controlRegistry.activeCount, pourcentage: 0 },
      resultats: [],
      resume: { totalControles: 0, parSeverite: { BLOQUANT: 0, MAJEUR: 0, MINEUR: 0, INFO: 0, OK: 0 }, parNiveau: {}, scoreGlobal: 0, bloquantsRestants: 0 },
    }

    session.phase = 'PHASE_3'
    session.statut = 'EN_COURS'

    // Pré-fetch fiscal config par pays (idem startPhase1Audit)
    let fiscalConfigP3: FiscalConfig | undefined
    let countryCodeP3: string | undefined
    try {
      const entRaw = localStorage.getItem(scopeKey('fiscasync_entreprise_settings'))
      if (entRaw) {
        const ent = JSON.parse(entRaw)
        countryCodeP3 = String(ent?.pays_code || ent?.country_code || 'CI').toUpperCase()
        fiscalConfigP3 = await getFiscalConfig(countryCodeP3)
      }
    } catch (err) {
      logger.warn('[Audit Phase3] Failed to prefetch fiscalConfig — falling back to CI', err)
    }

    const context: AuditContext = {
      balanceN,
      planComptable: PLAN_SYSCOHADA_REVISE,
      liassesArchivees: getAllArchives(),
      exercice: session.exercice,
      mappingSyscohada: SYSCOHADA_MAPPING,
      countryCode: countryCodeP3,
      fiscalConfig: fiscalConfigP3,
    }

    try {
      const resultats = await executePhase3(context, callbacks)
      // Ajouter aux resultats existants si session existante
      session.resultats = [...session.resultats, ...resultats]
      session.resume = computeResume(session.resultats)
      session.statut = 'TERMINEE'
      session.dateFin = new Date().toISOString()
    } catch (err) {
      session.statut = 'ERREUR'
    }

    saveSession(session)
    await persistAuditResults(session, dossierId)
    callbacks?.onComplete?.(session.resume)
    return session
  }

  /**
   * Phase 2 : Reimportation et comparaison
   */
  async reimportAndCompare(
    newBalance: BalanceEntry[],
    oldSessionId: string,
    callbacks?: Partial<AuditProgressCallback>
  ): Promise<{ session: SessionAudit; rapport: RapportCorrection }> {
    const oldSession = getSession(oldSessionId)
    if (!oldSession) throw new Error(`Session ${oldSessionId} introuvable`)

    // Relancer l'audit avec la nouvelle balance
    const newSession = await this.startPhase1Audit(newBalance, undefined, oldSession.exercice, callbacks)
    newSession.phase = 'PHASE_2'
    saveSession(newSession)

    // Generer rapport de corrections
    const rapport = generateCorrectionReport(oldSession, newSession)

    // Comparer les balances pour les comptes modifies
    const oldSnapshot = getSnapshot(oldSession.balanceId)
    if (oldSnapshot) {
      const oldMap = new Map(oldSnapshot.lignes.map((l) => [l.compte, l]))
      for (const newLine of newBalance) {
        const oldLine = oldMap.get(newLine.compte)
        const newSolde = (newLine.solde_debit || 0) - (newLine.solde_credit || 0)
        const oldSolde = oldLine ? ((oldLine.solde_debit || 0) - (oldLine.solde_credit || 0)) : 0
        if (Math.abs(newSolde - oldSolde) > 0.01) {
          rapport.comptesModifies.push({
            compte: newLine.compte,
            libelle: newLine.intitule,
            soldeAvant: oldSolde,
            soldeApres: newSolde,
            ecart: newSolde - oldSolde,
          })
        }
      }
    }

    saveCorrectionReport(rapport)
    return { session: newSession, rapport }
  }

  /**
   * Archiver une session
   */
  async archiveSession(sessionId: string): Promise<void> {
    const session = getSession(sessionId)
    if (!session) throw new Error(`Session ${sessionId} introuvable`)

    const snapshot = getSnapshot(session.balanceId)
    if (!snapshot) throw new Error(`Snapshot non trouve pour la balance ${session.balanceId}`)

    await saveArchive(session, snapshot)
  }

  /**
   * Obtenir les balances demo depuis le localStorage
   */
  getDemoBalance(): BalanceEntry[] {
    try {
      const data = localStorage.getItem('fiscasync_audit_demo_balance')
      if (data) return JSON.parse(data)
    } catch (err) {
      logger.error('Failed to load demo balance:', err)
    }
    return []
  }
}

export const auditOrchestrator = new AuditOrchestrator()
