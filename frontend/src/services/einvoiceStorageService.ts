/**
 * Service de persistance localStorage pour la facturation electronique
 * Pattern identique a balanceStorageService.ts
 */

import { scopeKey } from './dossierScopeService'

const PREFIX = 'fiscasync_einvoice_'

// ────────── Interfaces ──────────

export type InvoiceType = 'FACTURE' | 'AVOIR'
export type InvoiceDirection = 'VENTE' | 'ACHAT'
export type InvoiceStatus = 'brouillon' | 'validee' | 'envoyee' | 'payee' | 'annulee'

export interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number // 18 for 18%
  compteComptable: string // 7011 vente, 6011 achat
  totalHT: number
  totalTVA: number
  totalTTC: number
}

export interface InvoiceParty {
  name: string
  taxId: string      // NIF/IFU
  rccm: string       // Registre du Commerce
  address: string
  city: string
  country: string
  phone: string
  email: string
  compteComptable: string // 411x client, 401x fournisseur
}

export interface Invoice {
  id: string
  number: string // FV-2026-0001
  type: InvoiceType
  direction: InvoiceDirection
  status: InvoiceStatus
  date: string
  dueDate: string
  seller: InvoiceParty
  buyer: InvoiceParty
  lines: InvoiceLine[]
  totalHT: number
  totalTVA: number
  totalTTC: number
  currency: string
  notes: string
  linkedInvoiceId?: string // for AVOIR
  paidDate?: string
  paidAmount?: number
  xmlContent?: string
  xmlFormat?: 'UBL21' | 'CII' | 'PEPPOL'
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  taxId: string
  rccm: string
  type: 'client' | 'fournisseur'
  address: string
  city: string
  country: string
  phone: string
  email: string
  compteComptable: string // 4110x / 4010x
  createdAt: string
}

export interface InvoiceSequence {
  prefix: string  // FV or FA or AV
  year: number
  lastNumber: number
}

export interface InvoiceSettings {
  defaultCurrency: string
  defaultTaxRate: number
  companyPrefix: string
  autoNumbering: boolean
  defaultPaymentTermDays: number
}

// ────────── Helpers ──────────

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(scopeKey(PREFIX + key))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(scopeKey(PREFIX + key), JSON.stringify(value))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

// ────────── Settings ──────────

const DEFAULT_SETTINGS: InvoiceSettings = {
  defaultCurrency: 'XOF',
  defaultTaxRate: 18,
  companyPrefix: 'FV',
  autoNumbering: true,
  defaultPaymentTermDays: 30,
}

export function getInvoiceSettings(): InvoiceSettings {
  return getItem<InvoiceSettings>('settings') || DEFAULT_SETTINGS
}

export function saveInvoiceSettings(settings: Partial<InvoiceSettings>): void {
  const current = getInvoiceSettings()
  setItem('settings', { ...current, ...settings })
}

// ────────── Invoice Numbering ──────────

function getNextInvoiceNumber(type: InvoiceType, direction: InvoiceDirection): string {
  const year = new Date().getFullYear()
  const prefix = type === 'AVOIR' ? 'AV'
    : direction === 'VENTE' ? 'FV' : 'FA'

  const seqKey = `${prefix}-${year}`
  const sequences = getItem<Record<string, InvoiceSequence>>('sequence') || {}
  const seq = sequences[seqKey] || { prefix, year, lastNumber: 0 }

  seq.lastNumber++
  sequences[seqKey] = seq
  setItem('sequence', sequences)

  return `${prefix}-${year}-${String(seq.lastNumber).padStart(4, '0')}`
}

// ────────── Invoice CRUD ──────────

export function createInvoice(data: {
  type: InvoiceType
  direction: InvoiceDirection
  date: string
  dueDate: string
  seller: InvoiceParty
  buyer: InvoiceParty
  lines: Omit<InvoiceLine, 'id' | 'totalHT' | 'totalTVA' | 'totalTTC'>[]
  currency?: string
  notes?: string
  linkedInvoiceId?: string
}): Invoice {
  const settings = getInvoiceSettings()
  const lines: InvoiceLine[] = data.lines.map(l => {
    const totalHT = l.quantity * l.unitPrice
    const totalTVA = totalHT * (l.taxRate / 100)
    return {
      ...l,
      id: generateId(),
      totalHT,
      totalTVA,
      totalTTC: totalHT + totalTVA,
    }
  })

  const totalHT = lines.reduce((s, l) => s + l.totalHT, 0)
  const totalTVA = lines.reduce((s, l) => s + l.totalTVA, 0)

  const invoice: Invoice = {
    id: generateId(),
    number: getNextInvoiceNumber(data.type, data.direction),
    type: data.type,
    direction: data.direction,
    status: 'brouillon',
    date: data.date,
    dueDate: data.dueDate,
    seller: data.seller,
    buyer: data.buyer,
    lines,
    totalHT,
    totalTVA,
    totalTTC: totalHT + totalTVA,
    currency: data.currency || settings.defaultCurrency,
    notes: data.notes || '',
    linkedInvoiceId: data.linkedInvoiceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const list = getItem<Invoice[]>('invoices') || []
  list.unshift(invoice)
  setItem('invoices', list)
  window.dispatchEvent(new CustomEvent('fiscasync:einvoice-created', { detail: { id: invoice.id } }))
  return invoice
}

export function updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
  const list = getItem<Invoice[]>('invoices') || []
  const idx = list.findIndex(i => i.id === id)
  if (idx < 0) return null

  // Recalculate totals if lines changed
  if (updates.lines) {
    updates.lines = updates.lines.map(l => {
      const totalHT = l.quantity * l.unitPrice
      const totalTVA = totalHT * (l.taxRate / 100)
      return { ...l, totalHT, totalTVA, totalTTC: totalHT + totalTVA }
    })
    updates.totalHT = updates.lines.reduce((s, l) => s + l.totalHT, 0)
    updates.totalTVA = updates.lines.reduce((s, l) => s + l.totalTVA, 0)
    updates.totalTTC = updates.totalHT + updates.totalTVA
  }

  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
  setItem('invoices', list)
  window.dispatchEvent(new CustomEvent('fiscasync:einvoice-updated'))
  return list[idx]
}

export function getAllInvoices(filters?: {
  type?: InvoiceType
  direction?: InvoiceDirection
  status?: InvoiceStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  clientId?: string
}): Invoice[] {
  let list = getItem<Invoice[]>('invoices') || []
  if (filters?.type) list = list.filter(i => i.type === filters.type)
  if (filters?.direction) list = list.filter(i => i.direction === filters.direction)
  if (filters?.status) list = list.filter(i => i.status === filters.status)
  if (filters?.dateFrom) list = list.filter(i => i.date >= filters.dateFrom!)
  if (filters?.dateTo) list = list.filter(i => i.date <= filters.dateTo!)
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(i =>
      i.number.toLowerCase().includes(s) ||
      i.buyer.name.toLowerCase().includes(s) ||
      i.seller.name.toLowerCase().includes(s)
    )
  }
  return list.sort((a, b) => b.date.localeCompare(a.date))
}

export function getInvoice(id: string): Invoice | null {
  const list = getItem<Invoice[]>('invoices') || []
  return list.find(i => i.id === id) || null
}

export function deleteInvoice(id: string): void {
  const list = getItem<Invoice[]>('invoices') || []
  setItem('invoices', list.filter(i => i.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:einvoice-deleted'))
}

export function validateInvoice(id: string): { valid: boolean; errors: string[] } {
  const invoice = getInvoice(id)
  if (!invoice) return { valid: false, errors: ['Facture introuvable'] }

  const errors: string[] = []
  if (!invoice.seller.name) errors.push('Vendeur: raison sociale manquante')
  if (!invoice.seller.taxId) errors.push('Vendeur: NIF/IFU manquant')
  if (!invoice.buyer.name) errors.push('Acheteur: raison sociale manquante')
  if (invoice.lines.length === 0) errors.push('Aucune ligne de facturation')
  if (invoice.totalTTC <= 0) errors.push('Montant TTC doit etre positif')
  if (!invoice.date) errors.push('Date de facture manquante')
  if (!invoice.dueDate) errors.push('Date d\'echeance manquante')

  if (errors.length === 0) {
    updateInvoice(id, { status: 'validee' })
  }

  return { valid: errors.length === 0, errors }
}

export function markAsPaid(id: string, paidAmount?: number): void {
  const invoice = getInvoice(id)
  if (!invoice) return
  updateInvoice(id, {
    status: 'payee',
    paidDate: new Date().toISOString(),
    paidAmount: paidAmount || invoice.totalTTC,
  })
}

export function createAvoir(invoiceId: string): Invoice | null {
  const original = getInvoice(invoiceId)
  if (!original) return null

  return createInvoice({
    type: 'AVOIR',
    direction: original.direction,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    seller: original.seller,
    buyer: original.buyer,
    lines: original.lines.map(l => ({
      description: `Avoir sur: ${l.description}`,
      quantity: l.quantity,
      unitPrice: -l.unitPrice,
      taxRate: l.taxRate,
      compteComptable: l.compteComptable,
    })),
    currency: original.currency,
    notes: `Avoir reference facture ${original.number}`,
    linkedInvoiceId: original.id,
  })
}

// ────────── Client / Fournisseur CRUD ──────────

export function saveClient(data: Omit<Client, 'id' | 'createdAt'>): Client {
  const client: Client = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const list = getItem<Client[]>('clients') || []
  list.unshift(client)
  setItem('clients', list)
  window.dispatchEvent(new CustomEvent('fiscasync:einvoice-client-saved'))
  return client
}

export function getAllClients(type?: 'client' | 'fournisseur'): Client[] {
  const list = getItem<Client[]>('clients') || []
  if (type) return list.filter(c => c.type === type)
  return list
}

export function getClient(id: string): Client | null {
  const list = getItem<Client[]>('clients') || []
  return list.find(c => c.id === id) || null
}

export function updateClient(id: string, updates: Partial<Client>): void {
  const list = getItem<Client[]>('clients') || []
  const idx = list.findIndex(c => c.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates }
    setItem('clients', list)
  }
}

export function deleteClient(id: string): void {
  const list = getItem<Client[]>('clients') || []
  setItem('clients', list.filter(c => c.id !== id))
}

// ────────── Stats ──────────

export function getInvoiceStats(exercice?: string): {
  totalVentesHT: number
  totalAchatsHT: number
  tvaCollectee: number
  tvaDeductible: number
  tvaNette: number
  invoiceCount: number
  avoirCount: number
  unpaidAmount: number
} {
  const year = exercice || String(new Date().getFullYear())
  const invoices = getAllInvoices().filter(i => i.date.startsWith(year) && i.status !== 'annulee')

  const ventes = invoices.filter(i => i.direction === 'VENTE' && i.type === 'FACTURE')
  const achats = invoices.filter(i => i.direction === 'ACHAT' && i.type === 'FACTURE')
  const avoirs = invoices.filter(i => i.type === 'AVOIR')
  const unpaid = invoices.filter(i => i.status !== 'payee' && i.status !== 'annulee' && i.type === 'FACTURE')

  return {
    totalVentesHT: ventes.reduce((s, i) => s + i.totalHT, 0),
    totalAchatsHT: achats.reduce((s, i) => s + i.totalHT, 0),
    tvaCollectee: ventes.reduce((s, i) => s + i.totalTVA, 0),
    tvaDeductible: achats.reduce((s, i) => s + i.totalTVA, 0),
    tvaNette: ventes.reduce((s, i) => s + i.totalTVA, 0) - achats.reduce((s, i) => s + i.totalTVA, 0),
    invoiceCount: invoices.filter(i => i.type === 'FACTURE').length,
    avoirCount: avoirs.length,
    unpaidAmount: unpaid.reduce((s, i) => s + i.totalTTC, 0),
  }
}
