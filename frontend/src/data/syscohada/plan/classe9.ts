import type { CompteComptable } from '../types'

/**
 * CLASSE 9 - COMPTES DES ENGAGEMENTS HORS BILAN ET COMPTABILITE ANALYTIQUE
 * Plan comptable SYSCOHADA Révisé (2017)
 */
export const CLASSE_9_COMPTES: CompteComptable[] = [
  // ============================================================
  // 90 - COMPTES DE FLUX EN ENGAGEMENT
  // ============================================================
  {
    numero: '90',
    libelle: 'Comptes de flux en engagement',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '901',
    libelle: 'Engagements de financement accordés',
    classe: 9,
    sousClasse: '90',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '902',
    libelle: 'Engagements de financement obtenus',
    classe: 9,
    sousClasse: '90',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '903',
    libelle: 'Engagements de garantie donnés',
    classe: 9,
    sousClasse: '90',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '904',
    libelle: 'Engagements de garantie obtenus',
    classe: 9,
    sousClasse: '90',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '905',
    libelle: 'Engagements réciproques',
    classe: 9,
    sousClasse: '90',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '906',
    libelle: 'Biens détenus en fiducie',
    classe: 9,
    sousClasse: '90',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 91 - CONTREPARTIE DES ENGAGEMENTS
  // ============================================================
  {
    numero: '91',
    libelle: 'Contrepartie des engagements',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '911',
    libelle: 'Contrepartie des engagements de financement accordés',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '912',
    libelle: 'Contrepartie des engagements de financement obtenus',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '913',
    libelle: 'Contrepartie des engagements de garantie donnés',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '914',
    libelle: 'Contrepartie des engagements de garantie obtenus',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '915',
    libelle: 'Contrepartie des engagements réciproques',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '916',
    libelle: 'Contrepartie des biens détenus en fiducie',
    classe: 9,
    sousClasse: '91',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 92 - COMPTABILITE ANALYTIQUE DE GESTION - COMPTES REFLECHIS
  // ============================================================
  {
    numero: '92',
    libelle: 'Comptabilité analytique de gestion - Comptes réfléchis',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '921',
    libelle: 'Comptes réfléchis d\'achats',
    classe: 9,
    sousClasse: '92',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '922',
    libelle: 'Comptes réfléchis de charges',
    classe: 9,
    sousClasse: '92',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '923',
    libelle: 'Comptes réfléchis de produits',
    classe: 9,
    sousClasse: '92',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '924',
    libelle: 'Comptes réfléchis de stocks',
    classe: 9,
    sousClasse: '92',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 93 - COMPTABILITE ANALYTIQUE - COUTS
  // ============================================================
  {
    numero: '93',
    libelle: 'Comptabilité analytique - Coûts',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '931',
    libelle: 'Coûts d\'achat',
    classe: 9,
    sousClasse: '93',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '932',
    libelle: 'Coûts de production',
    classe: 9,
    sousClasse: '93',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '933',
    libelle: 'Coûts de distribution',
    classe: 9,
    sousClasse: '93',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '934',
    libelle: 'Coûts d\'administration',
    classe: 9,
    sousClasse: '93',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '935',
    libelle: 'Coûts de revient',
    classe: 9,
    sousClasse: '93',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '938',
    libelle: 'Autres coûts',
    classe: 9,
    sousClasse: '93',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 94 - INVENTAIRE PERMANENT DES STOCKS
  // ============================================================
  {
    numero: '94',
    libelle: 'Inventaire permanent des stocks',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '941',
    libelle: 'Stocks de matières',
    classe: 9,
    sousClasse: '94',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '942',
    libelle: 'Stocks de produits finis',
    classe: 9,
    sousClasse: '94',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '943',
    libelle: 'Stocks d\'en-cours',
    classe: 9,
    sousClasse: '94',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 95 - COMPTES DE SECTIONS ANALYTIQUES
  // ============================================================
  {
    numero: '95',
    libelle: 'Comptes de sections analytiques',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '951',
    libelle: 'Sections principales',
    classe: 9,
    sousClasse: '95',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '952',
    libelle: 'Sections auxiliaires',
    classe: 9,
    sousClasse: '95',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 96 - ECARTS SUR COUTS PREVISIONNELS
  // ============================================================
  {
    numero: '96',
    libelle: 'Écarts sur coûts prévisionnels',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '961',
    libelle: 'Écarts sur matières',
    classe: 9,
    sousClasse: '96',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '962',
    libelle: 'Écarts sur main d\'oeuvre',
    classe: 9,
    sousClasse: '96',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '963',
    libelle: 'Écarts sur charges indirectes',
    classe: 9,
    sousClasse: '96',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 97 - RESULTATS ANALYTIQUES
  // ============================================================
  {
    numero: '97',
    libelle: 'Résultats analytiques',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '971',
    libelle: 'Résultats analytiques sur produits',
    classe: 9,
    sousClasse: '97',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '972',
    libelle: 'Résultats analytiques sur commandes',
    classe: 9,
    sousClasse: '97',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '973',
    libelle: 'Résultats analytiques sur activités',
    classe: 9,
    sousClasse: '97',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 98 - COMPTES DE LIAISON INTERETABLISSEMENTS ANALYTIQUES
  // ============================================================
  {
    numero: '98',
    libelle: 'Comptes de liaison interétablissements analytiques',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '981',
    libelle: 'Comptes de liaison envois',
    classe: 9,
    sousClasse: '98',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '982',
    libelle: 'Comptes de liaison réceptions',
    classe: 9,
    sousClasse: '98',
    nature: 'SPECIAL',
    sens: 'CREDITEUR',
    utilisation: 'FACULTATIF'
  },

  // ============================================================
  // 99 - COMPTES D'AJUSTEMENT INTERNE
  // ============================================================
  {
    numero: '99',
    libelle: 'Comptes d\'ajustement interne',
    classe: 9,
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '991',
    libelle: 'Différences d\'incorporation',
    classe: 9,
    sousClasse: '99',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '995',
    libelle: 'Différences d\'imputation',
    classe: 9,
    sousClasse: '99',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  },
  {
    numero: '998',
    libelle: 'Résultats de la comptabilité analytique',
    classe: 9,
    sousClasse: '99',
    nature: 'SPECIAL',
    sens: 'DEBITEUR',
    utilisation: 'FACULTATIF'
  }
]
