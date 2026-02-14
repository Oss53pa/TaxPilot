import type { ChapitreOperations } from '../types'

export const CHAPITRE_23: ChapitreOperations = {
  numero: 23,
  titre: 'Opérations en devises',
  sections: [
    {
      titre: 'Enregistrement initial en devises',
      contenu:
        "Les transactions libellées en monnaie étrangère sont converties en monnaie de comptabilisation (FCFA ou autre) au cours de change à la date de l'opération. " +
        "Les achats et ventes en devises sont enregistrés au cours du jour de la facture. Les dettes et créances en devises sont initialement comptabilisées au cours du jour de la transaction. " +
        "Le SYSCOHADA Révisé admet l'utilisation d'un cours moyen de la période si les fluctuations ne sont pas significatives.",
      ecritures: [
        {
          numero: 1,
          description: 'Achat de marchandises à un fournisseur étranger pour 10 000 USD au cours de 600 FCFA/USD',
          lignes: [
            { sens: 'D', compte: '601', libelleCompte: 'Achats de marchandises', montant: 6000000 },
            { sens: 'C', compte: '401', libelleCompte: 'Fournisseurs', montant: 6000000, commentaire: '10 000 USD x 600' },
          ],
        },
      ],
    },
    {
      titre: 'Écarts de conversion',
      contenu:
        "À la date de clôture, les créances et dettes en devises sont évaluées au cours de clôture. Les différences par rapport au cours d'enregistrement initial constituent des écarts de conversion. " +
        "Les écarts de conversion actif (pertes latentes) sont inscrits au débit du compte 478 « Écarts de conversion actif » et donnent lieu à une provision pour risques de change. " +
        "Les écarts de conversion passif (gains latents) sont inscrits au crédit du compte 479 « Écarts de conversion passif ».",
      ecritures: [
        {
          numero: 2,
          description: 'Écart de conversion à la clôture : dette fournisseur USD revalorisée, perte latente de 200 000 FCFA',
          lignes: [
            { sens: 'D', compte: '478', libelleCompte: 'Écarts de conversion actif', montant: 200000, commentaire: 'Perte latente de change' },
            { sens: 'C', compte: '401', libelleCompte: 'Fournisseurs', montant: 200000, commentaire: 'Augmentation de la dette en FCFA' },
            { sens: 'D', compte: '6591', libelleCompte: 'Charges de provisions financières', montant: 200000, commentaire: 'Provision pour risque de change' },
            { sens: 'C', compte: '155', libelleCompte: 'Provisions pour risques de change', montant: 200000 },
          ],
        },
      ],
    },
    {
      titre: 'Gains et pertes de change',
      contenu:
        "Les gains de change réalisés lors du règlement d'opérations en devises sont enregistrés au crédit du compte 776 « Gains de change ». " +
        "Les pertes de change réalisées sont comptabilisées au débit du compte 676 « Pertes de change ». " +
        "À l'ouverture de l'exercice suivant, les écarts de conversion sont contre-passés et les provisions pour risque de change sont reprises.",
    },
  ],
  comptesLies: ['476', '478', '479', '676', '776'],
}
