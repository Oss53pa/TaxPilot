/**
 * Service de validation de la balance — connecté aux vrais contrôles audit
 *
 * Remplace l'ancienne simulation (setTimeout + score hardcodé 85)
 * par l'exécution réelle des 129 contrôles du registry.
 *
 * Utilise les niveaux 0-2 (structurel, équilibre, conformité OHADA)
 * pour la validation rapide à l'import.
 */

import { auditOrchestrator } from './audit/auditOrchestrator'
import type { SessionAudit, ResultatControle } from '@/types/audit.types'

export interface BalanceValidationResult {
  /** Score 0-100, calculé réellement depuis les contrôles */
  score: number
  /** Résultats individuels des contrôles exécutés */
  controls: ControlResult[]
  /** True si au moins un contrôle BLOQUANT a échoué */
  isBlocking: boolean
  /** Inverse de isBlocking */
  canProceed: boolean
  /** Session d'audit complète (pour archivage) */
  session: SessionAudit | null
  /** Résumé par sévérité */
  summary: {
    bloquant: number
    majeur: number
    mineur: number
    info: number
    ok: number
  }
}

export interface ControlResult {
  code: string
  label: string
  status: 'OK' | 'BLOQUANT' | 'MAJEUR' | 'MINEUR' | 'INFO'
  message: string
  suggestion?: string
  reference?: string
}

/**
 * Exécute les contrôles audit niveaux 0-5 + 8 sur la balance importée.
 * C'est la Phase 1 complète du moteur d'audit.
 */
export async function executeBalanceValidation(
  balanceN: Array<{ compte: string; libelle: string; solde_debit: number; solde_credit: number; [key: string]: unknown }>,
  balanceN1?: Array<{ compte: string; libelle: string; solde_debit: number; solde_credit: number; [key: string]: unknown }>,
  onProgress?: (stage: string, current: number, total: number) => void,
): Promise<BalanceValidationResult> {
  try {
    const session = await auditOrchestrator.startPhase1Audit(
      balanceN as never[],
      (balanceN1 || []) as never[],
      undefined,
      {
        onProgress: (_niveau, index, total, ref) => {
          onProgress?.(`Contrôle ${ref}`, index, total)
        },
        onLevelStart: (niveau) => {
          const noms: Record<number, string> = {
            0: 'Intégrité structurelle',
            1: 'Équilibre fondamental',
            2: 'Conformité OHADA',
            3: 'Sens des soldes',
            4: 'Cohérence inter-comptes',
            5: 'Comparaison N/N-1',
            8: 'Continuité archives',
          }
          onProgress?.(`Niveau ${niveau} — ${noms[niveau] || ''}`, 0, 1)
        },
      },
    )

    // Transformer les résultats en format simplifié
    const controls: ControlResult[] = session.resultats.map((r: ResultatControle) => ({
      code: r.ref,
      label: r.nom,
      status: r.severite as ControlResult['status'],
      message: r.message || '',
      suggestion: r.suggestion,
      reference: r.referenceReglementaire,
    }))

    const summary = session.resume.parSeverite

    return {
      score: session.resume.scoreGlobal,
      controls,
      isBlocking: summary.BLOQUANT > 0,
      canProceed: summary.BLOQUANT === 0,
      session,
      summary: {
        bloquant: summary.BLOQUANT,
        majeur: summary.MAJEUR,
        mineur: summary.MINEUR,
        info: summary.INFO,
        ok: summary.OK,
      },
    }
  } catch (error) {
    // Fallback en cas d'erreur du moteur d'audit
    return {
      score: 0,
      controls: [{
        code: 'SYS-ERR',
        label: 'Erreur système',
        status: 'BLOQUANT',
        message: `Erreur lors de l'exécution des contrôles : ${error instanceof Error ? error.message : String(error)}`,
      }],
      isBlocking: true,
      canProceed: false,
      session: null,
      summary: { bloquant: 1, majeur: 0, mineur: 0, info: 0, ok: 0 },
    }
  }
}
