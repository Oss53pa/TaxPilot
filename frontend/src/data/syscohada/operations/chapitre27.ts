import type { ChapitreOperations } from '../types'

export const CHAPITRE_27: ChapitreOperations = {
  numero: 27,
  titre: 'Provisions pour dépréciation des créances',
  sections: [
    {
      titre: 'Identification des créances douteuses',
      contenu:
        "Une créance est qualifiée de douteuse lorsque son recouvrement devient incertain en raison de la situation financière du débiteur, d'un retard de paiement significatif ou d'un litige en cours. " +
        "Les créances douteuses sont transférées du compte 411 « Clients » au compte 416 « Clients douteux ou litigieux » pour leur montant TTC. " +
        "L'identification des créances douteuses nécessite une revue systématique de la balance âgée des clients et des contentieux en cours à chaque clôture.",
      ecritures: [
        {
          numero: 1,
          description: 'Reclassement en créance douteuse d\'un client pour 3 540 000 FCFA TTC (3 000 000 HT + TVA 18%)',
          lignes: [
            { sens: 'D', compte: '416', libelleCompte: 'Clients douteux ou litigieux', montant: 3540000 },
            { sens: 'C', compte: '411', libelleCompte: 'Clients', montant: 3540000 },
          ],
        },
      ],
    },
    {
      titre: 'Constitution',
      contenu:
        "La dépréciation est calculée sur le montant hors taxes de la créance, car la TVA reste récupérable en cas d'irrécouvrabilité définitive. " +
        "Le compte 6594 « Charges de provisions pour dépréciation des créances » est débité par le crédit du compte 491 « Dépréciations des comptes clients ». " +
        "Le pourcentage de dépréciation est estimé en fonction de la probabilité de perte, tenant compte des garanties détenues et de la situation du débiteur.",
      ecritures: [
        {
          numero: 2,
          description: 'Dépréciation à 60% de la créance douteuse HT de 3 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '6594', libelleCompte: 'Charges de provisions pour dépréciation des créances', montant: 1800000, commentaire: '60% de 3 000 000 HT' },
            { sens: 'C', compte: '491', libelleCompte: 'Dépréciations des comptes clients', montant: 1800000 },
          ],
        },
      ],
    },
    {
      titre: 'Ajustement et reprise',
      contenu:
        "À chaque clôture, les dépréciations existantes sont réajustées. Si le risque augmente, un complément de dotation est enregistré. Si le risque diminue, une reprise partielle est effectuée. " +
        "Le compte 7594 « Reprises de charges de provisions pour dépréciation des créances » est crédité lors de la reprise. " +
        "Lorsque la créance est définitivement irrécouvrable, elle est passée en perte (compte 651) et la dépréciation antérieure est intégralement reprise.",
    },
  ],
  comptesLies: ['49', '491', '659', '759'],
}
