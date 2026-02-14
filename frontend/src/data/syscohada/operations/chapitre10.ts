import type { ChapitreOperations } from '../types'

export const CHAPITRE_10: ChapitreOperations = {
  numero: 10,
  titre: "Acquisitions d'immobilisations corporelles",
  sections: [
    {
      titre: 'Acquisition au comptant',
      contenu:
        "Les immobilisations corporelles acquises au comptant sont enregistrées à leur coût d'acquisition, comprenant le prix d'achat hors taxes récupérables, les droits de douane, les frais de transport et d'installation, et tout coût directement attribuable à la mise en service. " +
        "Le compte d'immobilisation concerné (22, 23 ou 24) est débité par le crédit du compte de trésorerie. " +
        "La TVA non récupérable fait partie du coût d'acquisition.",
      ecritures: [
        {
          numero: 1,
          description: 'Acquisition d\'un matériel industriel pour 15 000 000 FCFA HT, TVA 18% récupérable, payé par chèque',
          lignes: [
            { sens: 'D', compte: '241', libelleCompte: 'Matériel et outillage industriel et commercial', montant: 15000000 },
            { sens: 'D', compte: '4451', libelleCompte: 'TVA récupérable sur immobilisations', montant: 2700000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 17700000 },
          ],
        },
      ],
    },
    {
      titre: 'Acquisition à crédit',
      contenu:
        "Lorsqu'une immobilisation est acquise à crédit, le compte 404 « Fournisseurs d'investissement » est crédité à la place du compte de trésorerie. " +
        "Si le paiement est échelonné sur plus de 12 mois, les intérêts intercalaires ne sont pas inclus dans le coût d'acquisition mais sont comptabilisés en charges financières. " +
        "Les avances versées sur commandes d'immobilisations sont enregistrées au compte 251 « Avances et acomptes versés sur immobilisations ».",
    },
    {
      titre: "Immobilisation produite par l'entreprise",
      contenu:
        "Les immobilisations produites par l'entreprise pour elle-même sont évaluées à leur coût de production, incluant les charges directes et une quote-part raisonnable de charges indirectes. " +
        "Le compte d'immobilisation est débité par le crédit du compte 72 « Production immobilisée ». " +
        "Les immobilisations en cours de production sont temporairement enregistrées au compte 23 « Bâtiments, installations techniques et agencements en cours » ou dans la subdivision appropriée.",
      ecritures: [
        {
          numero: 2,
          description: 'Construction d\'un entrepôt en interne : coût de production 45 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '231', libelleCompte: 'Bâtiments', montant: 45000000 },
            { sens: 'C', compte: '72', libelleCompte: 'Production immobilisée', montant: 45000000 },
          ],
        },
      ],
    },
  ],
  comptesLies: ['22', '23', '24', '404', '481'],
}
