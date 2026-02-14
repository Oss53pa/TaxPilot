import type { FonctionnementCompte } from '../types'

export const FONCTIONNEMENT_CLASSE_8: FonctionnementCompte[] = [
  {
    numero: '81',
    contenu: 'Le compte 81 enregistre les valeurs comptables nettes des cessions d\'immobilisations, c\'est-à-dire la valeur d\'origine des immobilisations cédées diminuée des amortissements et dépréciations pratiqués jusqu\'à la date de cession.',
    subdivisions: [
      { numero: '811', libelle: 'Valeurs comptables des cessions d\'immobilisations incorporelles' },
      { numero: '812', libelle: 'Valeurs comptables des cessions d\'immobilisations corporelles' },
      { numero: '816', libelle: 'Valeurs comptables des cessions d\'immobilisations financières' },
    ],
    commentaires: [
      'La VNC est calculée comme : valeur brute - amortissements cumulés - dépréciations cumulées.',
      'Le résultat de cession est la différence entre le produit de cession (compte 82) et la VNC (compte 81).',
      'L\'opération de cession est une opération HAO si elle n\'est pas liée à l\'activité courante.',
    ],
    fonctionnement: {
      debit: [
        { description: 'VNC de l\'immobilisation cédée (valeur brute - amortissements)', contrePartie: ['21', '22', '23', '24', '26', '27'] },
      ],
      credit: [
        { description: 'Amortissements de l\'immobilisation cédée (sortie des amortissements)', contrePartie: ['28'] },
        { description: 'Dépréciations de l\'immobilisation cédée', contrePartie: ['29'] },
      ],
    },
    exclusions: [
      { description: 'Les charges d\'exploitation courantes', compteCorrige: '60', libelleCompteCorrige: 'Achats' },
      { description: 'Les charges HAO autres que cessions', compteCorrige: '83', libelleCompteCorrige: 'Charges HAO' },
    ],
    elementsControle: [
      'Acte de cession ou facture de vente',
      'Calcul de la VNC à la date de cession',
      'Concordance avec le fichier des immobilisations',
      'Complément d\'amortissement jusqu\'à la date de cession',
    ],
  },
  {
    numero: '82',
    contenu: 'Le compte 82 enregistre les produits des cessions d\'immobilisations, c\'est-à-dire le prix de vente convenu entre les parties pour la cession d\'immobilisations incorporelles, corporelles ou financières.',
    subdivisions: [
      { numero: '821', libelle: 'Produits des cessions d\'immobilisations incorporelles' },
      { numero: '822', libelle: 'Produits des cessions d\'immobilisations corporelles' },
      { numero: '826', libelle: 'Produits des cessions d\'immobilisations financières' },
    ],
    commentaires: [
      'Le produit de cession est enregistré au prix de vente net des frais de cession.',
      'La plus-value ou moins-value de cession résulte de la comparaison entre le compte 82 et le compte 81.',
      'En cas de cession d\'un bien en crédit-bail, l\'écriture retrace la levée d\'option d\'achat puis la cession.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas d\'annulation de la cession', contrePartie: ['41', '47'] },
      ],
      credit: [
        { description: 'Prix de cession de l\'immobilisation', contrePartie: ['41', '47', '52'] },
        { description: 'Indemnité d\'expropriation', contrePartie: ['44', '47'] },
      ],
    },
    exclusions: [
      { description: 'Les produits d\'exploitation (ventes de biens)', compteCorrige: '70', libelleCompteCorrige: 'Ventes' },
      { description: 'Les produits HAO autres que cessions', compteCorrige: '84', libelleCompteCorrige: 'Produits HAO' },
    ],
    elementsControle: [
      'Acte de cession ou facture de vente',
      'Encaissement du prix de cession',
      'Calcul de la plus ou moins-value',
      'Concordance avec le fichier des immobilisations',
    ],
  },
  {
    numero: '83',
    contenu: 'Le compte 83 enregistre les charges hors activités ordinaires (HAO), c\'est-à-dire les charges ne relevant pas de l\'activité courante de l\'entreprise et présentant un caractère exceptionnel ou non récurrent.',
    subdivisions: [
      { numero: '831', libelle: 'Charges HAO constatées' },
      { numero: '834', libelle: 'Pertes sur créances HAO' },
      { numero: '835', libelle: 'Dons et libéralités accordés' },
      { numero: '836', libelle: 'Abandons de créances consentis' },
      { numero: '837', libelle: 'Charges provisionnées HAO' },
      { numero: '838', libelle: 'Autres charges HAO' },
    ],
    commentaires: [
      'Les charges HAO sont des charges exceptionnelles ou non récurrentes par nature.',
      'Les pénalités, amendes et dommages-intérêts versés constituent des charges HAO.',
      'Les abandons de créances à caractère commercial ne sont pas des charges HAO mais des charges d\'exploitation.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Charges HAO constatées (pénalités, amendes)', contrePartie: ['44', '47', '52'] },
        { description: 'Dons et libéralités', contrePartie: ['52', '57'] },
        { description: 'Abandons de créances', contrePartie: ['41', '27'] },
      ],
      credit: [
        { description: 'Transfert de charges HAO', contrePartie: ['84'] },
      ],
    },
    exclusions: [
      { description: 'Les charges d\'exploitation courantes', compteCorrige: '60', libelleCompteCorrige: 'Achats' },
      { description: 'Les VNC des cessions d\'immobilisations', compteCorrige: '81', libelleCompteCorrige: 'Valeurs comptables des cessions d\'immobilisations' },
    ],
    elementsControle: [
      'Pièces justificatives de la charge exceptionnelle',
      'Caractère non récurrent avéré',
      'Décisions du conseil d\'administration pour les dons importants',
      'Convention pour les abandons de créances',
    ],
  },
  {
    numero: '84',
    contenu: 'Le compte 84 enregistre les produits hors activités ordinaires (HAO), c\'est-à-dire les produits ne relevant pas de l\'activité courante de l\'entreprise et présentant un caractère exceptionnel ou non récurrent.',
    subdivisions: [
      { numero: '841', libelle: 'Produits HAO constatés' },
      { numero: '845', libelle: 'Dons et libéralités reçus' },
      { numero: '846', libelle: 'Abandons de créances obtenus' },
      { numero: '848', libelle: 'Autres produits HAO' },
    ],
    commentaires: [
      'Les produits HAO sont des produits exceptionnels ou non récurrents par nature.',
      'Les dégrèvements d\'impôts relatifs à des exercices antérieurs peuvent constituer des produits HAO.',
      'Les dons et libéralités reçus d\'un montant significatif sont des produits HAO.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas de produit constaté à tort', contrePartie: ['47'] },
      ],
      credit: [
        { description: 'Produits HAO encaissés ou constatés', contrePartie: ['52', '41', '47'] },
        { description: 'Dons et libéralités reçus', contrePartie: ['52', '57'] },
        { description: 'Abandons de créances obtenus', contrePartie: ['40', '16'] },
      ],
    },
    exclusions: [
      { description: 'Les produits d\'exploitation courants', compteCorrige: '70', libelleCompteCorrige: 'Ventes' },
      { description: 'Les produits de cessions d\'immobilisations', compteCorrige: '82', libelleCompteCorrige: 'Produits des cessions d\'immobilisations' },
    ],
    elementsControle: [
      'Pièces justificatives du produit exceptionnel',
      'Caractère non récurrent avéré',
      'Justification de la classification en HAO',
      'Convention pour les abandons de créances obtenus',
    ],
  },
  {
    numero: '85',
    contenu: 'Le compte 85 enregistre les dotations hors activités ordinaires (HAO) aux amortissements, provisions réglementées et autres provisions exceptionnelles liées à des événements HAO.',
    subdivisions: [
      { numero: '851', libelle: 'Dotations aux provisions réglementées' },
      { numero: '852', libelle: 'Dotations aux amortissements HAO' },
      { numero: '853', libelle: 'Dotations aux provisions pour risques et charges HAO' },
      { numero: '854', libelle: 'Dotations aux provisions pour dépréciations HAO' },
      { numero: '858', libelle: 'Autres dotations HAO' },
    ],
    commentaires: [
      'Les dotations aux provisions réglementées (amortissements dérogatoires) sont des dotations HAO.',
      'Les dotations pour risques et charges HAO concernent des événements exceptionnels.',
      'Les dotations HAO ne sont généralement pas déductibles fiscalement.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Dotation aux provisions réglementées', contrePartie: ['14'] },
        { description: 'Dotation aux provisions HAO', contrePartie: ['15', '19'] },
        { description: 'Dotation aux amortissements HAO', contrePartie: ['28'] },
      ],
      credit: [
        { description: 'Contre-passation en cas d\'erreur', contrePartie: ['14', '15'] },
      ],
    },
    exclusions: [
      { description: 'Les dotations aux amortissements d\'exploitation', compteCorrige: '68', libelleCompteCorrige: 'Dotations aux amortissements' },
      { description: 'Les dotations aux provisions d\'exploitation', compteCorrige: '69', libelleCompteCorrige: 'Dotations aux provisions' },
    ],
    elementsControle: [
      'Calcul des amortissements dérogatoires',
      'Justification du caractère HAO',
      'Conformité aux textes réglementaires',
      'Documentation des événements exceptionnels',
    ],
  },
  {
    numero: '86',
    contenu: 'Le compte 86 enregistre les reprises hors activités ordinaires (HAO) de provisions réglementées, de provisions pour risques et charges HAO et de dépréciations HAO, ainsi que les transferts de charges HAO.',
    subdivisions: [
      { numero: '861', libelle: 'Reprises de provisions réglementées' },
      { numero: '862', libelle: 'Reprises d\'amortissements HAO' },
      { numero: '863', libelle: 'Reprises de provisions pour risques et charges HAO' },
      { numero: '864', libelle: 'Reprises de provisions pour dépréciations HAO' },
      { numero: '865', libelle: 'Reprises de subventions d\'investissement' },
      { numero: '868', libelle: 'Autres reprises HAO' },
    ],
    commentaires: [
      'Les reprises de provisions réglementées interviennent quand l\'avantage fiscal cesse.',
      'La reprise des subventions d\'investissement suit le rythme d\'amortissement des biens subventionnés.',
      'Les reprises HAO sont des produits et contribuent à la formation du résultat HAO.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Contre-passation en cas d\'erreur', contrePartie: ['14', '15', '13'] },
      ],
      credit: [
        { description: 'Reprise de provisions réglementées', contrePartie: ['14'] },
        { description: 'Reprise de provisions HAO', contrePartie: ['15', '19'] },
        { description: 'Quote-part de subvention d\'investissement virée au résultat', contrePartie: ['13'] },
      ],
    },
    exclusions: [
      { description: 'Les reprises de provisions d\'exploitation', compteCorrige: '79', libelleCompteCorrige: 'Reprises de provisions' },
      { description: 'Les produits des cessions d\'immobilisations', compteCorrige: '82', libelleCompteCorrige: 'Produits des cessions d\'immobilisations' },
    ],
    elementsControle: [
      'Justification de chaque reprise HAO',
      'Calcul de la quote-part de subvention d\'investissement',
      'Conformité du rythme de reprise',
      'Concordance avec les dotations d\'origine',
    ],
  },
  {
    numero: '87',
    contenu: 'Le compte 87 enregistre les participations des travailleurs aux bénéfices de l\'entreprise, lorsqu\'une telle participation est prévue par la législation, les conventions collectives ou les accords d\'entreprise.',
    subdivisions: [
      { numero: '871', libelle: 'Participation légale des travailleurs' },
      { numero: '872', libelle: 'Participation contractuelle des travailleurs' },
      { numero: '878', libelle: 'Autres formes de participation' },
    ],
    commentaires: [
      'La participation des travailleurs est une charge de l\'exercice au titre duquel elle est calculée.',
      'Elle est provisionnée à la clôture si le montant n\'est pas définitivement arrêté.',
      'Son régime fiscal varie selon la législation de chaque État membre de l\'OHADA.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Participation des travailleurs de l\'exercice', contrePartie: ['42', '43'] },
      ],
      credit: [
        { description: 'Contre-passation de la provision (exercice précédent)', contrePartie: ['15'] },
      ],
    },
    exclusions: [
      { description: 'Les rémunérations du personnel', compteCorrige: '66', libelleCompteCorrige: 'Charges de personnel' },
      { description: 'Les dividendes des associés', compteCorrige: '465', libelleCompteCorrige: 'Associés, dividendes à payer' },
    ],
    elementsControle: [
      'Calcul de la participation conformément aux textes applicables',
      'PV du comité d\'entreprise',
      'Provision constituée à la clôture',
    ],
  },
  {
    numero: '89',
    contenu: 'Le compte 89 enregistre l\'impôt sur le résultat de l\'exercice, c\'est-à-dire l\'impôt sur les bénéfices des sociétés ou l\'impôt sur le revenu dû au titre de l\'exercice. Il inclut l\'impôt exigible et, le cas échéant, l\'impôt différé.',
    subdivisions: [
      { numero: '891', libelle: 'Impôt sur les bénéfices de l\'exercice' },
      { numero: '892', libelle: 'Rappels d\'impôts sur les résultats' },
      { numero: '895', libelle: 'Impôt minimum forfaitaire (IMF)' },
      { numero: '899', libelle: 'Dégrèvements et annulations d\'impôts sur les résultats' },
    ],
    commentaires: [
      'L\'impôt sur les bénéfices est calculé sur le résultat fiscal (résultat comptable retraité des réintégrations et déductions).',
      'L\'impôt minimum forfaitaire (IMF) est dû même en cas de résultat déficitaire dans certains pays.',
      'L\'impôt différé résulte des différences temporelles entre le résultat comptable et le résultat fiscal.',
    ],
    fonctionnement: {
      debit: [
        { description: 'Impôt sur les bénéfices de l\'exercice', contrePartie: ['44'] },
        { description: 'Impôt minimum forfaitaire', contrePartie: ['44'] },
        { description: 'Rappels d\'impôts sur les résultats', contrePartie: ['44'] },
      ],
      credit: [
        { description: 'Dégrèvements d\'impôts obtenus', contrePartie: ['44'] },
        { description: 'Annulation de rappels contestés avec succès', contrePartie: ['44'] },
      ],
    },
    exclusions: [
      { description: 'Les impôts et taxes d\'exploitation (patente, foncier)', compteCorrige: '64', libelleCompteCorrige: 'Impôts et taxes' },
      { description: 'La TVA collectée et déductible', compteCorrige: '44', libelleCompteCorrige: 'État (TVA)' },
    ],
    elementsControle: [
      'Liasse fiscale et déclaration de résultat',
      'Tableau de passage du résultat comptable au résultat fiscal',
      'Avis d\'imposition et acomptes versés',
      'Calcul de l\'impôt différé le cas échéant',
    ],
  },
]
