import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_5: FonctionnementCompte[] = [
  {
    numero: '50',
    contenu: 'Le compte 50 enregistre les titres de placement, c\'est-à-dire les titres acquis en vue de réaliser un gain à brève échéance, et qui ne répondent pas à la définition de titres de participation ou de titres immobilisés.',
    subdivisions: [
      { numero: '501', libelle: 'Actions propres' },
      { numero: '502', libelle: 'Actions cotées' },
      { numero: '503', libelle: 'Actions non cotées' },
      { numero: '504', libelle: 'Obligations cotées' },
      { numero: '505', libelle: 'Obligations non cotées' },
      { numero: '506', libelle: 'Bons du Trésor et bons de caisse à court terme' },
      { numero: '508', libelle: 'Autres valeurs assimilées' },
    ],
    commentaires: [
      'Les titres de placement sont évalués au coût d\'acquisition à l\'entrée.',
      'À la clôture, ils sont évalués au cours du jour (titres cotés) ou à la valeur probable de négociation (titres non cotés).',
      'Si la valeur à la clôture est inférieure au coût, une dépréciation est constatée.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Acquisition de titres de placement', contrePartie: ['52', '53'] },
        { description: 'Réception de titres en paiement', contrePartie: ['41', '47'] },
      ],
      credit: [
        { description: 'Cession de titres de placement', contrePartie: ['52', '53'] },
        { description: 'Remboursement de titres à l\'échéance', contrePartie: ['52'] },
      ],
    },
    exclusions: [
      { description: 'Les titres de participation détenus durablement', compteCorrige: '26', libelleCompteCorrige: 'Titres de participation' },
      { description: 'Les titres immobilisés à long terme', compteCorrige: '27', libelleCompteCorrige: 'Autres immobilisations financières' },
    ],
    elementsControle: [
      'Relevés de portefeuille de titres',
      'Évaluation à la valeur de marché à la clôture',
      'Calcul des plus ou moins-values de cession',
      'Concordance avec les avis d\'opéré',
    ],
  },
  {
    numero: '52',
    contenu: 'Le compte 52 enregistre les opérations réalisées avec les banques : dépôts, retraits, virements, frais bancaires et intérêts. Le solde créditeur représente les disponibilités en banque, le solde débiteur représente un découvert bancaire.',
    subdivisions: [
      { numero: '521', libelle: 'Banques locales' },
      { numero: '522', libelle: 'Banques autres États UEMOA/CEMAC' },
      { numero: '523', libelle: 'Banques hors zone' },
      { numero: '524', libelle: 'Banques, comptes en devises' },
      { numero: '525', libelle: 'Banques, établissements financiers et assimilés' },
      { numero: '526', libelle: 'Banques, intérêts courus' },
    ],
    commentaires: [
      'Un rapprochement bancaire doit être établi mensuellement pour justifier le solde.',
      'Les virements internes entre comptes bancaires transitent par le compte 58 (virements internes).',
      'Les comptes en devises sont convertis au cours de clôture avec constatation d\'un écart de conversion.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Encaissements (clients, emprunts, apports)', contrePartie: ['41', '16', '46'] },
        { description: 'Virements internes reçus', contrePartie: ['58'] },
        { description: 'Cession de titres', contrePartie: ['50', '26'] },
      ],
      credit: [
        { description: 'Décaissements (fournisseurs, salaires, impôts)', contrePartie: ['40', '42', '44'] },
        { description: 'Virements internes émis', contrePartie: ['58'] },
        { description: 'Frais et commissions bancaires', contrePartie: ['63'] },
      ],
    },
    exclusions: [
      { description: 'Les concours bancaires courants et découverts', compteCorrige: '56', libelleCompteCorrige: 'Banques, crédits de trésorerie' },
      { description: 'Les chèques à encaisser', compteCorrige: '513', libelleCompteCorrige: 'Chèques à encaisser' },
    ],
    elementsControle: [
      'Rapprochement bancaire mensuel',
      'Confirmation bancaire annuelle',
      'Analyse des suspens anciens',
      'Vérification des pouvoirs bancaires',
    ],
  },
  {
    numero: '53',
    contenu: 'Le compte 53 enregistre les opérations avec les établissements financiers et assimilés (CCP, Trésor public, établissements financiers divers) autres que les banques.',
    subdivisions: [
      { numero: '531', libelle: 'Chèques postaux' },
      { numero: '532', libelle: 'Trésor' },
      { numero: '533', libelle: 'Sociétés de gestion et d\'intermédiation (SGI)' },
      { numero: '538', libelle: 'Autres organismes financiers' },
    ],
    commentaires: [
      'Les comptes chèques postaux fonctionnent de la même manière que les comptes bancaires.',
      'Un rapprochement doit être établi périodiquement.',
      'Les opérations de placement transitent par les comptes 50 et 53.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Encaissements (virements reçus, versements)', contrePartie: ['41', '58'] },
        { description: 'Fonds reçus d\'autres établissements', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Décaissements (virements émis, prélèvements)', contrePartie: ['40', '42', '44'] },
        { description: 'Virements vers d\'autres comptes', contrePartie: ['58'] },
      ],
    },
    exclusions: [
      { description: 'Les comptes bancaires', compteCorrige: '52', libelleCompteCorrige: 'Banques' },
      { description: 'La caisse en espèces', compteCorrige: '57', libelleCompteCorrige: 'Caisse' },
    ],
    elementsControle: [
      'Rapprochement avec les relevés de l\'établissement',
      'Confirmation annuelle des soldes',
      'Justification des opérations en suspens',
    ],
  },
  {
    numero: '56',
    contenu: 'Le compte 56 enregistre les concours bancaires courants et les crédits de trésorerie à court terme : découverts autorisés, crédits de campagne, escompte de papier commercial et autres concours bancaires.',
    subdivisions: [
      { numero: '561', libelle: 'Crédits de trésorerie' },
      { numero: '564', libelle: 'Escompte de crédits de campagne' },
      { numero: '565', libelle: 'Escompte de crédits ordinaires' },
      { numero: '566', libelle: 'Intérêts courus' },
    ],
    commentaires: [
      'Les concours bancaires sont classés dans les dettes financières à court terme au bilan.',
      'L\'escompte d\'effets de commerce est un mode de financement qui donne lieu à une dette envers la banque.',
      'Ces dettes figurent au passif courant du bilan.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Remboursement des concours bancaires', contrePartie: ['52'] },
        { description: 'Paiement à l\'échéance des effets escomptés', contrePartie: ['412'] },
      ],
      credit: [
        { description: 'Mobilisation de créances (escompte)', contrePartie: ['52'] },
        { description: 'Obtention de crédits de trésorerie', contrePartie: ['52'] },
      ],
    },
    exclusions: [
      { description: 'Les emprunts à long terme', compteCorrige: '16', libelleCompteCorrige: 'Emprunts et dettes assimilées' },
      { description: 'Les dettes fournisseurs', compteCorrige: '40', libelleCompteCorrige: 'Fournisseurs et comptes rattachés' },
    ],
    elementsControle: [
      'Conventions de crédit et autorisations de découvert',
      'Rapprochement avec les confirmations bancaires',
      'Vérification du montant des intérêts courus',
      'Conformité avec les plafonds autorisés',
    ],
  },
  {
    numero: '57',
    contenu: 'Le compte 57 enregistre les mouvements d\'espèces en caisse. Le solde de ce compte est toujours débiteur ou nul, jamais créditeur.',
    subdivisions: [
      { numero: '571', libelle: 'Caisse siège social' },
      { numero: '572', libelle: 'Caisse succursale A' },
      { numero: '573', libelle: 'Caisse succursale B' },
      { numero: '578', libelle: 'Autres caisses' },
    ],
    commentaires: [
      'Le solde de caisse ne peut jamais être créditeur : on ne peut pas sortir plus d\'espèces qu\'il n\'y en a.',
      'Un comptage physique de caisse doit être effectué régulièrement et à la clôture de l\'exercice.',
      'Les mouvements de caisse doivent être justifiés par des pièces (reçus, bons de caisse).',
    ],
    fonctionnement: {
      debit: [
        { description: 'Encaissements en espèces (ventes au comptant)', contrePartie: ['70', '41'] },
        { description: 'Retrait bancaire pour alimentation de caisse', contrePartie: ['58'] },
      ],
      credit: [
        { description: 'Paiements en espèces (achats, salaires)', contrePartie: ['60', '62', '42'] },
        { description: 'Versement en banque', contrePartie: ['58'] },
      ],
    },
    exclusions: [
      { description: 'Les chèques et effets à encaisser', compteCorrige: '51', libelleCompteCorrige: 'Valeurs à encaisser' },
      { description: 'Les timbres fiscaux et postaux', compteCorrige: '47', libelleCompteCorrige: 'Débiteurs et créditeurs divers' },
    ],
    elementsControle: [
      'Inventaire physique de la caisse (comptage)',
      'Concordance entre solde comptable et espèces en caisse',
      'Brouillard de caisse tenu à jour',
      'Plafond de caisse respecté',
    ],
  },
  {
    numero: '59',
    contenu: 'Le compte 59 enregistre les dépréciations des titres de placement et des comptes de trésorerie lorsque leur valeur à la clôture est inférieure à leur coût d\'acquisition ou à leur valeur nominale.',
    subdivisions: [
      { numero: '590', libelle: 'Dépréciations des titres de placement' },
      { numero: '591', libelle: 'Dépréciations des titres et valeurs à encaisser' },
      { numero: '592', libelle: 'Dépréciations des comptes banques' },
      { numero: '593', libelle: 'Dépréciations des comptes établissements financiers' },
      { numero: '594', libelle: 'Dépréciations des comptes d\'instruments de trésorerie' },
    ],
    commentaires: [
      'La dépréciation des titres de placement est évaluée titre par titre ou par catégorie homogène.',
      'Elle correspond à la différence entre le coût d\'acquisition et la valeur de marché à la clôture.',
      'Les dépréciations sont ajustées à chaque clôture d\'exercice.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Reprise de la dépréciation (hausse de la valeur)', contrePartie: ['797', '779'] },
        { description: 'Annulation lors de la cession des titres', contrePartie: ['797'] },
      ],
      credit: [
        { description: 'Constitution de la dépréciation', contrePartie: ['697', '679'] },
        { description: 'Augmentation de la dépréciation', contrePartie: ['697'] },
      ],
    },
    exclusions: [
      { description: 'Les dépréciations des titres de participation', compteCorrige: '296', libelleCompteCorrige: 'Dépréciations des titres de participation' },
      { description: 'Les dépréciations des créances clients', compteCorrige: '491', libelleCompteCorrige: 'Dépréciations des comptes clients' },
    ],
    elementsControle: [
      'Évaluation des titres à la valeur de marché',
      'Calcul individuel de la dépréciation',
      'Documentation de la méthodologie d\'évaluation',
      'Suivi des reprises et dotations',
    ],
  },
]
