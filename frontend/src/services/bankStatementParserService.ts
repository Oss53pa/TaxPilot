/**
 * Parseurs de relevés bancaires : OFX, CAMT.053, CSV
 * Transforme les fichiers bruts en BankTransaction[]
 */

import type { BankTransaction } from './bankFeedStorageService'

type RawTransaction = Omit<BankTransaction, 'id' | 'createdAt'>

// ────────── OFX Parser ──────────

export function parseOFXFile(text: string, bankAccountId: string): RawTransaction[] {
  const transactions: RawTransaction[] = []

  // Extract transactions between <STMTTRN> tags
  const txnBlocks = text.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) || []

  for (const block of txnBlocks) {
    const getTag = (tag: string): string => {
      // OFX format: <TAG>value or <TAG>value\n
      const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'))
      return match ? match[1].trim() : ''
    }

    const amount = parseFloat(getTag('TRNAMT')) || 0
    const dateRaw = getTag('DTPOSTED')
    // OFX date format: YYYYMMDDHHMMSS or YYYYMMDD
    const date = dateRaw.length >= 8
      ? `${dateRaw.substring(0, 4)}-${dateRaw.substring(4, 6)}-${dateRaw.substring(6, 8)}`
      : new Date().toISOString().split('T')[0]

    const label = getTag('NAME') || getTag('MEMO') || 'Transaction sans libelle'
    const reference = getTag('FITID') || getTag('REFNUM') || ''

    transactions.push({
      bankAccountId,
      date,
      label,
      reference,
      amount,
      reconciled: false,
      compteComptable: null,
      suggestedCompte: null,
      suggestionConfidence: 0,
      source: 'OFX',
    })
  }

  return transactions
}

// ────────── CAMT.053 Parser (ISO 20022) ──────────

export function parseCAMT053File(xml: string, bankAccountId: string): RawTransaction[] {
  const transactions: RawTransaction[] = []

  // Parse XML using DOMParser
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')

  // Find all Ntry (entry) elements
  const entries = doc.getElementsByTagName('Ntry')

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    // Amount
    const amtEl = entry.getElementsByTagName('Amt')[0]
    let amount = amtEl ? parseFloat(amtEl.textContent || '0') : 0

    // Credit/Debit indicator
    const cdtDbtEl = entry.getElementsByTagName('CdtDbtInd')[0]
    if (cdtDbtEl?.textContent === 'DBIT') amount = -Math.abs(amount)
    else amount = Math.abs(amount)

    // Booking date
    const bookgDtEl = entry.getElementsByTagName('BookgDt')[0]
    const dtEl = bookgDtEl?.getElementsByTagName('Dt')[0]
    const date = dtEl?.textContent || new Date().toISOString().split('T')[0]

    // Reference
    const acctSvcrRefEl = entry.getElementsByTagName('AcctSvcrRef')[0]
    const reference = acctSvcrRefEl?.textContent || ''

    // Label - look in transaction details
    let label = ''
    const rmtInfEl = entry.getElementsByTagName('RmtInf')[0]
    if (rmtInfEl) {
      const ustrdEl = rmtInfEl.getElementsByTagName('Ustrd')[0]
      label = ustrdEl?.textContent || ''
    }
    if (!label) {
      const addtlNtryInfEl = entry.getElementsByTagName('AddtlNtryInf')[0]
      label = addtlNtryInfEl?.textContent || 'Transaction CAMT'
    }

    transactions.push({
      bankAccountId,
      date,
      label,
      reference,
      amount,
      reconciled: false,
      compteComptable: null,
      suggestedCompte: null,
      suggestionConfidence: 0,
      source: 'CAMT053',
    })
  }

  return transactions
}

// ────────── CSV Parser ──────────

export interface CSVParserConfig {
  separator: string       // ',' or ';' or '\t'
  dateColumn: number      // 0-indexed
  labelColumn: number
  amountColumn: number
  debitColumn?: number    // if separate debit/credit columns
  creditColumn?: number
  referenceColumn?: number
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD-MM-YYYY'
  skipHeader: boolean
  encoding?: string
}

export const DEFAULT_CSV_CONFIG: CSVParserConfig = {
  separator: ';',
  dateColumn: 0,
  labelColumn: 1,
  amountColumn: 2,
  dateFormat: 'DD/MM/YYYY',
  skipHeader: true,
}

function parseCSVDate(raw: string, format: CSVParserConfig['dateFormat']): string {
  const clean = raw.trim().replace(/['"]/g, '')
  switch (format) {
    case 'DD/MM/YYYY': {
      const [d, m, y] = clean.split('/')
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    case 'DD-MM-YYYY': {
      const [d, m, y] = clean.split('-')
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    case 'MM/DD/YYYY': {
      const [m, d, y] = clean.split('/')
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    case 'YYYY-MM-DD':
    default:
      return clean
  }
}

function parseAmount(raw: string): number {
  // Handle French number format: 1 234,56 or 1.234,56
  const clean = raw.trim().replace(/['"]/g, '').replace(/\s/g, '')
  // If uses comma as decimal separator
  if (clean.includes(',') && !clean.includes('.')) {
    return parseFloat(clean.replace(',', '.')) || 0
  }
  // If uses both . and , → 1.234,56 format
  if (clean.includes('.') && clean.includes(',')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0
  }
  return parseFloat(clean) || 0
}

export function parseBankCSV(text: string, bankAccountId: string, config: CSVParserConfig = DEFAULT_CSV_CONFIG): RawTransaction[] {
  const transactions: RawTransaction[] = []
  const lines = text.split(/\r?\n/).filter(l => l.trim())

  const startIdx = config.skipHeader ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(config.separator)
    if (cols.length < Math.max(config.dateColumn, config.labelColumn, config.amountColumn) + 1) continue

    const date = parseCSVDate(cols[config.dateColumn], config.dateFormat)
    const label = cols[config.labelColumn].trim().replace(/^["']|["']$/g, '')
    const reference = config.referenceColumn !== undefined ? cols[config.referenceColumn]?.trim().replace(/^["']|["']$/g, '') || '' : ''

    let amount: number
    if (config.debitColumn !== undefined && config.creditColumn !== undefined) {
      const debit = parseAmount(cols[config.debitColumn] || '0')
      const credit = parseAmount(cols[config.creditColumn] || '0')
      amount = credit > 0 ? credit : -Math.abs(debit)
    } else {
      amount = parseAmount(cols[config.amountColumn])
    }

    if (amount === 0 && !label) continue // skip empty lines

    transactions.push({
      bankAccountId,
      date,
      label,
      reference,
      amount,
      reconciled: false,
      compteComptable: null,
      suggestedCompte: null,
      suggestionConfidence: 0,
      source: 'CSV',
    })
  }

  return transactions
}

// ────────── Auto-detect file type ──────────

export function detectFileType(text: string): 'OFX' | 'CAMT053' | 'CSV' | null {
  const trimmed = text.trim()
  if (trimmed.includes('<OFX>') || trimmed.includes('OFXHEADER')) return 'OFX'
  if (trimmed.includes('<Document') && (trimmed.includes('camt.053') || trimmed.includes('BkToCstmrStmt'))) return 'CAMT053'
  // Check if it looks like CSV (has lines with consistent separators)
  const lines = trimmed.split(/\r?\n/).filter(l => l.trim())
  if (lines.length >= 2) {
    const sep = [';', ',', '\t'].find(s => {
      const counts = lines.slice(0, 5).map(l => l.split(s).length)
      return counts[0] > 1 && counts.every(c => c === counts[0])
    })
    if (sep) return 'CSV'
  }
  return null
}

export function detectCSVSeparator(text: string): string {
  const lines = text.split(/\r?\n/).filter(l => l.trim()).slice(0, 5)
  for (const sep of [';', ',', '\t']) {
    const counts = lines.map(l => l.split(sep).length)
    if (counts[0] > 1 && counts.every(c => c === counts[0])) return sep
  }
  return ';'
}
