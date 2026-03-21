/**
 * Service de persistance localStorage pour les declarations DGI
 * Pattern identique a balanceStorageService.ts
 */

import { calculerPassageFiscal } from './passageFiscalService'

import { scopeKey } from './dossierScopeService'

const PREFIX = 'fiscasync_dgifiling_'

// ────────── Interfaces ──────────

export type DeclarationType = 'DSF' | 'DAS' | 'TVA' | 'IS' | 'LIASSE'
export type DeclarationStatus = 'brouillon' | 'validee' | 'soumise' | 'acceptee' | 'rejetee'

export interface DSFData {
  bilanActifTotal: number
  bilanPassifTotal: number
  compteResultatProduits: number
  compteResultatCharges: number
  resultatComptable: number
  resultatFiscal: number
  totalReintegrations: number
  totalDeductions: number
  chiffreAffaires: number
  isDu: number
}

export interface DASData {
  salaries: DASEmployee[]
  masseSalarialeBrute: number
  retenuesIRPP: number
  cotisationsCNPS: number
  totalNetPaye: number
}

export interface DASEmployee {
  id: string
  nom: string
  prenoms: string
  matricule: string
  emploi: string
  salaireBrutAnnuel: number
  retenueIRPP: number
  cotisationCNPS: number
  netPaye: number
}

export interface TVAData {
  periode: string
  tvaCollectee: number
  tvaDeductible: number
  tvaNette: number
  creditTVA: number
}

export interface DGIDeclaration {
  id: string
  type: DeclarationType
  status: DeclarationStatus
  exercice: string
  periode?: string // for TVA: '2026-01', '2026-Q1'
  entreprise: string
  nif: string
  montantDu: number
  dsfData?: DSFData
  dasData?: DASData
  tvaData?: TVAData
  xmlContent?: string
  validationErrors: string[]
  submittedAt?: string
  receiptId?: string
  createdAt: string
  updatedAt: string
}

export interface FilingReceipt {
  id: string
  declarationId: string
  declarationType: DeclarationType
  referenceDepot: string
  dateDepot: string
  hashSHA256: string
  entreprise: string
  exercice: string
  montant: number
  status: 'valide' | 'archive'
  createdAt: string
}

export interface FilingSettings {
  nif: string
  centreImpots: string
  regimeFiscal: 'reel_normal' | 'reel_simplifie' | 'synthetique'
  periodicitesTVA: 'mensuelle' | 'trimestrielle'
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

async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ────────── Settings ──────────

const DEFAULT_SETTINGS: FilingSettings = {
  nif: '',
  centreImpots: '',
  regimeFiscal: 'reel_normal',
  periodicitesTVA: 'mensuelle',
}

export function getFilingSettings(): FilingSettings {
  return getItem<FilingSettings>('settings') || DEFAULT_SETTINGS
}

export function saveFilingSettings(settings: Partial<FilingSettings>): void {
  const current = getFilingSettings()
  setItem('settings', { ...current, ...settings })
}

// ────────── Declaration CRUD ──────────

export function createDeclaration(data: {
  type: DeclarationType
  exercice: string
  periode?: string
  entreprise: string
  nif: string
}): DGIDeclaration {
  const declaration: DGIDeclaration = {
    id: generateId(),
    type: data.type,
    status: 'brouillon',
    exercice: data.exercice,
    periode: data.periode,
    entreprise: data.entreprise,
    nif: data.nif,
    montantDu: 0,
    validationErrors: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const list = getItem<DGIDeclaration[]>('declarations') || []
  list.unshift(declaration)
  setItem('declarations', list)
  window.dispatchEvent(new CustomEvent('fiscasync:dgifiling-created', { detail: { id: declaration.id } }))
  return declaration
}

export function updateDeclaration(id: string, updates: Partial<DGIDeclaration>): DGIDeclaration | null {
  const list = getItem<DGIDeclaration[]>('declarations') || []
  const idx = list.findIndex(d => d.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
  setItem('declarations', list)
  window.dispatchEvent(new CustomEvent('fiscasync:dgifiling-updated'))
  return list[idx]
}

export function getAllDeclarations(filters?: {
  type?: DeclarationType
  status?: DeclarationStatus
  exercice?: string
}): DGIDeclaration[] {
  let list = getItem<DGIDeclaration[]>('declarations') || []
  if (filters?.type) list = list.filter(d => d.type === filters.type)
  if (filters?.status) list = list.filter(d => d.status === filters.status)
  if (filters?.exercice) list = list.filter(d => d.exercice === filters.exercice)
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getDeclaration(id: string): DGIDeclaration | null {
  const list = getItem<DGIDeclaration[]>('declarations') || []
  return list.find(d => d.id === id) || null
}

export function deleteDeclaration(id: string): void {
  const list = getItem<DGIDeclaration[]>('declarations') || []
  setItem('declarations', list.filter(d => d.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:dgifiling-deleted'))
}

// ────────── Validation ──────────

export function validateDeclaration(id: string): { valid: boolean; errors: string[] } {
  const decl = getDeclaration(id)
  if (!decl) return { valid: false, errors: ['Declaration introuvable'] }

  const errors: string[] = []
  if (!decl.entreprise) errors.push('Raison sociale manquante')
  if (!decl.nif) errors.push('NIF manquant')
  if (!decl.exercice) errors.push('Exercice non defini')

  switch (decl.type) {
    case 'DSF':
      if (!decl.dsfData) {
        errors.push('Donnees DSF non generees (importez une balance)')
      } else {
        if (Math.abs(decl.dsfData.bilanActifTotal - decl.dsfData.bilanPassifTotal) > 1) {
          errors.push(`Desequilibre bilan: Actif ${decl.dsfData.bilanActifTotal.toLocaleString('fr-FR')} != Passif ${decl.dsfData.bilanPassifTotal.toLocaleString('fr-FR')}`)
        }
      }
      break
    case 'DAS':
      if (!decl.dasData) {
        errors.push('Donnees DAS non renseignees')
      } else if (decl.dasData.salaries.length === 0) {
        errors.push('Aucun salarie declare')
      }
      break
    case 'TVA':
      if (!decl.tvaData) {
        errors.push('Donnees TVA non calculees')
      }
      break
    case 'IS':
      if (decl.montantDu <= 0) errors.push('Montant IS non calcule')
      break
    case 'LIASSE':
      if (!decl.dsfData) errors.push('Donnees liasse non generees')
      break
  }

  if (errors.length === 0) {
    updateDeclaration(id, { status: 'validee', validationErrors: [] })
  } else {
    updateDeclaration(id, { validationErrors: errors })
  }

  return { valid: errors.length === 0, errors }
}

// ────────── Submission (simulation) ──────────

export async function submitDeclaration(id: string): Promise<FilingReceipt | null> {
  const decl = getDeclaration(id)
  if (!decl) return null

  // Validate first
  const validation = validateDeclaration(id)
  if (!validation.valid) return null

  // Generate reference
  const refPrefix = `DGI-${decl.type}`
  const refNum = Date.now().toString(36).toUpperCase()
  const referenceDepot = `${refPrefix}-${decl.exercice}-${refNum}`

  // Generate SHA-256 hash of declaration content
  const contentToHash = JSON.stringify({
    type: decl.type,
    exercice: decl.exercice,
    entreprise: decl.entreprise,
    nif: decl.nif,
    montantDu: decl.montantDu,
    data: decl.dsfData || decl.dasData || decl.tvaData,
  })
  const hashSHA256 = await computeSHA256(contentToHash)

  const receipt: FilingReceipt = {
    id: generateId(),
    declarationId: id,
    declarationType: decl.type,
    referenceDepot,
    dateDepot: new Date().toISOString(),
    hashSHA256,
    entreprise: decl.entreprise,
    exercice: decl.exercice,
    montant: decl.montantDu,
    status: 'valide',
    createdAt: new Date().toISOString(),
  }

  // Save receipt
  const receipts = getItem<FilingReceipt[]>('receipts') || []
  receipts.unshift(receipt)
  setItem('receipts', receipts)

  // Update declaration
  updateDeclaration(id, {
    status: 'soumise',
    submittedAt: new Date().toISOString(),
    receiptId: receipt.id,
  })

  // Save to history
  const history = getItem<{ date: string; action: string; declarationId: string; reference: string }[]>('history') || []
  history.unshift({
    date: new Date().toISOString(),
    action: `Soumission ${decl.type} ${decl.exercice}`,
    declarationId: id,
    reference: referenceDepot,
  })
  if (history.length > 100) history.length = 100
  setItem('history', history)

  window.dispatchEvent(new CustomEvent('fiscasync:dgifiling-submitted', {
    detail: { declarationId: id, receiptId: receipt.id }
  }))

  return receipt
}

// ────────── Receipts ──────────

export function getAllReceipts(): FilingReceipt[] {
  return getItem<FilingReceipt[]>('receipts') || []
}

export function getReceipt(id: string): FilingReceipt | null {
  const list = getAllReceipts()
  return list.find(r => r.id === id) || null
}

// ────────── DSF Auto-generation ──────────

export function generateDSF(_exercice: string): DSFData | null {
  try {
    // Load balance from balanceStorageService
    const balanceRaw = localStorage.getItem('fiscasync_balance_latest')
    if (!balanceRaw) return null
    const balance = JSON.parse(balanceRaw)
    if (!balance?.entries?.length) return null

    const passage = calculerPassageFiscal(balance.entries)

    // Calculate bilan totals from balance entries
    const entries = balance.entries as Array<{ compte: string; solde_debit: number; solde_credit: number }>
    const actifAccounts = entries.filter(e => ['1', '2', '3', '4', '5'].some(p => e.compte.startsWith(p)) && e.solde_debit > e.solde_credit)
    const passifAccounts = entries.filter(e => ['1', '2', '3', '4', '5'].some(p => e.compte.startsWith(p)) && e.solde_credit > e.solde_debit)

    const bilanActifTotal = actifAccounts.reduce((s, e) => s + (e.solde_debit - e.solde_credit), 0)
    const bilanPassifTotal = passifAccounts.reduce((s, e) => s + (e.solde_credit - e.solde_debit), 0)
    const produits = entries.filter(e => e.compte.startsWith('7')).reduce((s, e) => s + (e.solde_credit - e.solde_debit), 0)
    const charges = entries.filter(e => e.compte.startsWith('6')).reduce((s, e) => s + (e.solde_debit - e.solde_credit), 0)

    const dsfData: DSFData = {
      bilanActifTotal: Math.round(bilanActifTotal),
      bilanPassifTotal: Math.round(bilanPassifTotal),
      compteResultatProduits: Math.round(produits),
      compteResultatCharges: Math.round(charges),
      resultatComptable: passage.resultat_comptable,
      resultatFiscal: passage.resultat_fiscal,
      totalReintegrations: passage.total_reintegrations,
      totalDeductions: passage.total_deductions,
      chiffreAffaires: passage.chiffre_affaires,
      isDu: passage.is_du,
    }

    return dsfData
  } catch {
    return null
  }
}

export function generateDAS(_exercice: string, salaries: DASEmployee[]): DASData {
  const masseSalarialeBrute = salaries.reduce((s, e) => s + e.salaireBrutAnnuel, 0)
  const retenuesIRPP = salaries.reduce((s, e) => s + e.retenueIRPP, 0)
  const cotisationsCNPS = salaries.reduce((s, e) => s + e.cotisationCNPS, 0)
  const totalNetPaye = salaries.reduce((s, e) => s + e.netPaye, 0)

  return {
    salaries,
    masseSalarialeBrute,
    retenuesIRPP,
    cotisationsCNPS,
    totalNetPaye,
  }
}

// ────────── Stats ──────────

export function getFilingStats(): {
  totalDeclarations: number
  soumises: number
  enAttente: number
  acceptees: number
  rejetees: number
  totalMontantDu: number
  totalReceipts: number
} {
  const decls = getItem<DGIDeclaration[]>('declarations') || []
  const receipts = getItem<FilingReceipt[]>('receipts') || []

  return {
    totalDeclarations: decls.length,
    soumises: decls.filter(d => d.status === 'soumise').length,
    enAttente: decls.filter(d => d.status === 'brouillon' || d.status === 'validee').length,
    acceptees: decls.filter(d => d.status === 'acceptee').length,
    rejetees: decls.filter(d => d.status === 'rejetee').length,
    totalMontantDu: decls.reduce((s, d) => s + d.montantDu, 0),
    totalReceipts: receipts.length,
  }
}
