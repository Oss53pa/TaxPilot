/**
 * Configuration des 84 pages de la liasse fiscale SYSCOHADA CI
 * Reconstruit depuis le fichier Excel de reference:
 *   Liasse_systeme_normal_2024_V9_AJM_23052025-REV PA.xlsx
 *
 * CHAQUE entree correspond a UN onglet Excel, dans le MEME ordre.
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
  /** File name (without extension) in modules/liasse-fiscale/components/pages/ */
  componentFile: string
  /** Page ID used in the liasse-fiscale module (e.g. 'couverture', 'note-3a') */
  moduleId: string
  regimes: Regime[]
  sourceData: 'entreprise' | 'balance' | 'calcul' | 'saisie_manuelle' | 'mixte'
  orientation?: 'portrait' | 'landscape'
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

// ── Raccourcis regimes ──

const ALL: Regime[] = ['reel_normal', 'reel_simplifie', 'forfaitaire', 'micro']
const NS: Regime[] = ['reel_normal', 'reel_simplifie']
const NSF: Regime[] = ['reel_normal', 'reel_simplifie', 'forfaitaire']
const N: Regime[] = ['reel_normal']

// ══════════════════════════════════════════════════════════════
// 84 PAGES — Ordre EXACT du fichier Excel de reference
// ══════════════════════════════════════════════════════════════

export const LIASSE_PAGES: LiassePage[] = [
  // ── Onglet 1: COUVERTURE ──
  { id: 'COUVERTURE', pageNum: 1, section: 'couverture', label: 'Couverture', componentKey: 'CouvertureSYSCOHADA', componentFile: '01_Couverture', moduleId: 'couverture', regimes: ALL, sourceData: 'entreprise' },

  // ── Onglet 2: GARDE ──
  { id: 'GARDE', pageNum: 2, section: 'garde', label: 'Page de Garde', componentKey: 'PageGardeSYSCOHADA', componentFile: '02_Garde', moduleId: 'garde', regimes: ALL, sourceData: 'entreprise' },

  // ── Onglet 3: RECEVABILITE ──
  { id: 'RECEVABILITE', pageNum: 3, section: 'garde', label: 'Recevabilite', componentKey: 'RecevabiliteSYSCOHADA', componentFile: '03_Recevabilite', moduleId: 'recevabilite', regimes: ALL, sourceData: 'entreprise' },

  // ── Onglet 4: NOTE36 (TABLE DES CODES) ──
  { id: 'NOTE36_CODES', pageNum: 4, section: 'notes', label: 'Note 36 — Table des Codes', componentKey: 'Note36Tables', componentFile: '04_Note36Codes', moduleId: 'note36-codes', regimes: NS, sourceData: 'calcul' },

  // ── Onglet 5: NOTE36 Suite (Nomenclature) ──
  { id: 'NOTE36_NOMENCLATURE', pageNum: 5, section: 'notes', label: 'Note 36 Suite — Nomenclature', componentKey: 'Note36NomenclatureSYSCOHADA', componentFile: '05_Note36Nomenclature', moduleId: 'note36-ciap', regimes: NS, sourceData: 'calcul' },

  // ── Onglet 6: FICHE R1 ──
  { id: 'FICHE_R1', pageNum: 6, section: 'fiches', label: 'Fiche R1 — Renseignements Generaux', componentKey: 'FicheR1SYSCOHADA', componentFile: '06_FicheR1', moduleId: 'fiche-r1', regimes: ALL, sourceData: 'entreprise' },

  // ── Onglet 7: FICHE R2 ──
  { id: 'FICHE_R2', pageNum: 7, section: 'fiches', label: 'Fiche R2 — Dirigeants et CAC', componentKey: 'FicheR2SYSCOHADA', componentFile: '07_FicheR2', moduleId: 'fiche-r2', regimes: NSF, sourceData: 'entreprise' },

  // ── Onglet 8: FICHE R3 ──
  { id: 'FICHE_R3', pageNum: 8, section: 'fiches', label: 'Fiche R3 — Participations', componentKey: 'FicheR3SYSCOHADA', componentFile: '08_FicheR3', moduleId: 'fiche-r3', regimes: NS, sourceData: 'mixte' },

  // ── Onglet 9: BILAN ──
  { id: 'BILAN', pageNum: 9, section: 'etats', label: 'Bilan', componentKey: 'BilanSynthetique', componentFile: '09_Bilan', moduleId: 'bilan', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 10: ACTIF ──
  { id: 'ACTIF', pageNum: 10, section: 'etats', label: 'Actif', componentKey: 'BilanActifSYSCOHADA', componentFile: '10_Actif', moduleId: 'actif', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 11: PASSIF ──
  { id: 'PASSIF', pageNum: 11, section: 'etats', label: 'Passif', componentKey: 'BilanPassifSYSCOHADA', componentFile: '11_Passif', moduleId: 'passif', regimes: NS, sourceData: 'balance' },

  // ── Onglet 12: RESULTAT ──
  { id: 'RESULTAT', pageNum: 12, section: 'etats', label: 'Compte de Resultat', componentKey: 'CompteResultatSYSCOHADA', componentFile: '12_Resultat', moduleId: 'resultat', regimes: NSF, sourceData: 'balance' },

  // ── Onglet 13: TFT ──
  { id: 'TFT', pageNum: 13, section: 'etats', label: 'Tableau des Flux de Tresorerie', componentKey: 'TableauFluxTresorerieSYSCOHADA', componentFile: '13_TFT', moduleId: 'tft', regimes: NS, sourceData: 'balance' },

  // ── Onglet 14: FICHE R4 ──
  { id: 'FICHE_R4', pageNum: 14, section: 'fiches', label: 'Fiche R4 — Informations Complementaires', componentKey: 'FicheR4SYSCOHADA', componentFile: '14_FicheR4', moduleId: 'fiche-r4', regimes: N, sourceData: 'mixte' },

  // ══════════════════════════════════════════════════════════════
  // NOTES ANNEXES (Onglets 15-65)
  // ══════════════════════════════════════════════════════════════

  // ── Onglet 15: NOTE 1 ──
  { id: 'NOTE_1', pageNum: 15, section: 'notes', label: `Note 1 — ${getNoteTitle(1)}`, componentKey: 'Note1SYSCOHADA', componentFile: '15_Note01', moduleId: 'note-01', regimes: NS, sourceData: 'balance' },

  // ── Onglet 16: NOTE 2 ──
  { id: 'NOTE_2', pageNum: 16, section: 'notes', label: `Note 2 — ${getNoteTitle(2)}`, componentKey: 'Note2SYSCOHADA', componentFile: '16_Note02', moduleId: 'note-02', regimes: NS, sourceData: 'saisie_manuelle' },

  // ── Onglet 17: NOTE 3A ──
  { id: 'NOTE_3A', pageNum: 17, section: 'notes', label: `Note 3A — ${getSubNoteTitle('3A')}`, componentKey: 'Note3ASYSCOHADA', componentFile: '17_Note3A', moduleId: 'note-3a', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 18: NOTE 3B ──
  { id: 'NOTE_3B', pageNum: 18, section: 'notes', label: `Note 3B — ${getSubNoteTitle('3B')}`, componentKey: 'Note3BSYSCOHADA', componentFile: '18_Note3B', moduleId: 'note-3b', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 19: NOTE 3C ──
  { id: 'NOTE_3C', pageNum: 19, section: 'notes', label: `Note 3C — ${getSubNoteTitle('3C')}`, componentKey: 'Note3CSYSCOHADA', componentFile: '19_Note3C', moduleId: 'note-3c', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 20: NOTE 3C BIS ──
  { id: 'NOTE_3C_BIS', pageNum: 20, section: 'notes', label: `Note 3C BIS — ${getSubNoteTitle('3C_BIS')}`, componentKey: 'Note3CBISSYSCOHADA', componentFile: '20_Note3CBis', moduleId: 'note-3c-bis', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 21: NOTE 3D ──
  { id: 'NOTE_3D', pageNum: 21, section: 'notes', label: `Note 3D — ${getSubNoteTitle('3D')}`, componentKey: 'Note3DSYSCOHADA', componentFile: '21_Note3D', moduleId: 'note-3d', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 22: NOTE 3E ──
  { id: 'NOTE_3E', pageNum: 22, section: 'notes', label: `Note 3E — ${getSubNoteTitle('3E')}`, componentKey: 'Note3ESYSCOHADA', componentFile: '22_Note3E', moduleId: 'note-3e', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 23: NOTE 4 ──
  { id: 'NOTE_4', pageNum: 23, section: 'notes', label: `Note 4 — ${getNoteTitle(4)}`, componentKey: 'Note4SYSCOHADA', componentFile: '23_Note04', moduleId: 'note-04', regimes: NS, sourceData: 'balance' },

  // ── Onglet 24: NOTE 5 ──
  { id: 'NOTE_5', pageNum: 24, section: 'notes', label: `Note 5 — ${getNoteTitle(5)}`, componentKey: 'Note5SYSCOHADA', componentFile: '24_Note05', moduleId: 'note-05', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 25: NOTE 6 ──
  { id: 'NOTE_6', pageNum: 25, section: 'notes', label: `Note 6 — ${getNoteTitle(6)}`, componentKey: 'Note6SYSCOHADA', componentFile: '25_Note06', moduleId: 'note-06', regimes: NS, sourceData: 'balance' },

  // ── Onglet 26: NOTE 7 ──
  { id: 'NOTE_7', pageNum: 26, section: 'notes', label: `Note 7 — ${getNoteTitle(7)}`, componentKey: 'Note7SYSCOHADA', componentFile: '26_Note07', moduleId: 'note-07', regimes: NS, sourceData: 'balance' },

  // ── Onglet 27: NOTE 8 ──
  { id: 'NOTE_8', pageNum: 27, section: 'notes', label: `Note 8 — ${getNoteTitle(8)}`, componentKey: 'Note8SYSCOHADA', componentFile: '27_Note08', moduleId: 'note-08', regimes: NS, sourceData: 'balance' },

  // ── Onglet 28: NOTE 8A ──
  { id: 'NOTE_8A', pageNum: 28, section: 'notes', label: `Note 8A — ${getSubNoteTitle('8A')}`, componentKey: 'Note8ASYSCOHADA', componentFile: '28_Note8A', moduleId: 'note-8a', regimes: NS, sourceData: 'balance' },

  // ── Onglet 29: NOTE 8B ──
  { id: 'NOTE_8B', pageNum: 29, section: 'notes', label: `Note 8B — ${getSubNoteTitle('8B')}`, componentKey: 'Note8BSYSCOHADA', componentFile: '29_Note8B', moduleId: 'note-8b', regimes: NS, sourceData: 'balance' },

  // ── Onglet 30: NOTE 8C ──
  { id: 'NOTE_8C', pageNum: 30, section: 'notes', label: `Note 8C — ${getSubNoteTitle('8C')}`, componentKey: 'Note8CSYSCOHADA', componentFile: '30_Note8C', moduleId: 'note-8c', regimes: NS, sourceData: 'balance' },

  // ── Onglet 31: NOTE 9 ──
  { id: 'NOTE_9', pageNum: 31, section: 'notes', label: `Note 9 — ${getNoteTitle(9)}`, componentKey: 'Note9SYSCOHADA', componentFile: '31_Note09', moduleId: 'note-09', regimes: NS, sourceData: 'balance' },

  // ── Onglet 32: NOTE 10 ──
  { id: 'NOTE_10', pageNum: 32, section: 'notes', label: `Note 10 — ${getNoteTitle(10)}`, componentKey: 'Note10SYSCOHADA', componentFile: '32_Note10', moduleId: 'note-10', regimes: NS, sourceData: 'balance' },

  // ── Onglet 33: NOTE 11 ──
  { id: 'NOTE_11', pageNum: 33, section: 'notes', label: `Note 11 — ${getNoteTitle(11)}`, componentKey: 'Note11SYSCOHADA', componentFile: '33_Note11', moduleId: 'note-11', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 34: NOTE 12 ──
  { id: 'NOTE_12', pageNum: 34, section: 'notes', label: `Note 12 — ${getNoteTitle(12)}`, componentKey: 'Note12SYSCOHADA', componentFile: '34_Note12', moduleId: 'note-12', regimes: NS, sourceData: 'balance' },

  // ── Onglet 35: NOTE 13 ──
  { id: 'NOTE_13', pageNum: 35, section: 'notes', label: `Note 13 — ${getNoteTitle(13)}`, componentKey: 'Note13SYSCOHADA', componentFile: '35_Note13', moduleId: 'note-13', regimes: NS, sourceData: 'mixte' },

  // ── Onglet 36: NOTE 14 ──
  { id: 'NOTE_14', pageNum: 36, section: 'notes', label: `Note 14 — ${getNoteTitle(14)}`, componentKey: 'Note14SYSCOHADA', componentFile: '36_Note14', moduleId: 'note-14', regimes: NS, sourceData: 'balance' },

  // ── Onglet 37: NOTE 15A ──
  { id: 'NOTE_15A', pageNum: 37, section: 'notes', label: `Note 15A — ${getSubNoteTitle('15A')}`, componentKey: 'Note15ASYSCOHADA', componentFile: '37_Note15A', moduleId: 'note-15a', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 38: NOTE 15B ──
  { id: 'NOTE_15B', pageNum: 38, section: 'notes', label: `Note 15B — ${getSubNoteTitle('15B')}`, componentKey: 'Note15BSYSCOHADA', componentFile: '38_Note15B', moduleId: 'note-15b', regimes: NS, sourceData: 'balance' },

  // ── Onglet 39: NOTE 16A ──
  { id: 'NOTE_16A', pageNum: 39, section: 'notes', label: `Note 16A — ${getSubNoteTitle('16A')}`, componentKey: 'Note16ASYSCOHADA', componentFile: '39_Note16A', moduleId: 'note-16a', regimes: NS, sourceData: 'balance', orientation: 'landscape' },

  // ── Onglet 40: NOTE 16B ──
  { id: 'NOTE_16B', pageNum: 40, section: 'notes', label: `Note 16B — ${getSubNoteTitle('16B')}`, componentKey: 'Note16BSYSCOHADA', componentFile: '40_Note16B', moduleId: 'note-16b', regimes: N, sourceData: 'saisie_manuelle' },

  // ── Onglet 41: NOTE 16B BIS ──
  { id: 'NOTE_16B_BIS', pageNum: 41, section: 'notes', label: `Note 16B BIS — ${getSubNoteTitle('16B_BIS')}`, componentKey: 'Note16BBISSYSCOHADA', componentFile: '41_Note16BBis', moduleId: 'note-16b-bis', regimes: N, sourceData: 'saisie_manuelle' },

  // ── Onglet 42: NOTE 16C ──
  { id: 'NOTE_16C', pageNum: 42, section: 'notes', label: `Note 16C — ${getSubNoteTitle('16C')}`, componentKey: 'Note16CSYSCOHADA', componentFile: '42_Note16C', moduleId: 'note-16c', regimes: N, sourceData: 'saisie_manuelle' },

  // ── Onglet 43: NOTE 17 ──
  { id: 'NOTE_17', pageNum: 43, section: 'notes', label: `Note 17 — ${getNoteTitle(17)}`, componentKey: 'Note17SYSCOHADA', componentFile: '43_Note17', moduleId: 'note-17', regimes: NS, sourceData: 'balance' },

  // ── Onglet 44: NOTE 18 ──
  { id: 'NOTE_18', pageNum: 44, section: 'notes', label: `Note 18 — ${getNoteTitle(18)}`, componentKey: 'Note18SYSCOHADA', componentFile: '44_Note18', moduleId: 'note-18', regimes: NS, sourceData: 'balance' },

  // ── Onglet 45: NOTE 19 ──
  { id: 'NOTE_19', pageNum: 45, section: 'notes', label: `Note 19 — ${getNoteTitle(19)}`, componentKey: 'Note19SYSCOHADA', componentFile: '45_Note19', moduleId: 'note-19', regimes: NS, sourceData: 'balance' },

  // ── Onglet 46: NOTE 20 ──
  { id: 'NOTE_20', pageNum: 46, section: 'notes', label: `Note 20 — ${getNoteTitle(20)}`, componentKey: 'Note20SYSCOHADA', componentFile: '46_Note20', moduleId: 'note-20', regimes: NS, sourceData: 'balance' },

  // ── Onglet 47: NOTE 21 ──
  { id: 'NOTE_21', pageNum: 47, section: 'notes', label: `Note 21 — ${getNoteTitle(21)}`, componentKey: 'Note21SYSCOHADA', componentFile: '47_Note21', moduleId: 'note-21', regimes: N, sourceData: 'balance' },

  // ── Onglet 48: NOTE 22 ──
  { id: 'NOTE_22', pageNum: 48, section: 'notes', label: `Note 22 — ${getNoteTitle(22)}`, componentKey: 'Note22SYSCOHADA', componentFile: '48_Note22', moduleId: 'note-22', regimes: NS, sourceData: 'balance' },

  // ── Onglet 49: NOTE 23 ──
  { id: 'NOTE_23', pageNum: 49, section: 'notes', label: `Note 23 — ${getNoteTitle(23)}`, componentKey: 'Note23SYSCOHADA', componentFile: '49_Note23', moduleId: 'note-23', regimes: N, sourceData: 'balance' },

  // ── Onglet 50: NOTE 24 ──
  { id: 'NOTE_24', pageNum: 50, section: 'notes', label: `Note 24 — ${getNoteTitle(24)}`, componentKey: 'Note24SYSCOHADA', componentFile: '50_Note24', moduleId: 'note-24', regimes: N, sourceData: 'balance' },

  // ── Onglet 51: NOTE 25 ──
  { id: 'NOTE_25', pageNum: 51, section: 'notes', label: `Note 25 — ${getNoteTitle(25)}`, componentKey: 'Note25SYSCOHADA', componentFile: '51_Note25', moduleId: 'note-25', regimes: N, sourceData: 'balance' },

  // ── Onglet 52: NOTE 26 ──
  { id: 'NOTE_26', pageNum: 52, section: 'notes', label: `Note 26 — ${getNoteTitle(26)}`, componentKey: 'Note26SYSCOHADA', componentFile: '52_Note26', moduleId: 'note-26', regimes: N, sourceData: 'balance' },

  // ── Onglet 53: NOTE 27A ──
  { id: 'NOTE_27A', pageNum: 53, section: 'notes', label: `Note 27A — ${getSubNoteTitle('27A')}`, componentKey: 'Note27ASYSCOHADA', componentFile: '53_Note27A', moduleId: 'note-27a', regimes: NS, sourceData: 'balance' },

  // ── Onglet 54: NOTE 27B ──
  { id: 'NOTE_27B', pageNum: 54, section: 'notes', label: `Note 27B — ${getSubNoteTitle('27B')}`, componentKey: 'Note27BSYSCOHADA', componentFile: '54_Note27B', moduleId: 'note-27b', regimes: NS, sourceData: 'mixte' },

  // ── Onglet 55: NOTE 28 ──
  { id: 'NOTE_28', pageNum: 55, section: 'notes', label: `Note 28 — ${getNoteTitle(28)}`, componentKey: 'Note28SYSCOHADA', componentFile: '55_Note28', moduleId: 'note-28', regimes: N, sourceData: 'balance' },

  // ── Onglet 56: NOTE 29 ──
  { id: 'NOTE_29', pageNum: 56, section: 'notes', label: `Note 29 — ${getNoteTitle(29)}`, componentKey: 'Note29SYSCOHADA', componentFile: '56_Note29', moduleId: 'note-29', regimes: N, sourceData: 'balance' },

  // ── Onglet 57: NOTE 30 ──
  { id: 'NOTE_30', pageNum: 57, section: 'notes', label: `Note 30 — ${getNoteTitle(30)}`, componentKey: 'Note30SYSCOHADA', componentFile: '57_Note30', moduleId: 'note-30', regimes: N, sourceData: 'balance' },

  // ── Onglet 58: NOTE 31 ──
  { id: 'NOTE_31', pageNum: 58, section: 'notes', label: `Note 31 — ${getNoteTitle(31)}`, componentKey: 'Note31SYSCOHADA', componentFile: '58_Note31', moduleId: 'note-31', regimes: NS, sourceData: 'mixte' },

  // ── Onglet 59: NOTE 32 ──
  { id: 'NOTE_32', pageNum: 59, section: 'notes', label: `Note 32 — ${getNoteTitle(32)}`, componentKey: 'Note32SYSCOHADA', componentFile: '59_Note32', moduleId: 'note-32', regimes: N, sourceData: 'balance' },

  // ── Onglet 60: NOTE 33 ──
  { id: 'NOTE_33', pageNum: 60, section: 'notes', label: `Note 33 — ${getNoteTitle(33)}`, componentKey: 'Note33SYSCOHADA', componentFile: '60_Note33', moduleId: 'note-33', regimes: N, sourceData: 'balance' },

  // ── Onglet 61: NOTE 34 ──
  { id: 'NOTE_34', pageNum: 61, section: 'notes', label: `Note 34 — ${getNoteTitle(34)}`, componentKey: 'Note34SYSCOHADA', componentFile: '61_Note34', moduleId: 'note-34', regimes: N, sourceData: 'calcul' },

  // ── Onglet 62: NOTE 35 ──
  { id: 'NOTE_35', pageNum: 62, section: 'notes', label: `Note 35 — ${getNoteTitle(35)}`, componentKey: 'Note35SYSCOHADA', componentFile: '62_Note35', moduleId: 'note-35', regimes: N, sourceData: 'saisie_manuelle' },

  // ── Onglet 63: NOTE 37 (pas de NOTE 36 dans les notes, le 36 est aux onglets 4-5) ──
  { id: 'NOTE_37', pageNum: 63, section: 'notes', label: `Note 37 — ${getNoteTitle(37)}`, componentKey: 'Note37SYSCOHADA', componentFile: '63_Note37', moduleId: 'note-37', regimes: N, sourceData: 'calcul' },

  // ── Onglet 64: NOTE 38 ──
  { id: 'NOTE_38', pageNum: 64, section: 'notes', label: `Note 38 — ${getNoteTitle(38)}`, componentKey: 'Note38SYSCOHADA', componentFile: '64_Note38', moduleId: 'note-38', regimes: N, sourceData: 'saisie_manuelle' },

  // ── Onglet 65: NOTE 39 ──
  { id: 'NOTE_39', pageNum: 65, section: 'notes', label: `Note 39 — ${getNoteTitle(39)}`, componentKey: 'Note39SYSCOHADA', componentFile: '65_Note39', moduleId: 'note-39', regimes: N, sourceData: 'saisie_manuelle' },

  // ══════════════════════════════════════════════════════════════
  // PAGES DGI-INS (Onglets 66-67)
  // ══════════════════════════════════════════════════════════════

  // ── Onglet 66: GARDE (DGI-INS) ──
  { id: 'GARDE_DGI_INS', pageNum: 66, section: 'garde', label: 'Garde DGI-INS', componentKey: 'GardeDgiIns', componentFile: '66_GardeDgiIns', moduleId: 'garde-dgi-ins', regimes: NS, sourceData: 'mixte' },

  // ── Onglet 67: NOTES DGI-INS ──
  { id: 'NOTES_DGI_INS', pageNum: 67, section: 'notes', label: 'Notes DGI-INS', componentKey: 'NotesDgiInsSYSCOHADA', componentFile: '67_NotesDgiIns', moduleId: 'notes-dgi-ins', regimes: NS, sourceData: 'mixte' },

  // ══════════════════════════════════════════════════════════════
  // COMPLEMENTS (Onglets 68-70)
  // ══════════════════════════════════════════════════════════════

  // ── Onglet 68: COMP-CHARGES ──
  { id: 'COMP_CHARGES', pageNum: 68, section: 'supplements', label: 'Complement Charges', componentKey: 'ComplementCharges', componentFile: '68_CompCharges', moduleId: 'comp-charges', regimes: NS, sourceData: 'balance' },

  // ── Onglet 69: COMP-TVA ──
  { id: 'COMP_TVA', pageNum: 69, section: 'supplements', label: 'Complement TVA', componentKey: 'SupplementTVA', componentFile: '69_CompTva', moduleId: 'comp-tva', regimes: NSF, sourceData: 'balance' },

  // ── Onglet 70: COMP-TVA (2) ──
  { id: 'COMP_TVA_2', pageNum: 70, section: 'supplements', label: 'Complement TVA (2)', componentKey: 'CompTva2', componentFile: '70_CompTva2', moduleId: 'comp-tva-2', regimes: NS, sourceData: 'balance' },

  // ══════════════════════════════════════════════════════════════
  // SUPPLEMENTS (Onglets 71-77)
  // ══════════════════════════════════════════════════════════════

  // ── Onglet 71: SUPPL1 ──
  { id: 'SUPPL1', pageNum: 71, section: 'supplements', label: 'Supplement 1 — Elements Statistiques UEMOA', componentKey: 'SupplementImpotSociete', componentFile: '71_Suppl1', moduleId: 'suppl1', regimes: N, sourceData: 'mixte' },

  // ── Onglet 72: SUPPL2 ──
  { id: 'SUPPL2', pageNum: 72, section: 'supplements', label: 'Supplement 2 — Repartition Resultat Fiscal', componentKey: 'SupplementAvantagesFiscaux', componentFile: '72_Suppl2', moduleId: 'suppl2', regimes: N, sourceData: 'mixte' },

  // ── Onglet 73: SUPPL3 ──
  { id: 'SUPPL3', pageNum: 73, section: 'supplements', label: 'Supplement 3 — Complement Entites Individuelles', componentKey: 'ComplementProduits', componentFile: '73_Suppl3', moduleId: 'suppl3', regimes: N, sourceData: 'mixte' },

  // ── Onglet 74: SUPPL4 ──
  { id: 'SUPPL4', pageNum: 74, section: 'supplements', label: 'Supplement 4 — Amortissements et Inventaire', componentKey: 'Suppl4', componentFile: '74_Suppl4', moduleId: 'suppl4', regimes: N, sourceData: 'mixte' },

  // ── Onglet 75: SUPPL5 ──
  { id: 'SUPPL5', pageNum: 75, section: 'supplements', label: 'Supplement 5 — Detail Frais Accessoires', componentKey: 'Suppl5', componentFile: '75_Suppl5', moduleId: 'suppl5', regimes: N, sourceData: 'mixte' },

  // ── Onglet 76: SUPPL6 ──
  { id: 'SUPPL6', pageNum: 76, section: 'supplements', label: 'Supplement 6 — Avantages en Nature', componentKey: 'Suppl6', componentFile: '76_Suppl6', moduleId: 'suppl6', regimes: N, sourceData: 'mixte' },

  // ── Onglet 77: SUPPL7 ──
  { id: 'SUPPL7', pageNum: 77, section: 'supplements', label: 'Supplement 7 — Creances et Dettes Echues', componentKey: 'Suppl7', componentFile: '77_Suppl7', moduleId: 'suppl7', regimes: N, sourceData: 'mixte' },

  // ══════════════════════════════════════════════════════════════
  // GARDES SPECIALISEES (Onglets 78-83)
  // ══════════════════════════════════════════════════════════════

  // ── Onglet 78: GARDE (BIC) ──
  { id: 'GARDE_BIC', pageNum: 78, section: 'garde', label: 'Garde BIC', componentKey: 'GardeBic', componentFile: '78_GardeBic', moduleId: 'garde-bic', regimes: NSF, sourceData: 'entreprise' },

  // ── Onglet 79: GARDE (BNC) ──
  { id: 'GARDE_BNC', pageNum: 79, section: 'garde', label: 'Garde BNC', componentKey: 'GardeBnc', componentFile: '79_GardeBnc', moduleId: 'garde-bnc', regimes: NSF, sourceData: 'entreprise' },

  // ── Onglet 80: GARDE (BA) ──
  { id: 'GARDE_BA', pageNum: 80, section: 'garde', label: 'Garde BA', componentKey: 'GardeBa', componentFile: '80_GardeBa', moduleId: 'garde-ba', regimes: NS, sourceData: 'entreprise' },

  // ── Onglet 81: GARDE (301) ──
  { id: 'GARDE_301', pageNum: 81, section: 'garde', label: 'Garde 301', componentKey: 'Garde301', componentFile: '81_Garde301', moduleId: 'garde-301', regimes: N, sourceData: 'entreprise' },

  // ── Onglet 82: GARDE (302) ──
  { id: 'GARDE_302', pageNum: 82, section: 'garde', label: 'Garde 302', componentKey: 'Garde302', componentFile: '82_Garde302', moduleId: 'garde-302', regimes: N, sourceData: 'entreprise' },

  // ── Onglet 83: GARDE(3) ──
  { id: 'GARDE_3', pageNum: 83, section: 'garde', label: 'Garde Consolidation', componentKey: 'Garde3', componentFile: '83_Garde3', moduleId: 'garde-3', regimes: N, sourceData: 'entreprise' },

  // ══════════════════════════════════════════════════════════════
  // COMMENTAIRE (Onglet 84)
  // ══════════════════════════════════════════════════════════════

  // ── Onglet 84: COMMENTAIRE ──
  { id: 'COMMENTAIRE', pageNum: 84, section: 'commentaires', label: 'Commentaires', componentKey: 'Commentaire', componentFile: '84_Commentaire', moduleId: 'commentaire', regimes: ALL, sourceData: 'saisie_manuelle' },
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
