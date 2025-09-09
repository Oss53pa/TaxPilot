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

  // Notes annexes (NOTE 1 à NOTE 39)
  ...Array.from({ length: 39 }, (_, i) => {
    const noteNumber = i + 1
    const noteId = noteNumber === 36 ? 'note36_details' : `note${noteNumber}`
    return {
      id: noteId,
      name: `NOTE ${noteNumber}`,
      title: `Note ${noteNumber} - ${getNoteTitle(noteNumber)}`,
      category: 'notes' as const,
      order: 15 + i,
      required: isNoteRequired(noteNumber),
      hasComments: true,
      description: getNoteDescription(noteNumber)
    }
  }),

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
    1: 'Méthodes comptables',
    2: 'Changements de méthodes',
    3: 'Immobilisations',
    4: 'État des créances et dettes',
    5: 'Provisions',
    6: 'Capitaux propres',
    7: 'Tableau de variation des capitaux propres',
    8: 'Charges et produits',
    9: 'Engagements hors bilan',
    10: 'Événements postérieurs',
    11: 'Informations sectorielles',
    12: 'Effectif et charges de personnel',
    13: 'Rémunération des dirigeants',
    14: 'Impôts et taxes',
    15: 'Tableau de détermination du résultat fiscal',
    16: 'Affectation du résultat',
    17: 'Tableau des soldes intermédiaires de gestion',
    18: 'Capacité d\'autofinancement',
    19: 'État des stocks',
    20: 'État des amortissements',
    21: 'Plus et moins-values',
    22: 'État des provisions',
    23: 'Crédit-bail',
    24: 'Échéancier des créances et dettes',
    25: 'Charges à payer et produits à recevoir',
    26: 'Charges et produits constatés d\'avance',
    27: 'Composition du capital social',
    28: 'Filiales et participations',
    29: 'Opérations avec les entreprises liées',
    30: 'Intégration fiscale',
    31: 'Tableau de passage',
    32: 'Informations diverses',
    33: 'État de rapprochement',
    34: 'Tableau de répartition des bénéfices',
    35: 'État des déficits',
    36: 'Table des codes',
    37: 'Informations complémentaires',
    38: 'Déclarations spéciales',
    39: 'Attestations et certifications'
  }
  return noteTitles[noteNumber] || `Annexe ${noteNumber}`
}

function getNoteDescription(noteNumber: number): string {
  const noteDescriptions: { [key: number]: string } = {
    1: 'Principes et méthodes comptables appliqués',
    2: 'Changements de méthodes comptables et impacts',
    3: 'Détail et mouvements des immobilisations',
    4: 'Ventilation des créances et dettes par échéance',
    5: 'État détaillé des provisions',
    6: 'Composition et variation des capitaux propres',
    // ... autres descriptions
  }
  return noteDescriptions[noteNumber] || `Note annexe numéro ${noteNumber}`
}

function isNoteRequired(noteNumber: number): boolean {
  // Notes obligatoires selon SYSCOHADA
  const requiredNotes = [1, 2, 3, 4, 5, 6, 7, 8, 14, 15, 16, 17, 20, 22, 27, 31]
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