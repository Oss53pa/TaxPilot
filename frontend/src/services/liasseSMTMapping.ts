/**
 * Mapping SMT (Systeme Minimal de Tresorerie) - SYSCOHADA Revise 2017
 * Pour les petites entites avec CA < 60M FCFA
 * Structure simplifiee : ~36 lignes vs 65 pour le SN
 */

export interface MappingEntry {
  comptes: string[]
  amortComptes?: string[]
}

export const SMT_MAPPING = {
  // ACTIF SMT (10 lignes)
  actif: {
    AI_1: { // Immobilisations incorporelles
      comptes: ['21'],
      amortComptes: ['281', '291']
    } as MappingEntry,
    AI_2: { // Immobilisations corporelles
      comptes: ['22', '23', '24'],
      amortComptes: ['282', '283', '284', '292', '293', '294']
    } as MappingEntry,
    AI_3: { // Immobilisations financieres
      comptes: ['26', '27'],
      amortComptes: ['296', '297']
    } as MappingEntry,
    AC_1: { // Stocks
      comptes: ['31', '32', '33', '34', '35', '36', '37', '38'],
      amortComptes: ['39']
    } as MappingEntry,
    AC_2: { // Creances clients
      comptes: ['41'],
      amortComptes: ['491']
    } as MappingEntry,
    AC_3: { // Autres creances
      comptes: ['40', '42', '43', '44', '45', '46', '47', '48', '49'],
      amortComptes: ['490', '492', '493', '494', '495', '496', '497']
    } as MappingEntry,
    AC_4: { // Charges constatees d'avance
      comptes: ['476'],
      amortComptes: []
    } as MappingEntry,
    TA_1: { // Banques
      comptes: ['52', '53'],
      amortComptes: []
    } as MappingEntry,
    TA_2: { // Caisse
      comptes: ['57'],
      amortComptes: []
    } as MappingEntry,
    TA_3: { // Autres tresorerie actif
      comptes: ['50', '51', '54', '55', '56', '58'],
      amortComptes: ['590', '591', '592', '593', '594']
    } as MappingEntry,
  },

  // PASSIF SMT (10 lignes)
  passif: {
    CP_1: { // Capital
      comptes: ['101', '102', '103', '104', '105']
    } as MappingEntry,
    CP_2: { // Reserves
      comptes: ['11']
    } as MappingEntry,
    CP_3: { // Report a nouveau
      comptes: ['12']
    } as MappingEntry,
    CP_4: { // Resultat de l'exercice
      comptes: ['13']
    } as MappingEntry,
    CP_5: { // Autres capitaux propres
      comptes: ['14', '106']
    } as MappingEntry,
    DF_1: { // Emprunts et dettes financieres
      comptes: ['16', '17']
    } as MappingEntry,
    PC_1: { // Fournisseurs
      comptes: ['401', '402', '403', '404', '405', '408']
    } as MappingEntry,
    PC_2: { // Dettes fiscales et sociales
      comptes: ['42', '43', '44']
    } as MappingEntry,
    PC_3: { // Autres dettes
      comptes: ['45', '46', '47', '48']
    } as MappingEntry,
    TP_1: { // Tresorerie passif
      comptes: ['52']
    } as MappingEntry,
  },

  // CHARGES SMT (10 lignes)
  charges: {
    CH_1: { // Achats de marchandises
      comptes: ['601']
    } as MappingEntry,
    CH_2: { // Achats de matieres et fournitures
      comptes: ['602', '604', '605', '608']
    } as MappingEntry,
    CH_3: { // Variation de stocks
      comptes: ['603']
    } as MappingEntry,
    CH_4: { // Transports
      comptes: ['61']
    } as MappingEntry,
    CH_5: { // Services exterieurs
      comptes: ['62', '63']
    } as MappingEntry,
    CH_6: { // Impots et taxes
      comptes: ['64']
    } as MappingEntry,
    CH_7: { // Autres charges
      comptes: ['65']
    } as MappingEntry,
    CH_8: { // Charges de personnel
      comptes: ['66']
    } as MappingEntry,
    CH_9: { // Dotations amortissements et provisions
      comptes: ['68', '69']
    } as MappingEntry,
    CH_10: { // Charges financieres et HAO + Impot
      comptes: ['67', '81', '83', '85', '89']
    } as MappingEntry,
  },

  // PRODUITS SMT (6 lignes)
  produits: {
    PR_1: { // Ventes de marchandises
      comptes: ['701']
    } as MappingEntry,
    PR_2: { // Ventes de produits fabriques
      comptes: ['702', '703', '704', '705', '706']
    } as MappingEntry,
    PR_3: { // Production stockee et immobilisee
      comptes: ['72', '73']
    } as MappingEntry,
    PR_4: { // Subventions d'exploitation
      comptes: ['71']
    } as MappingEntry,
    PR_5: { // Autres produits et transferts de charges
      comptes: ['75', '78', '791', '797', '798']
    } as MappingEntry,
    PR_6: { // Produits financiers et HAO
      comptes: ['77', '787', '82', '84', '86', '88']
    } as MappingEntry,
  }
}

/** Libelles pour l'affichage du bilan SMT */
export const SMT_LIBELLES = {
  actif: {
    AI_1: 'Immobilisations incorporelles',
    AI_2: 'Immobilisations corporelles',
    AI_3: 'Immobilisations financieres',
    AC_1: 'Stocks',
    AC_2: 'Creances clients',
    AC_3: 'Autres creances',
    AC_4: 'Charges constatees d\'avance',
    TA_1: 'Banques',
    TA_2: 'Caisse',
    TA_3: 'Autres tresorerie',
  },
  passif: {
    CP_1: 'Capital',
    CP_2: 'Reserves',
    CP_3: 'Report a nouveau',
    CP_4: 'Resultat de l\'exercice',
    CP_5: 'Autres capitaux propres',
    DF_1: 'Emprunts et dettes financieres',
    PC_1: 'Fournisseurs',
    PC_2: 'Dettes fiscales et sociales',
    PC_3: 'Autres dettes',
    TP_1: 'Tresorerie passif',
  },
  charges: {
    CH_1: 'Achats de marchandises',
    CH_2: 'Achats de matieres et fournitures',
    CH_3: 'Variation de stocks',
    CH_4: 'Transports',
    CH_5: 'Services exterieurs',
    CH_6: 'Impots et taxes',
    CH_7: 'Autres charges',
    CH_8: 'Charges de personnel',
    CH_9: 'Dotations amortissements et provisions',
    CH_10: 'Charges financieres, HAO et Impot',
  },
  produits: {
    PR_1: 'Ventes de marchandises',
    PR_2: 'Ventes de produits fabriques',
    PR_3: 'Production stockee et immobilisee',
    PR_4: 'Subventions d\'exploitation',
    PR_5: 'Autres produits et transferts de charges',
    PR_6: 'Produits financiers et HAO',
  },
}
