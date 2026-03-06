/**
 * Service de parsing Excel/CSV — balance SYSCOHADA 8 colonnes
 * Structure cible :
 *   Compte | Description | Solde Débit N-1 | Solde Crédit N-1
 *   | Mouvement Débit N | Mouvement Crédit N | Solde Débit N | Solde Crédit N
 *
 * Rétrocompatible avec l'ancien format 10 colonnes (Débit/Crédit + Solde Débit/Crédit + N-1).
 */

import * as XLSX from 'xlsx'
import type { BalanceEntry } from './liasseDataService'

// ────────── Public types ──────────

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
  debitN1?: number
  creditN1?: number
  soldeDebitN1?: number
  soldeCreditN1?: number
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
  /** @deprecated — N-1 is now inside each BalanceEntry. Kept empty for compat. */
  entriesN1: BalanceEntry[]
  errors: string[]
  warnings: string[]
  totalRows: number
  validRows: number
  skippedRows: number
}

export interface ImportPipelineResult {
  entries: BalanceEntry[]
  entriesN1: BalanceEntry[]
  detection: DetectionResult
  parseResult: ParseResult
  errors: string[]
  warnings: string[]
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
    FS: separator || undefined,
  })
  const name = workbook.SheetNames[0]
  const sheet = workbook.Sheets[name]
  const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const headers = json.length > 0 ? json[0].map(String) : []
  const rows = json.slice(1)
  return { name, headers, rows, rawSheet: sheet }
}

// ────────── Column detection ──────────

/** Normalise: lowercase, remove accents/extra spaces */
function norm(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Patterns for column type detection */
const PATTERNS = {
  compte:      /n[°o]?\s*compte|numero.*compte|code.*compte|numero|n[°o]\s*cpte|^compte$/,
  libelle:     /libelle|intitule|designation|description|nom.*compte/,
  debit:       /debit(?!\s*e)/,
  credit:      /credit/,
  soldeDebit:  /solde.*debit|debit.*solde|^sd$/,
  soldeCredit: /solde.*credit|credit.*solde|^sc$/,
}

/** N-1 markers */
const N1_MARKER = /n[\s\-._]*1|precedent|anterieur|previous/

/** Extract a 4-digit year from a header string */
function extractYear(header: string): number | null {
  const m = header.match(/\b(20\d{2})\b/)
  return m ? parseInt(m[1], 10) : null
}

/** Mouvement marker — distinguishes "Mouvement Débit" from "Solde Débit" */
const MVT_MARKER = /mouvement|mvt|flux/

export function detectStructure(sheet: ParsedSheet): DetectionResult {
  const { headers, rows } = sheet

  if (headers.length === 0) {
    return { mapping: null, headers: [], sampleData: [], confidence: 0, rowCount: 0 }
  }

  const mapping: Partial<ColumnMapping> = {}
  let matchCount = 0

  // Detect years in headers for N vs N-1 disambiguation
  const headerYears = headers.map(h => extractYear(h.trim()))
  const distinctYears = [...new Set(headerYears.filter((y): y is number => y !== null))].sort((a, b) => a - b)
  const maxYear = distinctYears.length >= 2 ? distinctYears[distinctYears.length - 1] : null

  // Classify each header column
  const colClassification: { type: string; isN1: boolean; isMvt: boolean }[] = headers.map((h, idx) => {
    const n = norm(h)
    const isN1 = N1_MARKER.test(n) ||
      (maxYear !== null && headerYears[idx] !== null && headerYears[idx]! < maxYear)
    const isMvt = MVT_MARKER.test(n)

    // Order matters: soldeDebit before debit to avoid false matches
    if (!isMvt && PATTERNS.soldeDebit.test(n))  return { type: 'soldeDebit', isN1, isMvt }
    if (!isMvt && PATTERNS.soldeCredit.test(n)) return { type: 'soldeCredit', isN1, isMvt }
    if (PATTERNS.compte.test(n))                return { type: 'compte', isN1: false, isMvt: false }
    if (PATTERNS.libelle.test(n))               return { type: 'libelle', isN1: false, isMvt: false }
    if (PATTERNS.debit.test(n))                 return { type: 'debit', isN1, isMvt }
    if (PATTERNS.credit.test(n))                return { type: 'credit', isN1, isMvt }
    return { type: 'unknown', isN1, isMvt }
  })

  // Assign N columns (non N-1)
  colClassification.forEach((col, i) => {
    if (col.isN1 || col.type === 'unknown') return
    if (col.type === 'soldeDebit' && mapping.soldeDebit === undefined)   { mapping.soldeDebit = i; matchCount++ }
    else if (col.type === 'soldeCredit' && mapping.soldeCredit === undefined) { mapping.soldeCredit = i; matchCount++ }
    else if (col.type === 'compte' && mapping.compte === undefined)     { mapping.compte = i; matchCount++ }
    else if (col.type === 'libelle' && mapping.libelle === undefined)   { mapping.libelle = i; matchCount++ }
    else if (col.type === 'debit' && mapping.debit === undefined)       { mapping.debit = i; matchCount++ }
    else if (col.type === 'credit' && mapping.credit === undefined)     { mapping.credit = i; matchCount++ }
  })

  // Assign N-1 columns (explicitly marked)
  colClassification.forEach((col, i) => {
    if (!col.isN1 || col.type === 'unknown') return
    if (col.type === 'soldeDebit' && mapping.soldeDebitN1 === undefined)   { mapping.soldeDebitN1 = i }
    else if (col.type === 'soldeCredit' && mapping.soldeCreditN1 === undefined) { mapping.soldeCreditN1 = i }
    else if (col.type === 'debit' && mapping.debitN1 === undefined)       { mapping.debitN1 = i }
    else if (col.type === 'credit' && mapping.creditN1 === undefined)     { mapping.creditN1 = i }
  })

  // Handle duplicate columns without N-1 markers:
  // If there are 2+ debit/credit or soldeDebit/soldeCredit columns, second pair = N-1
  const hasExplicitN1 = mapping.debitN1 !== undefined || mapping.creditN1 !== undefined ||
                         mapping.soldeDebitN1 !== undefined || mapping.soldeCreditN1 !== undefined
  if (!hasExplicitN1) {
    const seen = new Map<string, number[]>()
    colClassification.forEach((col, i) => {
      if (col.isN1 || col.type === 'unknown' || col.type === 'compte' || col.type === 'libelle') return
      const list = seen.get(col.type) || []
      list.push(i)
      seen.set(col.type, list)
    })
    seen.forEach((indices, type) => {
      if (indices.length < 2) return
      const [nIdx, n1Idx] = indices
      if (type === 'soldeDebit')  { mapping.soldeDebit = nIdx; mapping.soldeDebitN1 = n1Idx }
      if (type === 'soldeCredit') { mapping.soldeCredit = nIdx; mapping.soldeCreditN1 = n1Idx }
      if (type === 'debit')       { mapping.debit = nIdx; mapping.debitN1 = n1Idx }
      if (type === 'credit')      { mapping.credit = nIdx; mapping.creditN1 = n1Idx }
    })
  }

  // Minimal requirement: at least compte + amount columns
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
  if (mapping.libelle === undefined) mapping.libelle = -1

  // Fill N-1 defaults from solde columns
  if (mapping.debitN1 === undefined && mapping.soldeDebitN1 !== undefined) mapping.debitN1 = mapping.soldeDebitN1
  if (mapping.creditN1 === undefined && mapping.soldeCreditN1 !== undefined) mapping.creditN1 = mapping.soldeCreditN1

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

  const hasN1 = (mapping.soldeDebitN1 !== undefined && mapping.soldeCreditN1 !== undefined) ||
                (mapping.debitN1 !== undefined && mapping.creditN1 !== undefined)

  const { rows } = sheet

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const lineNum = i + 2

    const compteRaw = row[mapping.compte]
    if (compteRaw == null || String(compteRaw).trim() === '') {
      skippedRows++
      continue
    }

    const compte = String(compteRaw).trim().replace(/\s/g, '')
    if (!/^\d/.test(compte)) {
      skippedRows++
      continue
    }

    const intitule = mapping.libelle >= 0 ? String(row[mapping.libelle] ?? '').trim() : ''
    const debit = parseFrenchNumber(row[mapping.debit])
    const credit = parseFrenchNumber(row[mapping.credit])

    // Solde N
    let solde_debit: number
    let solde_credit: number
    if (mapping.soldeDebit !== undefined && mapping.soldeCredit !== undefined &&
        mapping.soldeDebit !== mapping.debit && mapping.soldeCredit !== mapping.credit) {
      solde_debit = parseFrenchNumber(row[mapping.soldeDebit])
      solde_credit = parseFrenchNumber(row[mapping.soldeCredit])
    } else {
      const solde = debit - credit
      solde_debit = solde > 0 ? solde : 0
      solde_credit = solde < 0 ? Math.abs(solde) : 0
    }

    // Solde N-1 (unified into the same entry)
    let solde_debit_n1 = 0
    let solde_credit_n1 = 0
    if (hasN1) {
      if (mapping.soldeDebitN1 !== undefined && mapping.soldeCreditN1 !== undefined &&
          mapping.soldeDebitN1 !== mapping.debitN1 && mapping.soldeCreditN1 !== mapping.creditN1) {
        solde_debit_n1 = parseFrenchNumber(row[mapping.soldeDebitN1])
        solde_credit_n1 = parseFrenchNumber(row[mapping.soldeCreditN1])
      } else if (mapping.debitN1 !== undefined && mapping.creditN1 !== undefined) {
        const dN1 = parseFrenchNumber(row[mapping.debitN1])
        const cN1 = parseFrenchNumber(row[mapping.creditN1])
        const soldeN1 = dN1 - cN1
        solde_debit_n1 = soldeN1 > 0 ? soldeN1 : 0
        solde_credit_n1 = soldeN1 < 0 ? Math.abs(soldeN1) : 0
      }
    }

    // Skip completely empty rows
    if (debit === 0 && credit === 0 && solde_debit === 0 && solde_credit === 0 &&
        solde_debit_n1 === 0 && solde_credit_n1 === 0) {
      skippedRows++
      continue
    }

    if (debit < 0 || credit < 0) {
      warnings.push(`Ligne ${lineNum} : montant négatif détecté pour le compte ${compte}`)
    }

    entries.push({
      compte,
      intitule,
      debit,
      credit,
      solde_debit,
      solde_credit,
      solde_debit_n1,
      solde_credit_n1,
    })
  }

  if (entries.length === 0 && rows.length > 0) {
    errors.push('Aucune ligne de balance valide trouvée dans le fichier.')
  }

  if (skippedRows > 0) {
    warnings.push(`${skippedRows} lignes ignorées (vides ou non numériques)`)
  }

  const n1Count = entries.filter(e => (e.solde_debit_n1 ?? 0) !== 0 || (e.solde_credit_n1 ?? 0) !== 0).length
  if (n1Count > 0) {
    warnings.push(`${n1Count} comptes avec données N-1 détectés`)
  }

  return {
    entries,
    entriesN1: [], // deprecated — N-1 is now inside entries
    errors,
    warnings,
    totalRows: rows.length,
    validRows: entries.length,
    skippedRows,
  }
}

// ────────── Full pipeline ──────────

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

  const sheet = sheets[0]

  // Detect columns
  const detection = detectStructure(sheet)
  if (!detection.mapping) {
    throw new Error(
      'Impossible de détecter les colonnes de comptes. ' +
      'Vérifiez que le fichier contient les colonnes : Compte, Description, Solde Débit, Solde Crédit'
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
    entriesN1: [], // deprecated
    detection,
    parseResult,
    errors,
    warnings,
  }
}
