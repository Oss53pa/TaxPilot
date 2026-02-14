import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_2: FonctionnementCompte[] = [
  {
    numero: '21',
    contenu: 'Le compte 21 enregistre les immobilisations incorporelles, c\'est-à-dire les actifs non monétaires sans substance physique, détenus pour la production, la fourniture de biens ou de services, la location ou l\'utilisation à des fins administratives.',
    subdivisions: [
      { numero: '211', libelle: 'Frais de développement' },
      { numero: '212', libelle: 'Brevets, licences, concessions et droits similaires' },
      { numero: '213', libelle: 'Logiciels et sites internet' },
      { numero: '214', libelle: 'Marques' },
      { numero: '215', libelle: 'Fonds commercial' },
      { numero: '216', libelle: 'Droit au bail' },
      { numero: '217', libelle: 'Investissements de création' },
      { numero: '218', libelle: 'Autres droits et valeurs incorporels' },
      { numero: '219', libelle: 'Immobilisations incorporelles en cours' },
    ],
    commentaires: [
      'Les frais de recherche fondamentale ne sont jamais immobilisés ; seuls les frais de développement remplissant les conditions d\'activation le sont.',
      'Le fonds commercial n\'est amorti que si sa durée d\'utilisation est limitée.',
      'Les logiciels acquis ou créés en interne pour un usage durable sont inscrits en immobilisations.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Acquisition d\'immobilisations incorporelles', contrePartie: ['40', '48', '52'] },
        { description: 'Production immobilisée d\'immobilisations incorporelles', contrePartie: ['72'] },
        { description: 'Apport en nature', contrePartie: ['101', '104'] },
      ],
      credit: [
        { description: 'Cession ou mise hors service', contrePartie: ['81', '82'] },
        { description: 'Mise au rebut', contrePartie: ['81'] },
      ],
    },
    exclusions: [
      { description: 'Les charges de recherche non activables', compteCorrige: '63', libelleCompteCorrige: 'Services extérieurs B' },
      { description: 'Les charges constatées d\'avance', compteCorrige: '476', libelleCompteCorrige: 'Charges constatées d\'avance' },
    ],
    elementsControle: [
      'Contrats d\'acquisition (brevets, licences, logiciels)',
      'Justification des critères d\'activation des frais de développement',
      'Plan d\'amortissement de chaque immobilisation incorporelle',
      'Test de dépréciation annuel pour le fonds commercial',
    ],
  },
  {
    numero: '22',
    contenu: 'Le compte 22 enregistre les terrains dont l\'entreprise est propriétaire. Les terrains sont en principe non amortissables, sauf les terrains de gisement qui s\'épuisent par exploitation.',
    subdivisions: [
      { numero: '221', libelle: 'Terrains agricoles et forestiers' },
      { numero: '222', libelle: 'Terrains nus' },
      { numero: '223', libelle: 'Terrains bâtis' },
      { numero: '224', libelle: 'Travaux de mise en valeur des terrains' },
      { numero: '225', libelle: 'Terrains de gisement' },
      { numero: '226', libelle: 'Terrains aménagés' },
      { numero: '228', libelle: 'Autres terrains' },
      { numero: '229', libelle: 'Aménagements de terrains en cours' },
    ],
    commentaires: [
      'Les terrains ne sont pas amortissables sauf les terrains de gisement (carrières, mines).',
      'Les terrains bâtis doivent être distingués des constructions pour la ventilation du coût d\'acquisition.',
      'Les aménagements de terrain ont une durée d\'utilisation limitée et sont amortissables.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Acquisition de terrains', contrePartie: ['40', '48', '52'] },
        { description: 'Apport en nature', contrePartie: ['101', '104'] },
        { description: 'Réévaluation libre', contrePartie: ['106'] },
      ],
      credit: [
        { description: 'Cession de terrains', contrePartie: ['81', '82'] },
        { description: 'Expropriation', contrePartie: ['82'] },
      ],
    },
    exclusions: [
      { description: 'Les terrains détenus comme stocks immobiliers', compteCorrige: '31', libelleCompteCorrige: 'Marchandises' },
    ],
    elementsControle: [
      'Titres de propriété',
      'Actes notariés d\'acquisition',
      'Concordance avec le cadastre',
      'Évaluation en cas de réévaluation',
    ],
  },
  {
    numero: '23',
    contenu: 'Le compte 23 enregistre les bâtiments, installations et agencements dont l\'entreprise est propriétaire et qui sont utilisés de manière durable pour l\'exploitation.',
    subdivisions: [
      { numero: '231', libelle: 'Bâtiments industriels' },
      { numero: '232', libelle: 'Bâtiments commerciaux' },
      { numero: '233', libelle: 'Bâtiments administratifs et autres' },
      { numero: '234', libelle: 'Ouvrages d\'infrastructure' },
      { numero: '235', libelle: 'Aménagements de bureaux' },
      { numero: '237', libelle: 'Bâtiments industriels sur sol d\'autrui' },
      { numero: '238', libelle: 'Autres installations et agencements' },
      { numero: '239', libelle: 'Bâtiments et installations en cours' },
    ],
    commentaires: [
      'Les bâtiments sont amortis sur leur durée d\'utilité estimée.',
      'L\'approche par composants est obligatoire selon le SYSCOHADA Révisé : chaque composant significatif d\'un bâtiment est amorti séparément.',
      'Les constructions sur sol d\'autrui sont inscrites dans un sous-compte spécifique.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Acquisition ou construction de bâtiments', contrePartie: ['40', '48', '52'] },
        { description: 'Production immobilisée', contrePartie: ['72'] },
        { description: 'Inscription du bien en location-acquisition', contrePartie: ['17'] },
      ],
      credit: [
        { description: 'Cession de bâtiments', contrePartie: ['81', '82'] },
        { description: 'Destruction ou démolition', contrePartie: ['81'] },
      ],
    },
    exclusions: [
      { description: 'Les immeubles de placement détenus pour la location ou la plus-value', compteCorrige: '26', libelleCompteCorrige: 'Titres de participation' },
      { description: 'Les constructions en cours non encore livrées', compteCorrige: '239', libelleCompteCorrige: 'Bâtiments et installations en cours' },
    ],
    elementsControle: [
      'Titres de propriété et permis de construire',
      'Plan d\'amortissement par composant',
      'Concordance avec le fichier des immobilisations',
      'Couverture par assurance',
    ],
  },
  {
    numero: '24',
    contenu: 'Le compte 24 enregistre le matériel, le mobilier, les équipements et le matériel de transport détenus par l\'entreprise pour être utilisés dans la production, la fourniture de biens ou services, ou à des fins administratives.',
    subdivisions: [
      { numero: '241', libelle: 'Matériel et outillage industriel et commercial' },
      { numero: '242', libelle: 'Matériel et outillage agricole' },
      { numero: '243', libelle: 'Matériel d\'emballage récupérable et identifiable' },
      { numero: '244', libelle: 'Matériel et mobilier de bureau' },
      { numero: '245', libelle: 'Matériel de transport' },
      { numero: '246', libelle: 'Immobilisations animales et agricoles' },
      { numero: '248', libelle: 'Autres matériels et outillages' },
      { numero: '249', libelle: 'Matériel en cours' },
    ],
    commentaires: [
      'Le matériel est amorti sur sa durée d\'utilité estimée selon le mode linéaire ou dégressif.',
      'Le matériel de transport comprend les véhicules utilitaires et les véhicules de tourisme.',
      'Les pièces de rechange majeures constituent des immobilisations si leur durée d\'utilisation est supérieure à un an.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Acquisition de matériel', contrePartie: ['40', '48', '52'] },
        { description: 'Production de matériel par l\'entreprise', contrePartie: ['72'] },
        { description: 'Inscription du bien en location-acquisition', contrePartie: ['17'] },
      ],
      credit: [
        { description: 'Cession de matériel', contrePartie: ['81', '82'] },
        { description: 'Mise au rebut', contrePartie: ['81'] },
      ],
    },
    exclusions: [
      { description: 'Les petits matériels et outillages de faible valeur', compteCorrige: '60', libelleCompteCorrige: 'Achats' },
      { description: 'Le matériel pris en location simple', compteCorrige: '62', libelleCompteCorrige: 'Services extérieurs A' },
    ],
    elementsControle: [
      'Factures d\'acquisition',
      'Fichier des immobilisations',
      'Inventaire physique annuel',
      'Plan d\'amortissement',
    ],
  },
  {
    numero: '26',
    contenu: 'Le compte 26 enregistre les titres de participation, c\'est-à-dire les titres dont la possession durable est estimée utile à l\'activité de l\'entreprise, notamment parce qu\'elle permet d\'exercer une influence sur la société émettrice ou d\'en assurer le contrôle.',
    subdivisions: [
      { numero: '261', libelle: 'Titres de participation dans des sociétés sous contrôle exclusif' },
      { numero: '262', libelle: 'Titres de participation dans des sociétés sous contrôle conjoint' },
      { numero: '263', libelle: 'Titres de participation dans des sociétés conférant une influence notable' },
      { numero: '265', libelle: 'Participations dans des organismes professionnels' },
      { numero: '266', libelle: 'Parts dans des GIE' },
      { numero: '268', libelle: 'Autres titres de participation' },
    ],
    commentaires: [
      'Les titres de participation sont évalués à leur coût d\'acquisition à l\'entrée.',
      'À la clôture, ils sont évalués à leur valeur d\'utilité ; une dépréciation est constatée si nécessaire.',
      'La détention de plus de 10% du capital crée une présomption de participation.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Acquisition de titres de participation', contrePartie: ['52', '53', '46'] },
        { description: 'Libération d\'actions souscrites', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Cession de titres de participation', contrePartie: ['81', '82'] },
        { description: 'Annulation des titres (liquidation de la filiale)', contrePartie: ['81'] },
      ],
    },
    exclusions: [
      { description: 'Les titres de placement à court terme', compteCorrige: '50', libelleCompteCorrige: 'Titres de placement' },
      { description: 'Les titres immobilisés autres que les participations', compteCorrige: '27', libelleCompteCorrige: 'Autres immobilisations financières' },
    ],
    elementsControle: [
      'Ordres d\'achat et relevés de titres',
      'Évaluation de la valeur d\'utilité à la clôture',
      'Concordance avec les comptes des filiales',
      'Justification de l\'intention de détention durable',
    ],
  },
  {
    numero: '27',
    contenu: 'Le compte 27 enregistre les autres immobilisations financières, c\'est-à-dire les prêts, dépôts et cautionnements versés, ainsi que les titres immobilisés autres que les titres de participation.',
    subdivisions: [
      { numero: '271', libelle: 'Prêts et créances non commerciales' },
      { numero: '272', libelle: 'Prêts au personnel' },
      { numero: '273', libelle: 'Créances sur l\'État' },
      { numero: '274', libelle: 'Titres immobilisés' },
      { numero: '275', libelle: 'Dépôts et cautionnements versés' },
      { numero: '276', libelle: 'Intérêts courus' },
      { numero: '278', libelle: 'Immobilisations financières diverses' },
    ],
    commentaires: [
      'Les prêts sont comptabilisés à leur valeur nominale.',
      'Les dépôts et cautionnements correspondent à des sommes versées à des tiers en garantie.',
      'Les titres immobilisés sont ceux que l\'entreprise détient durablement sans exercer d\'influence.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Octroi de prêts', contrePartie: ['52', '53'] },
        { description: 'Versement de dépôts et cautionnements', contrePartie: ['52'] },
        { description: 'Acquisition de titres immobilisés', contrePartie: ['52', '53'] },
      ],
      credit: [
        { description: 'Remboursement de prêts', contrePartie: ['52', '53'] },
        { description: 'Restitution de dépôts et cautionnements', contrePartie: ['52'] },
        { description: 'Cession de titres immobilisés', contrePartie: ['81', '82'] },
      ],
    },
    exclusions: [
      { description: 'Les titres de participation', compteCorrige: '26', libelleCompteCorrige: 'Titres de participation' },
      { description: 'Les créances commerciales', compteCorrige: '41', libelleCompteCorrige: 'Clients et comptes rattachés' },
    ],
    elementsControle: [
      'Contrats de prêt',
      'Quittances de dépôts et cautionnements',
      'Confirmation des soldes par les tiers',
      'Test de dépréciation sur les prêts',
    ],
  },
  {
    numero: '28',
    contenu: 'Le compte 28 enregistre les amortissements des immobilisations corporelles et incorporelles. L\'amortissement constate la consommation des avantages économiques attendus de l\'actif sur sa durée d\'utilité.',
    subdivisions: [
      { numero: '281', libelle: 'Amortissements des immobilisations incorporelles' },
      { numero: '282', libelle: 'Amortissements des terrains' },
      { numero: '283', libelle: 'Amortissements des bâtiments, installations' },
      { numero: '284', libelle: 'Amortissements du matériel' },
      { numero: '285', libelle: 'Amortissements des avances et acomptes versés sur immobilisations' },
    ],
    commentaires: [
      'L\'amortissement est calculé sur la base amortissable (coût d\'acquisition moins valeur résiduelle).',
      'Le mode d\'amortissement doit refléter le rythme de consommation des avantages économiques.',
      'La durée et le mode d\'amortissement doivent être revus à chaque clôture.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Cession ou mise hors service de l\'immobilisation', contrePartie: ['81'] },
        { description: 'Reprise sur amortissements (cas exceptionnels)', contrePartie: ['79'] },
      ],
      credit: [
        { description: 'Dotation aux amortissements de l\'exercice', contrePartie: ['681', '687'] },
        { description: 'Dotation aux amortissements HAO', contrePartie: ['85'] },
      ],
    },
    exclusions: [
      { description: 'Les dépréciations d\'actifs immobilisés', compteCorrige: '29', libelleCompteCorrige: 'Dépréciations' },
      { description: 'Les provisions réglementées (amortissements dérogatoires)', compteCorrige: '14', libelleCompteCorrige: 'Provisions réglementées' },
    ],
    elementsControle: [
      'Plans d\'amortissement conformes aux durées d\'utilité',
      'Concordance entre dotations et fichier des immobilisations',
      'Revue des durées et modes d\'amortissement à la clôture',
      'Distinction entre amortissement comptable et fiscal',
    ],
  },
  {
    numero: '29',
    contenu: 'Le compte 29 enregistre les dépréciations des immobilisations lorsque leur valeur actuelle (valeur d\'utilité ou juste valeur diminuée des coûts de sortie) devient inférieure à leur valeur nette comptable.',
    subdivisions: [
      { numero: '291', libelle: 'Dépréciations des immobilisations incorporelles' },
      { numero: '292', libelle: 'Dépréciations des terrains' },
      { numero: '293', libelle: 'Dépréciations des bâtiments' },
      { numero: '294', libelle: 'Dépréciations du matériel' },
      { numero: '296', libelle: 'Dépréciations des titres de participation' },
      { numero: '297', libelle: 'Dépréciations des autres immobilisations financières' },
    ],
    commentaires: [
      'Un test de dépréciation doit être effectué dès qu\'un indice de perte de valeur est identifié.',
      'La dépréciation est réversible : elle peut être reprise si les conditions s\'améliorent.',
      'Le fonds commercial et les immobilisations incorporelles à durée de vie indéfinie doivent faire l\'objet d\'un test annuel.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Reprise de la dépréciation devenue sans objet', contrePartie: ['791', '797'] },
        { description: 'Cession ou mise hors service de l\'immobilisation', contrePartie: ['81'] },
      ],
      credit: [
        { description: 'Constatation de la dépréciation', contrePartie: ['691', '697'] },
        { description: 'Augmentation de la dépréciation', contrePartie: ['691', '697'] },
      ],
    },
    exclusions: [
      { description: 'Les amortissements des immobilisations', compteCorrige: '28', libelleCompteCorrige: 'Amortissements' },
      { description: 'Les dépréciations des stocks', compteCorrige: '39', libelleCompteCorrige: 'Dépréciations des stocks' },
    ],
    elementsControle: [
      'Identification des indices de perte de valeur',
      'Calcul de la valeur actuelle (valeur d\'utilité ou juste valeur)',
      'Documentation du test de dépréciation',
      'Suivi des reprises de dépréciation',
    ],
  },
]
