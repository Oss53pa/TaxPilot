import type { ChapitreOperations } from '../types'

export const CHAPITRE_26: ChapitreOperations = {
  numero: 26,
  titre: "Charges et produits constatés d'avance",
  sections: [
    {
      titre: "Charges constatées d'avance",
      contenu:
        "Les charges constatées d'avance correspondent à des achats de biens ou services dont la fourniture ou la prestation interviendra ultérieurement. " +
        "Elles sont enregistrées à la clôture au débit du compte 476 « Charges constatées d'avance » par le crédit du compte de charges concerné. " +
        "Cette écriture de régularisation réduit les charges de l'exercice en cours pour les reporter sur l'exercice suivant, conformément au principe d'indépendance des exercices.",
      ecritures: [
        {
          numero: 1,
          description: "Prime d'assurance annuelle de 2 400 000 FCFA payée le 1er octobre, charge constatée d'avance sur 9 mois",
          lignes: [
            { sens: 'D', compte: '476', libelleCompte: "Charges constatées d'avance", montant: 1800000, commentaire: '9/12 de 2 400 000' },
            { sens: 'C', compte: '625', libelleCompte: "Primes d'assurance", montant: 1800000 },
          ],
        },
      ],
    },
    {
      titre: "Produits constatés d'avance",
      contenu:
        "Les produits constatés d'avance correspondent à des produits perçus ou comptabilisés avant que la prestation ou la livraison correspondante ne soit effectuée. " +
        "Ils sont enregistrés à la clôture au débit du compte de produit concerné par le crédit du compte 477 « Produits constatés d'avance ». " +
        "Au début de l'exercice suivant, l'écriture est contre-passée pour réintégrer ces produits dans l'exercice approprié.",
      ecritures: [
        {
          numero: 2,
          description: "Loyer trimestriel encaissé d'avance le 1er décembre : 900 000 FCFA, produit constaté d'avance sur 2 mois",
          lignes: [
            { sens: 'D', compte: '707', libelleCompte: 'Produits accessoires', montant: 600000, commentaire: '2/3 de 900 000' },
            { sens: 'C', compte: '477', libelleCompte: "Produits constatés d'avance", montant: 600000 },
          ],
        },
      ],
    },
    {
      titre: 'Régularisations',
      contenu:
        "Les écritures de régularisation (charges et produits constatés d'avance) sont systématiquement contre-passées à l'ouverture de l'exercice suivant. " +
        "Cette contre-passation permet de replacer la charge ou le produit dans l'exercice auquel il se rapporte effectivement. " +
        "Le contrôle des comptes 476 et 477 doit être effectué à chaque clôture pour s'assurer que tous les éléments inter-exercices ont été correctement traités.",
    },
  ],
  comptesLies: ['476', '477'],
}
