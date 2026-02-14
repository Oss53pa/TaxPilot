import type { ChapitreOperations } from '../types'

export const CHAPITRE_13: ChapitreOperations = {
  numero: 13,
  titre: 'Location-acquisition et crédit-bail',
  sections: [
    {
      titre: "Inscription à l'actif",
      contenu:
        "Le SYSCOHADA Révisé impose la comptabilisation des contrats de location-acquisition (crédit-bail) à l'actif du preneur, conformément à la prééminence de la substance sur la forme. " +
        "Le bien est inscrit au débit du compte d'immobilisation concerné pour sa juste valeur ou la valeur actualisée des paiements minimaux (si inférieure), par le crédit du compte 17 « Dettes de location-acquisition ». " +
        "Cette inscription génère simultanément un actif amortissable et une dette financière.",
      ecritures: [
        {
          numero: 1,
          description: "Inscription à l'actif d'un matériel en crédit-bail : valeur 20 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '241', libelleCompte: 'Matériel et outillage industriel et commercial', montant: 20000000 },
            { sens: 'C', compte: '172', libelleCompte: 'Emprunts équivalents de crédit-bail immobilier', montant: 20000000 },
          ],
        },
      ],
    },
    {
      titre: 'Comptabilisation des redevances',
      contenu:
        "Chaque redevance de crédit-bail est décomposée en une part de remboursement du capital (qui diminue la dette au compte 17) et une part d'intérêts (comptabilisée au compte 672 « Intérêts dans loyers de location-acquisition »). " +
        "Le tableau de répartition est établi selon la méthode du taux d'intérêt effectif. " +
        "L'amortissement du bien est comptabilisé indépendamment des redevances, sur la durée d'utilité du bien.",
      ecritures: [
        {
          numero: 2,
          description: 'Paiement d\'une redevance trimestrielle de 1 800 000 FCFA dont 300 000 d\'intérêts',
          lignes: [
            { sens: 'D', compte: '172', libelleCompte: 'Emprunts équivalents de crédit-bail immobilier', montant: 1500000, commentaire: 'Part en capital' },
            { sens: 'D', compte: '672', libelleCompte: 'Intérêts dans loyers de location-acquisition', montant: 300000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 1800000 },
          ],
        },
      ],
    },
    {
      titre: "Levée d'option",
      contenu:
        "À la fin du contrat, le preneur peut lever l'option d'achat en versant le prix résiduel convenu. " +
        "Le solde restant de la dette de location-acquisition est apuré. Si le prix de levée diffère du solde de la dette, la différence est traitée en charge ou produit financier. " +
        "Après la levée d'option, le bien reste à l'actif et continue d'être amorti sur sa durée d'utilité restante.",
    },
  ],
  comptesLies: ['17', '172', '173', '623', '672'],
}
