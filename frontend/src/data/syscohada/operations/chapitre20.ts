import type { ChapitreOperations } from '../types'

export const CHAPITRE_20: ChapitreOperations = {
  numero: 20,
  titre: 'Opérations avec les clients',
  sections: [
    {
      titre: 'Facturation des ventes',
      contenu:
        "Les ventes de biens et services sont enregistrées au crédit des comptes 70 (ventes de marchandises, produits fabriqués, services) par le débit du compte 411 « Clients ». " +
        "Le chiffre d'affaires est comptabilisé hors taxes collectées. La TVA collectée est enregistrée au crédit du compte 4431. " +
        "Les remises commerciales figurant sur facture sont déduites directement du montant de la vente.",
      ecritures: [
        {
          numero: 1,
          description: 'Facturation d\'une vente de marchandises pour 6 000 000 FCFA HT, TVA 18%',
          lignes: [
            { sens: 'D', compte: '411', libelleCompte: 'Clients', montant: 7080000 },
            { sens: 'C', compte: '701', libelleCompte: 'Ventes de marchandises', montant: 6000000 },
            { sens: 'C', compte: '4431', libelleCompte: 'TVA facturée sur ventes', montant: 1080000 },
          ],
        },
      ],
    },
    {
      titre: 'Effets à recevoir',
      contenu:
        "Lorsque le client accepte un effet de commerce (traite), la créance est transférée du compte 411 au compte 412 « Clients, effets à recevoir ». " +
        "L'effet peut être conservé en portefeuille jusqu'à l'échéance, remis à l'escompte (compte 565 « Banques, crédits d'escompte ») ou endossé au profit d'un tiers. " +
        "En cas d'impayé, l'effet est réintégré au compte 411 et des frais de retour peuvent être facturés.",
    },
    {
      titre: 'Avances reçues',
      contenu:
        "Les avances et acomptes reçus des clients sont enregistrés au crédit du compte 419 « Clients créditeurs » par le débit du compte de trésorerie. " +
        "Lors de la facturation définitive, le compte 419 est débité pour venir en diminution de la créance enregistrée au compte 411. " +
        "Les avances reçues peuvent être soumises à TVA selon la réglementation fiscale locale.",
    },
    {
      titre: 'Clients douteux',
      contenu:
        "Lorsqu'une créance client présente un risque de non-recouvrement, elle est transférée du compte 411 au compte 416 « Clients douteux ou litigieux ». " +
        "Une dépréciation est constituée en fonction du risque estimé de perte (débit 6594, crédit 491). La créance est maintenue TTC au bilan. " +
        "En cas d'irrécouvrabilité définitive, la créance est soldée et la perte est constatée au compte 651 « Pertes sur créances clients ».",
      ecritures: [
        {
          numero: 2,
          description: 'Reclassement d\'un client douteux (créance TTC 2 360 000 FCFA) et dépréciation à 50%',
          lignes: [
            { sens: 'D', compte: '416', libelleCompte: 'Clients douteux ou litigieux', montant: 2360000 },
            { sens: 'C', compte: '411', libelleCompte: 'Clients', montant: 2360000, commentaire: 'Reclassement' },
            { sens: 'D', compte: '6594', libelleCompte: 'Charges de provisions pour dépréciation des créances', montant: 1000000, commentaire: '50% du HT' },
            { sens: 'C', compte: '491', libelleCompte: 'Dépréciations des comptes clients', montant: 1000000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['41', '411', '412', '413', '418', '419'],
}
