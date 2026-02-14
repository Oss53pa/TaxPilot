/**
 * Plan Comptable SYSCOHADA Révisé - Façade de rétrocompatibilité
 *
 * Ce fichier re-exporte depuis le nouveau module structuré syscohada/.
 * Tous les imports existants continuent de fonctionner sans modification.
 */

// Re-export du type CompteComptable (compatible avec l'ancien format)
export type { CompteComptable } from './syscohada/types'

// Re-export de toutes les données et fonctions depuis le nouveau module
export {
  SYSCOHADA_REVISE_CLASSES,
  PLAN_SYSCOHADA_REVISE,
  getSYSCOHADAAccountByNumber,
  getSYSCOHADAAccountsByClass,
  getSYSCOHADAAccountsBySector,
  validateSYSCOHADAAccount,
} from './syscohada/plan'
