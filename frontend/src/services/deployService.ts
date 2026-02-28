/**
 * Service de deploiement de la balance auditee vers la liasse fiscale
 * Orchestre: chargement balance → generation etats financiers → audit Phase 3 → validation
 */

import type { TypeLiasse } from '@/types'
import type { StoredBalance } from './balanceStorageService'
import { updateBalanceStatut } from './balanceStorageService'
import { liasseDataService } from './liasseDataService'
import { auditOrchestrator } from './audit/auditOrchestrator'

export interface DeployResult {
  success: boolean
  bloquantsPhase3: number
  message: string
}

/**
 * Deployer une balance auditee dans la liasse fiscale
 * 1. Charger la balance dans liasseDataService
 * 2. Generer les etats financiers
 * 3. Lancer audit Phase 3 (controles post-calcul niveaux 6-7)
 * 4. Si 0 bloquant → marquer comme deployee → succes
 * 5. Si bloquants → retourner erreur
 */
export async function deployToLiasse(
  balance: StoredBalance,
  typeLiasse: TypeLiasse = 'SN'
): Promise<DeployResult> {
  // 1. Charger la balance
  liasseDataService.loadBalance(balance.entries)

  // 2. Generer les etats financiers (force les calculs)
  try {
    liasseDataService.generateBilanActif(typeLiasse)
    liasseDataService.generateBilanPassif(typeLiasse)
    liasseDataService.generateCompteResultat(typeLiasse)
    liasseDataService.generateSIG()
    liasseDataService.generateTFT()
    liasseDataService.generateTAFIRE()
  } catch (err) {
    throw new Error(`Erreur lors de la generation des etats financiers: ${err instanceof Error ? err.message : String(err)}`)
  }

  // 3. Lancer audit Phase 3 (niveaux 6-7)
  const phase3Session = await auditOrchestrator.startPhase3Audit(balance.entries)
  const bloquantsPhase3 = phase3Session.resume.parSeverite.BLOQUANT || 0

  // 4. Verifier les resultats
  if (bloquantsPhase3 > 0) {
    const bloquants = phase3Session.resultats
      .filter(r => r.severite === 'BLOQUANT' && r.statut === 'ANOMALIE')
      .map(r => `${r.ref}: ${r.message}`)
      .join('\n')

    throw new Error(
      `${bloquantsPhase3} anomalie(s) bloquante(s) detectee(s) lors du controle Phase 3 (etats financiers):\n${bloquants}`
    )
  }

  // 5. Marquer comme deployee
  updateBalanceStatut(balance.id, 'deployee')

  return {
    success: true,
    bloquantsPhase3: 0,
    message: `Balance deployee avec succes. ${phase3Session.resultats.length} controles Phase 3 executes, 0 bloquant.`,
  }
}
