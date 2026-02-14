import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_3: FonctionnementCompte[] = [
  {
    numero: '31',
    contenu: 'Le compte 31 enregistre les marchandises, c\'est-à-dire les biens achetés par l\'entreprise et destinés à être revendus en l\'état, sans transformation.',
    subdivisions: [
      { numero: '311', libelle: 'Marchandises A' },
      { numero: '312', libelle: 'Marchandises B' },
      { numero: '318', libelle: 'Autres marchandises' },
    ],
    commentaires: [
      'Les marchandises sont évaluées à leur coût d\'acquisition (prix d\'achat + frais accessoires).',
      'À la clôture, les marchandises sont évaluées au plus faible du coût et de la valeur nette de réalisation.',
      'L\'entreprise peut utiliser la méthode du coût moyen pondéré (CUMP) ou la méthode FIFO (premier entré, premier sorti).',
    ],
    fonctionnement: {
      debit: [
        { description: 'Entrée en stock (constatation du stock final)', contrePartie: ['603'] },
        { description: 'Entrée en stock par inventaire permanent', contrePartie: ['603'] },
      ],
      credit: [
        { description: 'Sortie de stock (annulation du stock initial)', contrePartie: ['603'] },
        { description: 'Sortie de stock par inventaire permanent', contrePartie: ['603'] },
      ],
    },
    exclusions: [
      { description: 'Les matières premières destinées à être transformées', compteCorrige: '32', libelleCompteCorrige: 'Matières premières et fournitures liées' },
      { description: 'Les produits fabriqués par l\'entreprise', compteCorrige: '36', libelleCompteCorrige: 'Produits finis' },
    ],
    elementsControle: [
      'Inventaire physique à la clôture',
      'Concordance entre inventaire physique et comptable',
      'Évaluation au coût d\'acquisition',
      'Test de la valeur nette de réalisation',
    ],
  },
  {
    numero: '32',
    contenu: 'Le compte 32 enregistre les matières premières et fournitures liées, c\'est-à-dire les biens destinés à être incorporés dans les produits fabriqués ou consommés lors du processus de production.',
    subdivisions: [
      { numero: '321', libelle: 'Matières premières' },
      { numero: '322', libelle: 'Matières et fournitures consommables' },
      { numero: '323', libelle: 'Emballages' },
      { numero: '324', libelle: 'Matières et fournitures d\'emballage' },
      { numero: '325', libelle: 'Emballages récupérables non identifiables' },
      { numero: '326', libelle: 'Emballages à usage mixte' },
    ],
    commentaires: [
      'Les matières premières sont évaluées à leur coût d\'acquisition à l\'entrée en stock.',
      'Les emballages commerciaux non récupérables sont des consommations de l\'exercice.',
      'La distinction entre emballages récupérables et non récupérables détermine le traitement comptable.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Entrée en stock (constatation du stock final)', contrePartie: ['602'] },
        { description: 'Entrée en stock par inventaire permanent', contrePartie: ['602'] },
      ],
      credit: [
        { description: 'Sortie de stock (annulation du stock initial)', contrePartie: ['602'] },
        { description: 'Consommation par la production', contrePartie: ['602'] },
      ],
    },
    exclusions: [
      { description: 'Les marchandises revendues en l\'état', compteCorrige: '31', libelleCompteCorrige: 'Marchandises' },
      { description: 'Les fournitures non stockables (eau, électricité)', compteCorrige: '60', libelleCompteCorrige: 'Achats' },
    ],
    elementsControle: [
      'Inventaire physique à la clôture',
      'Fiche de stock et bons de sortie',
      'Évaluation conforme à la méthode choisie (CUMP ou FIFO)',
      'Concordance entre stock physique et comptable',
    ],
  },
  {
    numero: '33',
    contenu: 'Le compte 33 enregistre les autres approvisionnements non stockés ou en attente de stockage, notamment les fournitures d\'atelier, de bureau et les combustibles.',
    subdivisions: [
      { numero: '331', libelle: 'Matières consommables' },
      { numero: '332', libelle: 'Fournitures d\'atelier et d\'usine' },
      { numero: '333', libelle: 'Fournitures de magasin' },
      { numero: '334', libelle: 'Fournitures de bureau' },
      { numero: '338', libelle: 'Autres matières' },
    ],
    commentaires: [
      'Ces approvisionnements sont des biens consommables qui ne s\'incorporent pas directement dans les produits fabriqués.',
      'Ils sont évalués au coût d\'acquisition.',
      'La variation de stock est enregistrée en fin d\'exercice par le jeu des comptes de stock.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Entrée en stock (constatation du stock final)', contrePartie: ['602'] },
      ],
      credit: [
        { description: 'Sortie de stock (annulation du stock initial)', contrePartie: ['602'] },
      ],
    },
    exclusions: [
      { description: 'Les matières premières s\'incorporant dans les produits', compteCorrige: '32', libelleCompteCorrige: 'Matières premières et fournitures liées' },
    ],
    elementsControle: [
      'Inventaire physique à la clôture',
      'Concordance avec les achats de l\'exercice',
      'Évaluation au coût d\'acquisition',
    ],
  },
  {
    numero: '34',
    contenu: 'Le compte 34 enregistre les produits en cours, c\'est-à-dire les biens en cours de fabrication ou de transformation à la date de clôture de l\'exercice, ainsi que les travaux et services en cours.',
    subdivisions: [
      { numero: '341', libelle: 'Produits en cours' },
      { numero: '342', libelle: 'Travaux en cours' },
      { numero: '343', libelle: 'Services en cours' },
      { numero: '344', libelle: 'Produits intermédiaires en cours' },
      { numero: '345', libelle: 'Produits résiduels en cours' },
    ],
    commentaires: [
      'Les produits en cours sont évalués au coût de production à la date de clôture.',
      'Le coût de production comprend les charges directes et une quote-part des charges indirectes de production.',
      'Les en-cours de longue durée peuvent faire l\'objet d\'une comptabilisation selon la méthode à l\'avancement.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Constatation des en-cours à la clôture (stock final)', contrePartie: ['73'] },
      ],
      credit: [
        { description: 'Annulation des en-cours de l\'exercice précédent (stock initial)', contrePartie: ['73'] },
      ],
    },
    exclusions: [
      { description: 'Les produits finis terminés', compteCorrige: '36', libelleCompteCorrige: 'Produits finis' },
      { description: 'Les marchandises non transformées', compteCorrige: '31', libelleCompteCorrige: 'Marchandises' },
    ],
    elementsControle: [
      'Inventaire physique des en-cours à la clôture',
      'Calcul du coût de production',
      'Suivi de l\'avancement des travaux en cours',
    ],
  },
  {
    numero: '36',
    contenu: 'Le compte 36 enregistre les produits finis, c\'est-à-dire les biens fabriqués par l\'entreprise, ayant atteint le stade d\'achèvement et destinés à être vendus. Il inclut également les produits intermédiaires et les produits résiduels.',
    subdivisions: [
      { numero: '361', libelle: 'Produits finis A' },
      { numero: '362', libelle: 'Produits finis B' },
      { numero: '365', libelle: 'Produits intermédiaires' },
      { numero: '366', libelle: 'Produits résiduels (déchets, rebuts)' },
      { numero: '368', libelle: 'Autres produits finis' },
    ],
    commentaires: [
      'Les produits finis sont évalués au coût de production.',
      'Le coût de production inclut le coût d\'acquisition des matières consommées, les charges directes de production et les charges indirectes raisonnablement rattachables.',
      'Les sous-activités (charges de production non absorbées) ne sont pas incluses dans le coût de production.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Entrée en stock des produits fabriqués (stock final)', contrePartie: ['73'] },
        { description: 'Entrée par inventaire permanent', contrePartie: ['73'] },
      ],
      credit: [
        { description: 'Sortie de stock (annulation stock initial)', contrePartie: ['73'] },
        { description: 'Sortie pour vente par inventaire permanent', contrePartie: ['73'] },
      ],
    },
    exclusions: [
      { description: 'Les marchandises achetées pour la revente', compteCorrige: '31', libelleCompteCorrige: 'Marchandises' },
      { description: 'Les produits en cours non achevés', compteCorrige: '34', libelleCompteCorrige: 'Produits en cours' },
    ],
    elementsControle: [
      'Inventaire physique à la clôture',
      'Fiche de coût de production',
      'Concordance entre stock physique et comptable',
      'Test de la valeur nette de réalisation',
    ],
  },
  {
    numero: '39',
    contenu: 'Le compte 39 enregistre les dépréciations constatées sur les stocks lorsque la valeur nette de réalisation est inférieure au coût d\'entrée (coût d\'acquisition ou coût de production).',
    subdivisions: [
      { numero: '391', libelle: 'Dépréciations des stocks de marchandises' },
      { numero: '392', libelle: 'Dépréciations des stocks de matières premières' },
      { numero: '393', libelle: 'Dépréciations des stocks d\'autres approvisionnements' },
      { numero: '394', libelle: 'Dépréciations des produits en cours' },
      { numero: '396', libelle: 'Dépréciations des stocks de produits finis' },
    ],
    commentaires: [
      'La dépréciation est la différence entre le coût d\'entrée et la valeur nette de réalisation lorsque celle-ci est inférieure.',
      'La valeur nette de réalisation est le prix de vente estimé diminué des coûts nécessaires pour réaliser la vente.',
      'Les dépréciations sont ajustées à chaque clôture (dotation complémentaire ou reprise).',
    ],
    fonctionnement: {
      debit: [
        { description: 'Reprise de la dépréciation devenue sans objet', contrePartie: ['791', '759'] },
        { description: 'Annulation à la sortie du stock', contrePartie: ['603', '602'] },
      ],
      credit: [
        { description: 'Constitution de la dépréciation à la clôture', contrePartie: ['691', '659'] },
        { description: 'Augmentation de la dépréciation', contrePartie: ['691', '659'] },
      ],
    },
    exclusions: [
      { description: 'Les dépréciations des immobilisations', compteCorrige: '29', libelleCompteCorrige: 'Dépréciations des immobilisations' },
      { description: 'Les dépréciations des créances', compteCorrige: '49', libelleCompteCorrige: 'Dépréciations des comptes de tiers' },
    ],
    elementsControle: [
      'Analyse de la rotation des stocks',
      'Estimation de la valeur nette de réalisation',
      'Identification des stocks obsolètes ou à rotation lente',
      'Revue des dépréciations existantes',
    ],
  },
]
