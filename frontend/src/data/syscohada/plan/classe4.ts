import type { CompteComptable } from '../types'

/**
 * CLASSE 4 - COMPTES DE TIERS
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_4_COMPTES: CompteComptable[] = [
  // ============================================================
  // 40 - FOURNISSEURS ET COMPTES RATTACHES
  // ============================================================
  {
    numero: '40',
    libelle: 'Fournisseurs et comptes rattachés',
    classe: 4,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '401',
    libelle: 'Fournisseurs, dettes en compte',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4011',
    libelle: 'Fournisseurs locaux',
    classe: 4,
    sousClasse: '401',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4012',
    libelle: 'Fournisseurs groupe',
    classe: 4,
    sousClasse: '401',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4013',
    libelle: 'Fournisseurs sous-traitants',
    classe: 4,
    sousClasse: '401',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4017',
    libelle: 'Fournisseurs, retenues de garantie',
    classe: 4,
    sousClasse: '401',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4018',
    libelle: 'Fournisseurs, factures non parvenues',
    classe: 4,
    sousClasse: '401',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '402',
    libelle: 'Fournisseurs, effets à payer',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '403',
    libelle: "Fournisseurs d'immobilisations, dettes en compte",
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '404',
    libelle: "Fournisseurs d'immobilisations, effets à payer",
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '405',
    libelle: "Fournisseurs d'investissements",
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '408',
    libelle: 'Fournisseurs, factures non parvenues',
    classe: 4,
    sousClasse: '40',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4081',
    libelle: 'Fournisseurs',
    classe: 4,
    sousClasse: '408',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4082',
    libelle: "Fournisseurs d'immobilisations",
    classe: 4,
    sousClasse: '408',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4083',
    libelle: "Fournisseurs, factures non parvenues d'exploitation",
    classe: 4,
    sousClasse: '408',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '409',
    libelle: 'Fournisseurs débiteurs',
    classe: 4,
    sousClasse: '40',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4091',
    libelle: 'Fournisseurs, avances et acomptes versés',
    classe: 4,
    sousClasse: '409',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4094',
    libelle: 'Fournisseurs, créances pour emballages à rendre',
    classe: 4,
    sousClasse: '409',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4098',
    libelle: 'Rabais, remises, ristournes à obtenir',
    classe: 4,
    sousClasse: '409',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 41 - CLIENTS ET COMPTES RATTACHES
  // ============================================================
  {
    numero: '41',
    libelle: 'Clients et comptes rattachés',
    classe: 4,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '411',
    libelle: 'Clients',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4111',
    libelle: 'Clients locaux',
    classe: 4,
    sousClasse: '411',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4112',
    libelle: 'Clients groupe',
    classe: 4,
    sousClasse: '411',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4114',
    libelle: 'Clients, État et collectivités publiques',
    classe: 4,
    sousClasse: '411',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4118',
    libelle: 'Clients divers',
    classe: 4,
    sousClasse: '411',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '412',
    libelle: 'Clients, effets à recevoir',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '413',
    libelle: 'Clients, créances douteuses ou litigieuses',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '414',
    libelle: "Créances sur cessions courantes d'immobilisations",
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '415',
    libelle: 'Clients, effets escomptés non échus',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '416',
    libelle: 'Créances litigieuses',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '418',
    libelle: 'Clients, produits non encore facturés',
    classe: 4,
    sousClasse: '41',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4181',
    libelle: 'Clients, factures à établir',
    classe: 4,
    sousClasse: '418',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4186',
    libelle: 'Clients, intérêts courus',
    classe: 4,
    sousClasse: '418',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '419',
    libelle: 'Clients créditeurs',
    classe: 4,
    sousClasse: '41',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4191',
    libelle: 'Clients, avances et acomptes reçus',
    classe: 4,
    sousClasse: '419',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4194',
    libelle: 'Clients, dettes pour emballages consignés',
    classe: 4,
    sousClasse: '419',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4198',
    libelle: 'Rabais, remises, ristournes à accorder',
    classe: 4,
    sousClasse: '419',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 42 - PERSONNEL
  // ============================================================
  {
    numero: '42',
    libelle: 'Personnel',
    classe: 4,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '421',
    libelle: 'Personnel, avances et acomptes',
    classe: 4,
    sousClasse: '42',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4211',
    libelle: 'Personnel, avances',
    classe: 4,
    sousClasse: '421',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4212',
    libelle: 'Personnel, acomptes',
    classe: 4,
    sousClasse: '421',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4213',
    libelle: 'Frais avancés et fournitures au personnel',
    classe: 4,
    sousClasse: '421',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '422',
    libelle: 'Personnel, rémunérations dues',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4221',
    libelle: 'Personnel, rémunérations dues',
    classe: 4,
    sousClasse: '422',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4222',
    libelle: 'Personnel, prêts',
    classe: 4,
    sousClasse: '422',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '423',
    libelle: 'Personnel, oppositions, saisies-arrêts',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '424',
    libelle: 'Personnel, oeuvres sociales internes',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '425',
    libelle: 'Représentants du personnel',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '426',
    libelle: 'Personnel, dépôts reçus',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '427',
    libelle: 'Personnel, frais médicaux et pharmacie',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '428',
    libelle: 'Personnel, charges à payer et produits à recevoir',
    classe: 4,
    sousClasse: '42',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4281',
    libelle: 'Dettes provisionnées pour congés à payer',
    classe: 4,
    sousClasse: '428',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4282',
    libelle: 'Dettes provisionnées pour gratifications',
    classe: 4,
    sousClasse: '428',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4286',
    libelle: 'Autres charges à payer',
    classe: 4,
    sousClasse: '428',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 43 - ORGANISMES SOCIAUX
  // ============================================================
  {
    numero: '43',
    libelle: 'Organismes sociaux',
    classe: 4,
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '431',
    libelle: 'Sécurité sociale',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '432',
    libelle: 'Caisses de retraite',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '433',
    libelle: 'Autres organismes sociaux',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '438',
    libelle: 'Organismes sociaux, charges à payer',
    classe: 4,
    sousClasse: '43',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4381',
    libelle: 'Charges sociales sur congés à payer',
    classe: 4,
    sousClasse: '438',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4382',
    libelle: 'Charges sociales sur gratifications',
    classe: 4,
    sousClasse: '438',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4386',
    libelle: 'Autres charges à payer',
    classe: 4,
    sousClasse: '438',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 44 - ETAT ET COLLECTIVITES PUBLIQUES
  // ============================================================
  {
    numero: '44',
    libelle: 'État et collectivités publiques',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '441',
    libelle: 'État, subventions à recevoir',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '442',
    libelle: 'État, impôts et taxes recouvrables sur des tiers',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '443',
    libelle: 'État, TVA facturée',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4431',
    libelle: 'TVA facturée sur ventes',
    classe: 4,
    sousClasse: '443',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4432',
    libelle: 'TVA facturée sur prestations',
    classe: 4,
    sousClasse: '443',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4433',
    libelle: 'TVA facturée sur travaux',
    classe: 4,
    sousClasse: '443',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4434',
    libelle: 'TVA sur factures à établir',
    classe: 4,
    sousClasse: '443',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '444',
    libelle: 'État, impôts sur les bénéfices',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4441',
    libelle: "Impôt sur les bénéfices de l'exercice",
    classe: 4,
    sousClasse: '444',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4442',
    libelle: "Acomptes provisionnels d'IS",
    classe: 4,
    sousClasse: '444',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4449',
    libelle: "Excédent d'IS",
    classe: 4,
    sousClasse: '444',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '445',
    libelle: 'État, TVA récupérable',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4451',
    libelle: 'TVA récupérable sur immobilisations',
    classe: 4,
    sousClasse: '445',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4452',
    libelle: 'TVA récupérable sur achats',
    classe: 4,
    sousClasse: '445',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4453',
    libelle: 'TVA récupérable sur transports',
    classe: 4,
    sousClasse: '445',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4454',
    libelle: 'TVA récupérable sur services extérieurs',
    classe: 4,
    sousClasse: '445',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4455',
    libelle: 'TVA récupérable sur factures non parvenues',
    classe: 4,
    sousClasse: '445',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4456',
    libelle: "TVA transférée par d'autres entités du groupe",
    classe: 4,
    sousClasse: '445',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4458',
    libelle: 'TVA à régulariser ou en attente',
    classe: 4,
    sousClasse: '445',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '446',
    libelle: 'État, autres impôts et taxes',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4461',
    libelle: "Taxes sur le chiffre d'affaires",
    classe: 4,
    sousClasse: '446',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4462',
    libelle: 'Droits de douane',
    classe: 4,
    sousClasse: '446',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4463',
    libelle: 'Taxes sur les salaires',
    classe: 4,
    sousClasse: '446',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4464',
    libelle: 'Patentes et licences',
    classe: 4,
    sousClasse: '446',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4465',
    libelle: 'Taxes foncières',
    classe: 4,
    sousClasse: '446',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4468',
    libelle: 'Autres impôts et taxes',
    classe: 4,
    sousClasse: '446',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '447',
    libelle: 'État, impôts retenus à la source',
    classe: 4,
    sousClasse: '44',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4471',
    libelle: 'Impôt général sur le revenu',
    classe: 4,
    sousClasse: '447',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4472',
    libelle: 'Impôt sur les revenus de capitaux mobiliers',
    classe: 4,
    sousClasse: '447',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4478',
    libelle: 'Autres impôts et taxes retenus à la source',
    classe: 4,
    sousClasse: '447',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '448',
    libelle: 'État, charges à payer et produits à recevoir',
    classe: 4,
    sousClasse: '44',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4481',
    libelle: 'Charges fiscales sur congés à payer',
    classe: 4,
    sousClasse: '448',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4486',
    libelle: 'Charges à payer',
    classe: 4,
    sousClasse: '448',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '4487',
    libelle: 'Produits à recevoir',
    classe: 4,
    sousClasse: '448',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '449',
    libelle: 'État, créances fiscales et précomptes',
    classe: 4,
    sousClasse: '44',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4491',
    libelle: 'État, crédit de TVA à reporter',
    classe: 4,
    sousClasse: '449',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4492',
    libelle: "État, crédit d'impôt",
    classe: 4,
    sousClasse: '449',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4499',
    libelle: 'Autres créances fiscales',
    classe: 4,
    sousClasse: '449',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 45 - ORGANISMES INTERNATIONAUX
  // ============================================================
  {
    numero: '45',
    libelle: 'Organismes internationaux',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '451',
    libelle: 'Opérations avec les organismes africains',
    classe: 4,
    sousClasse: '45',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '452',
    libelle: 'Opérations avec les autres organismes internationaux',
    classe: 4,
    sousClasse: '45',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '458',
    libelle: 'Organismes internationaux, charges à payer',
    classe: 4,
    sousClasse: '45',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 46 - ASSOCIES ET GROUPE
  // ============================================================
  {
    numero: '46',
    libelle: 'Associés et groupe',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '461',
    libelle: 'Associés, opérations sur le capital',
    classe: 4,
    sousClasse: '46',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4611',
    libelle: 'Apporteurs, apports en nature',
    classe: 4,
    sousClasse: '461',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4612',
    libelle: 'Apporteurs, apports en numéraire',
    classe: 4,
    sousClasse: '461',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4613',
    libelle: 'Actionnaires, capital souscrit appelé non versé',
    classe: 4,
    sousClasse: '461',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4614',
    libelle: 'Actionnaires défaillants',
    classe: 4,
    sousClasse: '461',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4615',
    libelle: 'Associés, versements anticipés',
    classe: 4,
    sousClasse: '461',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4618',
    libelle: 'Associés, autres apports',
    classe: 4,
    sousClasse: '461',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '462',
    libelle: 'Associés, comptes courants',
    classe: 4,
    sousClasse: '46',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4621',
    libelle: 'Principal',
    classe: 4,
    sousClasse: '462',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4626',
    libelle: 'Intérêts courus',
    classe: 4,
    sousClasse: '462',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '463',
    libelle: 'Associés, opérations faites en commun et en GIE',
    classe: 4,
    sousClasse: '46',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '464',
    libelle: 'Associés, opérations de capital',
    classe: 4,
    sousClasse: '46',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '465',
    libelle: 'Associés, dividendes à payer',
    classe: 4,
    sousClasse: '46',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '466',
    libelle: 'Groupe, comptes courants',
    classe: 4,
    sousClasse: '46',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4661',
    libelle: 'Groupe, comptes courants débiteurs',
    classe: 4,
    sousClasse: '466',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4662',
    libelle: 'Groupe, comptes courants créditeurs',
    classe: 4,
    sousClasse: '466',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '467',
    libelle: 'Actionnaires, restant dû sur capital appelé',
    classe: 4,
    sousClasse: '46',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 47 - DEBITEURS ET CREDITEURS DIVERS
  // ============================================================
  {
    numero: '47',
    libelle: 'Débiteurs et créditeurs divers',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '471',
    libelle: "Compte d'attente",
    classe: 4,
    sousClasse: '47',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '472',
    libelle: "Créances sur cessions d'immobilisations",
    classe: 4,
    sousClasse: '47',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '473',
    libelle: 'Dettes sur acquisitions de titres de placement',
    classe: 4,
    sousClasse: '47',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '474',
    libelle: 'Répartition périodique des charges et produits',
    classe: 4,
    sousClasse: '47',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4741',
    libelle: 'Charges',
    classe: 4,
    sousClasse: '474',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4748',
    libelle: 'Produits',
    classe: 4,
    sousClasse: '474',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '475',
    libelle: 'Créances sur cessions de titres de placement',
    classe: 4,
    sousClasse: '47',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '476',
    libelle: "Charges constatées d'avance",
    classe: 4,
    sousClasse: '47',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '477',
    libelle: "Produits constatés d'avance",
    classe: 4,
    sousClasse: '47',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '478',
    libelle: 'Écarts de conversion - Actif',
    classe: 4,
    sousClasse: '47',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4781',
    libelle: 'Diminution des créances',
    classe: 4,
    sousClasse: '478',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4782',
    libelle: 'Augmentation des dettes',
    classe: 4,
    sousClasse: '478',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '479',
    libelle: 'Écarts de conversion - Passif',
    classe: 4,
    sousClasse: '47',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4791',
    libelle: 'Augmentation des créances',
    classe: 4,
    sousClasse: '479',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4792',
    libelle: 'Diminution des dettes',
    classe: 4,
    sousClasse: '479',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 48 - CREANCES ET DETTES H.A.O.
  // ============================================================
  {
    numero: '48',
    libelle: 'Créances et dettes H.A.O.',
    classe: 4,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '481',
    libelle: "Fournisseurs d'investissements",
    classe: 4,
    sousClasse: '48',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '482',
    libelle: "Créances sur cessions d'immobilisations",
    classe: 4,
    sousClasse: '48',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '483',
    libelle: 'Dettes sur acquisitions de titres de placement',
    classe: 4,
    sousClasse: '48',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '484',
    libelle: 'Autres créances H.A.O.',
    classe: 4,
    sousClasse: '48',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '485',
    libelle: 'Autres dettes H.A.O.',
    classe: 4,
    sousClasse: '48',
    nature: 'PASSIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '486',
    libelle: 'Créances H.A.O., charges à payer',
    classe: 4,
    sousClasse: '48',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '488',
    libelle: 'Autres créances et dettes H.A.O.',
    classe: 4,
    sousClasse: '48',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 49 - DEPRECIATIONS ET RISQUES PROVISIONNES
  // ============================================================
  {
    numero: '49',
    libelle: 'Dépréciations et risques provisionnés',
    classe: 4,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '491',
    libelle: 'Dépréciations des comptes clients',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4911',
    libelle: 'Créances douteuses',
    classe: 4,
    sousClasse: '491',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '4912',
    libelle: 'Créances litigieuses',
    classe: 4,
    sousClasse: '491',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '492',
    libelle: 'Dépréciations des comptes personnel',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '493',
    libelle: 'Dépréciations des comptes organismes sociaux',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '494',
    libelle: 'Dépréciations des comptes État',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '495',
    libelle: 'Dépréciations des comptes organismes internationaux',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '496',
    libelle: 'Dépréciations des comptes associés et groupe',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '497',
    libelle: 'Dépréciations des comptes débiteurs divers',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '498',
    libelle: 'Dépréciations des comptes de créances H.A.O.',
    classe: 4,
    sousClasse: '49',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  }
]
