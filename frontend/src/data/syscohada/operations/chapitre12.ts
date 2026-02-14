import type { ChapitreOperations } from '../types'

export const CHAPITRE_12: ChapitreOperations = {
  numero: 12,
  titre: "Cessions d'immobilisations",
  sections: [
    {
      titre: "Sortie de l'actif",
      contenu:
        "Lors de la cession d'une immobilisation, il convient d'abord de compléter l'amortissement jusqu'à la date de cession (prorata temporis). " +
        "L'immobilisation est ensuite sortie de l'actif : le compte d'amortissement (28) est débité pour le cumul des amortissements, le compte 81 « Valeurs comptables des cessions d'immobilisations » est débité pour la valeur nette comptable, et le compte d'immobilisation (21, 22, 23 ou 24) est crédité pour la valeur brute.",
      ecritures: [
        {
          numero: 1,
          description: "Cession d'un véhicule : valeur brute 12 000 000 FCFA, amortissements cumulés 9 000 000 FCFA, prix de cession 5 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '2845', libelleCompte: 'Amortissement du matériel de transport', montant: 9000000 },
            { sens: 'D', compte: '81', libelleCompte: "Valeurs comptables des cessions d'immobilisations", montant: 3000000, commentaire: 'VNC = 12M - 9M' },
            { sens: 'C', compte: '245', libelleCompte: 'Matériel de transport', montant: 12000000 },
          ],
        },
      ],
    },
    {
      titre: 'Enregistrement du prix de cession',
      contenu:
        "Le prix de cession est enregistré au crédit du compte 82 « Produits des cessions d'immobilisations » par le débit d'un compte de trésorerie ou du compte 485 « Créances sur cessions d'immobilisations ». " +
        "La TVA éventuellement collectée sur la cession est enregistrée au compte 4431. " +
        "La cession d'une immobilisation totalement amortie donne lieu à un produit net égal au prix de vente.",
      ecritures: [
        {
          numero: 2,
          description: 'Encaissement du prix de cession du véhicule : 5 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 5000000 },
            { sens: 'C', compte: '82', libelleCompte: "Produits des cessions d'immobilisations", montant: 5000000 },
          ],
        },
      ],
    },
    {
      titre: 'Plus ou moins-value',
      contenu:
        "La plus-value ou moins-value de cession résulte de la comparaison entre le prix de cession (compte 82) et la valeur comptable nette (compte 81). " +
        "Si le prix de cession est supérieur à la VNC, il y a plus-value ; dans le cas contraire, il y a moins-value. " +
        "Le SYSCOHADA n'utilise pas de compte spécifique pour le résultat de cession : celui-ci apparaît comme la différence entre les comptes 82 et 81 dans le compte de résultat.",
    },
  ],
  comptesLies: ['81', '82', '28', '21', '22', '23', '24'],
}
