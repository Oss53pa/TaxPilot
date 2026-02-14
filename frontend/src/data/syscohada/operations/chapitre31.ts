import type { ChapitreOperations } from '../types'

export const CHAPITRE_31: ChapitreOperations = {
  numero: 31,
  titre: 'Opérations de consolidation',
  sections: [
    {
      titre: 'Périmètre de consolidation',
      contenu:
        "Le périmètre de consolidation comprend la société mère et toutes les entités qu'elle contrôle directement ou indirectement (filiales), sur lesquelles elle exerce une influence notable (entreprises associées) ou un contrôle conjoint (coentreprises). " +
        "Le contrôle exclusif est présumé lorsque la société mère détient directement ou indirectement plus de 50% des droits de vote. L'influence notable est présumée au-delà de 20%. " +
        "Le SYSCOHADA Révisé s'inspire largement des normes IFRS en matière de consolidation tout en conservant certaines spécificités.",
      ecritures: [
        {
          numero: 1,
          description: "Élimination de la participation de la société mère (80%) dans une filiale au capital de 50 000 000 FCFA avec écart d'acquisition de 5 000 000 FCFA",
          lignes: [
            { sens: 'D', compte: '101', libelleCompte: 'Capital social (filiale)', montant: 40000000, commentaire: '80% de 50M' },
            { sens: 'D', compte: '215', libelleCompte: "Fonds commercial (écart d'acquisition)", montant: 5000000 },
            { sens: 'C', compte: '261', libelleCompte: 'Titres de participation', montant: 45000000, commentaire: 'Coût d\'acquisition' },
          ],
        },
      ],
    },
    {
      titre: 'Méthodes (intégration globale, proportionnelle, mise en équivalence)',
      contenu:
        "L'intégration globale s'applique aux filiales sous contrôle exclusif : l'intégralité des actifs, passifs, charges et produits est reprise, avec constatation des intérêts minoritaires. " +
        "L'intégration proportionnelle s'applique aux entités sous contrôle conjoint : seule la quote-part correspondant aux droits de la société mère est intégrée. " +
        "La mise en équivalence s'applique aux entreprises associées : les titres sont remplacés par la quote-part dans les capitaux propres, l'écart étant traité dans le résultat consolidé.",
    },
  ],
  comptesLies: ['26', '261', '265', '466'],
}
