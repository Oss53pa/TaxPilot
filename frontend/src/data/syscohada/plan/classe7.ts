import type { CompteComptable } from '../types'

/**
 * CLASSE 7 - COMPTES DE PRODUITS
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_7_COMPTES: CompteComptable[] = [
  // ============================================================
  // 70 - VENTES DE MARCHANDISES
  // ============================================================
  {
    numero: '70',
    libelle: 'Ventes de marchandises',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['COMMERCE']
  },
  {
    numero: '701',
    libelle: 'Ventes de marchandises A dans la Région',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '702',
    libelle: 'Ventes de marchandises A hors Région',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '703',
    libelle: 'Ventes de marchandises B dans la Région',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '704',
    libelle: 'Ventes de marchandises B hors Région',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '706',
    libelle: 'Ports, emballages perdus et autres frais facturés',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '707',
    libelle: 'Produits accessoires',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '709',
    libelle: 'Rabais, remises et ristournes accordés',
    classe: 7,
    sousClasse: '70',
    nature: 'PRODUIT',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 71 - VENTES DE PRODUITS FABRIQUES
  // ============================================================
  {
    numero: '71',
    libelle: 'Ventes de produits fabriqués',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['INDUSTRIE', 'PRODUCTION']
  },
  {
    numero: '711',
    libelle: 'Ventes de produits finis',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '712',
    libelle: 'Ventes de produits intermédiaires',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '713',
    libelle: 'Ventes de produits résiduels',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '715',
    libelle: 'Ports, emballages perdus et autres frais facturés',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '716',
    libelle: 'Produits accessoires',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '719',
    libelle: 'Rabais, remises et ristournes accordés',
    classe: 7,
    sousClasse: '71',
    nature: 'PRODUIT',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 72 - VENTES DE PRESTATIONS DE SERVICES
  // ============================================================
  {
    numero: '72',
    libelle: 'Ventes de prestations de services',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE',
    secteurs: ['SERVICES']
  },
  {
    numero: '721',
    libelle: 'Ventes de services vendus dans la Région',
    classe: 7,
    sousClasse: '72',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '722',
    libelle: 'Ventes de services vendus hors Région',
    classe: 7,
    sousClasse: '72',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '726',
    libelle: 'Ports et frais accessoires facturés',
    classe: 7,
    sousClasse: '72',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '729',
    libelle: 'Rabais, remises et ristournes accordés',
    classe: 7,
    sousClasse: '72',
    nature: 'PRODUIT',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 73 - VARIATIONS DE STOCKS DE BIENS PRODUITS ET EN COURS
  // ============================================================
  {
    numero: '73',
    libelle: 'Variations de stocks de biens produits et en cours',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '731',
    libelle: 'Variations des stocks de produits en cours',
    classe: 7,
    sousClasse: '73',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '732',
    libelle: 'Variations des stocks de services en cours',
    classe: 7,
    sousClasse: '73',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '733',
    libelle: 'Variations des stocks de produits finis',
    classe: 7,
    sousClasse: '73',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '734',
    libelle: 'Variations des stocks de produits intermédiaires et résiduels',
    classe: 7,
    sousClasse: '73',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '736',
    libelle: 'Variations des stocks de biens mis en concession',
    classe: 7,
    sousClasse: '73',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 74 - PRODUCTIONS IMMOBILISEES
  // ============================================================
  {
    numero: '74',
    libelle: 'Productions immobilisées',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '741',
    libelle: 'Productions immobilisées incorporelles',
    classe: 7,
    sousClasse: '74',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '742',
    libelle: 'Productions immobilisées corporelles',
    classe: 7,
    sousClasse: '74',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 75 - AUTRES PRODUITS
  // ============================================================
  {
    numero: '75',
    libelle: 'Autres produits',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '751',
    libelle: 'Redevances pour brevets, licences, logiciels et droits similaires',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '752',
    libelle: 'Revenus des immeubles non affectés aux activités professionnelles',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '753',
    libelle: 'Jetons de présence et rémunérations d\'administrateurs',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '754',
    libelle: 'Produits des cessions courantes d\'immobilisations',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '755',
    libelle: 'Quote-part de résultat sur opérations faites en commun',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7551',
    libelle: 'Quote-part transférée de perte',
    classe: 7,
    sousClasse: '755',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7555',
    libelle: 'Bénéfice imputé par transfert',
    classe: 7,
    sousClasse: '755',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '758',
    libelle: 'Produits divers',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7581',
    libelle: 'Indemnités de fonction et autres rémunérations d\'administrateurs',
    classe: 7,
    sousClasse: '758',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7582',
    libelle: 'Indemnités d\'assurances reçues',
    classe: 7,
    sousClasse: '758',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7588',
    libelle: 'Autres produits divers',
    classe: 7,
    sousClasse: '758',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '759',
    libelle: 'Reprises de charges provisionnées d\'exploitation',
    classe: 7,
    sousClasse: '75',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7591',
    libelle: 'sur risques à court terme',
    classe: 7,
    sousClasse: '759',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7593',
    libelle: 'sur stocks',
    classe: 7,
    sousClasse: '759',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7594',
    libelle: 'sur créances',
    classe: 7,
    sousClasse: '759',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7598',
    libelle: 'sur autres charges provisionnées',
    classe: 7,
    sousClasse: '759',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 77 - REVENUS FINANCIERS ET PRODUITS ASSIMILES
  // ============================================================
  {
    numero: '77',
    libelle: 'Revenus financiers et produits assimilés',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '771',
    libelle: 'Intérêts de prêts',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '772',
    libelle: 'Revenus de participations',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '773',
    libelle: 'Escomptes obtenus',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '774',
    libelle: 'Revenus de titres de placement',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '775',
    libelle: 'Revenus des créances commerciales',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '776',
    libelle: 'Gains de change',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '777',
    libelle: 'Gains sur cessions de titres de placement',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '778',
    libelle: 'Gains sur risques financiers',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7781',
    libelle: 'Gains de change sur créances commerciales',
    classe: 7,
    sousClasse: '778',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7782',
    libelle: 'Gains de change sur dettes commerciales',
    classe: 7,
    sousClasse: '778',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7784',
    libelle: 'Gains de change sur opérations financières',
    classe: 7,
    sousClasse: '778',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7788',
    libelle: 'Autres gains sur risques financiers',
    classe: 7,
    sousClasse: '778',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '779',
    libelle: 'Reprises de charges provisionnées financières',
    classe: 7,
    sousClasse: '77',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7791',
    libelle: 'sur risques financiers',
    classe: 7,
    sousClasse: '779',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7795',
    libelle: 'sur titres de placement',
    classe: 7,
    sousClasse: '779',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7798',
    libelle: 'sur autres risques financiers',
    classe: 7,
    sousClasse: '779',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 78 - TRANSFERTS DE CHARGES
  // ============================================================
  {
    numero: '78',
    libelle: 'Transferts de charges',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '781',
    libelle: 'Transferts de charges d\'exploitation',
    classe: 7,
    sousClasse: '78',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '787',
    libelle: 'Transferts de charges financières',
    classe: 7,
    sousClasse: '78',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 79 - REPRISES DE PROVISIONS
  // ============================================================
  {
    numero: '79',
    libelle: 'Reprises de provisions',
    classe: 7,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '791',
    libelle: 'Reprises de provisions d\'exploitation',
    classe: 7,
    sousClasse: '79',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7911',
    libelle: 'pour risques d\'exploitation',
    classe: 7,
    sousClasse: '791',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7912',
    libelle: 'pour grosses réparations',
    classe: 7,
    sousClasse: '791',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7913',
    libelle: 'pour dépréciation des immobilisations incorporelles',
    classe: 7,
    sousClasse: '791',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7914',
    libelle: 'pour dépréciation des immobilisations corporelles',
    classe: 7,
    sousClasse: '791',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '797',
    libelle: 'Reprises de provisions financières',
    classe: 7,
    sousClasse: '79',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7971',
    libelle: 'pour risques financiers',
    classe: 7,
    sousClasse: '797',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '7972',
    libelle: 'pour dépréciation des immobilisations financières',
    classe: 7,
    sousClasse: '797',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '798',
    libelle: 'Reprises d\'amortissements',
    classe: 7,
    sousClasse: '79',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  }
]
