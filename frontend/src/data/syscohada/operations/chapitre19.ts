import type { ChapitreOperations } from '../types'

export const CHAPITRE_19: ChapitreOperations = {
  numero: 19,
  titre: 'Opérations avec les fournisseurs',
  sections: [
    {
      titre: 'Comptabilisation des factures',
      contenu:
        "Les factures fournisseurs sont enregistrées au crédit du compte 401 « Fournisseurs » par le débit des comptes de charges ou d'immobilisations correspondants. " +
        "L'enregistrement intervient à la date de réception de la facture ou, à défaut, à la date de livraison des biens ou d'exécution des services. " +
        "Les avoirs reçus des fournisseurs (retours, remises) sont enregistrés au débit du compte 401 par le crédit du compte d'achat ou du compte 609.",
      ecritures: [
        {
          numero: 1,
          description: 'Réception et comptabilisation d\'une facture fournisseur de 3 000 000 FCFA HT, TVA 18%',
          lignes: [
            { sens: 'D', compte: '601', libelleCompte: 'Achats de marchandises', montant: 3000000 },
            { sens: 'D', compte: '4452', libelleCompte: 'TVA récupérable sur achats', montant: 540000 },
            { sens: 'C', compte: '401', libelleCompte: 'Fournisseurs', montant: 3540000 },
          ],
        },
      ],
    },
    {
      titre: 'Effets à payer',
      contenu:
        "Lorsque le règlement d'un fournisseur est matérialisé par un effet de commerce (lettre de change, billet à ordre), la dette est transférée du compte 401 au compte 402 « Fournisseurs, effets à payer ». " +
        "L'effet est comptabilisé à son nominal. À l'échéance, le compte 402 est débité par le crédit du compte de trésorerie. " +
        "Les intérêts éventuels liés à l'effet sont comptabilisés en charges financières.",
    },
    {
      titre: 'Avances et acomptes',
      contenu:
        "Les avances et acomptes versés aux fournisseurs sur commandes en cours sont enregistrés au débit du compte 409 « Fournisseurs débiteurs » par le crédit du compte de trésorerie. " +
        "Lors de la réception de la facture définitive, le compte 409 est soldé par transfert au crédit du compte 401. " +
        "Les avances sur immobilisations sont enregistrées distinctement au compte 251.",
    },
    {
      titre: 'Factures non parvenues',
      contenu:
        "Les factures non parvenues correspondent à des livraisons reçues avant la clôture pour lesquelles la facture n'a pas encore été établie. " +
        "Le compte 408 « Fournisseurs, factures non parvenues » est crédité par le débit des comptes de charges TTC estimées. " +
        "Ces écritures de régularisation sont contre-passées à l'ouverture de l'exercice suivant.",
      ecritures: [
        {
          numero: 2,
          description: 'Facture non parvenue pour marchandises livrées en décembre : estimation 1 800 000 FCFA TTC',
          lignes: [
            { sens: 'D', compte: '601', libelleCompte: 'Achats de marchandises', montant: 1525424, commentaire: 'Montant HT estimé' },
            { sens: 'D', compte: '4452', libelleCompte: 'TVA récupérable sur achats', montant: 274576 },
            { sens: 'C', compte: '408', libelleCompte: 'Fournisseurs, factures non parvenues', montant: 1800000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['40', '401', '402', '408', '409'],
}
