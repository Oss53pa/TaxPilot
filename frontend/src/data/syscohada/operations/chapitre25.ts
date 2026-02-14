import type { ChapitreOperations } from '../types'

export const CHAPITRE_25: ChapitreOperations = {
  numero: 25,
  titre: 'Titres de placement',
  sections: [
    {
      titre: 'Acquisition',
      contenu:
        "Les titres de placement sont des valeurs mobilières acquises en vue d'en tirer un revenu direct ou une plus-value à court terme, sans intention de contrôle. " +
        "Ils sont enregistrés au débit du compte 50 (501 « Actions », 502 « Obligations ») pour leur coût d'acquisition, incluant le prix d'achat et les frais accessoires. " +
        "Le SYSCOHADA Révisé permet d'inscrire les frais accessoires en charges de l'exercice d'acquisition.",
      ecritures: [
        {
          numero: 1,
          description: 'Acquisition de 200 actions de placement à 15 000 FCFA l\'action, commissions 60 000 FCFA',
          lignes: [
            { sens: 'D', compte: '501', libelleCompte: 'Actions', montant: 3060000, commentaire: '200 x 15 000 + 60 000 frais' },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 3060000 },
          ],
        },
      ],
    },
    {
      titre: 'Revenus des titres',
      contenu:
        "Les dividendes perçus sur les actions de placement sont enregistrés au crédit du compte 774 « Revenus de titres de placement ». " +
        "Les intérêts sur obligations sont comptabilisés au crédit du même compte. Les intérêts courus non échus à la date de clôture sont rattachés à l'exercice par le débit du compte 508 « Intérêts courus ». " +
        "La retenue à la source éventuellement prélevée est enregistrée au débit du compte 4472 « Impôt sur les revenus des valeurs mobilières ».",
    },
    {
      titre: 'Cession',
      contenu:
        "La cession de titres de placement génère un résultat financier : gain de change (compte 777 « Gains sur cessions de titres de placement ») ou perte (compte 677 « Pertes sur cessions de titres de placement »). " +
        "Le compte 50 est crédité de la valeur comptable des titres cédés. Le compte de trésorerie est débité du prix de cession net de frais. " +
        "En cas de cession partielle d'un lot de titres fongibles, la valeur de sortie est déterminée selon la méthode CUMP ou FIFO.",
      ecritures: [
        {
          numero: 2,
          description: 'Cession de 100 actions acquises à 15 300 FCFA, vendues à 18 000 FCFA l\'action',
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 1800000 },
            { sens: 'C', compte: '501', libelleCompte: 'Actions', montant: 1530000, commentaire: 'Valeur comptable' },
            { sens: 'C', compte: '777', libelleCompte: 'Gains sur cessions de titres de placement', montant: 270000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['50', '501', '502', '677', '777'],
}
