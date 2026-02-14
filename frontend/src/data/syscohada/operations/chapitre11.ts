import type { ChapitreOperations } from '../types'

export const CHAPITRE_11: ChapitreOperations = {
  numero: 11,
  titre: 'Amortissements des immobilisations',
  sections: [
    {
      titre: 'Amortissement linéaire',
      contenu:
        "L'amortissement linéaire (ou constant) répartit de manière égale la base amortissable sur la durée d'utilité de l'immobilisation. " +
        "La dotation annuelle est calculée en divisant le coût d'acquisition (ou de production) diminué de la valeur résiduelle par la durée d'utilité estimée. " +
        "Le compte 681 « Dotations aux amortissements d'exploitation » est débité par le crédit du compte 28 correspondant à l'immobilisation amortie.",
      ecritures: [
        {
          numero: 1,
          description: 'Dotation aux amortissements linéaires d\'un matériel de 15 000 000 FCFA amorti sur 5 ans',
          lignes: [
            { sens: 'D', compte: '6813', libelleCompte: "Dotations aux amortissements des immobilisations corporelles", montant: 3000000 },
            { sens: 'C', compte: '2841', libelleCompte: 'Amortissement du matériel industriel', montant: 3000000 },
          ],
        },
      ],
    },
    {
      titre: 'Amortissement dégressif',
      contenu:
        "L'amortissement dégressif est un mode d'amortissement fiscal qui permet de constater des dotations plus élevées en début de vie de l'immobilisation. " +
        "Le taux dégressif est obtenu en multipliant le taux linéaire par un coefficient fiscal (1,5 pour 3-4 ans, 2 pour 5-6 ans, 2,5 pour plus de 6 ans dans certaines législations OHADA). " +
        "La base amortissable est la valeur nette comptable en début de chaque exercice.",
    },
    {
      titre: 'Amortissement dérogatoire',
      contenu:
        "Lorsque l'amortissement fiscal diffère de l'amortissement économique, la différence est enregistrée en amortissement dérogatoire (provision réglementée). " +
        "L'excédent de l'amortissement fiscal sur l'amortissement économique donne lieu à une dotation au compte 851 par le crédit du compte 141. " +
        "L'excédent inverse donne lieu à une reprise au compte 861 par le débit du compte 141. Le total des amortissements économique et dérogatoire reconstitue l'amortissement fiscal.",
      ecritures: [
        {
          numero: 2,
          description: "Enregistrement conjoint : amortissement économique 3 000 000 FCFA, amortissement fiscal 4 500 000 FCFA (dérogatoire 1 500 000)",
          lignes: [
            { sens: 'D', compte: '6813', libelleCompte: 'Dotations aux amortissements des immobilisations corporelles', montant: 3000000 },
            { sens: 'C', compte: '2841', libelleCompte: 'Amortissement du matériel industriel', montant: 3000000 },
            { sens: 'D', compte: '851', libelleCompte: 'Dotations aux provisions réglementées', montant: 1500000 },
            { sens: 'C', compte: '141', libelleCompte: 'Amortissements dérogatoires', montant: 1500000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['28', '681', '68'],
}
