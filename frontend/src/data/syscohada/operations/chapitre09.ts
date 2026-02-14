import type { ChapitreOperations } from '../types'

export const CHAPITRE_09: ChapitreOperations = {
  numero: 9,
  titre: "Acquisitions d'immobilisations incorporelles",
  sections: [
    {
      titre: 'Acquisition',
      contenu:
        "Les immobilisations incorporelles acquises à titre onéreux sont comptabilisées à leur coût d'acquisition, qui comprend le prix d'achat et les frais accessoires directement attribuables. " +
        "Le compte 21 correspondant (211 à 215) est débité par le crédit du compte 404 « Fournisseurs d'investissement » ou d'un compte de trésorerie. " +
        "Les brevets, licences, marques et droits similaires sont inscrits au compte 212 ou 213 selon leur nature.",
      ecritures: [
        {
          numero: 1,
          description: 'Acquisition d\'un brevet industriel pour 8 000 000 FCFA, payé par banque',
          lignes: [
            { sens: 'D', compte: '212', libelleCompte: 'Brevets, licences, concessions et droits similaires', montant: 8000000 },
            { sens: 'C', compte: '521', libelleCompte: 'Banques locales', montant: 8000000 },
          ],
        },
      ],
    },
    {
      titre: 'Frais de développement immobilisés',
      contenu:
        "Les frais de développement peuvent être immobilisés au compte 211 « Frais de recherche et de développement » lorsque les conditions de l'Acte Uniforme sont réunies : " +
        "faisabilité technique démontrée, intention d'achever le projet, capacité à utiliser ou vendre, génération probable d'avantages économiques futurs, et évaluation fiable des coûts. " +
        "Les frais de recherche fondamentale et appliquée restent obligatoirement en charges de l'exercice.",
    },
    {
      titre: 'Logiciels acquis vs créés',
      contenu:
        "Les logiciels acquis sont immobilisés au compte 213 « Logiciels et sites internet » à leur coût d'acquisition. " +
        "Les logiciels créés en interne sont immobilisés au même compte pour les phases de programmation et de tests, tandis que les phases d'analyse préalable et de maintenance restent en charges. " +
        "L'amortissement des logiciels se fait généralement sur une durée de 3 à 5 ans en linéaire.",
      ecritures: [
        {
          numero: 2,
          description: 'Immobilisation d\'un logiciel de gestion créé en interne pour un coût de production de 12 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '213', libelleCompte: 'Logiciels et sites internet', montant: 12000000 },
            { sens: 'C', compte: '72', libelleCompte: 'Production immobilisée', montant: 12000000, commentaire: 'Coûts de développement activés' },
          ],
        },
      ],
    },
  ],
  comptesLies: ['21', '211', '212', '213', '215', '404'],
}
