import type { ChapitreOperations } from '../types'

export const CHAPITRE_24: ChapitreOperations = {
  numero: 24,
  titre: 'Opérations de trésorerie',
  sections: [
    {
      titre: 'Encaissements et décaissements',
      contenu:
        "Les opérations de trésorerie sont enregistrées dans les comptes de la classe 5. Les encaissements par banque sont portés au débit du compte 521 « Banques locales » et les décaissements au crédit. " +
        "Les chèques émis non encore présentés et les chèques reçus non encore encaissés sont suivis respectivement dans les comptes 513 et 514. " +
        "Les virements de fonds entre comptes bancaires ou entre banque et caisse transitent par le compte 585 « Virements de fonds ».",
      ecritures: [
        {
          numero: 1,
          description: 'Virement de fonds de la banque vers la caisse pour 500 000 FCFA',
          lignes: [
            { sens: 'D', compte: '585', libelleCompte: 'Virements de fonds', montant: 500000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 500000 },
            { sens: 'D', compte: '571', libelleCompte: 'Caisse', montant: 500000 },
            { sens: 'C', compte: '585', libelleCompte: 'Virements de fonds', montant: 500000 },
          ],
        },
      ],
    },
    {
      titre: 'Rapprochement bancaire',
      contenu:
        "Le rapprochement bancaire permet de vérifier la concordance entre le solde du compte 521 en comptabilité et le solde du relevé bancaire. " +
        "Les écarts proviennent des opérations enregistrées en comptabilité mais pas encore par la banque (chèques émis non présentés, remises non créditées) et inversement (frais bancaires, agios, virements reçus non encore comptabilisés). " +
        "Les écritures de régularisation doivent être passées pour toutes les opérations figurant sur le relevé bancaire mais non encore comptabilisées.",
    },
    {
      titre: 'Caisse',
      contenu:
        "Le compte 571 « Caisse » enregistre les mouvements d'espèces. Il est débité des encaissements et crédité des décaissements en numéraire. " +
        "Le solde du compte caisse doit toujours être débiteur ou nul ; un solde créditeur est une anomalie révélant une erreur comptable. " +
        "Un inventaire physique de la caisse doit être réalisé régulièrement et en fin d'exercice, les écarts éventuels étant régularisés.",
      ecritures: [
        {
          numero: 2,
          description: 'Régularisation d\'un excédent de caisse de 15 000 FCFA constaté lors de l\'inventaire',
          lignes: [
            { sens: 'D', compte: '571', libelleCompte: 'Caisse', montant: 15000 },
            { sens: 'C', compte: '758', libelleCompte: 'Produits divers', montant: 15000, commentaire: 'Excédent de caisse' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['52', '53', '57', '58', '51'],
}
