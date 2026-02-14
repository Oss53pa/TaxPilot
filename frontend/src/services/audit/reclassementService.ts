/**
 * Service de reclassement automatique
 * Detecte et genere les ecritures de reclassement pour les etats financiers
 */

import { BalanceEntry } from '@/services/liasseDataService'
import type { EcritureComptable } from '@/types/audit.types'

export interface Inversion {
  type: 'CLIENT_CREDITEUR' | 'FOURNISSEUR_DEBITEUR' | 'BANQUE_CREDITRICE'
  compte: string
  intitule: string
  montant: number
  compteReclassement: string
  libelleReclassement: string
}

class ReclassementService {
  /**
   * Detecte toutes les inversions de sens dans la balance
   */
  detecterInversions(balance: BalanceEntry[]): Inversion[] {
    const inversions: Inversion[] = []

    for (const l of balance) {
      const solde = (l.solde_debit || 0) - (l.solde_credit || 0)
      const num = l.compte.toString()

      // Clients crediteurs (411x avec solde crediteur)
      if (num.startsWith('411') && solde < -1) {
        inversions.push({
          type: 'CLIENT_CREDITEUR',
          compte: num,
          intitule: l.intitule,
          montant: Math.abs(solde),
          compteReclassement: '419',
          libelleReclassement: 'Clients crediteurs - reclassement passif',
        })
      }

      // Fournisseurs debiteurs (401x avec solde debiteur)
      if (num.startsWith('401') && solde > 1) {
        inversions.push({
          type: 'FOURNISSEUR_DEBITEUR',
          compte: num,
          intitule: l.intitule,
          montant: solde,
          compteReclassement: '409',
          libelleReclassement: 'Fournisseurs debiteurs - reclassement actif',
        })
      }

      // Banques creditrices (52x avec solde crediteur)
      if (num.startsWith('52') && solde < -1) {
        inversions.push({
          type: 'BANQUE_CREDITRICE',
          compte: num,
          intitule: l.intitule,
          montant: Math.abs(solde),
          compteReclassement: '52_PASSIF',
          libelleReclassement: 'Tresorerie-passif (concours bancaires)',
        })
      }
    }

    return inversions
  }

  /**
   * Genere les ecritures de reclassement pour les inversions detectees
   */
  genererReclassements(inversions: Inversion[]): EcritureComptable[] {
    return inversions.map((inv) => ({
      journal: 'OD',
      date: new Date().toISOString().slice(0, 10),
      lignes: [
        {
          sens: 'D' as const,
          compte: inv.compte,
          libelle: `Reclassement ${inv.intitule}`,
          montant: inv.montant,
        },
        {
          sens: 'C' as const,
          compte: inv.compteReclassement,
          libelle: inv.libelleReclassement,
          montant: inv.montant,
        },
      ],
      commentaire: `Reclassement ${inv.type}: ${inv.compte} (${inv.intitule}) -> ${inv.compteReclassement}`,
    }))
  }

  /**
   * Calcule le resume des reclassements
   */
  getResume(inversions: Inversion[]): {
    clientsCrediteurs: { count: number; montant: number }
    fournisseursDebiteurs: { count: number; montant: number }
    banquesCreditrices: { count: number; montant: number }
    total: number
  } {
    const clientsCrediteurs = inversions.filter((i) => i.type === 'CLIENT_CREDITEUR')
    const fournisseursDebiteurs = inversions.filter((i) => i.type === 'FOURNISSEUR_DEBITEUR')
    const banquesCreditrices = inversions.filter((i) => i.type === 'BANQUE_CREDITRICE')

    return {
      clientsCrediteurs: {
        count: clientsCrediteurs.length,
        montant: clientsCrediteurs.reduce((s, i) => s + i.montant, 0),
      },
      fournisseursDebiteurs: {
        count: fournisseursDebiteurs.length,
        montant: fournisseursDebiteurs.reduce((s, i) => s + i.montant, 0),
      },
      banquesCreditrices: {
        count: banquesCreditrices.length,
        montant: banquesCreditrices.reduce((s, i) => s + i.montant, 0),
      },
      total: inversions.reduce((s, i) => s + i.montant, 0),
    }
  }
}

export const reclassementService = new ReclassementService()
