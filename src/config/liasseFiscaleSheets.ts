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

  // Notes annexes (NOTE 1 à NOTE 39) - excluding notes with sub-parts (3,8,15,16,27)
  ...Array.from({ length: 39 }, (_, i) => i + 1)
    .filter(n => ![3, 8, 15, 16, 27].includes(n))
    .map(noteNumber => {
      const noteId = noteNumber === 36 ? 'note36_details' : `note${noteNumber}`
      return {
        id: noteId,
        name: `NOTE ${noteNumber}`,
        title: `Note ${noteNumber} - ${getNoteTitle(noteNumber)}`,
        category: 'notes' as const,
        order: 15 + noteNumber - 1,
        required: isNoteRequired(noteNumber),
        hasComments: true,
        description: getNoteDescription(noteNumber)
      }
    }),

  // Note 3 - Immobilisations (6 sous-onglets)
  {
    id: 'note3a',
    name: 'NOTE 3A',
    title: 'Note 3A - Immobilisations (Brutes)',
    category: 'notes' as const,
    order: 17,
    required: true,
    hasComments: true,
    description: 'Tableau des mouvements des immobilisations brutes'
  },
  {
    id: 'note3b',
    name: 'NOTE 3B',
    title: 'Note 3B - Biens en location-acquisition',
    category: 'notes' as const,
    order: 17.1,
    required: false,
    hasComments: true,
    description: 'Immobilisations en location-acquisition / crédit-bail'
  },
  {
    id: 'note3c',
    name: 'NOTE 3C',
    title: 'Note 3C - Amortissements',
    category: 'notes' as const,
    order: 17.2,
    required: true,
    hasComments: true,
    description: 'Tableau des amortissements cumulés'
  },
  {
    id: 'note3c_bis',
    name: 'NOTE 3C BIS',
    title: 'Note 3C BIS - Dépréciations',
    category: 'notes' as const,
    order: 17.3,
    required: false,
    hasComments: true,
    description: 'Tableau des dépréciations des immobilisations'
  },
  {
    id: 'note3d',
    name: 'NOTE 3D',
    title: 'Note 3D - Plus/Moins-values de cessions',
    category: 'notes' as const,
    order: 17.4,
    required: false,
    hasComments: true,
    description: 'Détermination des plus ou moins-values de cessions'
  },
  {
    id: 'note3e',
    name: 'NOTE 3E',
    title: 'Note 3E - Réévaluations',
    category: 'notes' as const,
    order: 17.5,
    required: false,
    hasComments: true,
    description: 'Tableau des réévaluations des immobilisations'
  },

  // Note 8 - Autres créances (3 sous-onglets)
  {
    id: 'note8a',
    name: 'NOTE 8A',
    title: 'Note 8A - Étalement charges immobilisées',
    category: 'notes' as const,
    order: 22,
    required: false,
    hasComments: true,
    description: 'Étalement des charges immobilisées par exercice'
  },
  {
    id: 'note8b',
    name: 'NOTE 8B',
    title: 'Note 8B - Étalement provisions (charges)',
    category: 'notes' as const,
    order: 22.1,
    required: false,
    hasComments: true,
    description: 'Étalement des provisions pour charges'
  },
  {
    id: 'note8c',
    name: 'NOTE 8C',
    title: 'Note 8C - Étalement provisions (risques)',
    category: 'notes' as const,
    order: 22.2,
    required: false,
    hasComments: true,
    description: 'Étalement des provisions pour risques'
  },

  // Note 15 - Subventions et provisions réglementées (2 sous-onglets)
  {
    id: 'note15a',
    name: 'NOTE 15A',
    title: 'Note 15A - Subventions et provisions réglementées',
    category: 'notes' as const,
    order: 29,
    required: true,
    hasComments: true,
    description: 'Subventions d\'investissement et provisions réglementées'
  },
  {
    id: 'note15b',
    name: 'NOTE 15B',
    title: 'Note 15B - Autres fonds propres',
    category: 'notes' as const,
    order: 29.1,
    required: false,
    hasComments: true,
    description: 'Titres participatifs, avances conditionnées, TSDI, ORA'
  },

  // Note 16 - Dettes financières (4 sous-onglets)
  {
    id: 'note16a',
    name: 'NOTE 16A',
    title: 'Note 16A - Dettes financières',
    category: 'notes' as const,
    order: 30,
    required: true,
    hasComments: true,
    description: 'Emprunts, location-acquisition et provisions financières'
  },
  {
    id: 'note16b',
    name: 'NOTE 16B',
    title: 'Note 16B - Engagements retraite (hypothèses)',
    category: 'notes' as const,
    order: 30.1,
    required: false,
    hasComments: true,
    description: 'Hypothèses actuarielles, variation engagement, analyse sensibilité'
  },
  {
    id: 'note16b_bis',
    name: 'NOTE 16B BIS',
    title: 'Note 16B BIS - Engagements retraite (actif/passif)',
    category: 'notes' as const,
    order: 30.2,
    required: false,
    hasComments: true,
    description: 'Actif/passif net et valeur actuelle des actifs de retraite'
  },
  {
    id: 'note16c',
    name: 'NOTE 16C',
    title: 'Note 16C - Actifs et passifs éventuels',
    category: 'notes' as const,
    order: 30.3,
    required: false,
    hasComments: true,
    description: 'Actifs éventuels et passifs éventuels'
  },

  // Note 27 - Charges de personnel (2 sous-onglets)
  {
    id: 'note27a',
    name: 'NOTE 27A',
    title: 'Note 27A - Charges de personnel',
    category: 'notes' as const,
    order: 41,
    required: true,
    hasComments: true,
    description: 'Détail des rémunérations et charges sociales'
  },
  {
    id: 'note27b',
    name: 'NOTE 27B',
    title: 'Note 27B - Effectifs et masse salariale',
    category: 'notes' as const,
    order: 41.1,
    required: true,
    hasComments: true,
    description: 'Effectifs par qualification et masse salariale'
  },

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
function getNoteTitle(noteNumber: number): string {
  const noteTitles: { [key: number]: string } = {
    1: 'Dettes garanties par des sûretés réelles',
    2: 'Informations obligatoires',
    3: 'Immobilisations',
    4: 'Immobilisations financières',
    5: 'Actif circulant et dettes circulantes HAO',
    6: 'Stocks et en-cours',
    7: 'Clients',
    8: 'Autres créances',
    9: 'Titres de placement',
    10: 'Valeurs à encaisser',
    11: 'Disponibilités',
    12: 'Écarts de conversion et transferts de charges',
    13: 'Capital',
    14: 'Primes et réserves',
    15: 'Subventions et provisions réglementées',
    16: 'Dettes financières et ressources assimilées',
    17: 'Fournisseurs d\'exploitation',
    18: 'Dettes fiscales et sociales',
    19: 'Autres dettes et provisions CT',
    20: 'Banques, crédit d\'escompte et trésorerie',
    21: 'Chiffre d\'affaires et autres produits',
    22: 'Achats',
    23: 'Transports',
    24: 'Services extérieurs',
    25: 'Impôts et taxes',
    26: 'Autres charges',
    27: 'Charges de personnel',
    28: 'Dotations provisions et dépréciations',
    29: 'Charges et revenus financiers',
    30: 'Autres charges et produits HAO',
    31: 'Répartition du résultat',
    32: 'Production de l\'exercice',
    33: 'Achats destinés à la production',
    34: 'Fiche synthèse indicateurs financiers',
    35: 'Informations sociales, environnementales',
    36: 'Table des codes',
    37: 'Détermination impôts sur le résultat',
    38: 'Événements postérieurs à la clôture',
    39: 'Changements de méthodes comptables'
  }
  return noteTitles[noteNumber] || `Annexe ${noteNumber}`
}

function getNoteDescription(noteNumber: number): string {
  const noteDescriptions: { [key: number]: string } = {
    1: 'Dettes garanties par des sûretés réelles données ou reçues',
    2: 'Informations obligatoires obtenues auprès des tiers',
    3: 'Tableau des mouvements des immobilisations corporelles et incorporelles',
    4: 'Détail des immobilisations financières (titres, prêts, dépôts)',
    5: 'Actif circulant HAO et dettes circulantes HAO',
    6: 'Détail des stocks et en-cours de production',
    7: 'Créances clients et comptes rattachés',
    8: 'Autres créances (personnel, État, débiteurs divers)',
    9: 'Titres de placement et valeurs mobilières',
    10: 'Valeurs à encaisser (chèques, effets)',
    11: 'Disponibilités en banques, CCP et caisse',
    12: 'Écarts de conversion actif/passif et transferts de charges',
    13: 'Capital social, apporteurs et associés',
    14: 'Primes liées au capital et réserves',
    15: 'Subventions d\'investissement et provisions réglementées',
    16: 'Dettes financières, emprunts et ressources assimilées',
    17: 'Fournisseurs d\'exploitation et comptes rattachés',
    18: 'Dettes fiscales et sociales (État, organismes sociaux)',
    19: 'Autres dettes et provisions pour risques à court terme',
    20: 'Banques, crédit d\'escompte et soldes de trésorerie',
    21: 'Chiffre d\'affaires et autres produits d\'exploitation',
    22: 'Achats de marchandises et matières premières',
    23: 'Transports de biens et de personnel',
    24: 'Services extérieurs (loyers, entretien, assurances)',
    25: 'Impôts, taxes et versements assimilés',
    26: 'Autres charges d\'exploitation',
    27: 'Charges de personnel et effectifs',
    28: 'Dotations aux provisions et dépréciations d\'exploitation',
    29: 'Charges et revenus financiers',
    30: 'Autres charges et produits hors activités ordinaires',
    31: 'Répartition du résultat de l\'exercice',
    32: 'Production immobilisée et stockée de l\'exercice',
    33: 'Achats destinés à la production (matières, fournitures)',
    34: 'Fiche synthèse des indicateurs financiers',
    35: 'Informations sociales, environnementales et sociétales',
    36: 'Table des codes comptables SYSCOHADA',
    37: 'Détermination des impôts sur le résultat',
    38: 'Événements survenus après la clôture de l\'exercice',
    39: 'Changements de méthodes comptables et corrections d\'erreurs'
  }
  return noteDescriptions[noteNumber] || `Note annexe numéro ${noteNumber}`
}

function isNoteRequired(noteNumber: number): boolean {
  // Notes obligatoires selon SYSCOHADA (excluding 3,8,15,16,27 which have sub-notes with their own required status)
  const requiredNotes = [1, 2, 4, 5, 6, 7, 9, 11, 13, 14, 17, 18, 19, 20, 21, 22, 25, 28, 29, 31]
  return requiredNotes.includes(noteNumber)
}

// Export des catégories
export const SHEET_CATEGORIES = [
  { id: 'cover', label: 'Couverture', icon: '📋', color: '#2196F3' },
  { id: 'guards', label: 'Pages de Garde', icon: '📑', color: '#4CAF50' },
  { id: 'fiches', label: 'Fiches de Renseignements', icon: '📝', color: '#FF9800' },
  { id: 'statements', label: 'États Financiers', icon: '📊', color: '#9C27B0' },
  { id: 'notes', label: 'Notes Annexes', icon: '📄', color: '#00BCD4' },
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