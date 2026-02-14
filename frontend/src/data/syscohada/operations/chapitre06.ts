import type { ChapitreOperations } from '../types'

export const CHAPITRE_06: ChapitreOperations = {
  numero: 6,
  titre: "Subventions d'investissement",
  sections: [
    {
      titre: 'Réception de la subvention',
      contenu:
        "Les subventions d'investissement sont des aides publiques destinées à financer l'acquisition ou la création d'immobilisations. " +
        "Elles sont enregistrées au crédit du compte 131 « Subventions d'équipement » lors de la notification de l'octroi, par le débit du compte 441 « État, subventions à recevoir ». " +
        "Lors de l'encaissement effectif, le compte 521 est débité et le compte 441 est crédité.",
      ecritures: [
        {
          numero: 1,
          description: "Notification et encaissement d'une subvention d'équipement de 20 000 000 FCFA pour l'acquisition d'une machine",
          lignes: [
            { sens: 'D', compte: '441', libelleCompte: 'État, subventions à recevoir', montant: 20000000, commentaire: "Notification de l'octroi" },
            { sens: 'C', compte: '131', libelleCompte: "Subventions d'équipement", montant: 20000000 },
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 20000000, commentaire: 'Encaissement' },
            { sens: 'C', compte: '441', libelleCompte: 'État, subventions à recevoir', montant: 20000000 },
          ],
        },
      ],
    },
    {
      titre: 'Reprise au résultat',
      contenu:
        "La subvention d'investissement est rapportée au résultat au rythme de l'amortissement du bien financé. " +
        "Le compte 139 « Subventions d'investissement inscrites au compte de résultat » est débité par le crédit du compte 865 « Reprises de subventions d'investissement ». " +
        "Cette reprise permet de neutraliser l'effet de la charge d'amortissement sur le résultat de chaque exercice concerné.",
      ecritures: [
        {
          numero: 2,
          description: "Reprise annuelle d'une subvention de 20 000 000 FCFA sur un bien amorti en 5 ans linéaire",
          lignes: [
            { sens: 'D', compte: '139', libelleCompte: "Subventions d'investissement inscrites au compte de résultat", montant: 4000000 },
            { sens: 'C', compte: '865', libelleCompte: "Reprises de subventions d'investissement", montant: 4000000 },
          ],
        },
      ],
    },
    {
      titre: 'Remboursement éventuel',
      contenu:
        "En cas de non-respect des conditions d'attribution, la subvention peut devoir être remboursée en tout ou partie. " +
        "Le remboursement s'impute d'abord sur la quote-part non encore rapportée au résultat (débit du compte 131), puis sur le résultat de l'exercice pour l'excédent. " +
        "Le SYSCOHADA prévoit que tout engagement de remboursement probable donne lieu à la constitution d'une provision.",
    },
  ],
  comptesLies: ['13', '131', '139', '441', '865'],
}
