/**
 * Knowledge — Liasse Fiscale SYSCOHADA
 */

import {
  LIASSE_SHEETS,
  getNoteTitle,
  getNoteDescription,
  getSheetRequirement,
  getVisibleSheets,
  getSheetCounts,
  REGIME_LABELS,
  SHEET_CATEGORIES,
} from '@/config/liasseFiscaleSheets'
import type { RegimeImposition } from '@/config/liasseFiscaleSheets'
import { SYSCOHADA_MAPPING } from '@/services/liasseDataService'
import type { Proph3tResponse, LiasseSheetCard, FiscalInfoCard } from '../types'

const ALL_REGIMES: RegimeImposition[] = ['REEL_NORMAL', 'REEL_SIMPLIFIE', 'FORFAITAIRE', 'MICRO']

function makeSheetEntry(sheet: typeof LIASSE_SHEETS[0]) {
  const regimes: Record<string, string> = {}
  for (const r of ALL_REGIMES) {
    regimes[REGIME_LABELS[r]] = getSheetRequirement(sheet.id, r)
  }
  return {
    id: sheet.id,
    name: sheet.name,
    title: sheet.title,
    description: sheet.description,
    category: sheet.category,
    required: sheet.required,
    regimes,
  }
}

// ── Sheet lookup ─────────────────────────────────────────────────────

export function handleLiasseSheet(sheetId?: string, noteNumber?: number, keywords?: string[]): Proph3tResponse {
  // Lookup by note number
  if (noteNumber !== undefined) {
    const noteId = `note${noteNumber}`
    const sheet = LIASSE_SHEETS.find(s => s.id === noteId || s.id === 'note36_details' && noteNumber === 36)

    if (!sheet) {
      return {
        text: `La **Note ${noteNumber}** n'existe pas dans la liasse fiscale SYSCOHADA. Les notes vont de 1 a 39.`,
        suggestions: ['Note 1', 'Note 15', 'Note 20', 'Liasse fiscale'],
      }
    }

    const title = getNoteTitle(noteNumber)
    const desc = getNoteDescription(noteNumber)
    const entry = makeSheetEntry(sheet)

    const card: LiasseSheetCard = { type: 'liasse_sheet', sheets: [entry] }
    return {
      text: `**Note ${noteNumber} — ${title}**\n\n${desc}\n\n${sheet.required ? '**Obligatoire** selon SYSCOHADA' : 'Facultatif'}`,
      content: [card],
      suggestions: [
        noteNumber > 1 ? `Note ${noteNumber - 1}` : 'Note 2',
        noteNumber < 39 ? `Note ${noteNumber + 1}` : 'Note 38',
        'Regime reel normal',
      ],
    }
  }

  // Lookup by sheet ID
  if (sheetId) {
    const sheet = LIASSE_SHEETS.find(s => s.id === sheetId || s.name.toLowerCase() === sheetId.toLowerCase())
    if (sheet) {
      const card: LiasseSheetCard = { type: 'liasse_sheet', sheets: [makeSheetEntry(sheet)] }
      return {
        text: `**${sheet.title}**\n\n${sheet.description || 'Feuillet de la liasse fiscale SYSCOHADA'}`,
        content: [card],
        suggestions: ['Notes annexes', 'Regime reel normal', 'Etats financiers'],
      }
    }
  }

  // Keyword-based search in sheet titles/names
  if (keywords && keywords.length > 0) {
    const matches = LIASSE_SHEETS.filter(s => {
      const searchText = `${s.name} ${s.title} ${s.description || ''}`.toLowerCase()
      return keywords.some(kw => kw.length > 2 && searchText.includes(kw))
    })
    if (matches.length > 0) {
      const top = matches.slice(0, 10)
      const entries = top.map(makeSheetEntry)
      const card: LiasseSheetCard = { type: 'liasse_sheet', sheets: entries }
      return {
        text: `**${matches.length} feuillet${matches.length > 1 ? 's' : ''}** trouve${matches.length > 1 ? 's' : ''} dans la liasse fiscale :`,
        content: [card],
        suggestions: ['Note 1', 'Regime reel normal', 'Categories liasse'],
      }
    }
  }

  // General liasse info
  const totalSheets = LIASSE_SHEETS.length
  const categories = SHEET_CATEGORIES.map(c => {
    const count = LIASSE_SHEETS.filter(s => s.category === c.id).length
    return `- **${c.label}** : ${count} feuillet${count > 1 ? 's' : ''}`
  }).join('\n')

  return {
    text: `**Liasse Fiscale SYSCOHADA** — ${totalSheets} feuillets au total\n\n${categories}\n\nPrecisez un numero de note (ex: "Note 15") ou un type de feuillet pour plus de details.`,
    suggestions: ['Note 1', 'Note 15', 'Regime reel normal', 'Etats financiers'],
  }
}

// ── Regime lookup ────────────────────────────────────────────────────

export function handleLiasseRegime(regime?: string): Proph3tResponse {
  const regimeKey = (regime?.toUpperCase() || 'REEL_NORMAL') as RegimeImposition

  if (!REGIME_LABELS[regimeKey]) {
    return {
      text: `Regime non reconnu. Les regimes disponibles sont :\n\n- **Reel Normal**\n- **Reel Simplifie**\n- **Forfaitaire**\n- **Micro-entreprise**`,
      suggestions: ['Regime reel normal', 'Regime simplifie', 'Regime forfaitaire', 'Regime micro'],
    }
  }

  const visible = getVisibleSheets(regimeKey)
  const counts = getSheetCounts(regimeKey)
  const label = REGIME_LABELS[regimeKey]

  const entries = visible.slice(0, 15).map(makeSheetEntry)
  const card: LiasseSheetCard = { type: 'liasse_sheet', sheets: entries }

  return {
    text: `**Liasse Fiscale — Regime ${label}**\n\n- **${counts.obligatoire}** feuillets obligatoires\n- **${counts.facultatif}** feuillets facultatifs\n- **${visible.length}** feuillets visibles au total\n\nVoici les premiers feuillets applicables :`,
    content: [card],
    suggestions: [
      regimeKey !== 'REEL_NORMAL' ? 'Regime reel normal' : 'Regime simplifie',
      'Note 15',
      'Categories liasse',
    ],
  }
}

// ── Mapping comptes ↔ postes ─────────────────────────────────────────

const POSTE_LABELS: Record<string, string> = {
  // Actif — Charges immobilisées
  AQ: "Frais d'établissement",
  AR: "Charges à répartir",
  AS: "Primes de remboursement des obligations",
  // Actif — Immobilisations incorporelles
  AD: "Frais de recherche et développement",
  AE: "Brevets, licences, logiciels et droits similaires",
  AF: "Fonds commercial et droit au bail",
  AG: "Autres immobilisations incorporelles",
  // Actif — Immobilisations corporelles
  AJ: "Terrains",
  AK: "Bâtiments",
  AL: "Installations et agencements",
  AM: "Matériel",
  AN: "Matériel de transport",
  AP: "Avances et acomptes versés sur immobilisations",
  // Actif — Immobilisations financières
  AT: "Titres de participation",
  AU: "Autres immobilisations financières",
  // Actif circulant
  BA: "Actif circulant HAO",
  BC: "Marchandises",
  BD: "Matières premières et autres approvisionnements",
  BE: "Autres approvisionnements",
  BF: "Produits en cours",
  BG: "Produits fabriqués",
  BI: "Fournisseurs, avances versées",
  BJ: "Clients",
  BK: "Autres créances",
  // Trésorerie actif
  BQ: "Titres de placement",
  BR: "Valeurs à encaisser",
  BS: "Banques, chèques postaux, caisse",
  BU: "Écart de conversion-Actif",

  // Passif — Capitaux propres
  CA: "Capital",
  CB: "Actionnaires, capital souscrit non appelé (-)",
  CC: "Primes liées au capital social",
  CD: "Réserves indisponibles",
  CE: "Écart de réévaluation",
  CF: "Réserves libres",
  CG: "Report à nouveau",
  CH: "Résultat net de l'exercice",
  CI: "Subventions d'investissement",
  CJ: "Provisions réglementées et fonds assimilés",
  // Passif — Dettes financières
  DA: "Emprunts obligataires",
  DB: "Emprunts et dettes auprès des établissements de crédit",
  DC: "Autres dettes financières",
  DD: "Dettes de crédit-bail et contrats assimilés",
  DE: "Dettes liées à des participations",
  DF: "Provisions financières pour risques et charges",
  // Passif circulant
  DH: "Dettes circulantes HAO et ressources assimilées",
  DI: "Clients, avances reçues",
  DJ: "Fournisseurs d'exploitation",
  DK: "Dettes fiscales et sociales",
  DL: "Autres dettes",
  DM: "Risques provisionnés",
  // Trésorerie passif
  DQ: "Banques, crédits d'escompte",
  DR: "Banques, établissements financiers et crédits de trésorerie",
  DT: "Écart de conversion-Passif",

  // Charges
  RA: "Achats de marchandises",
  RB: "Variation de stocks de marchandises",
  RC: "Achats de matières premières et fournitures liées",
  RD: "Variation de stocks de matières premières",
  RE: "Autres achats",
  RF: "Variation de stocks d'autres approvisionnements",
  RG: "Transports",
  RH: "Services extérieurs",
  RI: "Impôts et taxes",
  RJ: "Autres charges",
  RK: "Charges de personnel",
  RL: "Dotations aux amortissements d'exploitation",
  RM: "Dotations aux provisions d'exploitation",
  RN: "Frais financiers et charges assimilées",
  RO: "Pertes de change",
  RP: "Dotations aux provisions financières",
  RQ: "Valeurs comptables des cessions d'immobilisations",
  RR: "Charges HAO",
  RS: "Participation des travailleurs / Impôt sur le résultat",

  // Produits
  TA: "Ventes de marchandises",
  TB: "Ventes de produits fabriqués",
  TC: "Travaux, services vendus",
  TD: "Production stockée (ou déstockage)",
  TE: "Production immobilisée",
  TF: "Produits accessoires",
  TG: "Subventions d'exploitation",
  TH: "Autres produits",
  TI: "Reprises de provisions d'exploitation",
  TJ: "Revenus financiers et produits assimilés",
  TK: "Gains de change",
  TL: "Reprises de provisions financières",
  TM: "Transferts de charges financières",
  TN: "Produits des cessions d'immobilisations",
  TO: "Produits HAO",
}

type SectionKey = keyof typeof SYSCOHADA_MAPPING
const SECTION_LABELS: Record<SectionKey, string> = {
  actif: 'Bilan Actif',
  passif: 'Bilan Passif',
  charges: 'Compte de Résultat — Charges',
  produits: 'Compte de Résultat — Produits',
}

/** Recherche inverse : un numéro de compte → dans quel(s) poste(s) il apparaît */
function findPostesByAccount(accountPrefix: string): { ref: string; label: string; section: string; type: 'brut' | 'amort' }[] {
  const results: { ref: string; label: string; section: string; type: 'brut' | 'amort' }[] = []

  for (const [section, postes] of Object.entries(SYSCOHADA_MAPPING) as [SectionKey, Record<string, any>][]) {
    for (const [ref, mapping] of Object.entries(postes)) {
      // Check main comptes
      const mainMatch = (mapping.comptes as string[]).some(
        (prefix: string) => accountPrefix.startsWith(prefix) || prefix.startsWith(accountPrefix)
      )
      if (mainMatch) {
        results.push({ ref, label: POSTE_LABELS[ref] || ref, section: SECTION_LABELS[section], type: 'brut' })
      }
      // Check amortComptes (actif only)
      if (mapping.amortComptes) {
        const amortMatch = (mapping.amortComptes as string[]).some(
          (prefix: string) => accountPrefix.startsWith(prefix) || prefix.startsWith(accountPrefix)
        )
        if (amortMatch) {
          results.push({ ref, label: POSTE_LABELS[ref] || ref, section: SECTION_LABELS[section], type: 'amort' })
        }
      }
    }
  }
  return results
}

export function handleLiasseMapping(accountNumber?: string, posteRef?: string, keywords?: string[]): Proph3tResponse {
  // ── 1. Compte → Poste(s) ──
  if (accountNumber) {
    const matches = findPostesByAccount(accountNumber)
    if (matches.length === 0) {
      return {
        text: `Le compte **${accountNumber}** n'apparait dans aucun poste du mapping SYSCOHADA.\n\nLes comptes de classe 1 a 5 vont au bilan, classe 6 aux charges, classe 7 aux produits.`,
        suggestions: ['Mapping actif', 'Mapping passif', 'Mapping charges'],
      }
    }

    const items = matches.map(m => ({
      label: `${m.ref} — ${m.label}`,
      value: m.type === 'amort' ? `${m.section} (colonne Amort/Prov)` : m.section,
    }))

    const card: FiscalInfoCard = { type: 'fiscal_info', category: 'Mapping SYSCOHADA', items }
    const detail = matches.map(m =>
      `- **${m.ref}** (${m.label}) → ${m.section}${m.type === 'amort' ? ' *(amort/provisions)*' : ''}`
    ).join('\n')

    return {
      text: `Le compte **${accountNumber}** se ventile dans la liasse fiscale :\n\n${detail}`,
      content: [card],
      suggestions: matches.slice(0, 2).map(m => `Poste ${m.ref}`).concat(['Mapping actif']),
    }
  }

  // ── 2. Poste → Comptes ──
  if (posteRef) {
    const ref = posteRef.toUpperCase()
    // Find which section contains this ref
    for (const [section, postes] of Object.entries(SYSCOHADA_MAPPING) as [SectionKey, Record<string, any>][]) {
      if (postes[ref]) {
        const mapping = postes[ref]
        const comptes = (mapping.comptes as string[]).join(', ')
        const amort = mapping.amortComptes?.length > 0
          ? `\n**Amort/Provisions** : ${(mapping.amortComptes as string[]).join(', ')}`
          : ''

        const items: { label: string; value: string }[] = [
          { label: 'Référence', value: ref },
          { label: 'Libellé', value: POSTE_LABELS[ref] || ref },
          { label: 'Section', value: SECTION_LABELS[section] },
          { label: 'Comptes', value: comptes },
        ]
        if (mapping.amortComptes?.length > 0) {
          items.push({ label: 'Amort/Prov', value: (mapping.amortComptes as string[]).join(', ') })
        }

        const card: FiscalInfoCard = { type: 'fiscal_info', category: `Poste ${ref}`, items }

        return {
          text: `**Poste ${ref}** — ${POSTE_LABELS[ref] || 'Poste SYSCOHADA'}\n\n**Section** : ${SECTION_LABELS[section]}\n**Comptes** : ${comptes}${amort}`,
          content: [card],
          suggestions: (mapping.comptes as string[]).slice(0, 2).map((c: string) => `Compte ${c}`).concat([`Mapping ${section}`]),
        }
      }
    }

    return {
      text: `Le poste **${ref}** n'existe pas dans le mapping SYSCOHADA.\n\nLes references valides sont :\n- **A/B** : Bilan Actif (AQ-BU)\n- **C/D** : Bilan Passif (CA-DT)\n- **R** : Charges (RA-RS)\n- **T** : Produits (TA-TO)`,
      suggestions: ['Poste AD', 'Poste BJ', 'Poste CA', 'Poste RA'],
    }
  }

  // ── 3. Section keyword (actif, passif, charges, produits) ──
  const sectionKeyword = keywords?.find(k => ['actif', 'passif', 'charges', 'produits', 'bilan', 'resultat'].includes(k))
  if (sectionKeyword) {
    let targetSections: SectionKey[] = []
    if (sectionKeyword === 'bilan') targetSections = ['actif', 'passif']
    else if (sectionKeyword === 'resultat') targetSections = ['charges', 'produits']
    else if (['actif', 'passif', 'charges', 'produits'].includes(sectionKeyword)) targetSections = [sectionKeyword as SectionKey]

    const items: { label: string; value: string }[] = []
    for (const section of targetSections) {
      const postes = SYSCOHADA_MAPPING[section]
      for (const [ref] of Object.entries(postes)) {
        items.push({ label: ref, value: POSTE_LABELS[ref] || ref })
      }
    }

    const card: FiscalInfoCard = { type: 'fiscal_info', category: `Mapping ${targetSections.map(s => SECTION_LABELS[s]).join(' + ')}`, items }
    const summary = targetSections.map(s => {
      const count = Object.keys(SYSCOHADA_MAPPING[s]).length
      return `- **${SECTION_LABELS[s]}** : ${count} postes`
    }).join('\n')

    return {
      text: `**Mapping SYSCOHADA** — ${sectionKeyword}\n\n${summary}`,
      content: [card],
      suggestions: items.slice(0, 3).map(i => `Poste ${i.label}`),
    }
  }

  // ── 4. Vue générale ──
  const totalPostes = Object.values(SYSCOHADA_MAPPING).reduce((sum, section) => sum + Object.keys(section).length, 0)
  const summary = (Object.entries(SECTION_LABELS) as [SectionKey, string][]).map(([key, label]) => {
    const count = Object.keys(SYSCOHADA_MAPPING[key]).length
    return `- **${label}** : ${count} postes`
  }).join('\n')

  return {
    text: `**Mapping SYSCOHADA** — ${totalPostes} postes au total\n\n${summary}\n\nPrecisez un **numero de compte** (ex: "ou va le 213") ou une **reference de poste** (ex: "poste AD") pour le detail.`,
    suggestions: ['Mapping actif', 'Mapping passif', 'Ou va le compte 601', 'Poste BJ'],
  }
}

// ── Category lookup ──────────────────────────────────────────────────

export function handleLiasseCategory(category?: string): Proph3tResponse {
  const cat = category?.toLowerCase()
  const validCats = SHEET_CATEGORIES.map(c => c.id)

  if (cat && validCats.includes(cat)) {
    const catInfo = SHEET_CATEGORIES.find(c => c.id === cat)!
    const sheets = LIASSE_SHEETS.filter(s => s.category === cat)
    const entries = sheets.slice(0, 15).map(makeSheetEntry)
    const card: LiasseSheetCard = { type: 'liasse_sheet', sheets: entries }

    return {
      text: `**${catInfo.label}** — ${sheets.length} feuillet${sheets.length > 1 ? 's' : ''}`,
      content: [card],
      suggestions: validCats.filter(c => c !== cat).slice(0, 3).map(c => {
        const info = SHEET_CATEGORIES.find(sc => sc.id === c)
        return info?.label || c
      }),
    }
  }

  // List all categories
  const summary = SHEET_CATEGORIES.map(c => {
    const count = LIASSE_SHEETS.filter(s => s.category === c.id).length
    return `- **${c.label}** (${c.id}) : ${count} feuillets`
  }).join('\n')

  return {
    text: `**Categories de la Liasse Fiscale**\n\n${summary}`,
    suggestions: ['Etats financiers', 'Notes annexes', 'Supplements', 'Regime reel normal'],
  }
}
