/**
 * Service de parsing Excel/CSV 100% client-side
 * Utilise la librairie xlsx (SheetJS) pour lire les fichiers
 */

import * as XLSX from 'xlsx'
import type { BalanceEntry } from './liasseDataService'

export interface ParsedSheet {
  name: string
  headers: string[]
  rows: any[][]
  rawSheet: XLSX.WorkSheet
}

export interface ColumnMapping {
  compte: number
  libelle: number
  debit: number
  credit: number
  soldeDebit?: number
  soldeCredit?: number
}

export interface DetectionResult {
  mapping: ColumnMapping | null
  headers: string[]
  sampleData: any[][]
  confidence: number
  rowCount: number
}

export interface ParseResult {
  entries: BalanceEntry[]
  errors: string[]
  warnings: string[]
  totalRows: number
  validRows: number
  skippedRows: number
}

// ────────── File reading ──────────

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'))
    reader.readAsArrayBuffer(file)
  })
}

export function readFileAsText(file: File, encoding = 'UTF-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'))
    reader.readAsText(file, encoding)
  })
}

// ────────── Parsing ──────────

export function parseExcelFile(buffer: ArrayBuffer): ParsedSheet[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  return workbook.SheetNames.map(name => {
    const sheet = workbook.Sheets[name]
    const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    const headers = json.length > 0 ? json[0].map(String) : []
    const rows = json.slice(1)
    return { name, headers, rows, rawSheet: sheet }
  })
}

export function parseCsvFile(text: string, separator?: string): ParsedSheet {
  const workbook = XLSX.read(text, {
    type: 'string',
    FS: separator,
  })
  const name = workbook.SheetNames[0]
  const sheet = workbook.Sheets[name]
  const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const headers = json.length > 0 ? json[0].map(String) : []
  const rows = json.slice(1)
  return { name, headers, rows, rawSheet: sheet }
}

// ────────── Column detection ──────────

const PATTERNS = {
  compte:      /n[°o]?\s*compte|numero.*compte|code.*compte|num[eé]ro|n[°o]\s*cpte|compte/i,
  libelle:     /libell[eé]|intitul[eé]|d[eé]signation|nom.*compte/i,
  debit:       /d[eé]bit(?!\s*e)/i,
  credit:      /cr[eé]dit/i,
  soldeDebit:  /solde.*d[eé]bit|d[eé]bit.*solde|sd/i,
  soldeCredit: /solde.*cr[eé]dit|cr[eé]dit.*solde|sc/i,
}

export function detectStructure(sheet: ParsedSheet): DetectionResult {
  const { headers, rows } = sheet

  if (headers.length === 0) {
    return { mapping: null, headers: [], sampleData: [], confidence: 0, rowCount: 0 }
  }

  const mapping: Partial<ColumnMapping> = {}
  let matchCount = 0

  // First pass: detect soldeDebit/soldeCredit (more specific patterns)
  headers.forEach((h, i) => {
    const trimmed = h.trim()
    if (PATTERNS.soldeDebit.test(trimmed)) { mapping.soldeDebit = i; matchCount++ }
    else if (PATTERNS.soldeCredit.test(trimmed)) { mapping.soldeCredit = i; matchCount++ }
  })

  // Second pass: detect the rest (avoiding columns already matched)
  const usedCols = new Set(Object.values(mapping).filter(v => v !== undefined))
  headers.forEach((h, i) => {
    if (usedCols.has(i)) return
    const trimmed = h.trim()
    if (mapping.compte === undefined && PATTERNS.compte.test(trimmed)) { mapping.compte = i; matchCount++ }
    else if (mapping.libelle === undefined && PATTERNS.libelle.test(trimmed)) { mapping.libelle = i; matchCount++ }
    else if (mapping.debit === undefined && PATTERNS.debit.test(trimmed)) { mapping.debit = i; matchCount++ }
    else if (mapping.credit === undefined && PATTERNS.credit.test(trimmed)) { mapping.credit = i; matchCount++ }
  })

  // Minimal: at least compte + (debit/credit or soldeDebit/soldeCredit)
  const hasCompte = mapping.compte !== undefined
  const hasAmounts = (mapping.debit !== undefined && mapping.credit !== undefined) ||
                     (mapping.soldeDebit !== undefined && mapping.soldeCredit !== undefined)

  if (!hasCompte || !hasAmounts) {
    return {
      mapping: null,
      headers,
      sampleData: rows.slice(0, 5),
      confidence: Math.round((matchCount / 4) * 50),
      rowCount: rows.length,
    }
  }

  // Fill defaults
  if (mapping.debit === undefined) mapping.debit = mapping.soldeDebit!
  if (mapping.credit === undefined) mapping.credit = mapping.soldeCredit!
  if (mapping.libelle === undefined) mapping.libelle = -1 // no libelle column

  const confidence = Math.min(100, Math.round((matchCount / 4) * 100))

  return {
    mapping: mapping as ColumnMapping,
    headers,
    sampleData: rows.slice(0, 5),
    confidence,
    rowCount: rows.length,
  }
}

// ────────── Number parsing (French format) ──────────

function parseFrenchNumber(value: any): number {
  if (typeof value === 'number') return value
  if (value == null || value === '') return 0

  let str = String(value).trim()
  // Remove thousand separators (spaces, non-breaking spaces, dots used as thousands)
  str = str.replace(/[\s\u00A0]/g, '')

  // Handle parentheses for negative numbers: (1234) => -1234
  const isNeg = /^\(.*\)$/.test(str)
  if (isNeg) str = str.replace(/[()]/g, '')

  // Replace comma decimal separator with dot
  str = str.replace(',', '.')

  // Remove trailing non-numeric chars like currency symbols
  str = str.replace(/[^\d.\-]/g, '')

  const num = parseFloat(str)
  if (isNaN(num)) return 0
  return isNeg ? -num : num
}

// ────────── Main parsing ──────────

export function parseBalanceData(sheet: ParsedSheet, mapping: ColumnMapping): ParseResult {
  const entries: BalanceEntry[] = []
  const errors: string[] = []
  const warnings: string[] = []
  let skippedRows = 0

  const { rows } = sheet

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const lineNum = i + 2 // +1 for header, +1 for 1-indexed

    const compteRaw = row[mapping.compte]
    if (compteRaw == null || String(compteRaw).trim() === '') {
      skippedRows++
      continue
    }

    const compte = String(compteRaw).trim().replace(/\s/g, '')
    // Skip rows where "compte" is clearly not an account number
    if (!/^\d/.test(compte)) {
      skippedRows++
      continue
    }

    const intitule = mapping.libelle >= 0 ? String(row[mapping.libelle] ?? '').trim() : ''
    const debit = parseFrenchNumber(row[mapping.debit])
    const credit = parseFrenchNumber(row[mapping.credit])

    let solde_debit: number
    let solde_credit: number

    if (mapping.soldeDebit !== undefined && mapping.soldeCredit !== undefined &&
        mapping.soldeDebit !== mapping.debit && mapping.soldeCredit !== mapping.credit) {
      solde_debit = parseFrenchNumber(row[mapping.soldeDebit])
      solde_credit = parseFrenchNumber(row[mapping.soldeCredit])
    } else {
      // Compute solde from debit/credit
      const solde = debit - credit
      solde_debit = solde > 0 ? solde : 0
      solde_credit = solde < 0 ? Math.abs(solde) : 0
    }

    if (debit === 0 && credit === 0 && solde_debit === 0 && solde_credit === 0) {
      skippedRows++
      continue
    }

    if (debit < 0 || credit < 0) {
      warnings.push(`Ligne ${lineNum} : montant négatif détecté pour le compte ${compte}`)
    }

    entries.push({ compte, intitule, debit, credit, solde_debit, solde_credit })
  }

  if (entries.length === 0 && rows.length > 0) {
    errors.push('Aucune ligne de balance valide trouvée dans le fichier.')
  }

  if (skippedRows > 0) {
    warnings.push(`${skippedRows} lignes ignorées (vides ou non numériques)`)
  }

  return {
    entries,
    errors,
    warnings,
    totalRows: rows.length,
    validRows: entries.length,
    skippedRows,
  }
}

// ────────── Full pipeline ──────────

export interface ImportPipelineResult {
  entries: BalanceEntry[]
  detection: DetectionResult
  parseResult: ParseResult
  errors: string[]
  warnings: string[]
}

export async function importBalanceFile(
  file: File,
  options?: { separator?: string; encoding?: string }
): Promise<ImportPipelineResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate extension
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
    throw new Error(`Format non supporté : .${ext || '?'}. Formats acceptés : .xlsx, .xls, .csv`)
  }

  if (file.size === 0) {
    throw new Error('Le fichier est vide ou ne contient aucune donnée lisible.')
  }

  // Parse
  let sheets: ParsedSheet[]
  if (ext === 'csv') {
    const text = await readFileAsText(file, options?.encoding || 'UTF-8')
    if (!text.trim()) {
      throw new Error('Le fichier est vide ou ne contient aucune donnée lisible.')
    }
    sheets = [parseCsvFile(text, options?.separator)]
  } else {
    const buffer = await readFileAsArrayBuffer(file)
    sheets = parseExcelFile(buffer)
  }

  if (sheets.length === 0 || sheets[0].headers.length === 0) {
    throw new Error('Le fichier est vide ou ne contient aucune donnée lisible.')
  }

  // Use first sheet
  const sheet = sheets[0]

  // Detect columns
  const detection = detectStructure(sheet)
  if (!detection.mapping) {
    throw new Error(
      'Impossible de détecter les colonnes de comptes. ' +
      'Vérifiez que le fichier contient les colonnes : Compte, Libellé, Débit, Crédit'
    )
  }

  // Parse data
  const parseResult = parseBalanceData(sheet, detection.mapping)
  errors.push(...parseResult.errors)
  warnings.push(...parseResult.warnings)

  if (parseResult.entries.length === 0) {
    throw new Error('Aucune ligne de balance valide trouvée dans le fichier.')
  }

  // Check balance equilibrium
  const totalDebit = parseResult.entries.reduce((s, e) => s + e.solde_debit, 0)
  const totalCredit = parseResult.entries.reduce((s, e) => s + e.solde_credit, 0)
  const ecart = Math.abs(totalDebit - totalCredit)
  if (ecart > 1) {
    warnings.push(`La balance n'est pas équilibrée. Écart : ${Math.round(ecart).toLocaleString('fr-FR')} FCFA`)
  }

  return {
    entries: parseResult.entries,
    detection,
    parseResult,
    errors,
    warnings,
  }
}
