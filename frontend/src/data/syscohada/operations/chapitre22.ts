import type { ChapitreOperations } from '../types'

export const CHAPITRE_22: ChapitreOperations = {
  numero: 22,
  titre: 'État et impôts',
  sections: [
    {
      titre: 'TVA collectée et déductible',
      contenu:
        "La TVA collectée sur les ventes est enregistrée au crédit du compte 4431 « TVA facturée sur ventes ». La TVA déductible sur les achats est inscrite au débit du compte 4452 « TVA récupérable sur achats » et celle sur immobilisations au débit du compte 4451. " +
        "Les entreprises non assujetties ou partiellement exonérées intègrent la TVA non récupérable dans le coût des biens et services acquis. " +
        "Le prorata de déduction s'applique aux assujettis partiels.",
      ecritures: [
        {
          numero: 1,
          description: 'Déclaration mensuelle de TVA : TVA collectée 2 700 000, TVA déductible 1 800 000, TVA à décaisser 900 000 FCFA',
          lignes: [
            { sens: 'D', compte: '4431', libelleCompte: 'TVA facturée sur ventes', montant: 2700000 },
            { sens: 'C', compte: '4452', libelleCompte: 'TVA récupérable sur achats', montant: 1800000 },
            { sens: 'C', compte: '4441', libelleCompte: 'État, TVA due', montant: 900000 },
          ],
        },
      ],
    },
    {
      titre: 'Déclaration de TVA',
      contenu:
        "La déclaration de TVA est établie mensuellement ou trimestriellement selon le régime d'imposition. Le solde de TVA à décaisser (compte 4441) est réglé dans les délais légaux. " +
        "Si la TVA déductible excède la TVA collectée, le crédit de TVA est inscrit au compte 4449 « État, crédit de TVA à reporter ». " +
        "Le remboursement du crédit de TVA, lorsqu'il est demandé, est enregistré au débit du compte 4441 par le crédit du compte 4449.",
    },
    {
      titre: 'Impôts sur les bénéfices',
      contenu:
        "L'impôt sur les bénéfices (IS ou BIC) est comptabilisé au débit du compte 891 « Impôts sur les bénéfices de l'exercice » par le crédit du compte 441 « État, impôt sur les bénéfices ». " +
        "Les acomptes provisionnels versés en cours d'exercice sont enregistrés au débit du compte 444 « État, impôt sur les bénéfices ». " +
        "Le solde de l'IS à payer ou le trop-versé apparaît dans le compte 441 ou 444 selon les cas.",
      ecritures: [
        {
          numero: 2,
          description: 'Liquidation de l\'IS : impôt dû 4 500 000 FCFA, acomptes versés 3 000 000 FCFA, solde à payer 1 500 000',
          lignes: [
            { sens: 'D', compte: '891', libelleCompte: 'Impôts sur les bénéfices', montant: 4500000 },
            { sens: 'C', compte: '444', libelleCompte: 'État, impôt sur les bénéfices', montant: 4500000 },
          ],
        },
      ],
    },
    {
      titre: 'Taxes sur salaires',
      contenu:
        "Les taxes assises sur les salaires (taxe d'apprentissage, formation professionnelle, versement patronal sur salaires, etc.) sont comptabilisées au débit du compte 641 « Impôts et taxes sur rémunérations ». " +
        "Le compte 447 « État, impôts retenus à la source » enregistre les retenues opérées sur les salaires pour le compte de l'État. " +
        "Le versement de ces taxes s'effectue selon les échéances fixées par la législation fiscale de chaque État membre de l'OHADA.",
    },
  ],
  comptesLies: ['44', '443', '444', '445', '446', '447', '64'],
}
