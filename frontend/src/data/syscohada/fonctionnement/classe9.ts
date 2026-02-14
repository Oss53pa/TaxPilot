import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_9: FonctionnementCompte[] = [
  {
    numero: '90',
    contenu: 'Le compte 90 enregistre les engagements hors bilan obtenus par l\'entreprise, c\'est-à-dire les engagements reçus de tiers qui constituent des droits potentiels pour l\'entreprise sans figurer au bilan.',
    subdivisions: [
      { numero: '901', libelle: 'Avals, cautions et garanties obtenus' },
      { numero: '902', libelle: 'Effets escomptés non échus' },
      { numero: '903', libelle: 'Redevances de crédit-bail restant à courir' },
      { numero: '905', libelle: 'Biens détenus en garantie' },
      { numero: '906', libelle: 'Engagements reçus sur marchés à terme' },
      { numero: '908', libelle: 'Autres engagements obtenus' },
    ],
    commentaires: [
      'Les engagements obtenus sont des droits conditionnels qui ne sont pas comptabilisés au bilan.',
      'Ils doivent être mentionnés dans les notes annexes pour donner une image fidèle de la situation financière.',
      'Les garanties obtenues des banques ou d\'autres tiers sont enregistrées dans ce compte.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Constatation de l\'engagement obtenu', contrePartie: ['91'] },
      ],
      credit: [
        { description: 'Annulation de l\'engagement (expiration, levée, annulation)', contrePartie: ['91'] },
      ],
    },
    exclusions: [
      { description: 'Les créances certaines inscrites au bilan', compteCorrige: '41', libelleCompteCorrige: 'Clients et comptes rattachés' },
      { description: 'Les engagements donnés par l\'entreprise', compteCorrige: '91', libelleCompteCorrige: 'Engagements donnés' },
    ],
    elementsControle: [
      'Contrats et conventions mentionnant les garanties',
      'Lettres de garantie et cautions bancaires',
      'Revue annuelle des engagements hors bilan',
      'Mention dans les notes annexes',
    ],
  },
  {
    numero: '91',
    contenu: 'Le compte 91 enregistre les engagements hors bilan donnés par l\'entreprise, c\'est-à-dire les obligations potentielles prises envers des tiers qui ne figurent pas au passif du bilan mais qui pourraient entraîner une sortie de ressources.',
    subdivisions: [
      { numero: '911', libelle: 'Avals, cautions et garanties donnés' },
      { numero: '912', libelle: 'Hypothèques et nantissements consentis' },
      { numero: '913', libelle: 'Effets circulant sous l\'endos de l\'entreprise' },
      { numero: '914', libelle: 'Redevances de crédit-bail restant à payer' },
      { numero: '916', libelle: 'Engagements donnés sur marchés à terme' },
      { numero: '918', libelle: 'Autres engagements donnés' },
    ],
    commentaires: [
      'Les engagements donnés constituent des passifs éventuels qui doivent être suivis attentivement.',
      'Si la probabilité de sortie de ressources devient significative, une provision pour risques doit être constituée (compte 15).',
      'Les cautions données à des filiales ou associés doivent être détaillées dans les notes annexes.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Annulation de l\'engagement (échéance atteinte, levée)', contrePartie: ['90'] },
      ],
      credit: [
        { description: 'Constatation de l\'engagement donné', contrePartie: ['90'] },
      ],
    },
    exclusions: [
      { description: 'Les dettes certaines inscrites au bilan', compteCorrige: '16', libelleCompteCorrige: 'Emprunts et dettes assimilées' },
      { description: 'Les provisions pour risques avérés', compteCorrige: '15', libelleCompteCorrige: 'Provisions pour risques et charges' },
    ],
    elementsControle: [
      'Registre des engagements donnés',
      'Actes d\'hypothèques et nantissements',
      'Suivi des garanties en cours',
      'Évaluation de la probabilité de mise en jeu',
    ],
  },
  {
    numero: '92',
    contenu: 'Le compte 92 enregistre les charges de la comptabilité analytique de gestion réparties par fonction ou par centre d\'analyse. Il permet le suivi des coûts par destination (production, distribution, administration).',
    subdivisions: [
      { numero: '921', libelle: 'Charges des centres principaux de production' },
      { numero: '922', libelle: 'Charges des centres principaux de distribution' },
      { numero: '923', libelle: 'Charges des centres principaux d\'administration' },
      { numero: '924', libelle: 'Charges des centres auxiliaires' },
      { numero: '925', libelle: 'Charges des centres d\'approvisionnement' },
      { numero: '928', libelle: 'Autres charges de la comptabilité analytique' },
    ],
    commentaires: [
      'La comptabilité analytique est facultative mais recommandée pour le pilotage de l\'entreprise.',
      'Les charges de la comptabilité générale sont reclassées par destination dans la comptabilité analytique.',
      'Le SYSCOHADA Révisé encourage la tenue d\'une comptabilité analytique intégrée au système comptable.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Répartition des charges de la comptabilité générale par centre', contrePartie: ['93'] },
        { description: 'Charges supplétives (rémunération des capitaux propres)', contrePartie: ['93'] },
      ],
      credit: [
        { description: 'Imputation des charges aux coûts de production', contrePartie: ['93'] },
        { description: 'Charges non incorporables', contrePartie: ['93'] },
      ],
    },
    exclusions: [
      { description: 'Les charges de la comptabilité générale (classe 6)', compteCorrige: '60', libelleCompteCorrige: 'Achats' },
    ],
    elementsControle: [
      'Concordance entre comptabilité analytique et comptabilité générale',
      'Clés de répartition des charges indirectes',
      'Justification des charges supplétives',
      'Cohérence des coûts calculés',
    ],
  },
  {
    numero: '93',
    contenu: 'Le compte 93 enregistre les produits et les coûts calculés de la comptabilité analytique de gestion : coûts de production, coûts de distribution, coûts de revient et résultats analytiques.',
    subdivisions: [
      { numero: '931', libelle: 'Coûts de production des produits vendus' },
      { numero: '932', libelle: 'Coûts de distribution' },
      { numero: '933', libelle: 'Coûts d\'administration' },
      { numero: '934', libelle: 'Coûts de revient des produits vendus' },
      { numero: '935', libelle: 'Résultats analytiques' },
      { numero: '938', libelle: 'Comptes de liaison entre comptabilités' },
    ],
    commentaires: [
      'Le coût de revient est la somme du coût de production et des coûts hors production (distribution, administration).',
      'Les résultats analytiques permettent de déterminer la rentabilité par produit ou activité.',
      'Le compte 938 assure la liaison entre la comptabilité générale et la comptabilité analytique.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Coûts calculés (production, distribution, administration)', contrePartie: ['92'] },
      ],
      credit: [
        { description: 'Produits analytiques et résultats par activité', contrePartie: ['92'] },
        { description: 'Transfert vers la comptabilité générale via le compte de liaison', contrePartie: ['938'] },
      ],
    },
    exclusions: [
      { description: 'Les produits de la comptabilité générale (classe 7)', compteCorrige: '70', libelleCompteCorrige: 'Ventes' },
    ],
    elementsControle: [
      'Rapprochement entre résultat analytique et résultat comptable',
      'Justification des différences d\'incorporation',
      'Fiabilité des clés de répartition',
      'Cohérence entre les centres de coûts',
    ],
  },
  {
    numero: '95',
    contenu: 'Le compte 95 enregistre les engagements de retraite et avantages similaires accordés au personnel, lorsque ces engagements sont suivis hors bilan conformément aux options du SYSCOHADA Révisé.',
    subdivisions: [
      { numero: '951', libelle: 'Engagements de retraite et pensions' },
      { numero: '952', libelle: 'Indemnités de fin de carrière' },
      { numero: '953', libelle: 'Avantages postérieurs à l\'emploi' },
      { numero: '958', libelle: 'Autres engagements envers le personnel' },
    ],
    commentaires: [
      'Le SYSCOHADA Révisé offre l\'option de comptabiliser les engagements de retraite en provision (compte 152) ou en hors bilan (compte 95).',
      'L\'évaluation actuarielle des engagements de retraite est requise pour les entités significatives.',
      'Les hypothèses actuarielles (taux d\'actualisation, table de mortalité, taux de rotation) doivent être documentées.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Constatation de l\'engagement de retraite', contrePartie: ['96'] },
        { description: 'Réévaluation de l\'engagement', contrePartie: ['96'] },
      ],
      credit: [
        { description: 'Réduction de l\'engagement (versements effectués)', contrePartie: ['96'] },
        { description: 'Annulation en cas de transfert en provision au bilan', contrePartie: ['96'] },
      ],
    },
    exclusions: [
      { description: 'Les provisions pour pensions comptabilisées au bilan', compteCorrige: '152', libelleCompteCorrige: 'Provisions pour pensions et obligations similaires' },
      { description: 'Les charges de personnel courantes', compteCorrige: '66', libelleCompteCorrige: 'Charges de personnel' },
    ],
    elementsControle: [
      'Rapport de l\'actuaire indépendant',
      'Hypothèses actuarielles documentées',
      'Cohérence avec les engagements contractuels et conventionnels',
      'Mention détaillée dans les notes annexes',
    ],
  },
  {
    numero: '96',
    contenu: 'Le compte 96 enregistre les contreparties des engagements hors bilan enregistrés dans les comptes 90, 91 et 95. Il sert de compte miroir pour assurer l\'équilibre débit-crédit des écritures d\'engagement.',
    subdivisions: [
      { numero: '960', libelle: 'Contrepartie des engagements obtenus' },
      { numero: '961', libelle: 'Contrepartie des engagements donnés' },
      { numero: '965', libelle: 'Contrepartie des engagements de retraite' },
      { numero: '968', libelle: 'Contrepartie des autres engagements' },
    ],
    commentaires: [
      'Le compte 96 est un compte technique qui assure la double écriture des engagements hors bilan.',
      'Il n\'a pas de signification économique propre.',
      'Son solde est toujours l\'exact opposé des comptes 90, 91 et 95 correspondants.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contrepartie des engagements donnés (91) et des réductions d\'engagements obtenus (90)', contrePartie: ['90', '91'] },
      ],
      credit: [
        { description: 'Contrepartie des engagements obtenus (90) et des nouveaux engagements donnés (91)', contrePartie: ['90', '91'] },
      ],
    },
    exclusions: [],
    elementsControle: [
      'Concordance avec les comptes d\'engagement (90, 91, 95)',
      'Équilibre débit-crédit vérifié',
      'Rapprochement global des engagements hors bilan',
    ],
  },
]
