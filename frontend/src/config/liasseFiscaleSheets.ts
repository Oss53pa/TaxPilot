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
export function getNoteTitle(noteNumber: number): string {
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

export function getNoteDescription(noteNumber: number): string {
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
const REQUIRED_NOTE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 14, 15, 16, 17, 20, 22, 27, 31]

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