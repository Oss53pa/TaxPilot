import type { ChapitreOperations } from '../types'

export const CHAPITRE_34: ChapitreOperations = {
  numero: 34,
  titre: 'Concessions de service public',
  sections: [
    {
      titre: 'Biens mis en concession',
      contenu:
        "Les biens mis en concession de service public sont des immobilisations mises à la disposition du concessionnaire par l'autorité concédante pour l'exploitation du service public. " +
        "Le concessionnaire inscrit ces biens à l'actif de son bilan au compte 22 « Terrains » ou 237 « Bâtiments, installations en concession » selon leur nature, avec en contrepartie un passif au compte des droits du concédant. " +
        "Les biens financés par le concessionnaire (biens de retour) doivent être renouvelés et restitués en fin de concession.",
      ecritures: [
        {
          numero: 1,
          description: "Inscription à l'actif de biens de retour en concession pour 50 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '237', libelleCompte: 'Bâtiments, installations techniques en concession', montant: 50000000 },
            { sens: 'C', compte: '131', libelleCompte: 'Subventions d\'équipement', montant: 50000000, commentaire: 'Droits du concédant' },
          ],
        },
      ],
    },
    {
      titre: 'Renouvellement',
      contenu:
        "Le concessionnaire a l'obligation de maintenir les installations en bon état de fonctionnement et de procéder à leur renouvellement si nécessaire. " +
        "Les dépenses de renouvellement sont immobilisées si elles augmentent la valeur ou la durée de vie des biens, ou comptabilisées en charges d'entretien dans le cas contraire. " +
        "Une provision pour renouvellement peut être constituée afin de répartir la charge sur la durée de la concession.",
    },
    {
      titre: 'Fin de concession',
      contenu:
        "À l'expiration de la concession, les biens de retour sont restitués gratuitement à l'autorité concédante. Le concessionnaire procède à la sortie des biens de son actif. " +
        "Les biens de reprise (biens propres du concessionnaire) peuvent être rachetés par le concédant à une valeur convenue. " +
        "Le compte 826 « Reprises sur provisions pour renouvellement » est crédité pour solder les provisions de renouvellement restantes.",
      ecritures: [
        {
          numero: 2,
          description: 'Sortie de l\'actif des biens de retour en fin de concession : VNC 5 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '131', libelleCompte: 'Subventions d\'équipement', montant: 50000000, commentaire: 'Solde des droits du concédant' },
            { sens: 'D', compte: '2837', libelleCompte: 'Amortissements des installations en concession', montant: 45000000 },
            { sens: 'C', compte: '237', libelleCompte: 'Bâtiments, installations techniques en concession', montant: 50000000 },
            { sens: 'C', compte: '865', libelleCompte: 'Reprises de subventions d\'investissement', montant: 45000000, commentaire: 'Reprise des amortissements' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['22', '237', '826'],
}
