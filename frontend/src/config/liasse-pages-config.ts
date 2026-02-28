/**
 * Configuration complete des 87 pages de la liasse fiscale SYSCOHADA CI
 * Chaque page est associee a un ou plusieurs regimes d'imposition.
 * Au sein d'un regime, TOUTES les pages marquees OUI s'affichent
 * (vides si pas de donnees).
 */

import { getNoteTitle, getSubNoteTitle } from './liasseFiscaleSheets'

// ── Types ──

export type Regime = 'reel_normal' | 'reel_simplifie' | 'forfaitaire' | 'micro'

export type SectionId = 'couverture' | 'garde' | 'fiches' | 'etats' | 'notes' | 'supplements' | 'commentaires'

export interface LiassePage {
  id: string
  pageNum: number
  section: SectionId
  label: string
  componentKey: string
  regimes: Regime[]
  sourceData: 'entreprise' | 'balance' | 'calcul' | 'saisie_manuelle' | 'mixte'
}

// ── Section labels ──

export const SECTION_LABELS: Record<SectionId, string> = {
  couverture: 'Couverture',
  garde: 'Pages de Garde',
  fiches: 'Fiches de Renseignements',
  etats: 'Etats Financiers',
  notes: 'Notes Annexes',
  supplements: 'Supplements',
  commentaires: 'Commentaires',
}

// ── Regime labels ──

export const REGIME_LABELS: Record<Regime, string> = {
  reel_normal: 'Reel Normal',
  reel_simplifie: 'Reel Simplifie',
  forfaitaire: 'Forfaitaire',
  micro: 'Micro-Entreprise',
}

// ── 74 PAGES ──

const ALL: Regime[] = ['reel_normal', 'reel_simplifie', 'forfaitaire', 'micro']
const NS: Regime[] = ['reel_normal', 'reel_simplifie']
const NSF: Regime[] = ['reel_normal', 'reel_simplifie', 'forfaitaire']
const N: Regime[] = ['reel_normal']

export const LIASSE_PAGES: LiassePage[] = [
  // ══════════════════════════════════════════
  // SECTION 1 — COUVERTURE (1 page)
  // ══════════════════════════════════════════
  { id: 'COUVERTURE', pageNum: 1, section: 'couverture', label: 'Couverture', componentKey: 'CouvertureSYSCOHADA', regimes: ALL, sourceData: 'entreprise' },

  // ══════════════════════════════════════════
  // SECTION 2 — PAGES DE GARDE (9 pages)
  // ══════════════════════════════════════════
  { id: 'GARDE', pageNum: 2, section: 'garde', label: 'Page de Garde', componentKey: 'PageGardeSYSCOHADA', regimes: ALL, sourceData: 'entreprise' },
  { id: 'RECEVABILITE', pageNum: 3, section: 'garde', label: 'Recevabilite', componentKey: 'RecevabiliteSYSCOHADA', regimes: ALL, sourceData: 'entreprise' },
  { id: 'GARDE_DGI_INS', pageNum: 4, section: 'garde', label: 'Garde DGI-INS', componentKey: 'GardeDgiIns', regimes: NS, sourceData: 'mixte' },
  { id: 'GARDE_BIC', pageNum: 5, section: 'garde', label: 'Garde BIC', componentKey: 'GardeBic', regimes: NSF, sourceData: 'entreprise' },
  { id: 'GARDE_BNC', pageNum: 6, section: 'garde', label: 'Garde BNC', componentKey: 'GardeBnc', regimes: NSF, sourceData: 'entreprise' },
  { id: 'GARDE_BA', pageNum: 7, section: 'garde', label: 'Garde BA', componentKey: 'GardeBa', regimes: NS, sourceData: 'entreprise' },
  { id: 'GARDE_301', pageNum: 8, section: 'garde', label: 'Garde 301', componentKey: 'Garde301', regimes: N, sourceData: 'entreprise' },
  { id: 'GARDE_302', pageNum: 9, section: 'garde', label: 'Garde 302', componentKey: 'Garde302', regimes: N, sourceData: 'entreprise' },
  { id: 'GARDE_3', pageNum: 10, section: 'garde', label: 'Garde Consolidation', componentKey: 'Garde3', regimes: N, sourceData: 'entreprise' },

  // ══════════════════════════════════════════
  // SECTION 3 — FICHES DE RENSEIGNEMENTS (4 pages)
  // ══════════════════════════════════════════
  { id: 'FICHE_R1', pageNum: 11, section: 'fiches', label: 'Fiche R1 — Renseignements Generaux', componentKey: 'FicheR1SYSCOHADA', regimes: ALL, sourceData: 'entreprise' },
  { id: 'FICHE_R2', pageNum: 12, section: 'fiches', label: 'Fiche R2 — Dirigeants et CAC', componentKey: 'FicheR2SYSCOHADA', regimes: NSF, sourceData: 'entreprise' },
  { id: 'FICHE_R3', pageNum: 13, section: 'fiches', label: 'Fiche R3 — Participations', componentKey: 'FicheR3SYSCOHADA', regimes: NS, sourceData: 'mixte' },
  { id: 'FICHE_R4', pageNum: 14, section: 'fiches', label: 'Fiche R4 — Informations Complementaires', componentKey: 'FicheR4SYSCOHADA', regimes: N, sourceData: 'mixte' },

  // ══════════════════════════════════════════
  // SECTION 4 — ETATS FINANCIERS (5 pages)
  // ══════════════════════════════════════════
  { id: 'BILAN', pageNum: 15, section: 'etats', label: 'Bilan', componentKey: 'BilanSynthetique', regimes: NS, sourceData: 'balance' },
  { id: 'ACTIF', pageNum: 16, section: 'etats', label: 'Actif', componentKey: 'BilanActifSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'PASSIF', pageNum: 17, section: 'etats', label: 'Passif', componentKey: 'BilanPassifSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'RESULTAT', pageNum: 18, section: 'etats', label: 'Compte de Resultat', componentKey: 'CompteResultatSYSCOHADA', regimes: NSF, sourceData: 'balance' },
  { id: 'TFT', pageNum: 19, section: 'etats', label: 'Tableau des Flux de Tresorerie', componentKey: 'TableauFluxTresorerieSYSCOHADA', regimes: NS, sourceData: 'balance' },

  // ══════════════════════════════════════════
  // SECTION 5 — NOTES ANNEXES (55 pages avec sous-notes)
  // ══════════════════════════════════════════
  { id: 'NOTE36_CODES', pageNum: 20, section: 'notes', label: 'Note 36 — Table des Codes', componentKey: 'Note36Tables', regimes: NS, sourceData: 'calcul' },
  { id: 'NOTE36_NOMENCLATURE', pageNum: 21, section: 'notes', label: 'Note 36 Suite — Nomenclature', componentKey: 'Note36NomenclatureSYSCOHADA', regimes: NS, sourceData: 'calcul' },

  // Notes 1-2
  { id: 'NOTE_1', pageNum: 22, section: 'notes', label: `Note 1 — ${getNoteTitle(1)}`, componentKey: 'Note1SYSCOHADA', regimes: NS, sourceData: 'saisie_manuelle' },
  { id: 'NOTE_2', pageNum: 23, section: 'notes', label: `Note 2 — ${getNoteTitle(2)}`, componentKey: 'Note2SYSCOHADA', regimes: NS, sourceData: 'saisie_manuelle' },

  // Note 3 → sous-notes 3A-3E
  { id: 'NOTE_3A', pageNum: 24, section: 'notes', label: `Note 3A — ${getSubNoteTitle('3A')}`, componentKey: 'Note3ASYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_3B', pageNum: 25, section: 'notes', label: `Note 3B — ${getSubNoteTitle('3B')}`, componentKey: 'Note3BSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_3C', pageNum: 26, section: 'notes', label: `Note 3C — ${getSubNoteTitle('3C')}`, componentKey: 'Note3CSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_3C_BIS', pageNum: 27, section: 'notes', label: `Note 3C BIS — ${getSubNoteTitle('3C_BIS')}`, componentKey: 'Note3CBISSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_3D', pageNum: 28, section: 'notes', label: `Note 3D — ${getSubNoteTitle('3D')}`, componentKey: 'Note3DSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_3E', pageNum: 29, section: 'notes', label: `Note 3E — ${getSubNoteTitle('3E')}`, componentKey: 'Note3ESYSCOHADA', regimes: NS, sourceData: 'balance' },

  // Notes 4-7
  { id: 'NOTE_4', pageNum: 30, section: 'notes', label: `Note 4 — ${getNoteTitle(4)}`, componentKey: 'Note4SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_5', pageNum: 31, section: 'notes', label: `Note 5 — ${getNoteTitle(5)}`, componentKey: 'Note5SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_6', pageNum: 32, section: 'notes', label: `Note 6 — ${getNoteTitle(6)}`, componentKey: 'Note6SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_7', pageNum: 33, section: 'notes', label: `Note 7 — ${getNoteTitle(7)}`, componentKey: 'Note7SYSCOHADA', regimes: NS, sourceData: 'balance' },

  // Note 8 + sous-notes 8A-8C
  { id: 'NOTE_8', pageNum: 34, section: 'notes', label: `Note 8 — ${getNoteTitle(8)}`, componentKey: 'Note8SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_8A', pageNum: 35, section: 'notes', label: `Note 8A — ${getSubNoteTitle('8A')}`, componentKey: 'Note8ASYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_8B', pageNum: 36, section: 'notes', label: `Note 8B — ${getSubNoteTitle('8B')}`, componentKey: 'Note8BSYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_8C', pageNum: 37, section: 'notes', label: `Note 8C — ${getSubNoteTitle('8C')}`, componentKey: 'Note8CSYSCOHADA', regimes: NS, sourceData: 'balance' },

  // Notes 9-14
  { id: 'NOTE_9', pageNum: 38, section: 'notes', label: `Note 9 — ${getNoteTitle(9)}`, componentKey: 'Note9SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_10', pageNum: 39, section: 'notes', label: `Note 10 — ${getNoteTitle(10)}`, componentKey: 'Note10SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_11', pageNum: 40, section: 'notes', label: `Note 11 — ${getNoteTitle(11)}`, componentKey: 'Note11SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_12', pageNum: 41, section: 'notes', label: `Note 12 — ${getNoteTitle(12)}`, componentKey: 'Note12SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_13', pageNum: 42, section: 'notes', label: `Note 13 — ${getNoteTitle(13)}`, componentKey: 'Note13SYSCOHADA', regimes: NS, sourceData: 'mixte' },
  { id: 'NOTE_14', pageNum: 43, section: 'notes', label: `Note 14 — ${getNoteTitle(14)}`, componentKey: 'Note14SYSCOHADA', regimes: NS, sourceData: 'balance' },

  // Note 15 → sous-notes 15A-15B
  { id: 'NOTE_15A', pageNum: 44, section: 'notes', label: `Note 15A — ${getSubNoteTitle('15A')}`, componentKey: 'Note15ASYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_15B', pageNum: 45, section: 'notes', label: `Note 15B — ${getSubNoteTitle('15B')}`, componentKey: 'Note15BSYSCOHADA', regimes: NS, sourceData: 'balance' },

  // Note 16 → sous-notes 16A-16C
  { id: 'NOTE_16A', pageNum: 46, section: 'notes', label: `Note 16A — ${getSubNoteTitle('16A')}`, componentKey: 'Note16ASYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_16B', pageNum: 47, section: 'notes', label: `Note 16B — ${getSubNoteTitle('16B')}`, componentKey: 'Note16BSYSCOHADA', regimes: N, sourceData: 'saisie_manuelle' },
  { id: 'NOTE_16B_BIS', pageNum: 48, section: 'notes', label: `Note 16B BIS — ${getSubNoteTitle('16B_BIS')}`, componentKey: 'Note16BBISSYSCOHADA', regimes: N, sourceData: 'saisie_manuelle' },
  { id: 'NOTE_16C', pageNum: 49, section: 'notes', label: `Note 16C — ${getSubNoteTitle('16C')}`, componentKey: 'Note16CSYSCOHADA', regimes: N, sourceData: 'saisie_manuelle' },

  // Notes 17-26
  { id: 'NOTE_17', pageNum: 50, section: 'notes', label: `Note 17 — ${getNoteTitle(17)}`, componentKey: 'Note17SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_18', pageNum: 51, section: 'notes', label: `Note 18 — ${getNoteTitle(18)}`, componentKey: 'Note18SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_19', pageNum: 52, section: 'notes', label: `Note 19 — ${getNoteTitle(19)}`, componentKey: 'Note19SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_20', pageNum: 53, section: 'notes', label: `Note 20 — ${getNoteTitle(20)}`, componentKey: 'Note20SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_21', pageNum: 54, section: 'notes', label: `Note 21 — ${getNoteTitle(21)}`, componentKey: 'Note21SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_22', pageNum: 55, section: 'notes', label: `Note 22 — ${getNoteTitle(22)}`, componentKey: 'Note22SYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_23', pageNum: 56, section: 'notes', label: `Note 23 — ${getNoteTitle(23)}`, componentKey: 'Note23SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_24', pageNum: 57, section: 'notes', label: `Note 24 — ${getNoteTitle(24)}`, componentKey: 'Note24SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_25', pageNum: 58, section: 'notes', label: `Note 25 — ${getNoteTitle(25)}`, componentKey: 'Note25SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_26', pageNum: 59, section: 'notes', label: `Note 26 — ${getNoteTitle(26)}`, componentKey: 'Note26SYSCOHADA', regimes: N, sourceData: 'balance' },

  // Note 27 → sous-notes 27A-27B
  { id: 'NOTE_27A', pageNum: 60, section: 'notes', label: `Note 27A — ${getSubNoteTitle('27A')}`, componentKey: 'Note27ASYSCOHADA', regimes: NS, sourceData: 'balance' },
  { id: 'NOTE_27B', pageNum: 61, section: 'notes', label: `Note 27B — ${getSubNoteTitle('27B')}`, componentKey: 'Note27BSYSCOHADA', regimes: NS, sourceData: 'mixte' },

  // Notes 28-35
  { id: 'NOTE_28', pageNum: 62, section: 'notes', label: `Note 28 — ${getNoteTitle(28)}`, componentKey: 'Note28SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_29', pageNum: 63, section: 'notes', label: `Note 29 — ${getNoteTitle(29)}`, componentKey: 'Note29SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_30', pageNum: 64, section: 'notes', label: `Note 30 — ${getNoteTitle(30)}`, componentKey: 'Note30SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_31', pageNum: 65, section: 'notes', label: `Note 31 — ${getNoteTitle(31)}`, componentKey: 'Note31SYSCOHADA', regimes: NS, sourceData: 'mixte' },
  { id: 'NOTE_32', pageNum: 66, section: 'notes', label: `Note 32 — ${getNoteTitle(32)}`, componentKey: 'Note32SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_33', pageNum: 67, section: 'notes', label: `Note 33 — ${getNoteTitle(33)}`, componentKey: 'Note33SYSCOHADA', regimes: N, sourceData: 'balance' },
  { id: 'NOTE_34', pageNum: 68, section: 'notes', label: `Note 34 — ${getNoteTitle(34)}`, componentKey: 'Note34SYSCOHADA', regimes: N, sourceData: 'calcul' },
  { id: 'NOTE_35', pageNum: 69, section: 'notes', label: `Note 35 — ${getNoteTitle(35)}`, componentKey: 'Note35SYSCOHADA', regimes: N, sourceData: 'saisie_manuelle' },

  // Note 36 (details via factory)
  { id: 'NOTE_36', pageNum: 70, section: 'notes', label: `Note 36 — ${getNoteTitle(36)}`, componentKey: 'Note36SYSCOHADA', regimes: N, sourceData: 'calcul' },

  // Notes 37-39
  { id: 'NOTE_37', pageNum: 71, section: 'notes', label: `Note 37 — ${getNoteTitle(37)}`, componentKey: 'Note37SYSCOHADA', regimes: N, sourceData: 'calcul' },
  { id: 'NOTE_38', pageNum: 72, section: 'notes', label: `Note 38 — ${getNoteTitle(38)}`, componentKey: 'Note38SYSCOHADA', regimes: N, sourceData: 'saisie_manuelle' },
  { id: 'NOTE_39', pageNum: 73, section: 'notes', label: `Note 39 — ${getNoteTitle(39)}`, componentKey: 'Note39SYSCOHADA', regimes: N, sourceData: 'saisie_manuelle' },

  // Notes DGI-INS
  { id: 'NOTES_DGI_INS', pageNum: 74, section: 'notes', label: 'Notes DGI-INS', componentKey: 'NotesDgiInsSYSCOHADA', regimes: NS, sourceData: 'mixte' },

  // ══════════════════════════════════════════
  // SECTION 6 — SUPPLEMENTS (12 pages)
  // ══════════════════════════════════════════
  { id: 'TABLES_CALCUL_IMPOTS', pageNum: 75, section: 'supplements', label: 'Tables de Calcul des Impots', componentKey: 'TablesCalculImpots', regimes: NSF, sourceData: 'calcul' },
  { id: 'TABLEAUX_SUPPLEMENTAIRES', pageNum: 76, section: 'supplements', label: 'Tableaux Supplementaires', componentKey: 'TableauxSupplementaires', regimes: NS, sourceData: 'calcul' },
  { id: 'COMP_CHARGES', pageNum: 77, section: 'supplements', label: 'Complement Charges', componentKey: 'ComplementCharges', regimes: NS, sourceData: 'balance' },
  { id: 'COMP_TVA', pageNum: 78, section: 'supplements', label: 'Complement TVA', componentKey: 'SupplementTVA', regimes: NSF, sourceData: 'balance' },
  { id: 'COMP_TVA_2', pageNum: 79, section: 'supplements', label: 'Complement TVA (2)', componentKey: 'CompTva2', regimes: NS, sourceData: 'balance' },
  { id: 'SUPPL1', pageNum: 80, section: 'supplements', label: 'Supplement 1 — Impot sur les Societes', componentKey: 'SupplementImpotSociete', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL2', pageNum: 81, section: 'supplements', label: 'Supplement 2 — Avantages Fiscaux', componentKey: 'SupplementAvantagesFiscaux', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL3', pageNum: 82, section: 'supplements', label: 'Supplement 3 — Complement Produits', componentKey: 'ComplementProduits', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL4', pageNum: 83, section: 'supplements', label: 'Supplement 4', componentKey: 'Suppl4', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL5', pageNum: 84, section: 'supplements', label: 'Supplement 5', componentKey: 'Suppl5', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL6', pageNum: 85, section: 'supplements', label: 'Supplement 6', componentKey: 'Suppl6', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL7', pageNum: 86, section: 'supplements', label: 'Supplement 7', componentKey: 'Suppl7', regimes: N, sourceData: 'mixte' },

  // ══════════════════════════════════════════
  // SECTION 7 — COMMENTAIRES (1 page)
  // ══════════════════════════════════════════
  { id: 'COMMENTAIRE', pageNum: 87, section: 'commentaires', label: 'Commentaires', componentKey: 'Commentaire', regimes: ALL, sourceData: 'saisie_manuelle' },
]

// ── HELPERS ──

export function getPagesForRegime(regime: Regime): LiassePage[] {
  return LIASSE_PAGES.filter(p => p.regimes.includes(regime))
}

export function getPagesBySection(regime: Regime) {
  const pages = getPagesForRegime(regime)
  return {
    couverture: pages.filter(p => p.section === 'couverture'),
    garde: pages.filter(p => p.section === 'garde'),
    fiches: pages.filter(p => p.section === 'fiches'),
    etats: pages.filter(p => p.section === 'etats'),
    notes: pages.filter(p => p.section === 'notes'),
    supplements: pages.filter(p => p.section === 'supplements'),
    commentaires: pages.filter(p => p.section === 'commentaires'),
  }
}

export function getPageCountForRegime(regime: Regime): number {
  return getPagesForRegime(regime).length
}
