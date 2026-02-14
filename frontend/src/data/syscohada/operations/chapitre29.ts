import type { ChapitreOperations } from '../types'

export const CHAPITRE_29: ChapitreOperations = {
  numero: 29,
  titre: 'Opérations HAO',
  sections: [
    {
      titre: 'Charges HAO',
      contenu:
        "Les charges HAO (Hors Activités Ordinaires) regroupent les charges ne relevant pas de l'activité courante de l'entreprise et présentant un caractère extraordinaire ou non récurrent. " +
        "Elles sont enregistrées au compte 83 « Charges HAO » et comprennent notamment les pénalités sur marchés, les dons extraordinaires, les créances devenues irrécouvrables de manière exceptionnelle et les pertes sur calamités. " +
        "Le SYSCOHADA Révisé a réduit le périmètre des opérations HAO pour se rapprocher des normes IFRS.",
      ecritures: [
        {
          numero: 1,
          description: 'Pénalité de 3 000 000 FCFA sur un marché public pour retard de livraison',
          lignes: [
            { sens: 'D', compte: '831', libelleCompte: 'Charges HAO', montant: 3000000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 3000000 },
          ],
        },
      ],
    },
    {
      titre: 'Produits HAO',
      contenu:
        "Les produits HAO sont enregistrés au compte 84 « Produits HAO » et correspondent à des produits non liés à l'activité ordinaire. " +
        "Ils comprennent les indemnités d'assurance perçues suite à des sinistres, les dédits reçus sur marchés, et les subventions d'équilibre exceptionnelles. " +
        "Les plus-values de cession d'immobilisations ne sont plus classées en HAO dans le SYSCOHADA Révisé mais dans les comptes 82.",
    },
    {
      titre: 'Dotations et reprises HAO',
      contenu:
        "Les dotations aux amortissements et provisions à caractère HAO sont enregistrées au compte 85 « Dotations HAO ». Les reprises correspondantes figurent au compte 86 « Reprises HAO ». " +
        "Ces écritures concernent principalement les provisions pour restructuration, les dépréciations exceptionnelles résultant de catastrophes naturelles et les provisions pour amendes et pénalités significatives. " +
        "Le résultat HAO constitue une composante distincte du résultat net dans le compte de résultat SYSCOHADA.",
      ecritures: [
        {
          numero: 2,
          description: 'Dotation HAO pour provision pour restructuration de 10 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '854', libelleCompte: 'Dotations aux provisions pour risques et charges HAO', montant: 10000000 },
            { sens: 'C', compte: '155', libelleCompte: 'Provisions pour risques', montant: 10000000, commentaire: 'Restructuration prévue' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['83', '84', '85', '86', '48'],
}
