import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_1: FonctionnementCompte[] = [
  {
    numero: '101',
    contenu: 'Le compte 101 enregistre le montant du capital fixé par les statuts. Il représente la valeur nominale des actions ou parts sociales.',
    subdivisions: [
      { numero: '1011', libelle: 'Capital souscrit, non appelé' },
      { numero: '1012', libelle: 'Capital souscrit, appelé, non versé' },
      { numero: '1013', libelle: 'Capital souscrit, appelé, versé, non amorti' },
      { numero: '1014', libelle: 'Capital souscrit, appelé, versé, amorti' },
      { numero: '1018', libelle: 'Capital souscrit soumis à des conditions particulières' },
    ],
    commentaires: [
      'Le capital social figure au passif du bilan.',
      'Il ne peut être modifié que par décision des organes compétents.',
      'Les apports en nature doivent être évalués par un commissaire aux apports.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Réduction du capital', contrePartie: ['46', '12'] },
        { description: 'Amortissement du capital', contrePartie: ['1014', '1013'] },
      ],
      credit: [
        { description: 'Promesses d\'apport des associés', contrePartie: ['461', '109'] },
        { description: 'Incorporation des réserves, primes ou report à nouveau', contrePartie: ['106', '104', '110'] },
      ],
    },
    exclusions: [
      { description: 'Les fonds propres de l\'exploitant individuel', compteCorrige: '103', libelleCompteCorrige: 'Capital personnel' },
    ],
    elementsControle: [
      'Conformité avec les statuts',
      'PV des assemblées ayant décidé des modifications du capital',
      'Récépissé de dépôt au greffe',
    ],
  },
  {
    numero: '104',
    contenu: 'Le compte 104 enregistre les primes liées au capital social, c\'est-à-dire l\'excédent du prix d\'émission sur la valeur nominale des actions ou parts sociales. Il inclut les primes d\'émission, de fusion, d\'apport et de conversion.',
    subdivisions: [
      { numero: '1041', libelle: 'Primes d\'émission' },
      { numero: '1042', libelle: 'Primes de fusion' },
      { numero: '1043', libelle: 'Primes d\'apport' },
      { numero: '1044', libelle: 'Primes de conversion d\'obligations en actions' },
    ],
    commentaires: [
      'Les primes sont des compléments d\'apport non représentés par des titres.',
      'Elles peuvent être incorporées au capital ou distribuées sous conditions.',
      'Les primes de fusion résultent de la différence entre la valeur réelle et la valeur nominale des titres émis lors d\'une fusion.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Incorporation au capital', contrePartie: ['101'] },
        { description: 'Imputation des frais d\'augmentation de capital', contrePartie: ['201'] },
        { description: 'Distribution aux associés', contrePartie: ['465'] },
      ],
      credit: [
        { description: 'Primes d\'émission à la souscription', contrePartie: ['461'] },
        { description: 'Primes de fusion lors d\'opérations de restructuration', contrePartie: ['46'] },
      ],
    },
    exclusions: [
      { description: 'Les réserves constituées par affectation du résultat', compteCorrige: '106', libelleCompteCorrige: 'Réserves' },
    ],
    elementsControle: [
      'Bulletin de souscription ou traité de fusion',
      'PV de l\'assemblée générale extraordinaire',
      'Calcul de la prime (prix d\'émission - valeur nominale)',
    ],
  },
  {
    numero: '106',
    contenu: 'Le compte 106 enregistre les réserves constituées par l\'entreprise, c\'est-à-dire les bénéfices affectés durablement à l\'entreprise.',
    subdivisions: [
      { numero: '1061', libelle: 'Réserve légale' },
      { numero: '1062', libelle: 'Réserves indisponibles' },
      { numero: '1063', libelle: 'Réserves statutaires ou contractuelles' },
      { numero: '1064', libelle: 'Réserves réglementées' },
      { numero: '1068', libelle: 'Autres réserves' },
    ],
    commentaires: [
      'La réserve légale est obligatoire (10% du bénéfice net jusqu\'à atteindre 20% du capital).',
      'Les réserves statutaires sont prévues par les statuts de la société.',
      'Les réserves réglementées résultent de dispositions législatives ou réglementaires.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Incorporation au capital', contrePartie: ['101'] },
        { description: 'Distribution exceptionnelle', contrePartie: ['465'] },
        { description: 'Imputation de pertes', contrePartie: ['119', '129'] },
      ],
      credit: [
        { description: 'Affectation du résultat bénéficiaire', contrePartie: ['120'] },
        { description: 'Prélèvement sur primes', contrePartie: ['104'] },
      ],
    },
    exclusions: [],
    elementsControle: [
      'PV d\'assemblée générale d\'affectation du résultat',
      'Calcul de la réserve légale (5% minimum)',
      'Respect du plafond de 20% du capital pour la réserve légale',
    ],
  },
  {
    numero: '12',
    contenu: 'Le compte 12 enregistre pour solde les comptes de charges et les comptes de produits de l\'exercice. Le solde du compte 12 représente un bénéfice (solde créditeur) ou une perte (solde débiteur).',
    subdivisions: [
      { numero: '120', libelle: 'Résultat net : bénéfice' },
      { numero: '129', libelle: 'Résultat net : perte' },
    ],
    commentaires: [
      'Le résultat net est déterminé après impôts sur les bénéfices.',
      'Le résultat doit être affecté par l\'assemblée générale.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Affectation du bénéfice (réserves, dividendes, report)', contrePartie: ['106', '465', '110'] },
        { description: 'Solde débiteur des comptes de gestion (perte)', contrePartie: ['6', '8'] },
      ],
      credit: [
        { description: 'Solde créditeur des comptes de gestion (bénéfice)', contrePartie: ['7', '8'] },
        { description: 'Report de la perte de l\'exercice précédent', contrePartie: ['119'] },
      ],
    },
    exclusions: [],
    elementsControle: [
      'Concordance avec le compte de résultat',
      'Concordance avec la liasse fiscale',
      'PV d\'affectation du résultat',
    ],
  },
  {
    numero: '13',
    contenu: 'Le compte 13 enregistre les subventions reçues des pouvoirs publics et d\'organismes en vue d\'acquérir ou de créer des immobilisations ou de financer des activités à long terme.',
    subdivisions: [
      { numero: '131', libelle: 'Subventions d\'équipement A' },
      { numero: '132', libelle: 'Subventions d\'équipement B' },
      { numero: '138', libelle: 'Autres subventions d\'investissement' },
      { numero: '139', libelle: 'Subventions d\'investissement inscrites au compte de résultat' },
    ],
    commentaires: [
      'Les subventions d\'investissement sont rapportées au résultat au rythme des amortissements des biens financés.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Quote-part virée au résultat de l\'exercice', contrePartie: ['865'] },
        { description: 'Remboursement de la subvention', contrePartie: ['441'] },
      ],
      credit: [
        { description: 'Attribution de la subvention', contrePartie: ['441'] },
      ],
    },
    exclusions: [
      { description: 'Les subventions d\'exploitation', compteCorrige: '71', libelleCompteCorrige: 'Subventions d\'exploitation' },
      { description: 'Les subventions d\'équilibre', compteCorrige: '88', libelleCompteCorrige: 'Subventions d\'équilibre' },
    ],
    elementsControle: [
      'Convention de subvention',
      'Vérification du rythme de reprise',
      'Respect des conditions d\'attribution',
    ],
  },
  {
    numero: '14',
    contenu: 'Le compte 14 enregistre les provisions réglementées constituées en application de dispositions légales ou réglementaires, qui ne correspondent pas à l\'objet normal d\'une provision.',
    subdivisions: [
      { numero: '141', libelle: 'Amortissements dérogatoires' },
      { numero: '142', libelle: 'Plus-values de cession à réinvestir' },
      { numero: '143', libelle: 'Fonds réglementés' },
      { numero: '144', libelle: 'Provisions réglementées relatives aux stocks' },
      { numero: '145', libelle: 'Provisions réglementées relatives aux immobilisations' },
      { numero: '146', libelle: 'Provisions pour propre assureur' },
      { numero: '148', libelle: 'Autres provisions et fonds réglementés' },
    ],
    commentaires: [
      'Les provisions réglementées sont des provisions ne correspondant pas à l\'objet normal d\'une provision et comptabilisées en application de dispositions légales.',
      'L\'amortissement dérogatoire est la différence entre l\'amortissement fiscal et l\'amortissement comptable.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Reprise de la provision', contrePartie: ['861', '862'] },
      ],
      credit: [
        { description: 'Dotation de l\'exercice', contrePartie: ['851', '852'] },
      ],
    },
    exclusions: [
      { description: 'Les provisions pour risques et charges', compteCorrige: '15', libelleCompteCorrige: 'Provisions pour risques et charges' },
    ],
    elementsControle: [
      'Calcul des amortissements dérogatoires',
      'Conformité aux dispositions fiscales',
      'Documentation des textes de référence',
    ],
  },
  {
    numero: '15',
    contenu: 'Le compte 15 enregistre les provisions constituées pour couvrir des risques et des charges nettement précisés quant à leur objet, dont la réalisation est incertaine mais que des événements survenus ou en cours rendent probables.',
    subdivisions: [
      { numero: '151', libelle: 'Provisions pour risques' },
      { numero: '152', libelle: 'Provisions pour pensions et obligations similaires' },
      { numero: '155', libelle: 'Provisions pour charges' },
      { numero: '156', libelle: 'Provisions pour pertes de change' },
      { numero: '157', libelle: 'Provisions pour charges à répartir' },
    ],
    commentaires: [
      'La provision doit être évaluée avec fiabilité.',
      'La provision est reprise lorsque le risque ou la charge n\'existe plus.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Reprise de provision devenue sans objet', contrePartie: ['791', '797', '864'] },
        { description: 'Utilisation conforme à l\'objet', contrePartie: ['4', '5'] },
      ],
      credit: [
        { description: 'Constitution de la provision', contrePartie: ['691', '697', '854'] },
        { description: 'Augmentation de la provision', contrePartie: ['691', '697'] },
      ],
    },
    exclusions: [
      { description: 'Les provisions pour dépréciation d\'actifs', compteCorrige: '29', libelleCompteCorrige: 'Provisions pour dépréciation' },
      { description: 'Les provisions réglementées', compteCorrige: '14', libelleCompteCorrige: 'Provisions réglementées' },
    ],
    elementsControle: [
      'Justification de chaque provision',
      'Évaluation de la probabilité du risque',
      'Estimation fiable du montant',
      'Revue annuelle des provisions',
    ],
  },
  {
    numero: '16',
    contenu: 'Le compte 16 enregistre les emprunts et dettes contractés pour une durée initialement supérieure à un an (dettes financières).',
    subdivisions: [
      { numero: '161', libelle: 'Emprunts obligataires' },
      { numero: '162', libelle: 'Emprunts et dettes auprès des établissements de crédit' },
      { numero: '163', libelle: 'Avances reçues de l\'État' },
      { numero: '164', libelle: 'Avances reçues et comptes courants bloqués' },
      { numero: '165', libelle: 'Dépôts et cautionnements reçus' },
      { numero: '166', libelle: 'Intérêts courus' },
      { numero: '167', libelle: 'Emprunts et dettes assortis de conditions particulières' },
      { numero: '168', libelle: 'Autres emprunts et dettes assimilées' },
    ],
    commentaires: [
      'Les emprunts sont enregistrés pour leur valeur de remboursement.',
      'Les intérêts courus sont rattachés aux emprunts correspondants.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Remboursement des emprunts', contrePartie: ['52', '53'] },
        { description: 'Conversion en capital', contrePartie: ['101'] },
      ],
      credit: [
        { description: 'Réception des fonds empruntés', contrePartie: ['52', '53'] },
        { description: 'Intérêts échus restant dus', contrePartie: ['166'] },
      ],
    },
    exclusions: [
      { description: 'Les dettes fournisseurs', compteCorrige: '40', libelleCompteCorrige: 'Fournisseurs et comptes rattachés' },
      { description: 'Les concours bancaires courants', compteCorrige: '56', libelleCompteCorrige: 'Banques, crédits de trésorerie' },
    ],
    elementsControle: [
      'Contrats de prêt',
      'Tableaux d\'amortissement',
      'Concordance avec les confirmations bancaires',
      'Vérification des intérêts courus',
    ],
  },
  {
    numero: '17',
    contenu: 'Le compte 17 enregistre les dettes résultant de contrats de location-acquisition (crédit-bail) retraités conformément au SYSCOHADA Révisé.',
    subdivisions: [
      { numero: '172', libelle: 'Emprunts équivalents de location-acquisition immobilière' },
      { numero: '173', libelle: 'Emprunts équivalents de location-acquisition mobilière' },
      { numero: '176', libelle: 'Intérêts courus' },
    ],
    commentaires: [
      'Le SYSCOHADA Révisé impose le retraitement des contrats de crédit-bail dans les comptes individuels.',
      'La dette est enregistrée pour le montant correspondant à la valeur de l\'immobilisation à la date du contrat.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Remboursement de la partie en capital des redevances', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Prise en compte de la dette de crédit-bail', contrePartie: ['22', '23', '24'] },
      ],
    },
    exclusions: [
      { description: 'Les redevances de crédit-bail en charges (ancien traitement)', compteCorrige: '623', libelleCompteCorrige: 'Redevances de crédit-bail' },
    ],
    elementsControle: [
      'Contrats de crédit-bail',
      'Tableau de ventilation des redevances',
      'Concordance avec les immobilisations inscrites',
    ],
  },
  {
    numero: '11',
    contenu: 'Le compte 11 enregistre le report à nouveau, c\'est-à-dire la part du résultat de l\'exercice précédent dont l\'affectation a été reportée par l\'assemblée générale.',
    subdivisions: [
      { numero: '110', libelle: 'Report à nouveau solde créditeur' },
      { numero: '119', libelle: 'Report à nouveau solde débiteur' },
    ],
    commentaires: [
      'Le report à nouveau créditeur représente des bénéfices antérieurs non distribués et non mis en réserve.',
      'Le report à nouveau débiteur représente des pertes antérieures non encore résorbées.',
      'Le report à nouveau est apuré lors de l\'affectation des résultats ultérieurs.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Affectation de la perte de l\'exercice', contrePartie: ['129'] },
        { description: 'Distribution de bénéfices antérieurs', contrePartie: ['465'] },
        { description: 'Incorporation au capital', contrePartie: ['101'] },
      ],
      credit: [
        { description: 'Affectation du bénéfice non distribué et non mis en réserve', contrePartie: ['120'] },
        { description: 'Imputation de pertes sur réserves', contrePartie: ['106'] },
      ],
    },
    exclusions: [
      { description: 'Les réserves constituées', compteCorrige: '106', libelleCompteCorrige: 'Réserves' },
    ],
    elementsControle: [
      'PV d\'assemblée générale d\'affectation du résultat',
      'Concordance avec le résultat de l\'exercice précédent',
      'Suivi du report à nouveau débiteur dans le temps',
    ],
  },
]
