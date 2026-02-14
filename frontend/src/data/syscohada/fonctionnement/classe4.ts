import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_4: FonctionnementCompte[] = [
  {
    numero: '40',
    contenu: 'Le compte 40 enregistre les dettes envers les fournisseurs de biens et de services liés à l\'activité courante de l\'entreprise, ainsi que les effets à payer et les factures non parvenues.',
    subdivisions: [
      { numero: '401', libelle: 'Fournisseurs, comptes ordinaires' },
      { numero: '402', libelle: 'Fournisseurs, effets à payer' },
      { numero: '403', libelle: 'Fournisseurs, retenues de garantie et oppositions' },
      { numero: '404', libelle: 'Fournisseurs d\'investissement' },
      { numero: '408', libelle: 'Fournisseurs, factures non parvenues' },
      { numero: '409', libelle: 'Fournisseurs débiteurs (avances et acomptes versés, RRR à obtenir)' },
    ],
    commentaires: [
      'Les dettes fournisseurs sont comptabilisées à la date de réception de la facture ou de la livraison.',
      'Les factures non parvenues à la clôture sont provisionnées dans le compte 408.',
      'Les avances et acomptes versés aux fournisseurs sont enregistrés au débit du compte 409.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Règlement des fournisseurs', contrePartie: ['52', '53', '57'] },
        { description: 'Acceptation d\'un effet de commerce', contrePartie: ['402'] },
        { description: 'Rabais, remises et ristournes obtenus', contrePartie: ['609'] },
      ],
      credit: [
        { description: 'Achats de biens et services à crédit', contrePartie: ['60', '61', '62', '63'] },
        { description: 'Acquisitions d\'immobilisations à crédit', contrePartie: ['21', '22', '23', '24'] },
        { description: 'Factures non parvenues à la clôture', contrePartie: ['408'] },
      ],
    },
    exclusions: [
      { description: 'Les dettes financières (emprunts)', compteCorrige: '16', libelleCompteCorrige: 'Emprunts et dettes assimilées' },
      { description: 'Les dettes envers le personnel', compteCorrige: '42', libelleCompteCorrige: 'Personnel' },
    ],
    elementsControle: [
      'Rapprochement des relevés fournisseurs',
      'Justification du solde par balance âgée',
      'Cut-off des factures non parvenues',
      'Circularisation des principaux fournisseurs',
    ],
  },
  {
    numero: '41',
    contenu: 'Le compte 41 enregistre les créances sur les clients résultant de la vente de biens ou de la prestation de services dans le cadre de l\'activité courante de l\'entreprise.',
    subdivisions: [
      { numero: '411', libelle: 'Clients' },
      { numero: '412', libelle: 'Clients, effets à recevoir en portefeuille' },
      { numero: '413', libelle: 'Clients, chèques, effets et bons de caisse à encaisser' },
      { numero: '414', libelle: 'Créances sur cessions d\'immobilisations' },
      { numero: '415', libelle: 'Clients, effets escomptés non échus' },
      { numero: '416', libelle: 'Créances clients litigieuses ou douteuses' },
      { numero: '418', libelle: 'Clients, produits à recevoir' },
      { numero: '419', libelle: 'Clients créditeurs (avances et acomptes reçus, RRR à accorder)' },
    ],
    commentaires: [
      'Les créances clients sont comptabilisées à la date de la facturation.',
      'Les créances douteuses sont transférées au compte 416 dès que le recouvrement est incertain.',
      'Les produits à recevoir à la clôture sont provisionnés dans le compte 418.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Ventes de biens et services à crédit', contrePartie: ['70', '71', '72', '73'] },
        { description: 'Produits à recevoir à la clôture', contrePartie: ['418'] },
        { description: 'Effets à recevoir', contrePartie: ['412'] },
      ],
      credit: [
        { description: 'Encaissement des créances clients', contrePartie: ['52', '53', '57'] },
        { description: 'Rabais, remises et ristournes accordés', contrePartie: ['70'] },
        { description: 'Créances irrécouvrables', contrePartie: ['65'] },
      ],
    },
    exclusions: [
      { description: 'Les créances sur cessions de titres', compteCorrige: '47', libelleCompteCorrige: 'Débiteurs et créditeurs divers' },
      { description: 'Les prêts au personnel', compteCorrige: '272', libelleCompteCorrige: 'Prêts au personnel' },
    ],
    elementsControle: [
      'Balance âgée des créances clients',
      'Circularisation des principaux clients',
      'Analyse des créances douteuses et provisionnement',
      'Cut-off des produits à recevoir',
    ],
  },
  {
    numero: '42',
    contenu: 'Le compte 42 enregistre les dettes et créances liées au personnel de l\'entreprise : rémunérations dues, avances et acomptes accordés, oppositions sur salaires.',
    subdivisions: [
      { numero: '421', libelle: 'Personnel, rémunérations dues' },
      { numero: '422', libelle: 'Personnel, avances et acomptes' },
      { numero: '423', libelle: 'Personnel, oppositions et saisies' },
      { numero: '424', libelle: 'Personnel, oeuvres sociales internes' },
      { numero: '425', libelle: 'Représentants du personnel' },
      { numero: '428', libelle: 'Personnel, charges à payer et produits à recevoir' },
    ],
    commentaires: [
      'Le salaire net à payer est la différence entre le salaire brut et les retenues salariales.',
      'Les avances et acomptes sont portés au débit et déduits lors du paiement du salaire.',
      'Les congés payés acquis et non pris à la clôture doivent être provisionnés.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Avances et acomptes versés au personnel', contrePartie: ['52', '57'] },
        { description: 'Règlement des rémunérations nettes', contrePartie: ['52', '57'] },
        { description: 'Oppositions versées aux créanciers', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Rémunérations brutes dues au personnel', contrePartie: ['66'] },
        { description: 'Charges de congés payés à la clôture', contrePartie: ['66'] },
      ],
    },
    exclusions: [
      { description: 'Les charges sociales patronales', compteCorrige: '43', libelleCompteCorrige: 'Organismes sociaux' },
      { description: 'Les prêts au personnel (long terme)', compteCorrige: '272', libelleCompteCorrige: 'Prêts au personnel' },
    ],
    elementsControle: [
      'Concordance avec les bulletins de paie',
      'Rapprochement avec le livre de paie',
      'Justification des avances et acomptes',
      'Provision pour congés payés',
    ],
  },
  {
    numero: '43',
    contenu: 'Le compte 43 enregistre les dettes et créances envers les organismes sociaux (CNPS, caisses de retraite, mutuelles) au titre des charges sociales patronales et des retenues salariales.',
    subdivisions: [
      { numero: '431', libelle: 'Sécurité sociale' },
      { numero: '432', libelle: 'Caisses de retraite complémentaire' },
      { numero: '433', libelle: 'Autres organismes sociaux' },
      { numero: '438', libelle: 'Organismes sociaux, charges à payer et produits à recevoir' },
    ],
    commentaires: [
      'Les cotisations sociales patronales sont une charge pour l\'entreprise enregistrée au débit du compte 664.',
      'Les cotisations salariales retenues sur le salaire brut transitent par le crédit du compte 43.',
      'Les charges sociales à payer à la clôture sont provisionnées dans le compte 438.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Versement des cotisations sociales', contrePartie: ['52'] },
        { description: 'Paiement des indemnités par délégation', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Cotisations sociales patronales', contrePartie: ['664'] },
        { description: 'Cotisations sociales salariales retenues', contrePartie: ['421'] },
        { description: 'Charges sociales à payer à la clôture', contrePartie: ['438'] },
      ],
    },
    exclusions: [
      { description: 'Les rémunérations du personnel', compteCorrige: '42', libelleCompteCorrige: 'Personnel' },
      { description: 'Les impôts et taxes', compteCorrige: '44', libelleCompteCorrige: 'État et collectivités publiques' },
    ],
    elementsControle: [
      'Concordance avec les déclarations sociales',
      'Rapprochement des bordereaux de cotisation',
      'Justification des soldes par organisme',
      'Provision pour charges sociales sur congés payés',
    ],
  },
  {
    numero: '44',
    contenu: 'Le compte 44 enregistre les dettes et créances envers l\'État et les collectivités publiques au titre des impôts, taxes et versements assimilés, notamment la TVA, l\'impôt sur les bénéfices et les subventions à recevoir.',
    subdivisions: [
      { numero: '441', libelle: 'État, subventions à recevoir' },
      { numero: '442', libelle: 'État, autres impôts et taxes' },
      { numero: '443', libelle: 'État, TVA facturée' },
      { numero: '444', libelle: 'État, TVA due ou crédit de TVA' },
      { numero: '445', libelle: 'État, TVA récupérable' },
      { numero: '446', libelle: 'État, autres taxes sur le chiffre d\'affaires' },
      { numero: '447', libelle: 'État, impôts retenus à la source' },
      { numero: '448', libelle: 'État, charges à payer et produits à recevoir' },
      { numero: '449', libelle: 'État, créances et dettes diverses' },
    ],
    commentaires: [
      'La TVA collectée (443) est créditée lors des ventes ; la TVA déductible (445) est débitée lors des achats.',
      'La TVA à décaisser est le solde de la TVA collectée diminuée de la TVA déductible.',
      'L\'impôt sur les bénéfices est comptabilisé en charge de l\'exercice auquel il se rapporte.',
    ],
    fonctionnement: {
      debit: [
        { description: 'TVA déductible sur achats et immobilisations', contrePartie: ['60', '61', '62', '21', '24'] },
        { description: 'Paiement des impôts et taxes', contrePartie: ['52'] },
        { description: 'Acomptes d\'impôt sur les bénéfices', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'TVA collectée sur les ventes', contrePartie: ['70', '71', '72'] },
        { description: 'Impôts et taxes dus', contrePartie: ['64'] },
        { description: 'Impôt sur les bénéfices dû', contrePartie: ['89'] },
      ],
    },
    exclusions: [
      { description: 'Les cotisations sociales', compteCorrige: '43', libelleCompteCorrige: 'Organismes sociaux' },
      { description: 'Les taxes douanières payées à l\'import', compteCorrige: '60', libelleCompteCorrige: 'Achats (inclus dans le coût d\'achat)' },
    ],
    elementsControle: [
      'Concordance avec les déclarations fiscales (TVA, IS)',
      'Rapprochement CA déclaré et CA comptable',
      'Justification des crédits de TVA',
      'Vérification des acomptes d\'IS',
    ],
  },
  {
    numero: '46',
    contenu: 'Le compte 46 enregistre les opérations relatives aux associés et aux comptes des groupes : apports, comptes courants d\'associés, dividendes à payer, opérations intra-groupe.',
    subdivisions: [
      { numero: '461', libelle: 'Associés, opérations sur le capital' },
      { numero: '462', libelle: 'Associés, comptes courants' },
      { numero: '463', libelle: 'Associés, opérations faites en commun' },
      { numero: '465', libelle: 'Associés, dividendes à payer' },
      { numero: '466', libelle: 'Groupe, comptes courants' },
      { numero: '467', libelle: 'Actionnaires, restant dû sur capital appelé' },
    ],
    commentaires: [
      'Les comptes courants d\'associés enregistrent les avances de trésorerie consenties par les associés.',
      'Les dividendes à payer résultent de la décision d\'affectation du résultat.',
      'Les opérations intra-groupe doivent être identifiées pour les besoins de la consolidation.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Capital souscrit appelé (créance sur associés)', contrePartie: ['101', '109'] },
        { description: 'Remboursement des comptes courants d\'associés', contrePartie: ['52'] },
        { description: 'Versement de dividendes', contrePartie: ['52'] },
      ],
      credit: [
        { description: 'Versement des apports par les associés', contrePartie: ['52', '57'] },
        { description: 'Avances en compte courant des associés', contrePartie: ['52'] },
        { description: 'Dividendes à payer', contrePartie: ['12'] },
      ],
    },
    exclusions: [
      { description: 'Les emprunts auprès d\'établissements de crédit', compteCorrige: '16', libelleCompteCorrige: 'Emprunts et dettes assimilées' },
    ],
    elementsControle: [
      'Conventions de comptes courants',
      'PV d\'assemblée pour les dividendes',
      'Conformité avec les statuts (rémunération des comptes courants)',
      'Justification des opérations intra-groupe',
    ],
  },
  {
    numero: '47',
    contenu: 'Le compte 47 enregistre les débiteurs et créditeurs divers ne relevant pas des catégories précédentes, ainsi que les comptes transitoires et d\'attente, les charges et produits constatés d\'avance.',
    subdivisions: [
      { numero: '471', libelle: 'Débiteurs divers' },
      { numero: '472', libelle: 'Créditeurs divers' },
      { numero: '474', libelle: 'Compte transitoire, répartition périodique des charges et produits' },
      { numero: '475', libelle: 'Créances sur travaux non encore facturables' },
      { numero: '476', libelle: 'Charges constatées d\'avance' },
      { numero: '477', libelle: 'Produits constatés d\'avance' },
      { numero: '478', libelle: 'Écarts de conversion Actif' },
      { numero: '479', libelle: 'Écarts de conversion Passif' },
    ],
    commentaires: [
      'Les comptes transitoires doivent être soldés au plus tard à la clôture de l\'exercice.',
      'Les charges constatées d\'avance correspondent à des charges payées mais relatives à l\'exercice suivant.',
      'Les écarts de conversion résultent de l\'évaluation des créances et dettes en devises à la clôture.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Charges constatées d\'avance', contrePartie: ['60', '61', '62', '63'] },
        { description: 'Écarts de conversion Actif (perte latente)', contrePartie: ['40', '41', '16'] },
        { description: 'Créances diverses', contrePartie: ['75', '82'] },
      ],
      credit: [
        { description: 'Produits constatés d\'avance', contrePartie: ['70', '71', '72', '75'] },
        { description: 'Écarts de conversion Passif (gain latent)', contrePartie: ['40', '41', '16'] },
        { description: 'Dettes diverses', contrePartie: ['65', '81'] },
      ],
    },
    exclusions: [
      { description: 'Les créances clients', compteCorrige: '41', libelleCompteCorrige: 'Clients et comptes rattachés' },
      { description: 'Les dettes fournisseurs', compteCorrige: '40', libelleCompteCorrige: 'Fournisseurs et comptes rattachés' },
    ],
    elementsControle: [
      'Justification de chaque solde de compte transitoire',
      'Vérification des charges et produits constatés d\'avance',
      'Calcul des écarts de conversion',
      'Apurement des comptes d\'attente',
    ],
  },
  {
    numero: '49',
    contenu: 'Le compte 49 enregistre les dépréciations des comptes de tiers lorsque la valeur recouvrable des créances est inférieure à leur valeur nominale, en raison d\'un risque probable de non-recouvrement.',
    subdivisions: [
      { numero: '490', libelle: 'Dépréciations des comptes fournisseurs débiteurs' },
      { numero: '491', libelle: 'Dépréciations des comptes clients' },
      { numero: '492', libelle: 'Dépréciations des comptes personnel' },
      { numero: '493', libelle: 'Dépréciations des comptes organismes sociaux' },
      { numero: '494', libelle: 'Dépréciations des comptes État' },
      { numero: '496', libelle: 'Dépréciations des comptes associés et groupe' },
      { numero: '497', libelle: 'Dépréciations des comptes débiteurs divers' },
    ],
    commentaires: [
      'La dépréciation est constituée dès qu\'il existe un risque probable de non-recouvrement.',
      'Les créances irrécouvrables définitivement perdues sont passées en pertes après épuisement des voies de recours.',
      'La dépréciation est calculée sur le montant hors taxes de la créance.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Reprise de la dépréciation (créance recouvrée ou passée en perte)', contrePartie: ['791', '797'] },
      ],
      credit: [
        { description: 'Constitution de la dépréciation', contrePartie: ['691', '697'] },
        { description: 'Augmentation de la dépréciation', contrePartie: ['691'] },
      ],
    },
    exclusions: [
      { description: 'Les dépréciations des stocks', compteCorrige: '39', libelleCompteCorrige: 'Dépréciations des stocks' },
      { description: 'Les dépréciations des immobilisations', compteCorrige: '29', libelleCompteCorrige: 'Dépréciations des immobilisations' },
    ],
    elementsControle: [
      'Analyse individuelle des créances douteuses',
      'Suivi des procédures de recouvrement',
      'Estimation du risque de non-recouvrement',
      'Revue annuelle des dépréciations',
    ],
  },
]
