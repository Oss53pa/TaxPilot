import type { ChapitreOperations } from '../types'

export const CHAPITRE_36: ChapitreOperations = {
  numero: 36,
  titre: 'Dissolution et liquidation',
  sections: [
    {
      titre: 'Opérations de dissolution',
      contenu:
        "La dissolution d'une société est décidée par l'assemblée générale extraordinaire ou résulte de l'arrivée du terme, de la réalisation de l'objet social, ou d'un jugement. " +
        "Le liquidateur nommé procède à la réalisation de l'actif (vente des immobilisations, recouvrement des créances) et au paiement du passif. " +
        "Les opérations de liquidation sont enregistrées dans les comptes de la société en liquidation jusqu'au partage définitif.",
      ecritures: [
        {
          numero: 1,
          description: "Réalisation d'immobilisations lors de la liquidation : VNC 8 000 000 FCFA, prix de vente 6 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 6000000 },
            { sens: 'D', compte: '28', libelleCompte: 'Amortissements', montant: 12000000, commentaire: 'Cumul des amortissements' },
            { sens: 'C', compte: '24', libelleCompte: 'Matériel', montant: 20000000, commentaire: 'Valeur brute' },
            { sens: 'C', compte: '82', libelleCompte: "Produits des cessions d'immobilisations", montant: 6000000 },
            { sens: 'D', compte: '81', libelleCompte: "Valeurs comptables des cessions d'immobilisations", montant: 8000000 },
          ],
        },
      ],
    },
    {
      titre: "Liquidation de l'actif",
      contenu:
        "La liquidation de l'actif comprend la réalisation des immobilisations, le recouvrement des créances et la vente des stocks. " +
        "Les plus ou moins-values de cession sont comptabilisées normalement. Les frais de liquidation (honoraires du liquidateur, frais de justice) sont enregistrés en charges. " +
        "Le résultat de liquidation est déterminé par la différence entre le produit net de la réalisation et l'actif net comptable.",
    },
    {
      titre: 'Partage du boni/mali',
      contenu:
        "Après paiement de toutes les dettes et des frais de liquidation, le solde disponible (boni de liquidation) est réparti entre les associés au prorata de leurs droits. " +
        "Le boni de liquidation correspond à la différence entre le capital remboursé et l'actif net de liquidation. Le mali de liquidation représente la perte subie par les associés. " +
        "Le compte 101 « Capital social » et les réserves sont soldés lors du partage final.",
      ecritures: [
        {
          numero: 2,
          description: "Partage du boni de liquidation : capital 20 000 000, réserves 5 000 000, actif net disponible 28 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '101', libelleCompte: 'Capital social', montant: 20000000 },
            { sens: 'D', compte: '106', libelleCompte: 'Réserves', montant: 5000000 },
            { sens: 'D', compte: '120', libelleCompte: 'Résultat de liquidation (bénéfice)', montant: 3000000, commentaire: 'Boni de liquidation' },
            { sens: 'C', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 28000000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['101', '106', '12', '46'],
}
