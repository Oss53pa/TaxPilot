import type { CompteComptable } from '../types'

/**
 * CLASSE 8 - COMPTES DES AUTRES CHARGES ET DES AUTRES PRODUITS
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_8_COMPTES: CompteComptable[] = [
  // ============================================================
  // 81 - VALEURS COMPTABLES DES CESSIONS D'IMMOBILISATIONS
  // ============================================================
  {
    numero: '81',
    libelle: 'Valeurs comptables des cessions d\'immobilisations',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '811',
    libelle: 'Immobilisations incorporelles',
    classe: 8,
    sousClasse: '81',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '812',
    libelle: 'Immobilisations corporelles',
    classe: 8,
    sousClasse: '81',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '813',
    libelle: 'Immobilisations financières',
    classe: 8,
    sousClasse: '81',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '816',
    libelle: 'Valeurs comptables des cessions de biens mis en concession',
    classe: 8,
    sousClasse: '81',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 82 - PRODUITS DES CESSIONS D'IMMOBILISATIONS
  // ============================================================
  {
    numero: '82',
    libelle: 'Produits des cessions d\'immobilisations',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '821',
    libelle: 'Immobilisations incorporelles',
    classe: 8,
    sousClasse: '82',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '822',
    libelle: 'Immobilisations corporelles',
    classe: 8,
    sousClasse: '82',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '823',
    libelle: 'Immobilisations financières',
    classe: 8,
    sousClasse: '82',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '826',
    libelle: 'Produits des cessions de biens mis en concession',
    classe: 8,
    sousClasse: '82',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 83 - CHARGES HORS ACTIVITES ORDINAIRES
  // ============================================================
  {
    numero: '83',
    libelle: 'Charges hors activités ordinaires',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '831',
    libelle: 'Charges H.A.O. constatées',
    classe: 8,
    sousClasse: '83',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '834',
    libelle: 'Pertes sur créances H.A.O.',
    classe: 8,
    sousClasse: '83',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '835',
    libelle: 'Dons et libéralités accordés',
    classe: 8,
    sousClasse: '83',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '836',
    libelle: 'Abandons de créances consentis',
    classe: 8,
    sousClasse: '83',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '838',
    libelle: 'Autres charges H.A.O.',
    classe: 8,
    sousClasse: '83',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '839',
    libelle: 'Charges provisionnées H.A.O.',
    classe: 8,
    sousClasse: '83',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 84 - PRODUITS HORS ACTIVITES ORDINAIRES
  // ============================================================
  {
    numero: '84',
    libelle: 'Produits hors activités ordinaires',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '841',
    libelle: 'Produits H.A.O. constatés',
    classe: 8,
    sousClasse: '84',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '845',
    libelle: 'Dons et libéralités obtenus',
    classe: 8,
    sousClasse: '84',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '846',
    libelle: 'Abandons de créances obtenus',
    classe: 8,
    sousClasse: '84',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '848',
    libelle: 'Autres produits H.A.O.',
    classe: 8,
    sousClasse: '84',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '849',
    libelle: 'Reprises de charges provisionnées H.A.O.',
    classe: 8,
    sousClasse: '84',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 85 - DOTATIONS HORS ACTIVITES ORDINAIRES
  // ============================================================
  {
    numero: '85',
    libelle: 'Dotations hors activités ordinaires',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '851',
    libelle: 'Dotations aux provisions réglementées',
    classe: 8,
    sousClasse: '85',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8511',
    libelle: 'Amortissements dérogatoires',
    classe: 8,
    sousClasse: '851',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8512',
    libelle: 'Plus-values de cession à réinvestir',
    classe: 8,
    sousClasse: '851',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8518',
    libelle: 'Autres provisions réglementées',
    classe: 8,
    sousClasse: '851',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '852',
    libelle: 'Dotations aux amortissements H.A.O.',
    classe: 8,
    sousClasse: '85',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '853',
    libelle: 'Dotations aux dépréciations H.A.O.',
    classe: 8,
    sousClasse: '85',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8531',
    libelle: 'Dépréciations des immobilisations',
    classe: 8,
    sousClasse: '853',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8532',
    libelle: 'Dépréciations des stocks',
    classe: 8,
    sousClasse: '853',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8533',
    libelle: 'Dépréciations des créances et des comptes de trésorerie',
    classe: 8,
    sousClasse: '853',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '854',
    libelle: 'Dotations aux provisions pour risques et charges H.A.O.',
    classe: 8,
    sousClasse: '85',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '858',
    libelle: 'Autres dotations H.A.O.',
    classe: 8,
    sousClasse: '85',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 86 - REPRISES HORS ACTIVITES ORDINAIRES
  // ============================================================
  {
    numero: '86',
    libelle: 'Reprises hors activités ordinaires',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '861',
    libelle: 'Reprises de provisions réglementées',
    classe: 8,
    sousClasse: '86',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8611',
    libelle: 'Amortissements dérogatoires',
    classe: 8,
    sousClasse: '861',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8612',
    libelle: 'Plus-values de cession à réinvestir',
    classe: 8,
    sousClasse: '861',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8618',
    libelle: 'Autres provisions réglementées',
    classe: 8,
    sousClasse: '861',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '862',
    libelle: 'Reprises d\'amortissements H.A.O.',
    classe: 8,
    sousClasse: '86',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '863',
    libelle: 'Reprises de dépréciations H.A.O.',
    classe: 8,
    sousClasse: '86',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8631',
    libelle: 'Dépréciations des immobilisations',
    classe: 8,
    sousClasse: '863',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8632',
    libelle: 'Dépréciations des stocks',
    classe: 8,
    sousClasse: '863',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '8633',
    libelle: 'Dépréciations des créances et des comptes de trésorerie',
    classe: 8,
    sousClasse: '863',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '864',
    libelle: 'Reprises de provisions pour risques et charges H.A.O.',
    classe: 8,
    sousClasse: '86',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '868',
    libelle: 'Autres reprises H.A.O.',
    classe: 8,
    sousClasse: '86',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '869',
    libelle: 'Reprises de charges provisionnées H.A.O.',
    classe: 8,
    sousClasse: '86',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 87 - PARTICIPATION DES TRAVAILLEURS
  // ============================================================
  {
    numero: '87',
    libelle: 'Participation des travailleurs',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '871',
    libelle: 'Participation légale aux bénéfices',
    classe: 8,
    sousClasse: '87',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '872',
    libelle: 'Participation contractuelle aux bénéfices',
    classe: 8,
    sousClasse: '87',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '874',
    libelle: 'Participation facultative aux bénéfices',
    classe: 8,
    sousClasse: '87',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '878',
    libelle: 'Autres charges de participation',
    classe: 8,
    sousClasse: '87',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 88 - SUBVENTIONS D'EQUILIBRE
  // ============================================================
  {
    numero: '88',
    libelle: 'Subventions d\'équilibre',
    classe: 8,
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '881',
    libelle: 'Subventions d\'équilibre reçues de l\'État',
    classe: 8,
    sousClasse: '88',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '882',
    libelle: 'Subventions d\'équilibre reçues d\'autres organismes',
    classe: 8,
    sousClasse: '88',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '886',
    libelle: 'Abandons de créances à caractère financier',
    classe: 8,
    sousClasse: '88',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '888',
    libelle: 'Autres subventions d\'équilibre',
    classe: 8,
    sousClasse: '88',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 89 - IMPOTS SUR LE RESULTAT
  // ============================================================
  {
    numero: '89',
    libelle: 'Impôts sur le résultat',
    classe: 8,
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '891',
    libelle: 'Impôts sur les bénéfices de l\'exercice',
    classe: 8,
    sousClasse: '89',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '8911',
    libelle: 'Activités exercées dans l\'État',
    classe: 8,
    sousClasse: '891',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'OBLIGATOIRE'
  },
  {
    numero: '8912',
    libelle: 'Activités exercées dans les autres États',
    classe: 8,
    sousClasse: '891',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '892',
    libelle: 'Rappels d\'impôts sur les résultats',
    classe: 8,
    sousClasse: '89',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '895',
    libelle: 'Impôts minimum forfaitaire (IMF)',
    classe: 8,
    sousClasse: '89',
    nature: 'CHARGE',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '899',
    libelle: 'Dégrèvements et annulations d\'impôts sur résultats',
    classe: 8,
    sousClasse: '89',
    nature: 'PRODUIT',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  }
]
