/**
 * Configuration complète des onglets de la Liasse Fiscale SYSCOHADA
 * Basé sur le fichier Excel : Liasse_systeme_normal_2024_V9_AJM_23052025-REV PA.xlsx
 */

export interface SheetConfig {
  id: string
  name: string
  title: string
  category: 'cover' | 'guards' | 'fiches' | 'statements' | 'notes' | 'supplements' | 'comments'
  order: number
  required: boolean
  hasComments: boolean
  description?: string
  columns?: ColumnConfig[]
  validation?: ValidationRule[]
}

export interface ColumnConfig {
  id: string
  label: string
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'formula'
  width?: string
  editable: boolean
  required?: boolean
  formula?: string
}

export interface ValidationRule {
  type: 'required' | 'sum' | 'balance' | 'range' | 'format'
  field?: string
  message: string
  severity: 'error' | 'warning'
}

export const LIASSE_SHEETS: SheetConfig[] = [
  // Pages de garde et administration
  {
    id: 'couverture',
    name: 'COUVERTURE',
    title: 'Page de Couverture',
    category: 'cover',
    order: 1,
    required: true,
    hasComments: true,
    description: 'Page de couverture de la liasse fiscale'
  },
  {
    id: 'tables_calcul_impots',
    name: 'TABLES_CALCUL_IMPOTS',
    title: 'Tables de Calcul des Impôts',
    category: 'supplements',
    order: 2,
    required: true,
    hasComments: true,
    description: 'Calculs automatiques IS, TVA, taxes diverses selon pays OHADA'
  },
  {
    id: 'tableaux_supplementaires', 
    name: 'TABLEAUX_SUPPLEMENTAIRES',
    title: 'Tableaux Supplémentaires',
    category: 'supplements',
    order: 3,
    required: true,
    hasComments: true,
    description: 'Effectif, filiales, engagements hors bilan'
  },
  {
    id: 'garde',
    name: 'GARDE',
    title: 'Page de Garde',
    category: 'guards',
    order: 2,
    required: true,
    hasComments: true,
    description: 'Informations générales de l\'entreprise'
  },
  {
    id: 'recevabilite',
    name: 'RECEVABILITE',
    title: 'Recevabilité',
    category: 'guards',
    order: 3,
    required: true,
    hasComments: true,
    description: 'Critères de recevabilité de la déclaration'
  },

  // Tables de référence
  {
    id: 'note36_codes',
    name: 'NOTE36 (TABLE DES CODES)',
    title: 'Note 36 - Table des Codes',
    category: 'notes',
    order: 4,
    required: false,
    hasComments: true,
    description: 'Table de référence des codes comptables'
  },
  {
    id: 'note36_nomenclature',
    name: 'NOTE36 Suite (Nomenclature)',
    title: 'Note 36 - Nomenclature',
    category: 'notes',
    order: 5,
    required: false,
    hasComments: true,
    description: 'Nomenclature comptable détaillée'
  },

  // Fiches R1 à R4
  {
    id: 'fiche_r1',
    name: 'FICHE R1',
    title: 'Fiche R1 - Renseignements Généraux',
    category: 'fiches',
    order: 6,
    required: true,
    hasComments: true,
    description: 'Identification et renseignements généraux'
  },
  {
    id: 'fiche_r2',
    name: 'FICHE R2',
    title: 'Fiche R2 - Dirigeants et CAC',
    category: 'fiches',
    order: 7,
    required: true,
    hasComments: true,
    description: 'Dirigeants et commissaires aux comptes'
  },
  {
    id: 'fiche_r3',
    name: 'FICHE R3',
    title: 'Fiche R3 - Participations',
    category: 'fiches',
    order: 8,
    required: true,
    hasComments: true,
    description: 'Participations et filiales'
  },
  {
    id: 'fiche_r4',
    name: 'FICHE R4',
    title: 'Fiche R4 - Informations Complémentaires',
    category: 'fiches',
    order: 14,
    required: false,
    hasComments: true,
    description: 'Informations complémentaires'
  },

  // États Financiers Principaux
  {
    id: 'bilan',
    name: 'BILAN',
    title: 'Bilan Synthétique',
    category: 'statements',
    order: 9,
    required: true,
    hasComments: true,
    description: 'Bilan synthétique de l\'exercice'
  },
  {
    id: 'actif',
    name: 'ACTIF',
    title: 'Bilan - Actif',
    category: 'statements',
    order: 10,
    required: true,
    hasComments: true,
    description: 'Détail de l\'actif du bilan',
    columns: [
      { id: 'ref', label: 'Réf', type: 'text', editable: false, width: '80px' },
      { id: 'poste', label: 'ACTIF', type: 'text', editable: false, width: '400px' },
      { id: 'note', label: 'Note', type: 'text', editable: true, width: '80px' },
      { id: 'brut', label: 'Brut', type: 'currency', editable: true, width: '150px' },
      { id: 'amort_prov', label: 'Amort./Prov.', type: 'currency', editable: true, width: '150px' },
      { id: 'net', label: 'Net', type: 'currency', editable: false, width: '150px', formula: 'brut - amort_prov' },
      { id: 'net_n1', label: 'Net N-1', type: 'currency', editable: true, width: '150px' }
    ]
  },
  {
    id: 'passif',
    name: 'PASSIF',
    title: 'Bilan - Passif',
    category: 'statements',
    order: 11,
    required: true,
    hasComments: true,
    description: 'Détail du passif du bilan',
    columns: [
      { id: 'ref', label: 'Réf', type: 'text', editable: false, width: '80px' },
      { id: 'poste', label: 'PASSIF', type: 'text', editable: false, width: '400px' },
      { id: 'note', label: 'Note', type: 'text', editable: true, width: '80px' },
      { id: 'net', label: 'Net', type: 'currency', editable: true, width: '150px' },
      { id: 'net_n1', label: 'Net N-1', type: 'currency', editable: true, width: '150px' }
    ]
  },
  {
    id: 'resultat',
    name: 'RESULTAT',
    title: 'Compte de Résultat',
    category: 'statements',
    order: 12,
    required: true,
    hasComments: true,
    description: 'Compte de résultat de l\'exercice',
    columns: [
      { id: 'ref', label: 'Réf', type: 'text', editable: false, width: '80px' },
      { id: 'libelle', label: 'Libellé', type: 'text', editable: false, width: '400px' },
      { id: 'note', label: 'Note', type: 'text', editable: true, width: '80px' },
      { id: 'montant', label: 'Exercice N', type: 'currency', editable: true, width: '150px' },
      { id: 'montant_n1', label: 'Exercice N-1', type: 'currency', editable: true, width: '150px' }
    ]
  },
  {
    id: 'tft',
    name: 'TFT',
    title: 'Tableau de Flux de Trésorerie',
    category: 'statements',
    order: 13,
    required: true,
    hasComments: true,
    description: 'Tableau des flux de trésorerie'
  },

  // Notes annexes — liste explicite avec sous-notes
  ...[1, 2].map(n => ({
    id: `note${n}`, name: `NOTE ${n}`, title: `Note ${n} - ${getNoteTitle(n)}`,
    category: 'notes' as const, order: 15 + n - 1, required: isNoteRequired(n), hasComments: true, description: getNoteDescription(n),
  })),
  // Note 3 supprimée → sous-notes 3A-3E
  { id: 'note3a', name: 'NOTE 3A', title: `Note 3A - ${getSubNoteTitle('3A')}`, category: 'notes' as const, order: 17, required: true, hasComments: true, description: 'Mouvements des immobilisations brutes' },
  { id: 'note3b', name: 'NOTE 3B', title: `Note 3B - ${getSubNoteTitle('3B')}`, category: 'notes' as const, order: 18, required: true, hasComments: true, description: 'Biens pris en location-acquisition (crédit-bail retraité)' },
  { id: 'note3c', name: 'NOTE 3C', title: `Note 3C - ${getSubNoteTitle('3C')}`, category: 'notes' as const, order: 19, required: true, hasComments: true, description: 'Mouvements des amortissements' },
  { id: 'note3c_bis', name: 'NOTE 3C BIS', title: `Note 3C BIS - ${getSubNoteTitle('3C_BIS')}`, category: 'notes' as const, order: 20, required: true, hasComments: true, description: 'Mouvements des dépréciations' },
  { id: 'note3d', name: 'NOTE 3D', title: `Note 3D - ${getSubNoteTitle('3D')}`, category: 'notes' as const, order: 21, required: false, hasComments: true, description: 'Plus et moins-values de cession d\'immobilisations' },
  { id: 'note3e', name: 'NOTE 3E', title: `Note 3E - ${getSubNoteTitle('3E')}`, category: 'notes' as const, order: 22, required: false, hasComments: true, description: 'Informations sur les réévaluations' },
  // Notes 4-7
  ...[4, 5, 6, 7].map((n, i) => ({
    id: `note${n}`, name: `NOTE ${n}`, title: `Note ${n} - ${getNoteTitle(n)}`,
    category: 'notes' as const, order: 23 + i, required: isNoteRequired(n), hasComments: true, description: getNoteDescription(n),
  })),
  // Note 8 + sous-notes 8A-8C
  { id: 'note8', name: 'NOTE 8', title: `Note 8 - ${getNoteTitle(8)}`, category: 'notes' as const, order: 27, required: true, hasComments: true, description: getNoteDescription(8) },
  { id: 'note8a', name: 'NOTE 8A', title: `Note 8A - ${getSubNoteTitle('8A')}`, category: 'notes' as const, order: 28, required: false, hasComments: true, description: 'Frais d\'établissement et charges à répartir' },
  { id: 'note8b', name: 'NOTE 8B', title: `Note 8B - ${getSubNoteTitle('8B')}`, category: 'notes' as const, order: 29, required: false, hasComments: true, description: 'Provisions pour charges à répartir' },
  { id: 'note8c', name: 'NOTE 8C', title: `Note 8C - ${getSubNoteTitle('8C')}`, category: 'notes' as const, order: 30, required: false, hasComments: true, description: 'Provisions pour pensions et obligations' },
  // Notes 9-14
  ...[9, 10, 11, 12, 13, 14].map((n, i) => ({
    id: `note${n}`, name: `NOTE ${n}`, title: `Note ${n} - ${getNoteTitle(n)}`,
    category: 'notes' as const, order: 31 + i, required: isNoteRequired(n), hasComments: true, description: getNoteDescription(n),
  })),
  // Note 15 supprimée → sous-notes 15A-15B
  { id: 'note15a', name: 'NOTE 15A', title: `Note 15A - ${getSubNoteTitle('15A')}`, category: 'notes' as const, order: 37, required: true, hasComments: true, description: 'Subventions d\'investissement inscrites au passif' },
  { id: 'note15b', name: 'NOTE 15B', title: `Note 15B - ${getSubNoteTitle('15B')}`, category: 'notes' as const, order: 38, required: false, hasComments: true, description: 'Provisions réglementées et autres fonds propres' },
  // Note 16 supprimée → sous-notes 16A-16C
  { id: 'note16a', name: 'NOTE 16A', title: `Note 16A - ${getSubNoteTitle('16A')}`, category: 'notes' as const, order: 39, required: true, hasComments: true, description: 'Emprunts et dettes financières par échéance' },
  { id: 'note16b', name: 'NOTE 16B', title: `Note 16B - ${getSubNoteTitle('16B')}`, category: 'notes' as const, order: 40, required: false, hasComments: true, description: 'Hypothèses actuarielles pour les engagements de retraite' },
  { id: 'note16b_bis', name: 'NOTE 16B BIS', title: `Note 16B BIS - ${getSubNoteTitle('16B_BIS')}`, category: 'notes' as const, order: 41, required: false, hasComments: true, description: 'Bilan actuariel des engagements de retraite' },
  { id: 'note16c', name: 'NOTE 16C', title: `Note 16C - ${getSubNoteTitle('16C')}`, category: 'notes' as const, order: 42, required: false, hasComments: true, description: 'Actifs et passifs éventuels' },
  // Notes 17-26
  ...[17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map((n, i) => ({
    id: `note${n}`, name: `NOTE ${n}`, title: `Note ${n} - ${getNoteTitle(n)}`,
    category: 'notes' as const, order: 43 + i, required: isNoteRequired(n), hasComments: true, description: getNoteDescription(n),
  })),
  // Note 27 supprimée → sous-notes 27A-27B
  { id: 'note27a', name: 'NOTE 27A', title: `Note 27A - ${getSubNoteTitle('27A')}`, category: 'notes' as const, order: 53, required: true, hasComments: true, description: 'Détail des charges de personnel par catégorie' },
  { id: 'note27b', name: 'NOTE 27B', title: `Note 27B - ${getSubNoteTitle('27B')}`, category: 'notes' as const, order: 54, required: true, hasComments: true, description: 'Effectifs par genre, nationalité et masse salariale' },
  // Notes 28-35, 36 (details), 37-39
  ...[28, 29, 30, 31, 32, 33, 34, 35].map((n, i) => ({
    id: `note${n}`, name: `NOTE ${n}`, title: `Note ${n} - ${getNoteTitle(n)}`,
    category: 'notes' as const, order: 55 + i, required: isNoteRequired(n), hasComments: true, description: getNoteDescription(n),
  })),
  { id: 'note36_details', name: 'NOTE 36', title: `Note 36 - ${getNoteTitle(36)}`, category: 'notes' as const, order: 63, required: false, hasComments: true, description: getNoteDescription(36) },
  ...[37, 38, 39].map((n, i) => ({
    id: `note${n}`, name: `NOTE ${n}`, title: `Note ${n} - ${getNoteTitle(n)}`,
    category: 'notes' as const, order: 64 + i, required: false, hasComments: true, description: getNoteDescription(n),
  })),

  // Gardes spécifiques DGI/INS
  {
    id: 'garde_dgi_ins',
    name: 'GARDE (DGI-INS)',
    title: 'Garde DGI-INS',
    category: 'guards',
    order: 55,
    required: false,
    hasComments: true
  },
  {
    id: 'notes_dgi_ins',
    name: 'NOTES DGI - INS',
    title: 'Notes DGI-INS',
    category: 'notes',
    order: 56,
    required: false,
    hasComments: true
  },

  // Compléments
  {
    id: 'comp_charges',
    name: 'COMP-CHARGES',
    title: 'Complément - Charges',
    category: 'supplements',
    order: 57,
    required: false,
    hasComments: true
  },
  {
    id: 'comp_tva',
    name: 'COMP-TVA',
    title: 'Complément - TVA',
    category: 'supplements',
    order: 58,
    required: false,
    hasComments: true
  },
  {
    id: 'comp_tva_2',
    name: 'COMP-TVA (2)',
    title: 'Complément - TVA (Suite)',
    category: 'supplements',
    order: 59,
    required: false,
    hasComments: true
  },

  // Suppléments
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `suppl${i + 1}`,
    name: `SUPPL${i + 1}`,
    title: `Supplément ${i + 1}`,
    category: 'supplements' as const,
    order: 60 + i,
    required: false,
    hasComments: true
  })),

  // Gardes spécialisées
  {
    id: 'garde_bic',
    name: 'GARDE (BIC)',
    title: 'Garde BIC',
    category: 'guards',
    order: 67,
    required: false,
    hasComments: true
  },
  {
    id: 'garde_bnc',
    name: 'GARDE (BNC)',
    title: 'Garde BNC',
    category: 'guards',
    order: 68,
    required: false,
    hasComments: true
  },
  {
    id: 'garde_ba',
    name: 'GARDE (BA)',
    title: 'Garde BA',
    category: 'guards',
    order: 69,
    required: false,
    hasComments: true
  },
  {
    id: 'garde_301',
    name: 'GARDE (301)',
    title: 'Garde 301',
    category: 'guards',
    order: 70,
    required: false,
    hasComments: true
  },
  {
    id: 'garde_302',
    name: 'GARDE (302)',
    title: 'Garde 302',
    category: 'guards',
    order: 71,
    required: false,
    hasComments: true
  },
  {
    id: 'garde_3',
    name: 'GARDE(3)',
    title: 'Garde 3',
    category: 'guards',
    order: 72,
    required: false,
    hasComments: true
  },

  // Commentaire final
  {
    id: 'commentaire',
    name: 'COMMENTAIRE',
    title: 'Commentaires Généraux',
    category: 'comments',
    order: 73,
    required: false,
    hasComments: true,
    description: 'Commentaires généraux sur la liasse fiscale'
  }
]

// Fonctions utilitaires pour les notes
export function getNoteTitle(noteNumber: number): string {
  const noteTitles: { [key: number]: string } = {
    1: 'Dettes garanties par des suretes reelles',
    2: 'Benefice par action',
    3: 'Immobilisations',
    4: 'Actif circulant HAO',
    5: 'Stocks et en-cours',
    6: 'Clients',
    7: 'Autres creances',
    8: 'Tresorerie - Actif et Passif',
    9: 'Titres de placement',
    10: 'Capital social',
    11: 'Primes et reserves',
    12: 'Subventions',
    13: 'Provisions reglementees et fonds assimiles',
    14: 'Dettes financieres et ressources assimilees',
    15: 'Passif circulant HAO et fournisseurs',
    16: 'Dettes fiscales, sociales et autres',
    17: 'Chiffre d\'affaires et autres produits',
    18: 'Autres achats',
    19: 'Transports',
    20: 'Services exterieurs',
    21: 'Impots et taxes',
    22: 'Autres charges',
    23: 'Charges de personnel',
    24: 'Dotations HAO',
    25: 'Produits HAO',
    26: 'Impots sur le resultat',
    27: 'Charges de personnel',
    28: 'Dotations et charges pour provisions et depreciations',
    29: 'Charges et revenus financiers',
    30: 'Autres charges et produits HAO',
    31: 'Repartition du resultat et autres elements caracteristiques',
    32: 'Production de l\'exercice',
    33: 'Achats destines a la production',
    34: 'Determination du resultat fiscal',
    35: 'Informations sociales, environnementales et societales',
    36: 'Table des codes',
    37: 'Tableau de passage aux SIG',
    38: 'Detail compte de resultat',
    39: 'Changements de methodes comptables et corrections d\'erreurs'
  }
  return noteTitles[noteNumber] || `Annexe ${noteNumber}`
}

/** Titres des sous-notes (3A-3E, 8A-8C, 15A-15B, 16A-16C, 27A-27B) */
export function getSubNoteTitle(noteId: string): string {
  const subNoteTitles: Record<string, string> = {
    '3A': 'Immobilisations - Mouvements',
    '3B': 'Biens pris en location acquisition',
    '3C': 'Amortissements',
    '3C_BIS': 'Depreciations et provisions pour risques',
    '3D': 'Immobilisations financieres',
    '3E': 'Informations complementaires immobilisations',
    '8A': 'Tableau d\'etalement des charges immobilisees',
    '8B': 'Tableau d\'etalement de provisions pour charges a repartir',
    '8C': 'Charges constatees d\'avance',
    '15A': 'Passif circulant HAO',
    '15B': 'Fournisseurs d\'exploitation',
    '16A': 'Dettes fiscales et sociales',
    '16B': 'Autres dettes et provisions pour risques',
    '16B_BIS': 'Engagements de retraite et avantages assimiles (methode actuarielle)',
    '16C': 'Actifs et passifs eventuels',
    '27A': 'Charges de personnel',
    '27B': 'Effectifs, masse salariale et personnel exterieur',
  }
  return subNoteTitles[noteId] || `Annexe ${noteId}`
}

export function getNoteDescription(noteNumber: number): string {
  const noteDescriptions: { [key: number]: string } = {
    1: 'Dettes garanties par des suretes reelles consenties sur les actifs de l\'entite',
    2: 'Benefice par action (resultat de base et dilue)',
    3: 'Detail et mouvements des immobilisations',
    4: 'Actif circulant hors activite ordinaire (HAO)',
    5: 'Detail des stocks et en-cours de production',
    6: 'Creances clients et comptes rattaches',
    7: 'Creances fiscales, sociales et autres debiteurs',
    8: 'Tresorerie actif (banques, caisse) et tresorerie passif (credits de tresorerie)',
    9: 'Titres de placement et valeurs mobilieres',
    10: 'Capital social, actionnaires, capital souscrit non appele',
    11: 'Primes d\'emission, reserves legales et facultatives',
    12: 'Subventions d\'investissement et subventions d\'exploitation',
    13: 'Provisions reglementees et fonds assimiles',
    14: 'Emprunts, dettes financieres et ressources assimilees',
    15: 'Passif circulant HAO et fournisseurs d\'exploitation',
    16: 'Dettes fiscales et sociales, autres dettes et provisions pour risques',
    17: 'Chiffre d\'affaires, subventions et autres produits',
    18: 'Autres achats de marchandises et matieres',
    19: 'Frais de transport sur achats et ventes',
    20: 'Loyers, entretien, assurances et services exterieurs',
    21: 'Impots, taxes et versements assimiles',
    22: 'Autres charges d\'exploitation',
    23: 'Salaires, charges sociales et avantages au personnel',
    24: 'Dotations aux amortissements et provisions HAO',
    25: 'Produits hors activite ordinaire (HAO)',
    26: 'Impots sur le resultat (IS, IMF)',
    27: 'Charges de personnel par categorie',
    28: 'Dotations aux amortissements, depreciations et provisions',
    29: 'Charges et produits financiers',
    30: 'Charges et produits HAO',
    31: 'Repartition du resultat et elements caracteristiques des cinq derniers exercices',
    32: 'Production immobilisee, stockee et vendue',
    33: 'Achats de matieres premieres et fournitures',
    34: 'Tableau de determination du resultat fiscal',
    35: 'Informations sociales, environnementales et societales a fournir',
    36: 'Nomenclature et codes comptables de reference',
    37: 'Tableau de passage aux soldes intermediaires de gestion (SIG)',
    38: 'Detail du compte de resultat',
    39: 'Changements de methodes comptables, d\'estimations et corrections d\'erreurs',
  }
  return noteDescriptions[noteNumber] || `Note annexe numero ${noteNumber}`
}

function isNoteRequired(noteNumber: number): boolean {
  // Notes obligatoires selon SYSCOHADA
  const requiredNotes = [1, 2, 3, 4, 5, 6, 7, 8, 14, 15, 16, 17, 20, 22, 27, 31]
  return requiredNotes.includes(noteNumber)
}

// ============ SMT Sheets ============
export const SMT_SHEETS: SheetConfig[] = [
  {
    id: 'couverture',
    name: 'COUVERTURE',
    title: 'Page de Couverture',
    category: 'cover',
    order: 1,
    required: true,
    hasComments: true,
    description: 'Page de couverture de la liasse fiscale SMT',
  },
  {
    id: 'fiche_r1',
    name: 'FICHE R1',
    title: 'Fiche R1 - Renseignements Generaux',
    category: 'fiches',
    order: 2,
    required: true,
    hasComments: true,
    description: 'Identification et renseignements generaux',
  },
  {
    id: 'bilan_smt',
    name: 'BILAN SMT',
    title: 'Bilan Simplifie SMT',
    category: 'statements',
    order: 3,
    required: true,
    hasComments: true,
    description: 'Bilan simplifie - Actif et Passif (une page)',
    columns: [
      { id: 'ref', label: 'Ref', type: 'text', editable: false, width: '80px' },
      { id: 'libelle', label: 'Libelle', type: 'text', editable: false, width: '400px' },
      { id: 'montant', label: 'Exercice N', type: 'currency', editable: true, width: '150px' },
      { id: 'montant_n1', label: 'Exercice N-1', type: 'currency', editable: true, width: '150px' },
    ],
  },
  {
    id: 'cdr_smt',
    name: 'CdR SMT',
    title: 'Compte de Resultat Simplifie SMT',
    category: 'statements',
    order: 4,
    required: true,
    hasComments: true,
    description: 'Compte de resultat simplifie',
    columns: [
      { id: 'ref', label: 'Ref', type: 'text', editable: false, width: '80px' },
      { id: 'libelle', label: 'Libelle', type: 'text', editable: false, width: '400px' },
      { id: 'montant', label: 'Exercice N', type: 'currency', editable: true, width: '150px' },
      { id: 'montant_n1', label: 'Exercice N-1', type: 'currency', editable: true, width: '150px' },
    ],
  },
  // Notes reduites pour SMT (3-5 notes essentielles)
  {
    id: 'note1',
    name: 'NOTE 1',
    title: 'Note 1 - Methodes comptables',
    category: 'notes',
    order: 5,
    required: true,
    hasComments: true,
    description: 'Principes et methodes comptables appliques',
  },
  {
    id: 'note3',
    name: 'NOTE 3',
    title: 'Note 3 - Immobilisations',
    category: 'notes',
    order: 6,
    required: true,
    hasComments: true,
    description: 'Detail et mouvements des immobilisations',
  },
  {
    id: 'note5',
    name: 'NOTE 5',
    title: 'Note 5 - Provisions',
    category: 'notes',
    order: 7,
    required: false,
    hasComments: true,
    description: 'Etat detaille des provisions',
  },
  {
    id: 'tables_calcul_impots',
    name: 'TABLES_CALCUL_IMPOTS',
    title: 'Tables de Calcul des Impots',
    category: 'supplements',
    order: 8,
    required: true,
    hasComments: true,
    description: 'Calculs automatiques IS, TVA, taxes selon pays OHADA',
  },
]

// ============ Banque Sheets ============
export const BANQUE_SHEETS: SheetConfig[] = [
  { id: 'couverture', name: 'COUVERTURE', title: 'Page de Couverture', category: 'cover', order: 1, required: true, hasComments: true },
  { id: 'fiche_r1', name: 'FICHE R1', title: 'Fiche R1 - Renseignements Generaux', category: 'fiches', order: 2, required: true, hasComments: true },
  { id: 'bilan_banque', name: 'BILAN BANQUE', title: 'Bilan Bancaire', category: 'statements', order: 3, required: true, hasComments: true, description: 'Bilan bancaire PCEC/PCB' },
  { id: 'cdr_banque', name: 'COMPTE EXPLOITATION', title: 'Compte d\'Exploitation Bancaire', category: 'statements', order: 4, required: true, hasComments: true, description: 'Produit net bancaire et resultat' },
  { id: 'hors_bilan_banque', name: 'HORS BILAN', title: 'Engagements Hors Bilan', category: 'statements', order: 5, required: true, hasComments: true },
  { id: 'sig_banque', name: 'SIG', title: 'Soldes Intermediaires de Gestion', category: 'statements', order: 6, required: true, hasComments: true },
  { id: 'tft_banque', name: 'TFT', title: 'Tableau de Flux de Tresorerie', category: 'statements', order: 7, required: true, hasComments: true },
  { id: 'tables_calcul_impots', name: 'TABLES_CALCUL_IMPOTS', title: 'Tables de Calcul des Impots', category: 'supplements', order: 8, required: true, hasComments: true },
]

// ============ Assurance Sheets ============
export const ASSURANCE_SHEETS: SheetConfig[] = [
  { id: 'couverture', name: 'COUVERTURE', title: 'Page de Couverture', category: 'cover', order: 1, required: true, hasComments: true },
  { id: 'fiche_r1', name: 'FICHE R1', title: 'Fiche R1 - Renseignements Generaux', category: 'fiches', order: 2, required: true, hasComments: true },
  { id: 'bilan_assurance', name: 'BILAN ASSURANCE', title: 'Bilan Assurance', category: 'statements', order: 3, required: true, hasComments: true, description: 'Bilan specifique assurance CIMA' },
  { id: 'cdr_assurance', name: 'COMPTE RESULTAT', title: 'Compte de Resultat Assurance', category: 'statements', order: 4, required: true, hasComments: true, description: 'Compte technique et non-technique' },
  { id: 'etats_cima_c1', name: 'ETAT C1', title: 'Etat modele C1 CIMA', category: 'statements', order: 5, required: true, hasComments: true },
  { id: 'etats_cima_c9', name: 'ETAT C9', title: 'Etat modele C9 CIMA', category: 'statements', order: 6, required: true, hasComments: true },
  { id: 'etats_cima_c10a', name: 'ETAT C10a', title: 'Etat modele C10a CIMA', category: 'statements', order: 7, required: true, hasComments: true },
  { id: 'tables_calcul_impots', name: 'TABLES_CALCUL_IMPOTS', title: 'Tables de Calcul des Impots', category: 'supplements', order: 8, required: true, hasComments: true },
]

// ============ Microfinance Sheets ============
export const MICROFINANCE_SHEETS: SheetConfig[] = [
  { id: 'couverture', name: 'COUVERTURE', title: 'Page de Couverture', category: 'cover', order: 1, required: true, hasComments: true },
  { id: 'fiche_r1', name: 'FICHE R1', title: 'Fiche R1 - Renseignements Generaux', category: 'fiches', order: 2, required: true, hasComments: true },
  { id: 'bilan_microfinance', name: 'BILAN SFD', title: 'Bilan SFD', category: 'statements', order: 3, required: true, hasComments: true, description: 'Bilan SFD BCEAO/COBAC' },
  { id: 'cdr_microfinance', name: 'COMPTE RESULTAT SFD', title: 'Compte de Resultat SFD', category: 'statements', order: 4, required: true, hasComments: true },
  { id: 'hors_bilan_sfd', name: 'HORS BILAN', title: 'Engagements Hors Bilan SFD', category: 'statements', order: 5, required: true, hasComments: true },
  { id: 'tft_sfd', name: 'TFT', title: 'Tableau de Flux de Tresorerie SFD', category: 'statements', order: 6, required: true, hasComments: true },
  { id: 'tables_calcul_impots', name: 'TABLES_CALCUL_IMPOTS', title: 'Tables de Calcul des Impots', category: 'supplements', order: 7, required: true, hasComments: true },
]

// ============ EBNL Sheets ============
export const EBNL_SHEETS: SheetConfig[] = [
  { id: 'couverture', name: 'COUVERTURE', title: 'Page de Couverture', category: 'cover', order: 1, required: true, hasComments: true },
  { id: 'fiche_r1', name: 'FICHE R1', title: 'Fiche R1 - Renseignements Generaux', category: 'fiches', order: 2, required: true, hasComments: true },
  { id: 'bilan_ebnl', name: 'BILAN EBNL', title: 'Bilan EBNL', category: 'statements', order: 3, required: true, hasComments: true, description: 'Bilan SYCEBNL avec fonds associatifs' },
  { id: 'cdr_ebnl', name: 'COMPTE RESULTAT EBNL', title: 'Compte de Resultat EBNL', category: 'statements', order: 4, required: true, hasComments: true, description: 'CdR avec cotisations, dons, subventions' },
  { id: 'note1', name: 'NOTE 1', title: 'Note 1 - Methodes comptables', category: 'notes', order: 5, required: true, hasComments: true },
  { id: 'tables_calcul_impots', name: 'TABLES_CALCUL_IMPOTS', title: 'Tables de Calcul des Impots', category: 'supplements', order: 6, required: true, hasComments: true },
]

/**
 * Retourne la liste des sheets adaptees au type de liasse
 */
export type TypeLiasseSheets = 'SN' | 'SMT' | 'BANQUE' | 'ASSURANCE' | 'MICROFINANCE' | 'EBNL' | 'CONSO'

export function getSheetsForType(type: TypeLiasseSheets): SheetConfig[] {
  switch (type) {
    case 'SMT': return SMT_SHEETS
    case 'BANQUE': return BANQUE_SHEETS
    case 'ASSURANCE': return ASSURANCE_SHEETS
    case 'MICROFINANCE': return MICROFINANCE_SHEETS
    case 'EBNL': return EBNL_SHEETS
    case 'CONSO':
    case 'SN':
    default:
      return LIASSE_SHEETS
  }
}

// ============ Régimes d'imposition ============

export type RegimeImposition = 'REEL_NORMAL' | 'REEL_SIMPLIFIE' | 'FORFAITAIRE' | 'MICRO'

export const REGIME_LABELS: Record<RegimeImposition, string> = {
  REEL_NORMAL: 'Réel Normal',
  REEL_SIMPLIFIE: 'Réel Simplifié',
  FORFAITAIRE: 'Forfaitaire',
  MICRO: 'Micro-entreprise',
}

type SheetRequirement = 'obligatoire' | 'facultatif' | 'exclu'

// Notes obligatoires selon SYSCOHADA (pour Réel Normal)
const REQUIRED_NOTE_NUMBERS = [1, 2, 4, 5, 6, 7, 8, 14, 17, 20, 22, 31]
// Sub-notes obligatoires
const REQUIRED_SUBNOTE_IDS = ['note3a', 'note3b', 'note3c', 'note3c_bis', 'note15a', 'note16a', 'note27a', 'note27b']

function getSheetRegimeRule(sheetId: string): Record<RegimeImposition, SheetRequirement> {
  // Couverture - obligatoire pour tous
  if (sheetId === 'couverture') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'obligatoire', MICRO: 'obligatoire' }
  }

  // Pages de garde (garde, recevabilite)
  if (sheetId === 'garde' || sheetId === 'recevabilite') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'facultatif', MICRO: 'exclu' }
  }

  // Garde DGI-INS
  if (sheetId === 'garde_dgi_ins') {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Gardes spécialisées (BIC, BNC, BA, 301, 302, 3)
  if (['garde_bic', 'garde_bnc', 'garde_ba', 'garde_301', 'garde_302', 'garde_3'].includes(sheetId)) {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Fiche R1 - obligatoire pour tous
  if (sheetId === 'fiche_r1') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'obligatoire', MICRO: 'obligatoire' }
  }

  // Fiche R2, R3
  if (sheetId === 'fiche_r2' || sheetId === 'fiche_r3') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Fiche R4
  if (sheetId === 'fiche_r4') {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Bilan synthétique
  if (sheetId === 'bilan') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'facultatif', MICRO: 'exclu' }
  }

  // Actif, Passif
  if (sheetId === 'actif' || sheetId === 'passif') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Résultat
  if (sheetId === 'resultat') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'obligatoire', MICRO: 'facultatif' }
  }

  // TFT
  if (sheetId === 'tft') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Tables calcul impôts
  if (sheetId === 'tables_calcul_impots') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'obligatoire', FORFAITAIRE: 'facultatif', MICRO: 'exclu' }
  }

  // Tableaux supplémentaires
  if (sheetId === 'tableaux_supplementaires') {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Notes DGI-INS
  if (sheetId === 'notes_dgi_ins') {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Note 36 (codes, nomenclature, details)
  if (sheetId === 'note36_codes' || sheetId === 'note36_nomenclature' || sheetId === 'note36_details') {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Sub-notes (3a, 3b, 8a, 15a, 16a, 27a, etc.)
  if (REQUIRED_SUBNOTE_IDS.includes(sheetId)) {
    return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }
  const subNoteMatch = sheetId.match(/^note\d+[a-c]/)
  if (subNoteMatch) {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Notes 1-39 (excluding note36 handled above)
  const noteMatch = sheetId.match(/^note(\d+)$/)
  if (noteMatch) {
    const noteNum = parseInt(noteMatch[1])
    if (REQUIRED_NOTE_NUMBERS.includes(noteNum)) {
      // Notes obligatoires
      return { REEL_NORMAL: 'obligatoire', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
    } else {
      // Notes facultatives
      return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
    }
  }

  // Compléments (charges, TVA)
  if (sheetId === 'comp_charges' || sheetId === 'comp_tva' || sheetId === 'comp_tva_2') {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Suppléments (1-7)
  if (sheetId.startsWith('suppl')) {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'exclu', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
  }

  // Commentaire
  if (sheetId === 'commentaire') {
    return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'facultatif', MICRO: 'exclu' }
  }

  // Défaut : facultatif pour réel, exclu pour les autres
  return { REEL_NORMAL: 'facultatif', REEL_SIMPLIFIE: 'facultatif', FORFAITAIRE: 'exclu', MICRO: 'exclu' }
}

/** Retourne le statut d'un onglet pour un régime donné */
export function getSheetRequirement(sheetId: string, regime: RegimeImposition): SheetRequirement {
  return getSheetRegimeRule(sheetId)[regime]
}

/** Retourne les sheets visibles (non exclus) pour un régime donné */
export function getVisibleSheets(regime: RegimeImposition): SheetConfig[] {
  return LIASSE_SHEETS.filter(sheet => getSheetRequirement(sheet.id, regime) !== 'exclu')
}

/** Retourne le nombre d'onglets obligatoires et facultatifs pour un régime */
export function getSheetCounts(regime: RegimeImposition): { obligatoire: number; facultatif: number } {
  let obligatoire = 0
  let facultatif = 0
  for (const sheet of LIASSE_SHEETS) {
    const req = getSheetRequirement(sheet.id, regime)
    if (req === 'obligatoire') obligatoire++
    else if (req === 'facultatif') facultatif++
  }
  return { obligatoire, facultatif }
}

// Export des catégories
export const SHEET_CATEGORIES = [
  { id: 'cover', label: 'Couverture', icon: '📋', color: '#3b82f6' },
  { id: 'guards', label: 'Pages de Garde', icon: '📑', color: '#22c55e' },
  { id: 'fiches', label: 'Fiches de Renseignements', icon: '📝', color: '#f59e0b' },
  { id: 'statements', label: 'États Financiers', icon: '📊', color: '#8b5cf6' },
  { id: 'notes', label: 'Notes Annexes', icon: '📄', color: '#06b6d4' },
  { id: 'supplements', label: 'Suppléments', icon: '➕', color: '#FFC107' },
  { id: 'comments', label: 'Commentaires', icon: '💬', color: '#607D8B' }
]

// Validation rules globales
export const GLOBAL_VALIDATIONS = [
  {
    type: 'balance',
    message: 'Le total actif doit être égal au total passif',
    severity: 'error'
  },
  {
    type: 'consistency',
    message: 'Les montants doivent être cohérents entre les différents tableaux',
    severity: 'warning'
  }
]