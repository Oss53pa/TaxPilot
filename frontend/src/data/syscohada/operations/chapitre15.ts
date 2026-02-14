import type { ChapitreOperations } from '../types'

export const CHAPITRE_15: ChapitreOperations = {
  numero: 15,
  titre: 'Stocks : entrées',
  sections: [
    {
      titre: 'Achats de marchandises',
      contenu:
        "Les achats de marchandises sont enregistrés au débit du compte 601 « Achats de marchandises » pour le montant hors taxes récupérables. " +
        "Les frais de transport, manutention et assurance sur achats sont comptabilisés au compte 611 « Transports sur achats » ou incorporés au coût d'achat. " +
        "Les rabais, remises et ristournes obtenus figurent au crédit du compte 6019 « Rabais, remises et ristournes obtenus sur achats ».",
      ecritures: [
        {
          numero: 1,
          description: 'Achat de marchandises pour 7 500 000 FCFA HT, TVA 18%, frais de transport 250 000 FCFA',
          lignes: [
            { sens: 'D', compte: '601', libelleCompte: 'Achats de marchandises', montant: 7500000 },
            { sens: 'D', compte: '611', libelleCompte: 'Transports sur achats', montant: 250000 },
            { sens: 'D', compte: '4452', libelleCompte: 'TVA récupérable sur achats', montant: 1350000 },
            { sens: 'C', compte: '401', libelleCompte: 'Fournisseurs', montant: 9100000 },
          ],
        },
      ],
    },
    {
      titre: 'Achats de matières premières',
      contenu:
        "Les achats de matières premières et fournitures liées sont comptabilisés au débit du compte 602 « Achats de matières premières et fournitures liées ». " +
        "Le coût d'entrée en stock comprend le prix d'achat, les droits de douane, les taxes non récupérables et les frais de transport et de manutention directement attribuables. " +
        "En inventaire permanent, les entrées en stock sont enregistrées au débit du compte 32 par le crédit du compte 6032.",
    },
    {
      titre: 'Production stockée',
      contenu:
        "Les produits fabriqués par l'entreprise et mis en stock sont évalués à leur coût de production, comprenant les charges directes et une quote-part de charges indirectes de production. " +
        "En inventaire permanent, le compte 33 « Autres approvisionnements » ou 36 « Produits finis » est débité par le crédit du compte 73 « Variations de stocks de produits fabriqués ». " +
        "Les en-cours de production sont stockés au compte 34 « Produits en cours ».",
    },
  ],
  comptesLies: ['31', '32', '33', '36', '60', '61'],
}
