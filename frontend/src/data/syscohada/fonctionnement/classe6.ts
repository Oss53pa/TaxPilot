import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_6: FonctionnementCompte[] = [
  {
    numero: '60',
    contenu: 'Le compte 60 enregistre les achats de biens et de services consommés par l\'entreprise dans le cadre de son activité courante : achats de marchandises, de matières premières, de fournitures et les variations de stocks correspondantes.',
    subdivisions: [
      { numero: '601', libelle: 'Achats de marchandises' },
      { numero: '602', libelle: 'Achats de matières premières et fournitures liées' },
      { numero: '603', libelle: 'Variations des stocks de biens achetés' },
      { numero: '604', libelle: 'Achats stockés de matières et fournitures consommables' },
      { numero: '605', libelle: 'Autres achats' },
      { numero: '608', libelle: 'Achats d\'emballages' },
      { numero: '609', libelle: 'Rabais, remises et ristournes obtenus sur achats' },
    ],
    commentaires: [
      'Les achats sont enregistrés hors taxes récupérables, au prix d\'achat majoré des frais accessoires.',
      'Le compte 603 enregistre la variation de stock entre le stock initial et le stock final.',
      'Les RRR obtenus sont portés au crédit du compte 609 et viennent en déduction du coût des achats.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Achats de biens et services (factures fournisseurs)', contrePartie: ['40'] },
        { description: 'Achats au comptant', contrePartie: ['52', '57'] },
        { description: 'Variation de stock défavorable (stock initial > stock final)', contrePartie: ['31', '32', '33'] },
      ],
      credit: [
        { description: 'Retours de marchandises aux fournisseurs', contrePartie: ['40'] },
        { description: 'Rabais, remises et ristournes obtenus', contrePartie: ['40', '609'] },
        { description: 'Variation de stock favorable (stock final > stock initial)', contrePartie: ['31', '32', '33'] },
      ],
    },
    exclusions: [
      { description: 'Les acquisitions d\'immobilisations', compteCorrige: '21', libelleCompteCorrige: 'Immobilisations incorporelles' },
      { description: 'Les services extérieurs', compteCorrige: '62', libelleCompteCorrige: 'Services extérieurs A' },
    ],
    elementsControle: [
      'Concordance avec les factures fournisseurs',
      'Justification de la variation de stock',
      'Rapprochement avec les bons de réception',
      'Cut-off des achats en fin d\'exercice',
    ],
  },
  {
    numero: '62',
    contenu: 'Le compte 62 enregistre les charges de services extérieurs de type A : sous-traitance, locations, charges locatives, entretien et réparations, primes d\'assurance et études et recherches.',
    subdivisions: [
      { numero: '621', libelle: 'Sous-traitance générale' },
      { numero: '622', libelle: 'Locations et charges locatives' },
      { numero: '623', libelle: 'Redevances de crédit-bail et contrats assimilés' },
      { numero: '624', libelle: 'Entretien, réparations et maintenance' },
      { numero: '625', libelle: 'Primes d\'assurance' },
      { numero: '626', libelle: 'Études, recherches et documentation' },
      { numero: '627', libelle: 'Publicité, publications et relations publiques' },
      { numero: '628', libelle: 'Frais de télécommunications' },
    ],
    commentaires: [
      'Les locations enregistrées au compte 622 concernent les biens pris en location simple (non crédit-bail).',
      'Les charges d\'entretien courant sont distinguées des dépenses d\'immobilisation qui augmentent la durée de vie ou la capacité de l\'actif.',
      'Les frais de publicité sont des charges de l\'exercice sauf s\'ils répondent aux critères d\'immobilisation.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Factures de prestataires de services', contrePartie: ['40'] },
        { description: 'Paiement direct de services', contrePartie: ['52', '57'] },
        { description: 'Charges constatées d\'avance (reprise)', contrePartie: ['476'] },
      ],
      credit: [
        { description: 'Charges constatées d\'avance à la clôture', contrePartie: ['476'] },
        { description: 'Transfert de charges', contrePartie: ['78'] },
      ],
    },
    exclusions: [
      { description: 'Les achats de biens', compteCorrige: '60', libelleCompteCorrige: 'Achats' },
      { description: 'Les honoraires et frais de déplacement', compteCorrige: '63', libelleCompteCorrige: 'Services extérieurs B' },
    ],
    elementsControle: [
      'Contrats de location et de prestation',
      'Factures des prestataires',
      'Concordance avec les bons de commande',
      'Distinction entre charges et immobilisations',
    ],
  },
  {
    numero: '63',
    contenu: 'Le compte 63 enregistre les charges de services extérieurs de type B : rémunérations d\'intermédiaires et de conseils, frais de déplacement et de réception, frais postaux et de télécommunications, services bancaires.',
    subdivisions: [
      { numero: '631', libelle: 'Frais bancaires' },
      { numero: '632', libelle: 'Rémunérations d\'intermédiaires et de conseils' },
      { numero: '633', libelle: 'Frais de formation du personnel' },
      { numero: '634', libelle: 'Redevances pour brevets et licences' },
      { numero: '635', libelle: 'Cotisations' },
      { numero: '636', libelle: 'Frais de recrutement du personnel' },
      { numero: '637', libelle: 'Rémunérations du personnel extérieur à l\'entreprise' },
      { numero: '638', libelle: 'Autres charges externes' },
    ],
    commentaires: [
      'Les honoraires d\'avocats, experts-comptables, notaires et autres conseils sont enregistrés au compte 632.',
      'Les frais bancaires de gestion courante (frais de tenue de compte, commissions) sont distincts des frais financiers.',
      'Les frais de déplacement et de mission sont enregistrés au compte 638.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Factures d\'honoraires et de conseils', contrePartie: ['40'] },
        { description: 'Frais de déplacement payés', contrePartie: ['52', '57'] },
        { description: 'Commissions bancaires', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Charges constatées d\'avance', contrePartie: ['476'] },
        { description: 'Transfert de charges', contrePartie: ['78'] },
      ],
    },
    exclusions: [
      { description: 'Les intérêts bancaires (charges financières)', compteCorrige: '67', libelleCompteCorrige: 'Frais financiers et charges assimilées' },
      { description: 'Les loyers et charges locatives', compteCorrige: '62', libelleCompteCorrige: 'Services extérieurs A' },
    ],
    elementsControle: [
      'Lettres de mission et conventions d\'honoraires',
      'Notes de frais et justificatifs de déplacement',
      'Relevés bancaires pour les frais de banque',
      'Conformité avec les obligations de déclaration (DAS2)',
    ],
  },
  {
    numero: '64',
    contenu: 'Le compte 64 enregistre les impôts et taxes à la charge de l\'entreprise, à l\'exclusion de l\'impôt sur les bénéfices et de la TVA récupérable. Il comprend les impôts fonciers, patentes, taxes professionnelles et droits d\'enregistrement.',
    subdivisions: [
      { numero: '641', libelle: 'Impôts et taxes directs' },
      { numero: '642', libelle: 'Patentes et licences' },
      { numero: '643', libelle: 'Impôts fonciers' },
      { numero: '644', libelle: 'Impôts et taxes indirects' },
      { numero: '645', libelle: 'Droits d\'enregistrement' },
      { numero: '646', libelle: 'Droits de timbre' },
      { numero: '647', libelle: 'Pénalités et amendes fiscales' },
      { numero: '648', libelle: 'Autres impôts et taxes' },
    ],
    commentaires: [
      'La patente et la contribution foncière sont des impôts directs locaux.',
      'Les droits d\'enregistrement sur acquisitions d\'immobilisations font partie du coût d\'acquisition de l\'immobilisation.',
      'Les pénalités fiscales ne sont pas déductibles du résultat fiscal.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Constatation des impôts et taxes dus', contrePartie: ['44'] },
        { description: 'Paiement direct des impôts', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Transfert de charges (quote-part récupérable)', contrePartie: ['78'] },
        { description: 'Dégrèvement obtenu', contrePartie: ['75'] },
      ],
    },
    exclusions: [
      { description: 'L\'impôt sur les bénéfices', compteCorrige: '89', libelleCompteCorrige: 'Impôts sur le résultat' },
      { description: 'La TVA collectée et déductible', compteCorrige: '44', libelleCompteCorrige: 'État (TVA)' },
    ],
    elementsControle: [
      'Avis d\'imposition et rôles',
      'Concordance avec les déclarations fiscales',
      'Calcul des provisions pour impôts',
      'Vérification de la déductibilité fiscale',
    ],
  },
  {
    numero: '66',
    contenu: 'Le compte 66 enregistre les charges de personnel, c\'est-à-dire l\'ensemble des rémunérations brutes versées au personnel et les charges sociales patronales y afférentes.',
    subdivisions: [
      { numero: '661', libelle: 'Rémunérations directes versées au personnel national' },
      { numero: '662', libelle: 'Rémunérations directes versées au personnel non national' },
      { numero: '663', libelle: 'Indemnités forfaitaires versées au personnel' },
      { numero: '664', libelle: 'Charges sociales' },
      { numero: '665', libelle: 'Rémunérations des administrateurs, gérants et associés' },
      { numero: '666', libelle: 'Rémunérations et charges des stagiaires' },
      { numero: '668', libelle: 'Autres charges sociales' },
    ],
    commentaires: [
      'Les charges de personnel constituent généralement le poste de charges le plus important.',
      'Le salaire brut inclut le salaire de base, les heures supplémentaires, les primes et gratifications.',
      'Les charges sociales patronales (CNPS, caisses de retraite) sont une charge distincte de l\'entreprise.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Comptabilisation des salaires bruts', contrePartie: ['42'] },
        { description: 'Charges sociales patronales', contrePartie: ['43'] },
        { description: 'Gratifications et primes', contrePartie: ['42'] },
      ],
      credit: [
        { description: 'Transfert de charges de personnel', contrePartie: ['78'] },
        { description: 'Reprise de provision pour congés payés', contrePartie: ['15'] },
      ],
    },
    exclusions: [
      { description: 'Les rémunérations du personnel intérimaire', compteCorrige: '637', libelleCompteCorrige: 'Rémunérations du personnel extérieur' },
      { description: 'Les jetons de présence des administrateurs', compteCorrige: '665', libelleCompteCorrige: 'Rémunérations des administrateurs' },
    ],
    elementsControle: [
      'Livre de paie et bulletins de salaire',
      'Déclarations sociales (CNPS, caisses de retraite)',
      'Contrats de travail',
      'Concordance entre charges de personnel et effectifs',
    ],
  },
  {
    numero: '67',
    contenu: 'Le compte 67 enregistre les frais financiers et charges assimilées : intérêts des emprunts, agios bancaires, pertes de change et escomptes accordés.',
    subdivisions: [
      { numero: '671', libelle: 'Intérêts des emprunts' },
      { numero: '672', libelle: 'Intérêts dans loyers de location-acquisition' },
      { numero: '673', libelle: 'Escomptes accordés' },
      { numero: '674', libelle: 'Autres intérêts' },
      { numero: '675', libelle: 'Escomptes des effets de commerce' },
      { numero: '676', libelle: 'Pertes de change' },
      { numero: '677', libelle: 'Pertes sur cessions de titres de placement' },
      { numero: '678', libelle: 'Autres charges financières' },
    ],
    commentaires: [
      'Les intérêts des emprunts sont comptabilisés selon le principe de la comptabilité d\'engagement.',
      'Les pertes de change sont constatées lors du règlement de créances ou dettes en devises ou à la clôture.',
      'Les intérêts incorporables au coût de production d\'un actif qualifiant sont portés au débit de l\'immobilisation.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Intérêts échus ou courus sur emprunts', contrePartie: ['16', '166'] },
        { description: 'Pertes de change réalisées', contrePartie: ['40', '41', '52'] },
        { description: 'Escomptes accordés aux clients', contrePartie: ['41'] },
      ],
      credit: [
        { description: 'Transfert de charges financières', contrePartie: ['78'] },
        { description: 'Incorporation des intérêts au coût d\'un actif', contrePartie: ['21', '23', '24'] },
      ],
    },
    exclusions: [
      { description: 'Les frais bancaires de gestion courante', compteCorrige: '631', libelleCompteCorrige: 'Frais bancaires' },
      { description: 'Les dotations financières aux provisions', compteCorrige: '69', libelleCompteCorrige: 'Dotations aux provisions' },
    ],
    elementsControle: [
      'Tableaux d\'amortissement des emprunts',
      'Calcul des intérêts courus à la clôture',
      'Justification des pertes de change',
      'Rapprochement avec les relevés bancaires',
    ],
  },
  {
    numero: '68',
    contenu: 'Le compte 68 enregistre les dotations aux amortissements d\'exploitation des immobilisations corporelles et incorporelles. Ces dotations constatent la consommation des avantages économiques attendus sur la durée d\'utilité des actifs.',
    subdivisions: [
      { numero: '681', libelle: 'Dotations aux amortissements d\'exploitation' },
      { numero: '6811', libelle: 'Dotations aux amortissements des immobilisations incorporelles' },
      { numero: '6812', libelle: 'Dotations aux amortissements des immobilisations corporelles' },
      { numero: '6813', libelle: 'Dotations aux amortissements des immobilisations en location-acquisition' },
    ],
    commentaires: [
      'L\'amortissement linéaire est la méthode de référence du SYSCOHADA.',
      'La dotation est calculée prorata temporis en cas d\'acquisition ou de cession en cours d\'exercice.',
      'Les durées d\'amortissement doivent refléter la durée d\'utilité réelle et non la durée fiscale.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Dotation aux amortissements de l\'exercice', contrePartie: ['28'] },
      ],
      credit: [
        { description: 'Contre-passation en cas d\'erreur', contrePartie: ['28'] },
      ],
    },
    exclusions: [
      { description: 'Les dotations aux amortissements dérogatoires', compteCorrige: '851', libelleCompteCorrige: 'Dotations aux provisions réglementées' },
      { description: 'Les dotations aux dépréciations', compteCorrige: '69', libelleCompteCorrige: 'Dotations aux provisions' },
    ],
    elementsControle: [
      'Concordance avec le fichier des immobilisations',
      'Vérification des taux et durées d\'amortissement',
      'Application correcte du prorata temporis',
      'Revue des méthodes d\'amortissement',
    ],
  },
  {
    numero: '69',
    contenu: 'Le compte 69 enregistre les dotations aux provisions et aux dépréciations d\'exploitation et financières. Ces dotations constatent les risques, charges ou pertes de valeur probables identifiés à la clôture.',
    subdivisions: [
      { numero: '691', libelle: 'Dotations aux provisions d\'exploitation' },
      { numero: '692', libelle: 'Dotations aux dépréciations des immobilisations incorporelles' },
      { numero: '693', libelle: 'Dotations aux dépréciations des immobilisations corporelles' },
      { numero: '694', libelle: 'Dotations aux dépréciations des stocks' },
      { numero: '695', libelle: 'Dotations aux dépréciations des comptes de tiers' },
      { numero: '697', libelle: 'Dotations aux provisions et dépréciations financières' },
    ],
    commentaires: [
      'Les dotations d\'exploitation concernent les risques et charges liés à l\'activité courante.',
      'Les dotations financières concernent les dépréciations de titres et les provisions pour risques financiers.',
      'Chaque dotation doit être justifiée par un risque ou une perte de valeur identifié.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Dotation aux provisions pour risques et charges', contrePartie: ['15'] },
        { description: 'Dotation aux dépréciations des actifs', contrePartie: ['29', '39', '49', '59'] },
      ],
      credit: [
        { description: 'Contre-passation en cas d\'erreur', contrePartie: ['15', '29', '39', '49'] },
      ],
    },
    exclusions: [
      { description: 'Les dotations aux amortissements', compteCorrige: '68', libelleCompteCorrige: 'Dotations aux amortissements' },
      { description: 'Les dotations HAO', compteCorrige: '85', libelleCompteCorrige: 'Dotations HAO' },
    ],
    elementsControle: [
      'Justification de chaque provision et dépréciation',
      'Évaluation du risque ou de la perte de valeur',
      'Documentation des hypothèses retenues',
      'Revue annuelle de l\'ensemble des dotations',
    ],
  },
]
