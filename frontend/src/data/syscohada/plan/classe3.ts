import type { CompteComptable } from '../types'

/**
 * CLASSE 3 - COMPTES DE STOCKS
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_3_COMPTES: CompteComptable[] = [
  // ============================================================
  // 31 - MARCHANDISES
  // ============================================================
  {
    numero: '31',
    libelle: 'Marchandises',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['COMMERCE', 'DISTRIBUTION']
  },
  {
    numero: '311',
    libelle: 'Marchandises A',
    classe: 3,
    sousClasse: '31',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '312',
    libelle: 'Marchandises B',
    classe: 3,
    sousClasse: '31',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '313',
    libelle: 'Marchandises C',
    classe: 3,
    sousClasse: '31',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '318',
    libelle: 'Autres marchandises',
    classe: 3,
    sousClasse: '31',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 32 - MATIERES PREMIERES ET FOURNITURES LIEES
  // ============================================================
  {
    numero: '32',
    libelle: 'Matières premières et fournitures liées',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '321',
    libelle: 'Matières premières',
    classe: 3,
    sousClasse: '32',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '322',
    libelle: 'Matières et fournitures consommables',
    classe: 3,
    sousClasse: '32',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '3221',
    libelle: 'Combustibles',
    classe: 3,
    sousClasse: '322',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3222',
    libelle: "Produits d'entretien",
    classe: 3,
    sousClasse: '322',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3223',
    libelle: "Fournitures d'atelier et d'usine",
    classe: 3,
    sousClasse: '322',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3224',
    libelle: 'Fournitures de magasin',
    classe: 3,
    sousClasse: '322',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3225',
    libelle: 'Fournitures de bureau',
    classe: 3,
    sousClasse: '322',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '323',
    libelle: 'Emballages',
    classe: 3,
    sousClasse: '32',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3231',
    libelle: 'Emballages perdus',
    classe: 3,
    sousClasse: '323',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3232',
    libelle: 'Emballages récupérables non identifiables',
    classe: 3,
    sousClasse: '323',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3233',
    libelle: 'Emballages à usage mixte',
    classe: 3,
    sousClasse: '323',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 33 - AUTRES APPROVISIONNEMENTS
  // ============================================================
  {
    numero: '33',
    libelle: 'Autres approvisionnements',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '331',
    libelle: 'Matières consommables',
    classe: 3,
    sousClasse: '33',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '332',
    libelle: 'Fournitures consommables',
    classe: 3,
    sousClasse: '33',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3321',
    libelle: 'Combustibles',
    classe: 3,
    sousClasse: '332',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3322',
    libelle: "Produits d'entretien",
    classe: 3,
    sousClasse: '332',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3323',
    libelle: "Fournitures d'atelier et d'usine",
    classe: 3,
    sousClasse: '332',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3324',
    libelle: 'Fournitures de magasin',
    classe: 3,
    sousClasse: '332',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3325',
    libelle: 'Fournitures de bureau',
    classe: 3,
    sousClasse: '332',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '333',
    libelle: 'Emballages',
    classe: 3,
    sousClasse: '33',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3331',
    libelle: 'Emballages perdus',
    classe: 3,
    sousClasse: '333',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3332',
    libelle: 'Emballages récupérables non identifiables',
    classe: 3,
    sousClasse: '333',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '3333',
    libelle: 'Emballages à usage mixte',
    classe: 3,
    sousClasse: '333',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 34 - PRODUITS EN COURS
  // ============================================================
  {
    numero: '34',
    libelle: 'Produits en cours',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '341',
    libelle: 'Produits en cours',
    classe: 3,
    sousClasse: '34',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '342',
    libelle: 'Travaux en cours',
    classe: 3,
    sousClasse: '34',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '343',
    libelle: 'Produits intermédiaires en cours',
    classe: 3,
    sousClasse: '34',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '344',
    libelle: 'Produits résiduels en cours',
    classe: 3,
    sousClasse: '34',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 35 - SERVICES EN COURS
  // ============================================================
  {
    numero: '35',
    libelle: 'Services en cours',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF',
    secteurs: ['SERVICES']
  },
  {
    numero: '351',
    libelle: 'Études en cours',
    classe: 3,
    sousClasse: '35',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '352',
    libelle: 'Prestations de services en cours',
    classe: 3,
    sousClasse: '35',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 36 - PRODUITS FINIS
  // ============================================================
  {
    numero: '36',
    libelle: 'Produits finis',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '361',
    libelle: 'Produits finis A',
    classe: 3,
    sousClasse: '36',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '362',
    libelle: 'Produits finis B',
    classe: 3,
    sousClasse: '36',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '363',
    libelle: 'Produits finis C',
    classe: 3,
    sousClasse: '36',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '368',
    libelle: 'Autres produits finis',
    classe: 3,
    sousClasse: '36',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 37 - PRODUITS INTERMEDIAIRES ET RESIDUELS
  // ============================================================
  {
    numero: '37',
    libelle: 'Produits intermédiaires et résiduels',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '371',
    libelle: 'Produits intermédiaires',
    classe: 3,
    sousClasse: '37',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '372',
    libelle: 'Produits résiduels (déchets, rebuts)',
    classe: 3,
    sousClasse: '37',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 38 - STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DEPOT
  // ============================================================
  {
    numero: '38',
    libelle: 'Stocks en cours de route, en consignation ou en dépôt',
    classe: 3,
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '381',
    libelle: 'Stocks en cours de route',
    classe: 3,
    sousClasse: '38',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '382',
    libelle: 'Stocks en consignation ou en dépôt',
    classe: 3,
    sousClasse: '38',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '383',
    libelle: "Stocks provenant d'immobilisations mises hors service",
    classe: 3,
    sousClasse: '38',
    nature: 'ACTIF',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 39 - DEPRECIATIONS DES STOCKS
  // ============================================================
  {
    numero: '39',
    libelle: 'Dépréciations des stocks',
    classe: 3,
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '391',
    libelle: 'Dépréciations des marchandises',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '392',
    libelle: 'Dépréciations des matières premières',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '393',
    libelle: 'Dépréciations des autres approvisionnements',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '394',
    libelle: 'Dépréciations des produits en cours',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '395',
    libelle: 'Dépréciations des services en cours',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '396',
    libelle: 'Dépréciations des produits finis',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '397',
    libelle: 'Dépréciations des produits intermédiaires et résiduels',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '398',
    libelle: 'Dépréciations des stocks en cours de route',
    classe: 3,
    sousClasse: '39',
    nature: 'ACTIF',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  }
]
