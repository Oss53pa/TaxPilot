import type { ChapitreOperations } from '../types'

export const CHAPITRE_41: ChapitreOperations = {
  numero: 41,
  titre: 'Tableau des flux de trésorerie (TFT)',
  sections: [
    {
      titre: 'Flux liés aux activités opérationnelles',
      contenu:
        "Les flux de trésorerie liés aux activités opérationnelles représentent les encaissements et décaissements générés par les opérations courantes de l'entreprise. " +
        "Le SYSCOHADA Révisé propose la méthode indirecte, partant du résultat net et ajustant pour les éléments sans incidence sur la trésorerie (amortissements, provisions, plus ou moins-values de cession). " +
        "La variation du besoin en fonds de roulement (stocks, créances, dettes d'exploitation) est ajoutée pour obtenir la trésorerie nette générée par les activités opérationnelles.",
      ecritures: [
        {
          numero: 1,
          description: 'Illustration de la capacité d\'autofinancement : résultat net 10 500 000 FCFA, dotations aux amortissements 3 000 000 FCFA, reprise de provisions 500 000 FCFA',
          lignes: [
            { sens: 'D', compte: '12', libelleCompte: 'Résultat de l\'exercice', montant: 10500000, commentaire: 'Bénéfice net' },
            { sens: 'D', compte: '68', libelleCompte: 'Dotations aux amortissements', montant: 3000000, commentaire: 'Charge non décaissée' },
            { sens: 'C', compte: '79', libelleCompte: 'Reprises de provisions', montant: 500000, commentaire: 'Produit non encaissé' },
            { sens: 'C', compte: '57', libelleCompte: 'Caisse / Trésorerie', montant: 13000000, commentaire: 'CAF = 10,5M + 3M - 0,5M' },
          ],
        },
      ],
    },
    {
      titre: "Flux d'investissement",
      contenu:
        "Les flux d'investissement comprennent les décaissements liés à l'acquisition d'immobilisations corporelles, incorporelles et financières, ainsi que les encaissements provenant de leur cession. " +
        "Les prêts accordés et les remboursements reçus, les acquisitions et cessions de titres de participation font partie de cette catégorie. " +
        "Un flux d'investissement net négatif traduit un effort d'investissement de l'entreprise, signe généralement positif de développement.",
    },
    {
      titre: 'Flux de financement',
      contenu:
        "Les flux de financement regroupent les opérations ayant une incidence sur la structure financière de l'entreprise : augmentations de capital en numéraire, emprunts contractés et remboursés, dividendes versés. " +
        "Les remboursements de dettes de location-acquisition sont inclus dans les flux de financement. " +
        "La variation nette de trésorerie de l'exercice est la somme des trois catégories de flux et doit correspondre à la variation du solde des comptes 52 et 57 entre le début et la fin de l'exercice.",
      ecritures: [
        {
          numero: 2,
          description: 'Vérification de la variation de trésorerie : solde banque et caisse au 01/01 de 8 000 000 et au 31/12 de 12 500 000 FCFA',
          lignes: [
            { sens: 'D', compte: '52', libelleCompte: 'Banques', montant: 12500000, commentaire: 'Solde de clôture' },
            { sens: 'D', compte: '57', libelleCompte: 'Caisse', montant: 0, commentaire: 'Intégré dans le solde banques' },
            { sens: 'C', compte: '52', libelleCompte: 'Banques', montant: 8000000, commentaire: 'Solde d\'ouverture' },
            { sens: 'C', compte: '57', libelleCompte: 'Caisse', montant: 0, commentaire: 'Variation nette = +4 500 000' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['52', '57', '12', '68', '28'],
}
