import type { ChapitreOperations } from '../types'

export const CHAPITRE_40: ChapitreOperations = {
  numero: 40,
  titre: 'Comptabilité des associations et EBNL',
  sections: [
    {
      titre: 'Fonds associatifs',
      contenu:
        "Les entités à but non lucratif (EBNL) enregistrent les fonds permanents mis à leur disposition au compte 10 « Capital » ou plus précisément au compte 102 « Fonds associatifs » ou « Dotation ». " +
        "Ces fonds comprennent les apports permanents des fondateurs, les droits d'entrée des membres et les excédents affectés en fonds de réserve. " +
        "Le SYSCOHADA Révisé prévoit des dispositions spécifiques pour les EBNL, en adaptant la terminologie et les schémas d'écritures aux particularités de ces entités.",
      ecritures: [
        {
          numero: 1,
          description: 'Réception de la dotation initiale d\'une association : 5 000 000 FCFA',
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 5000000 },
            { sens: 'C', compte: '102', libelleCompte: 'Fonds associatifs', montant: 5000000, commentaire: 'Dotation initiale' },
          ],
        },
      ],
    },
    {
      titre: 'Subventions',
      contenu:
        "Les subventions constituent souvent la principale source de financement des EBNL. Les subventions de fonctionnement sont enregistrées au crédit du compte 75 « Autres produits » au fur et à mesure de leur utilisation. " +
        "Les subventions d'investissement sont inscrites au passif et reprises au résultat sur la durée d'amortissement des biens financés. " +
        "Les subventions reçues avec conditions suspensives sont comptabilisées en produits constatés d'avance jusqu'à la réalisation des conditions.",
      ecritures: [
        {
          numero: 2,
          description: 'Encaissement d\'une subvention de fonctionnement de 12 000 000 FCFA pour un projet annuel',
          lignes: [
            { sens: 'D', compte: '521', libelleCompte: 'Banques locales', montant: 12000000 },
            { sens: 'C', compte: '754', libelleCompte: 'Subventions d\'exploitation', montant: 12000000 },
          ],
        },
      ],
    },
    {
      titre: 'Contributions volontaires',
      contenu:
        "Les contributions volontaires en nature (bénévolat, dons en nature, mises à disposition gratuites) sont enregistrées en engagements hors bilan dans les comptes de classe 8 spécifiques. " +
        "Le compte 86 « Emplois des contributions volontaires » est débité en contrepartie du crédit du compte 87 « Contributions volontaires en nature ». " +
        "Cette comptabilisation, bien que facultative, est recommandée pour donner une image fidèle de l'activité réelle de l'EBNL et du coût complet de ses programmes.",
    },
  ],
  comptesLies: ['10', '102', '13', '75'],
}
