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
import type { Proph3tResponse, LiasseSheetCard } from '../types'

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
