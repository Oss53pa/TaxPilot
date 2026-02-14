import type { ChapitreOperations } from '../types'

export const CHAPITRE_35: ChapitreOperations = {
  numero: 35,
  titre: 'Opérations faites pour le compte de tiers',
  sections: [
    {
      titre: 'Mandats',
      contenu:
        "Lorsqu'une entreprise agit en qualité de mandataire pour le compte d'un tiers (mandant), les opérations réalisées pour le compte du mandant ne constituent ni des charges ni des produits pour le mandataire. " +
        "Les sommes reçues et décaissées pour le compte du mandant transitent par le compte 471 « Débiteurs divers et créditeurs divers ». " +
        "Seule la rémunération du mandataire (commission) constitue un produit enregistré au compte 706 « Services vendus » ou 7071 « Commissions et courtages ».",
      ecritures: [
        {
          numero: 1,
          description: "Encaissement de 10 000 000 FCFA pour le compte d'un mandant et versement après déduction d'une commission de 500 000 FCFA",
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 10000000 },
            { sens: 'C', compte: '471', libelleCompte: 'Débiteurs divers et créditeurs divers', montant: 10000000, commentaire: 'Fonds reçus pour le mandant' },
            { sens: 'D', compte: '471', libelleCompte: 'Débiteurs divers et créditeurs divers', montant: 10000000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 9500000, commentaire: 'Reversement au mandant' },
            { sens: 'C', compte: '7071', libelleCompte: 'Commissions et courtages', montant: 500000, commentaire: 'Commission du mandataire' },
          ],
        },
      ],
    },
    {
      titre: 'Commissions',
      contenu:
        "Les commissionnaires agissent en leur propre nom mais pour le compte d'un commettant. Contrairement au mandataire, le commissionnaire enregistre les achats et ventes dans ses comptes propres. " +
        "Le résultat de l'opération est ensuite partagé avec le commettant selon les termes du contrat de commission. " +
        "La commission perçue par le commissionnaire est comptabilisée en produit au compte 706 ou 7071.",
    },
    {
      titre: 'Opérations de transit',
      contenu:
        "Les transitaires en douane réalisent des opérations pour le compte de leurs clients (importateurs et exportateurs). Les droits de douane, taxes et frais avancés pour le compte des clients ne sont pas des charges du transitaire. " +
        "Ces avances sont enregistrées au débit du compte 471 en attente de remboursement par le client. " +
        "Les honoraires de transit constituent le seul produit du transitaire et sont facturés distinctement des débours récupérables.",
      ecritures: [
        {
          numero: 2,
          description: 'Avance de droits de douane de 2 000 000 FCFA pour un client et facturation des honoraires de transit de 300 000 FCFA',
          lignes: [
            { sens: 'D', compte: '471', libelleCompte: 'Débiteurs divers et créditeurs divers', montant: 2000000, commentaire: 'Droits de douane avancés' },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 2000000 },
            { sens: 'D', compte: '411', libelleCompte: 'Clients', montant: 2300000, commentaire: 'Débours + honoraires' },
            { sens: 'C', compte: '471', libelleCompte: 'Débiteurs divers et créditeurs divers', montant: 2000000, commentaire: 'Remboursement des débours' },
            { sens: 'C', compte: '706', libelleCompte: 'Services vendus', montant: 300000, commentaire: 'Honoraires de transit' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['47', '471'],
}
