import type { ChapitreOperations } from '../types'

export const CHAPITRE_17: ChapitreOperations = {
  numero: 17,
  titre: 'Dépréciation des stocks',
  sections: [
    {
      titre: 'Constitution',
      contenu:
        "Une dépréciation des stocks est constatée lorsque la valeur actuelle (valeur nette de réalisation) est inférieure au coût d'entrée. " +
        "Le compte 659 « Charges de provisions » est débité par le crédit du compte 39 « Dépréciations des stocks » (391 pour marchandises, 392 pour matières, etc.). " +
        "La dépréciation est évaluée article par article ou par catégories homogènes, en tenant compte des coûts d'achèvement et de commercialisation.",
      ecritures: [
        {
          numero: 1,
          description: 'Constitution d\'une dépréciation de stocks de marchandises obsolètes de 2 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '6593', libelleCompte: 'Charges de provisions pour dépréciation des stocks', montant: 2000000 },
            { sens: 'C', compte: '391', libelleCompte: 'Dépréciations des stocks de marchandises', montant: 2000000 },
          ],
        },
      ],
    },
    {
      titre: 'Ajustement',
      contenu:
        "À chaque clôture, les dépréciations existantes sont réexaminées et ajustées. Si la perte de valeur s'est accentuée, un complément de dotation est enregistré. " +
        "Si la valeur du stock s'est partiellement rétablie, une reprise partielle est effectuée au crédit du compte 759. " +
        "L'ajustement se fait en comparant la dépréciation nécessaire à l'exercice N avec celle existant à l'exercice N-1.",
    },
    {
      titre: 'Reprise',
      contenu:
        "La reprise de la dépréciation intervient lorsque les conditions ayant justifié la dépréciation disparaissent (vente du stock, remontée des cours, etc.). " +
        "Le compte 39 est débité par le crédit du compte 759 « Reprises de charges de provisions ». " +
        "En inventaire intermittent, les dépréciations de l'exercice précédent sont intégralement reprises et de nouvelles dépréciations sont constituées sur la base du stock final.",
      ecritures: [
        {
          numero: 2,
          description: 'Reprise de la dépréciation de stocks suite à la vente des marchandises dépréciées',
          lignes: [
            { sens: 'D', compte: '391', libelleCompte: 'Dépréciations des stocks de marchandises', montant: 2000000 },
            { sens: 'C', compte: '7593', libelleCompte: 'Reprises de charges de provisions pour dépréciation des stocks', montant: 2000000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['39', '659', '759'],
}
