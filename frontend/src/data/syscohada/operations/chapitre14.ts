import type { ChapitreOperations } from '../types'

export const CHAPITRE_14: ChapitreOperations = {
  numero: 14,
  titre: 'Immobilisations financières',
  sections: [
    {
      titre: 'Acquisition de titres de participation',
      contenu:
        "Les titres de participation sont des titres dont la possession durable est estimée utile à l'activité de l'entreprise, notamment en permettant d'exercer une influence ou un contrôle sur la société émettrice. " +
        "Ils sont enregistrés au débit du compte 261 « Titres de participation » pour leur coût d'acquisition, incluant le prix d'achat et les frais accessoires (commissions, courtages). " +
        "Les titres de participation sont évalués à chaque clôture à leur valeur d'utilité, avec constitution d'une dépréciation si nécessaire.",
      ecritures: [
        {
          numero: 1,
          description: 'Acquisition de 500 actions de la société XYZ à 20 000 FCFA l\'action, frais de courtage 200 000 FCFA',
          lignes: [
            { sens: 'D', compte: '261', libelleCompte: 'Titres de participation', montant: 10200000, commentaire: '500 x 20 000 + 200 000 frais' },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 10200000 },
          ],
        },
      ],
    },
    {
      titre: 'Prêts',
      contenu:
        "Les prêts accordés par l'entreprise à des tiers (filiales, associés, personnel) d'une durée supérieure à un an sont enregistrés au compte 27 « Autres immobilisations financières ». " +
        "Le compte 271 « Prêts et créances non commerciales » est débité par le crédit du compte de trésorerie. " +
        "Les intérêts courus sont comptabilisés au compte 2767 « Intérêts courus sur prêts » et les produits correspondants au compte 77.",
    },
    {
      titre: 'Dépôts et cautionnements',
      contenu:
        "Les dépôts et cautionnements versés sont des sommes bloquées en garantie d'exécution de contrats (loyer, fourniture d'énergie, etc.). " +
        "Ils sont enregistrés au débit du compte 275 « Dépôts et cautionnements versés » par le crédit du compte de trésorerie. " +
        "Lors de la restitution, l'écriture inverse est passée. Une dépréciation est constituée si le remboursement devient incertain.",
      ecritures: [
        {
          numero: 2,
          description: 'Versement d\'un dépôt de garantie de 3 mois de loyer : 1 500 000 FCFA',
          lignes: [
            { sens: 'D', compte: '275', libelleCompte: 'Dépôts et cautionnements versés', montant: 1500000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 1500000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['26', '27', '261', '271', '275'],
}
