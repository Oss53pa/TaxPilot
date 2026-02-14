import type { ChapitreOperations } from '../types'

export const CHAPITRE_28: ChapitreOperations = {
  numero: 28,
  titre: 'Opérations inter-exercices',
  sections: [
    {
      titre: 'Charges à payer',
      contenu:
        "Les charges à payer sont des dettes certaines dans leur principe mais dont le montant exact ou l'échéance ne sont pas encore définitivement arrêtés à la date de clôture. " +
        "Elles sont enregistrées au crédit de comptes rattachés aux comptes de dettes (408, 428, 438, 448) par le débit des comptes de charges correspondants. " +
        "Les exemples courants incluent les factures fournisseurs non parvenues (408), les congés payés à payer (428), les charges sociales à payer (438) et les impôts à payer (448).",
      ecritures: [
        {
          numero: 1,
          description: 'Charges sociales à payer sur salaires de décembre : estimation 1 200 000 FCFA',
          lignes: [
            { sens: 'D', compte: '6641', libelleCompte: 'Charges sociales sur rémunérations', montant: 1200000 },
            { sens: 'C', compte: '438', libelleCompte: 'Organismes sociaux, charges à payer', montant: 1200000 },
          ],
        },
      ],
    },
    {
      titre: 'Produits à recevoir',
      contenu:
        "Les produits à recevoir sont des créances certaines dans leur principe et dont le montant peut être évalué avec une fiabilité suffisante, mais qui n'ont pas encore fait l'objet d'un encaissement ou d'une facturation à la date de clôture. " +
        "Le compte 418 « Clients, produits à recevoir » est débité par le crédit du compte de produit concerné. " +
        "Les intérêts courus non échus sur prêts et placements sont également rattachés via les comptes d'intérêts courus.",
      ecritures: [
        {
          numero: 2,
          description: 'Produit à recevoir : prestations réalisées en décembre non encore facturées, 800 000 FCFA HT, TVA 18%',
          lignes: [
            { sens: 'D', compte: '418', libelleCompte: 'Clients, produits à recevoir', montant: 944000 },
            { sens: 'C', compte: '706', libelleCompte: 'Services vendus', montant: 800000 },
            { sens: 'C', compte: '4431', libelleCompte: 'TVA facturée sur ventes', montant: 144000 },
          ],
        },
      ],
    },
    {
      titre: 'Cut-off',
      contenu:
        "Le cut-off (séparation des exercices) est le processus de rattachement des charges et produits à l'exercice auquel ils se rapportent, indépendamment de leur date de paiement ou d'encaissement. " +
        "Il comprend les charges constatées d'avance (476), les produits constatés d'avance (477), les charges à payer et les produits à recevoir. " +
        "La correcte application du cut-off est essentielle pour garantir une image fidèle de la situation financière et des résultats de l'entreprise.",
    },
  ],
  comptesLies: ['408', '418', '428', '438', '448', '476', '477'],
}
