import type { ChapitreOperations } from '../types'

export const CHAPITRE_03: ChapitreOperations = {
  numero: 3,
  titre: 'Réduction et amortissement du capital',
  sections: [
    {
      titre: 'Réduction motivée par des pertes',
      contenu:
        "La réduction du capital motivée par des pertes consiste à apurer les pertes accumulées (compte 129 ou 119) en diminuant le capital social. " +
        "Cette opération est un assainissement financier qui ne constitue pas un remboursement aux associés. " +
        "Le compte 101 « Capital social » est débité par le crédit du compte 119 « Report à nouveau débiteur » ou 129 « Résultat net : perte ».",
      ecritures: [
        {
          numero: 1,
          description: 'Réduction du capital de 8 000 000 FCFA pour apurement des pertes cumulées',
          lignes: [
            { sens: 'D', compte: '101', libelleCompte: 'Capital social', montant: 8000000 },
            { sens: 'C', compte: '119', libelleCompte: 'Report à nouveau débiteur', montant: 8000000, commentaire: 'Apurement des pertes' },
          ],
        },
      ],
    },
    {
      titre: 'Réduction non motivée par des pertes',
      contenu:
        "La réduction du capital non motivée par des pertes entraîne un remboursement effectif aux actionnaires. " +
        "Elle peut se faire par diminution de la valeur nominale des titres ou par annulation de titres rachetés. " +
        "Les créanciers disposent d'un droit d'opposition. Le compte 101 est débité et le compte 461 « Associés, opérations sur le capital » est crédité, puis soldé lors du paiement.",
    },
    {
      titre: 'Amortissement du capital',
      contenu:
        "L'amortissement du capital est le remboursement anticipé aux actionnaires de tout ou partie de la valeur nominale de leurs actions, sans réduction du capital. " +
        "Il est financé par les bénéfices ou les réserves. Le capital amorti est transféré du compte 101 au compte 1019 « Capital amorti ». " +
        "Les actions amorties deviennent des actions de jouissance qui conservent le droit au superdividende et au boni de liquidation.",
      ecritures: [
        {
          numero: 2,
          description: 'Amortissement partiel du capital : remboursement de 2 000 FCFA par action sur 1 000 actions',
          lignes: [
            { sens: 'D', compte: '1181', libelleCompte: 'Réserves facultatives', montant: 2000000, commentaire: 'Prélèvement sur réserves' },
            { sens: 'C', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 2000000 },
            { sens: 'D', compte: '461', libelleCompte: 'Associés, opérations sur le capital', montant: 2000000, commentaire: 'Remboursement effectif' },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 2000000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['101', '109', '119', '129'],
}
