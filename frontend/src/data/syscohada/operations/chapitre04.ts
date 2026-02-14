import type { ChapitreOperations } from '../types'

export const CHAPITRE_04: ChapitreOperations = {
  numero: 4,
  titre: 'Affectation du résultat',
  sections: [
    {
      titre: 'Affectation du bénéfice',
      contenu:
        "L'affectation du bénéfice est décidée par l'assemblée générale ordinaire dans les six mois suivant la clôture de l'exercice. " +
        "Le bénéfice distribuable est constitué du résultat de l'exercice diminué des pertes antérieures et de la dotation à la réserve légale, augmenté du report à nouveau bénéficiaire. " +
        "Le compte 12 « Résultat de l'exercice » est soldé par le crédit des comptes de réserves (106, 111, 118), de dividendes à payer (465) et éventuellement du report à nouveau (110).",
      ecritures: [
        {
          numero: 1,
          description: 'Affectation d\'un bénéfice de 15 000 000 FCFA : réserve légale 750 000, dividendes 10 000 000, report à nouveau 4 250 000',
          lignes: [
            { sens: 'D', compte: '120', libelleCompte: 'Résultat de l\'exercice (bénéfice)', montant: 15000000 },
            { sens: 'C', compte: '111', libelleCompte: 'Réserve légale', montant: 750000, commentaire: '5% du bénéfice' },
            { sens: 'C', compte: '465', libelleCompte: 'Associés, dividendes à payer', montant: 10000000 },
            { sens: 'C', compte: '110', libelleCompte: 'Report à nouveau créditeur', montant: 4250000 },
          ],
        },
      ],
    },
    {
      titre: 'Traitement de la perte',
      contenu:
        "Lorsque l'exercice se solde par une perte, celle-ci peut être reportée à nouveau (compte 119) en attendant son imputation sur les bénéfices futurs. " +
        "L'assemblée peut aussi décider de l'imputer sur les réserves existantes ou de procéder à une réduction de capital si les pertes représentent plus de la moitié du capital. " +
        "Le compte 129 « Résultat de l'exercice (perte) » est soldé par le débit du compte 119 ou des comptes de réserves.",
    },
    {
      titre: 'Calcul de la réserve légale',
      contenu:
        "La dotation à la réserve légale est obligatoire à hauteur de 10 % du bénéfice net diminué des pertes antérieures, dans la limite de 20 % du capital social (OHADA). " +
        "Cette obligation cesse lorsque la réserve légale atteint le cinquième du capital. " +
        "La réserve légale ne peut être distribuée aux associés mais peut servir à compenser les pertes.",
    },
  ],
  comptesLies: ['12', '106', '110', '119', '465'],
}
