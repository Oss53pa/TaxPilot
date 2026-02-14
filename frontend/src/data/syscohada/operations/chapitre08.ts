import type { ChapitreOperations } from '../types'

export const CHAPITRE_08: ChapitreOperations = {
  numero: 8,
  titre: 'Provisions pour risques et charges',
  sections: [
    {
      titre: 'Constitution',
      contenu:
        "Une provision pour risques et charges est constituée lorsqu'il existe une obligation actuelle résultant d'un événement passé, qu'il est probable qu'une sortie de ressources sera nécessaire et que le montant peut être estimé de manière fiable. " +
        "Le compte 691 « Dotations aux provisions d'exploitation » ou 697 « Dotations aux provisions financières » est débité par le crédit du compte 15 correspondant (151, 155, etc.). " +
        "Les provisions doivent être évaluées à la meilleure estimation de la dépense nécessaire à l'extinction de l'obligation.",
      ecritures: [
        {
          numero: 1,
          description: 'Constitution d\'une provision pour litige de 5 000 000 FCFA suite à un contentieux avec un ancien salarié',
          lignes: [
            { sens: 'D', compte: '6591', libelleCompte: 'Charges de provisions d\'exploitation', montant: 5000000 },
            { sens: 'C', compte: '151', libelleCompte: 'Provisions pour risques', montant: 5000000, commentaire: 'Litige prud\'homal en cours' },
          ],
        },
      ],
    },
    {
      titre: 'Ajustement',
      contenu:
        "À chaque clôture, les provisions existantes sont réexaminées et ajustées pour refléter la meilleure estimation actuelle. " +
        "Si le risque augmente, un complément de provision est constitué. Si le risque diminue sans disparaître, une reprise partielle est effectuée. " +
        "L'ajustement peut aussi résulter de l'actualisation de la provision pour les obligations à long terme.",
    },
    {
      titre: 'Reprise (risque réalisé/non réalisé)',
      contenu:
        "La reprise de la provision intervient lorsque le risque se réalise (la charge effective est comptabilisée par nature) ou lorsque le risque disparaît. " +
        "Dans les deux cas, le compte 15 est débité par le crédit du compte 791 « Reprises de provisions d'exploitation » ou 797 « Reprises de provisions financières ». " +
        "La reprise et la charge effective sont enregistrées séparément afin de ne pas compenser les écritures.",
      ecritures: [
        {
          numero: 2,
          description: 'Reprise de provision pour litige suite au jugement : condamnation effective de 4 500 000 FCFA',
          lignes: [
            { sens: 'D', compte: '151', libelleCompte: 'Provisions pour risques', montant: 5000000, commentaire: 'Reprise intégrale' },
            { sens: 'C', compte: '7591', libelleCompte: 'Reprises de charges de provisions d\'exploitation', montant: 5000000 },
            { sens: 'D', compte: '831', libelleCompte: 'Charges HAO', montant: 4500000, commentaire: 'Indemnité versée suite au jugement' },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 4500000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['15', '151', '155', '691', '791'],
}
