import type { ChapitreOperations } from '../types'

export const CHAPITRE_18: ChapitreOperations = {
  numero: 18,
  titre: 'Achats et charges externes',
  sections: [
    {
      titre: 'Achats de marchandises et matières',
      contenu:
        "Les achats de biens sont comptabilisés au débit des comptes 601 (marchandises), 602 (matières premières), 604 (achats stockés de matières et fournitures consommables) ou 605 (autres achats). " +
        "L'enregistrement se fait à la date de transfert des risques et avantages, généralement à la livraison. " +
        "Les achats doivent être comptabilisés nets de remises commerciales, les escomptes de règlement étant enregistrés séparément au compte 773.",
      ecritures: [
        {
          numero: 1,
          description: 'Achat de fournitures de bureau pour 500 000 FCFA HT, TVA 18%, payé au comptant',
          lignes: [
            { sens: 'D', compte: '6055', libelleCompte: 'Fournitures de bureau et informatiques', montant: 500000 },
            { sens: 'D', compte: '4452', libelleCompte: 'TVA récupérable sur achats', montant: 90000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 590000 },
          ],
        },
      ],
    },
    {
      titre: 'Transports',
      contenu:
        "Les frais de transport sont comptabilisés selon leur nature : le compte 611 enregistre les transports sur achats, le compte 612 les transports sur ventes, et le compte 613 les transports pour le compte de tiers. " +
        "Lorsque le transport est assuré par l'entreprise elle-même, les charges correspondantes figurent dans les comptes par nature (carburant, salaires, amortissements). " +
        "Les ports facturés par les fournisseurs sont enregistrés distinctement ou inclus dans le coût des achats.",
    },
    {
      titre: 'Services extérieurs',
      contenu:
        "Les services extérieurs regroupent les charges des comptes 62 (services extérieurs) et 63 (autres services extérieurs). " +
        "Ils comprennent notamment les loyers (622), l'entretien et les réparations (624), les primes d'assurance (625), les études et recherches (631), la publicité (627) et les honoraires (632). " +
        "Ces charges sont comptabilisées à la date de la prestation ou de la facturation, avec régularisation en fin d'exercice pour les prestations reçues non encore facturées.",
      ecritures: [
        {
          numero: 2,
          description: 'Facturation de prestations d\'entretien pour 1 200 000 FCFA HT, TVA 18%',
          lignes: [
            { sens: 'D', compte: '6241', libelleCompte: 'Entretien et réparations des biens immobiliers', montant: 1200000 },
            { sens: 'D', compte: '4452', libelleCompte: 'TVA récupérable sur achats', montant: 216000 },
            { sens: 'C', compte: '401', libelleCompte: 'Fournisseurs', montant: 1416000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['60', '61', '62', '63'],
}
