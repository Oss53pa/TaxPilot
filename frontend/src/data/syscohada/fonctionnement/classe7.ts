import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_7: FonctionnementCompte[] = [
  {
    numero: '70',
    contenu: 'Le compte 70 enregistre le chiffre d\'affaires provenant de la vente de marchandises achetées et revendues en l\'état. Il constitue la première composante du chiffre d\'affaires de l\'entreprise commerciale.',
    subdivisions: [
      { numero: '701', libelle: 'Ventes de marchandises' },
      { numero: '702', libelle: 'Ventes de produits finis' },
      { numero: '703', libelle: 'Ventes de produits intermédiaires' },
      { numero: '704', libelle: 'Ventes de produits résiduels' },
      { numero: '706', libelle: 'Services vendus' },
      { numero: '707', libelle: 'Produits accessoires' },
      { numero: '709', libelle: 'Rabais, remises et ristournes accordés' },
    ],
    commentaires: [
      'Le chiffre d\'affaires est comptabilisé hors taxes (TVA et autres taxes collectées).',
      'Les ventes sont enregistrées à la date de livraison du bien ou d\'achèvement de la prestation.',
      'Les RRR accordés sur facture sont déduits directement ; les RRR hors facture sont portés au débit du compte 709.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Rabais, remises et ristournes accordés', contrePartie: ['41', '709'] },
        { description: 'Retours de marchandises par les clients', contrePartie: ['41'] },
      ],
      credit: [
        { description: 'Ventes de marchandises à crédit', contrePartie: ['41'] },
        { description: 'Ventes au comptant', contrePartie: ['52', '57'] },
        { description: 'Produits accessoires (locations, commissions)', contrePartie: ['41', '52'] },
      ],
    },
    exclusions: [
      { description: 'Les produits des cessions d\'immobilisations', compteCorrige: '82', libelleCompteCorrige: 'Produits des cessions d\'immobilisations' },
      { description: 'Les subventions d\'exploitation', compteCorrige: '71', libelleCompteCorrige: 'Subventions d\'exploitation' },
    ],
    elementsControle: [
      'Concordance entre CA déclaré et CA comptable',
      'Rapprochement avec les déclarations de TVA',
      'Cut-off des ventes en fin d\'exercice',
      'Analyse de l\'évolution du CA par rapport à N-1',
    ],
  },
  {
    numero: '71',
    contenu: 'Le compte 71 enregistre les subventions d\'exploitation reçues par l\'entreprise pour compenser l\'insuffisance de certains produits d\'exploitation ou pour faire face à certaines charges d\'exploitation.',
    subdivisions: [
      { numero: '711', libelle: 'Subventions d\'exploitation reçues de l\'État' },
      { numero: '712', libelle: 'Subventions d\'exploitation reçues des régions' },
      { numero: '713', libelle: 'Subventions d\'exploitation reçues des communes' },
      { numero: '714', libelle: 'Subventions d\'exploitation reçues des organismes internationaux' },
      { numero: '718', libelle: 'Autres subventions d\'exploitation' },
    ],
    commentaires: [
      'Les subventions d\'exploitation sont des produits de l\'exercice au cours duquel elles sont acquises.',
      'Elles sont rattachées à l\'exercice au titre duquel elles sont accordées (principe de spécialisation).',
      'Elles se distinguent des subventions d\'investissement (compte 13) et des subventions d\'équilibre (compte 88).',
    ],
    fonctionnement: {
      debit: [
        { description: 'Remboursement de subventions indûment perçues', contrePartie: ['44'] },
      ],
      credit: [
        { description: 'Notification de la subvention', contrePartie: ['441'] },
        { description: 'Réception directe des fonds', contrePartie: ['52'] },
      ],
    },
    exclusions: [
      { description: 'Les subventions d\'investissement', compteCorrige: '13', libelleCompteCorrige: 'Subventions d\'investissement' },
      { description: 'Les subventions d\'équilibre', compteCorrige: '88', libelleCompteCorrige: 'Subventions d\'équilibre' },
    ],
    elementsControle: [
      'Convention ou décision d\'attribution de la subvention',
      'Respect des conditions d\'attribution',
      'Rattachement à l\'exercice correct',
    ],
  },
  {
    numero: '72',
    contenu: 'Le compte 72 enregistre le coût de production des immobilisations créées par l\'entreprise pour elle-même (production immobilisée). Il s\'agit de la contrepartie des charges engagées pour produire des actifs destinés à rester dans l\'entreprise.',
    subdivisions: [
      { numero: '721', libelle: 'Production immobilisée, immobilisations incorporelles' },
      { numero: '722', libelle: 'Production immobilisée, immobilisations corporelles' },
    ],
    commentaires: [
      'La production immobilisée permet de neutraliser l\'effet des charges engagées pour la création d\'actifs.',
      'Le montant correspond au coût de production réel (charges directes + quote-part de charges indirectes).',
      'Elle est soumise à la TVA dans certains cas (livraison à soi-même).',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas d\'erreur ou d\'abandon du projet', contrePartie: ['21', '22', '23', '24'] },
      ],
      credit: [
        { description: 'Coût de production des immobilisations créées', contrePartie: ['21', '22', '23', '24'] },
      ],
    },
    exclusions: [
      { description: 'Les produits des ventes de biens et services à des tiers', compteCorrige: '70', libelleCompteCorrige: 'Ventes' },
      { description: 'La variation de stocks de produits', compteCorrige: '73', libelleCompteCorrige: 'Variations de stocks de biens produits' },
    ],
    elementsControle: [
      'Fiche de coût de production détaillée',
      'Concordance avec les charges immobilisées',
      'Conformité de la méthode de calcul du coût de production',
      'Le cas échéant, déclaration de livraison à soi-même (TVA)',
    ],
  },
  {
    numero: '75',
    contenu: 'Le compte 75 enregistre les autres produits courants qui ne proviennent pas de l\'activité principale de l\'entreprise mais qui sont de nature récurrente : revenus des immeubles non affectés à l\'exploitation, redevances, indemnités d\'assurance.',
    subdivisions: [
      { numero: '751', libelle: 'Revenus des immeubles non affectés aux activités professionnelles' },
      { numero: '752', libelle: 'Revenus des brevets, licences et droits similaires' },
      { numero: '753', libelle: 'Jetons de présence et rémunérations d\'administrateur' },
      { numero: '754', libelle: 'Indemnités d\'assurance reçues' },
      { numero: '758', libelle: 'Produits divers' },
    ],
    commentaires: [
      'Ces produits ne font pas partie du chiffre d\'affaires mais contribuent au résultat d\'exploitation.',
      'Les indemnités d\'assurance sont comptabilisées lorsque le droit est acquis.',
      'Les redevances de brevets et licences sont rattachées à l\'exercice concerné.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas de produit constaté d\'avance', contrePartie: ['477'] },
      ],
      credit: [
        { description: 'Revenus locatifs', contrePartie: ['41', '52'] },
        { description: 'Redevances reçues', contrePartie: ['41', '52'] },
        { description: 'Indemnités d\'assurance encaissées', contrePartie: ['52', '41'] },
      ],
    },
    exclusions: [
      { description: 'Les produits des activités ordinaires (ventes)', compteCorrige: '70', libelleCompteCorrige: 'Ventes' },
      { description: 'Les revenus financiers (dividendes, intérêts)', compteCorrige: '77', libelleCompteCorrige: 'Revenus financiers et produits assimilés' },
    ],
    elementsControle: [
      'Contrats de location et baux',
      'Conventions de redevances',
      'Déclarations de sinistres et correspondances avec les assureurs',
      'Rattachement à l\'exercice correct',
    ],
  },
  {
    numero: '77',
    contenu: 'Le compte 77 enregistre les revenus financiers et produits assimilés : dividendes reçus, intérêts perçus, gains de change et escomptes obtenus.',
    subdivisions: [
      { numero: '771', libelle: 'Intérêts de prêts et créances diverses' },
      { numero: '772', libelle: 'Revenus de participations' },
      { numero: '773', libelle: 'Escomptes obtenus' },
      { numero: '774', libelle: 'Revenus de titres de placement' },
      { numero: '776', libelle: 'Gains de change' },
      { numero: '777', libelle: 'Gains sur cessions de titres de placement' },
      { numero: '778', libelle: 'Autres produits financiers' },
    ],
    commentaires: [
      'Les dividendes sont comptabilisés lorsque le droit est acquis (décision de distribution par l\'AG).',
      'Les intérêts courus non échus sont rattachés à l\'exercice par le jeu des comptes de régularisation.',
      'Les gains de change sont constatés lors du règlement des opérations en devises étrangères.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation des produits constatés d\'avance', contrePartie: ['477'] },
      ],
      credit: [
        { description: 'Dividendes reçus des filiales et participations', contrePartie: ['52', '46'] },
        { description: 'Intérêts de prêts et placements', contrePartie: ['52', '27', '50'] },
        { description: 'Gains de change réalisés', contrePartie: ['40', '41', '52'] },
      ],
    },
    exclusions: [
      { description: 'Les produits des cessions de titres de participation', compteCorrige: '82', libelleCompteCorrige: 'Produits des cessions d\'immobilisations' },
      { description: 'Les produits d\'exploitation divers', compteCorrige: '75', libelleCompteCorrige: 'Autres produits' },
    ],
    elementsControle: [
      'Avis de crédit des dividendes et relevés bancaires',
      'Calcul des intérêts courus à la clôture',
      'Justification des gains de change',
      'Concordance avec les contrats de prêt et les placements',
    ],
  },
  {
    numero: '78',
    contenu: 'Le compte 78 enregistre les transferts de charges d\'exploitation et financières. Le transfert de charges permet de neutraliser une charge enregistrée par nature en la transférant à un autre compte (immobilisation, stock, ou tiers).',
    subdivisions: [
      { numero: '781', libelle: 'Transferts de charges d\'exploitation' },
      { numero: '787', libelle: 'Transferts de charges financières' },
    ],
    commentaires: [
      'Le transfert de charges n\'est pas un produit au sens strict mais une régularisation.',
      'Il est utilisé pour incorporer des charges au coût de production des immobilisations ou des stocks.',
      'Il sert également à transférer des charges à des comptes de tiers (indemnités d\'assurance par exemple).',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas d\'erreur', contrePartie: ['60', '62', '63', '66', '67'] },
      ],
      credit: [
        { description: 'Transfert de charges d\'exploitation vers immobilisations', contrePartie: ['21', '23', '24'] },
        { description: 'Transfert de charges financières incorporables', contrePartie: ['21', '23'] },
        { description: 'Transfert de charges couvertes par des indemnités', contrePartie: ['75', '41'] },
      ],
    },
    exclusions: [
      { description: 'Les reprises de provisions et dépréciations', compteCorrige: '79', libelleCompteCorrige: 'Reprises de provisions' },
      { description: 'La production immobilisée', compteCorrige: '72', libelleCompteCorrige: 'Production immobilisée' },
    ],
    elementsControle: [
      'Justification de chaque transfert de charges',
      'Concordance avec les charges transférées',
      'Documentation de la base de calcul',
    ],
  },
  {
    numero: '79',
    contenu: 'Le compte 79 enregistre les reprises de provisions d\'exploitation et financières, ainsi que les reprises de dépréciations, lorsque le risque, la charge ou la perte de valeur ayant motivé la provision ou la dépréciation n\'existe plus ou a diminué.',
    subdivisions: [
      { numero: '791', libelle: 'Reprises de provisions d\'exploitation' },
      { numero: '793', libelle: 'Reprises de dépréciations des immobilisations' },
      { numero: '794', libelle: 'Reprises de dépréciations des stocks' },
      { numero: '795', libelle: 'Reprises de dépréciations des comptes de tiers' },
      { numero: '797', libelle: 'Reprises de provisions et dépréciations financières' },
      { numero: '798', libelle: 'Reprises d\'amortissements' },
    ],
    commentaires: [
      'La reprise est effectuée lorsque la provision ou la dépréciation est devenue sans objet, totalement ou partiellement.',
      'La reprise est également effectuée lors de la réalisation du risque ou de la charge provisionnée.',
      'Le montant de la reprise est limité au montant de la provision ou dépréciation antérieurement constituée.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas d\'erreur', contrePartie: ['15', '29', '39', '49', '59'] },
      ],
      credit: [
        { description: 'Reprise de provision pour risques et charges', contrePartie: ['15'] },
        { description: 'Reprise de dépréciation d\'immobilisations', contrePartie: ['29'] },
        { description: 'Reprise de dépréciation de stocks', contrePartie: ['39'] },
        { description: 'Reprise de dépréciation de créances', contrePartie: ['49'] },
      ],
    },
    exclusions: [
      { description: 'Les reprises HAO', compteCorrige: '86', libelleCompteCorrige: 'Reprises HAO' },
      { description: 'Les transferts de charges', compteCorrige: '78', libelleCompteCorrige: 'Transferts de charges' },
    ],
    elementsControle: [
      'Justification de la reprise (disparition du risque ou réalisation)',
      'Concordance avec la dotation d\'origine',
      'Limitation au montant de la provision ou dépréciation existante',
      'Documentation de l\'événement ayant motivé la reprise',
    ],
  },
]
