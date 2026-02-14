import type { ChapitreOperations } from '../types'

export const CHAPITRE_07: ChapitreOperations = {
  numero: 7,
  titre: 'Provisions réglementées',
  sections: [
    {
      titre: 'Amortissements dérogatoires',
      contenu:
        "Les amortissements dérogatoires résultent de la différence entre l'amortissement fiscal (souvent dégressif ou accéléré) et l'amortissement économique (linéaire). " +
        "La fraction excédentaire est enregistrée au crédit du compte 141 « Amortissements dérogatoires » par le débit du compte 851 « Dotations aux provisions réglementées ». " +
        "Lorsque l'amortissement fiscal devient inférieur à l'amortissement économique, une reprise est effectuée.",
      ecritures: [
        {
          numero: 1,
          description: 'Dotation aux amortissements dérogatoires : excédent fiscal de 1 200 000 FCFA',
          lignes: [
            { sens: 'D', compte: '851', libelleCompte: 'Dotations aux provisions réglementées', montant: 1200000 },
            { sens: 'C', compte: '141', libelleCompte: 'Amortissements dérogatoires', montant: 1200000 },
          ],
        },
      ],
    },
    {
      titre: 'Plus-values à réinvestir',
      contenu:
        "Certaines législations fiscales de la zone OHADA permettent le report d'imposition des plus-values de cession à condition de réinvestir dans un délai donné. " +
        "La plus-value est transférée au compte 142 « Plus-values de cession à réinvestir » via le compte 851. " +
        "Lors du réinvestissement ou à l'expiration du délai, la provision est reprise au compte 861.",
    },
    {
      titre: 'Reprise des provisions',
      contenu:
        "La reprise des provisions réglementées intervient lorsque les conditions ayant motivé leur constitution cessent d'exister. " +
        "Le compte de provision (14x) est débité par le crédit du compte 861 « Reprises de provisions réglementées ». " +
        "Les reprises d'amortissements dérogatoires sont effectuées systématiquement lorsque l'amortissement économique excède l'amortissement fiscal.",
      ecritures: [
        {
          numero: 2,
          description: 'Reprise d\'amortissements dérogatoires de 800 000 FCFA',
          lignes: [
            { sens: 'D', compte: '141', libelleCompte: 'Amortissements dérogatoires', montant: 800000 },
            { sens: 'C', compte: '861', libelleCompte: 'Reprises de provisions réglementées', montant: 800000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['14', '141', '851', '861'],
}
