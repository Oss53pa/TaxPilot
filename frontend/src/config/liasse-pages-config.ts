/**
 * Configuration complete des 74 pages de la liasse fiscale SYSCOHADA CI
 * Chaque page est associee a un ou plusieurs regimes d'imposition.
 * Au sein d'un regime, TOUTES les pages marquees OUI s'affichent
 * (vides si pas de donnees).
 */

import { getNoteTitle } from './liasseFiscaleSheets'

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
  // SECTION 5 — NOTES ANNEXES (42 pages)
  // ══════════════════════════════════════════
  { id: 'NOTE36_CODES', pageNum: 20, section: 'notes', label: 'Note 36 — Table des Codes', componentKey: 'Note36Tables', regimes: NS, sourceData: 'calcul' },
  { id: 'NOTE36_NOMENCLATURE', pageNum: 21, section: 'notes', label: 'Note 36 Suite — Nomenclature', componentKey: 'Note36NomenclatureSYSCOHADA', regimes: NS, sourceData: 'calcul' },

  // Notes 1 a 20 : Normal + Simplifie
  ...Array.from({ length: 20 }, (_, i) => {
    const n = i + 1
    return {
      id: `NOTE_${n}`,
      pageNum: 22 + i,
      section: 'notes' as SectionId,
      label: `Note ${n} — ${getNoteTitle(n)}`,
      componentKey: `Note${n}SYSCOHADA`,
      regimes: NS as Regime[],
      sourceData: (n <= 8 ? 'balance' : 'mixte') as LiassePage['sourceData'],
    }
  }),

  // Notes 21 a 39
  ...([21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] as number[]).map((n, idx) => ({
    id: `NOTE_${n}`,
    pageNum: 42 + idx,
    section: 'notes' as SectionId,
    label: `Note ${n} — ${getNoteTitle(n)}`,
    componentKey: `Note${n}SYSCOHADA`,
    regimes: ([22, 27, 31].includes(n) ? NS : N) as Regime[],
    sourceData: 'mixte' as LiassePage['sourceData'],
  })),

  // Notes DGI-INS
  { id: 'NOTES_DGI_INS', pageNum: 61, section: 'notes', label: 'Notes DGI-INS', componentKey: 'NotesDgiInsSYSCOHADA', regimes: NS, sourceData: 'mixte' },

  // ══════════════════════════════════════════
  // SECTION 6 — SUPPLEMENTS (12 pages)
  // ══════════════════════════════════════════
  { id: 'TABLES_CALCUL_IMPOTS', pageNum: 62, section: 'supplements', label: 'Tables de Calcul des Impots', componentKey: 'TablesCalculImpots', regimes: NSF, sourceData: 'calcul' },
  { id: 'TABLEAUX_SUPPLEMENTAIRES', pageNum: 63, section: 'supplements', label: 'Tableaux Supplementaires', componentKey: 'TableauxSupplementaires', regimes: NS, sourceData: 'calcul' },
  { id: 'COMP_CHARGES', pageNum: 64, section: 'supplements', label: 'Complement Charges', componentKey: 'ComplementCharges', regimes: NS, sourceData: 'balance' },
  { id: 'COMP_TVA', pageNum: 65, section: 'supplements', label: 'Complement TVA', componentKey: 'SupplementTVA', regimes: NSF, sourceData: 'balance' },
  { id: 'COMP_TVA_2', pageNum: 66, section: 'supplements', label: 'Complement TVA (2)', componentKey: 'CompTva2', regimes: NS, sourceData: 'balance' },
  { id: 'SUPPL1', pageNum: 67, section: 'supplements', label: 'Supplement 1 — Impot sur les Societes', componentKey: 'SupplementImpotSociete', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL2', pageNum: 68, section: 'supplements', label: 'Supplement 2 — Avantages Fiscaux', componentKey: 'SupplementAvantagesFiscaux', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL3', pageNum: 69, section: 'supplements', label: 'Supplement 3 — Complement Produits', componentKey: 'ComplementProduits', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL4', pageNum: 70, section: 'supplements', label: 'Supplement 4', componentKey: 'Suppl4', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL5', pageNum: 71, section: 'supplements', label: 'Supplement 5', componentKey: 'Suppl5', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL6', pageNum: 72, section: 'supplements', label: 'Supplement 6', componentKey: 'Suppl6', regimes: N, sourceData: 'mixte' },
  { id: 'SUPPL7', pageNum: 73, section: 'supplements', label: 'Supplement 7', componentKey: 'Suppl7', regimes: N, sourceData: 'mixte' },

  // ══════════════════════════════════════════
  // SECTION 7 — COMMENTAIRES (1 page)
  // ══════════════════════════════════════════
  { id: 'COMMENTAIRE', pageNum: 74, section: 'commentaires', label: 'Commentaires', componentKey: 'Commentaire', regimes: ALL, sourceData: 'saisie_manuelle' },
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
