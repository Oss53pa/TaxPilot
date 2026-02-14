import type { ChapitreOperations } from '../types'

export const CHAPITRE_33: ChapitreOperations = {
  numero: 33,
  titre: 'Contrats à long terme',
  sections: [
    {
      titre: "Méthode à l'achèvement",
      contenu:
        "Selon la méthode à l'achèvement, le résultat n'est comptabilisé qu'à la livraison définitive du bien ou à l'achèvement de la prestation. " +
        "Pendant l'exécution du contrat, les charges sont enregistrées normalement en comptabilité et les travaux en cours sont stockés au compte 34 « Produits en cours ». " +
        "À l'achèvement, les en-cours sont annulés et le chiffre d'affaires total est comptabilisé au compte 71 « Production stockée (ou déstockage) ».",
      ecritures: [
        {
          numero: 1,
          description: "Contrat à long terme (méthode à l'achèvement) : stockage des en-cours de production de 8 000 000 FCFA en fin d'année 1",
          lignes: [
            { sens: 'D', compte: '342', libelleCompte: 'Travaux en cours', montant: 8000000 },
            { sens: 'C', compte: '71', libelleCompte: 'Production stockée', montant: 8000000, commentaire: "Stockage des en-cours" },
          ],
        },
      ],
    },
    {
      titre: "Méthode à l'avancement",
      contenu:
        "La méthode à l'avancement (méthode préférentielle du SYSCOHADA Révisé) consiste à comptabiliser le chiffre d'affaires et le résultat au fur et à mesure de l'avancement des travaux. " +
        "Le pourcentage d'avancement peut être déterminé par le rapport des coûts engagés sur les coûts totaux estimés, ou par des mesures physiques d'avancement. " +
        "Le compte 418 « Clients, produits à recevoir » est débité par le crédit du compte de produit pour la fraction du chiffre d'affaires acquise.",
      ecritures: [
        {
          numero: 2,
          description: "Contrat de 30 000 000 FCFA avancé à 40% : comptabilisation du CA partiel de 12 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '418', libelleCompte: 'Clients, produits à recevoir', montant: 12000000, commentaire: '40% de 30M' },
            { sens: 'C', compte: '706', libelleCompte: 'Services vendus', montant: 12000000, commentaire: 'CA à l\'avancement' },
          ],
        },
      ],
    },
    {
      titre: 'Provision pour perte à terminaison',
      contenu:
        "Lorsque le résultat prévisionnel global du contrat est déficitaire, une provision pour perte à terminaison doit être constituée immédiatement, quelle que soit la méthode retenue (achèvement ou avancement). " +
        "Le montant de la provision correspond à la perte totale prévisionnelle diminuée, le cas échéant, de la perte déjà constatée par la méthode à l'avancement. " +
        "La provision est constituée au débit du compte 6591 par le crédit du compte 159 « Provisions pour charges à répartir ».",
    },
  ],
  comptesLies: ['34', '342', '418', '71'],
}
