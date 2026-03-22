/**
 * Service de persistance localStorage pour la Veille Réglementaire
 * Pattern identique à dgiFilingStorageService.ts
 */
import { scopeKey } from './dossierScopeService'

const PREFIX = 'fiscasync_veille_'

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

// ────────── Interfaces ──────────

export interface VeilleRegulation {
  id: string
  title: string
  type: 'law' | 'decree' | 'circular' | 'instruction' | 'convention' | 'standard'
  category: 'fiscal' | 'social' | 'commercial' | 'accounting' | 'customs' | 'environmental'
  jurisdiction: string
  country: string
  authority: string
  referenceNumber: string
  publicationDate: string
  effectiveDate: string
  expiryDate?: string
  status: 'draft' | 'published' | 'active' | 'amended' | 'repealed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  fullText?: string
  impacts: VeilleImpact[]
  tags: string[]
  isBookmarked: boolean
  readStatus: 'unread' | 'read' | 'analyzed'
  complianceStatus: 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable'
  createdAt: string
  updatedAt: string
}

export interface VeilleImpact {
  id: string
  area: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  deadline?: string
  actionRequired: string
  responsibleDepartment: string
  status: 'pending' | 'in-progress' | 'completed'
  estimatedCost?: number
}

export interface ComplianceTask {
  id: string
  regulationId: string
  title: string
  description: string
  dueDate: string
  assignedTo: string[]
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  checkpoints: Checkpoint[]
  createdAt: string
  completedAt?: string
}

export interface Checkpoint {
  id: string
  description: string
  isCompleted: boolean
  completedBy?: string
  completedAt?: string
}

export interface RegulatoryAlert {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'critical'
  source: string
  date: string
  jurisdictions: string[]
  categories: string[]
  isActive: boolean
  isDismissed: boolean
  expiresAt?: string
  actions: string[]
  createdAt: string
}

// ────────── Regulation CRUD ──────────

export function getAllRegulations(filters?: {
  category?: string
  jurisdiction?: string
  priority?: string
  status?: string
  complianceStatus?: string
}): VeilleRegulation[] {
  let list = getItem<VeilleRegulation[]>('regulations') || []
  if (filters?.category) list = list.filter(r => r.category === filters.category)
  if (filters?.jurisdiction) list = list.filter(r => r.jurisdiction === filters.jurisdiction)
  if (filters?.priority) list = list.filter(r => r.priority === filters.priority)
  if (filters?.status) list = list.filter(r => r.status === filters.status)
  if (filters?.complianceStatus) list = list.filter(r => r.complianceStatus === filters.complianceStatus)
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getRegulation(id: string): VeilleRegulation | null {
  const list = getItem<VeilleRegulation[]>('regulations') || []
  return list.find(r => r.id === id) || null
}

export function createRegulation(data: Omit<VeilleRegulation, 'id' | 'createdAt' | 'updatedAt'>): VeilleRegulation {
  const regulation: VeilleRegulation = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const list = getItem<VeilleRegulation[]>('regulations') || []
  list.unshift(regulation)
  setItem('regulations', list)
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
  return regulation
}

export function updateRegulation(id: string, updates: Partial<VeilleRegulation>): VeilleRegulation | null {
  const list = getItem<VeilleRegulation[]>('regulations') || []
  const idx = list.findIndex(r => r.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() }
  setItem('regulations', list)
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
  return list[idx]
}

export function deleteRegulation(id: string): void {
  const list = getItem<VeilleRegulation[]>('regulations') || []
  setItem('regulations', list.filter(r => r.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
}

// ────────── ComplianceTask CRUD ──────────

export function getAllTasks(filters?: {
  status?: string
  priority?: string
  regulationId?: string
}): ComplianceTask[] {
  let list = getItem<ComplianceTask[]>('tasks') || []
  if (filters?.status) list = list.filter(t => t.status === filters.status)
  if (filters?.priority) list = list.filter(t => t.priority === filters.priority)
  if (filters?.regulationId) list = list.filter(t => t.regulationId === filters.regulationId)
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function createTask(data: Omit<ComplianceTask, 'id' | 'createdAt'>): ComplianceTask {
  const task: ComplianceTask = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const list = getItem<ComplianceTask[]>('tasks') || []
  list.unshift(task)
  setItem('tasks', list)
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
  return task
}

export function updateTask(id: string, updates: Partial<ComplianceTask>): ComplianceTask | null {
  const list = getItem<ComplianceTask[]>('tasks') || []
  const idx = list.findIndex(t => t.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('tasks', list)
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
  return list[idx]
}

export function deleteTask(id: string): void {
  const list = getItem<ComplianceTask[]>('tasks') || []
  setItem('tasks', list.filter(t => t.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
}

// ────────── Alert CRUD ──────────

export function getAllAlerts(filters?: { type?: string; isActive?: boolean; isDismissed?: boolean }): RegulatoryAlert[] {
  let list = getItem<RegulatoryAlert[]>('alerts') || []
  if (filters?.type) list = list.filter(a => a.type === filters.type)
  if (filters?.isActive !== undefined) list = list.filter(a => a.isActive === filters.isActive)
  if (filters?.isDismissed !== undefined) list = list.filter(a => a.isDismissed === filters.isDismissed)
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function createAlert(data: Omit<RegulatoryAlert, 'id' | 'createdAt'>): RegulatoryAlert {
  const alert: RegulatoryAlert = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const list = getItem<RegulatoryAlert[]>('alerts') || []
  list.unshift(alert)
  setItem('alerts', list)
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
  return alert
}

export function updateAlert(id: string, updates: Partial<RegulatoryAlert>): RegulatoryAlert | null {
  const list = getItem<RegulatoryAlert[]>('alerts') || []
  const idx = list.findIndex(a => a.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('alerts', list)
  window.dispatchEvent(new CustomEvent('fiscasync:veille-updated'))
  return list[idx]
}

export function dismissAlert(id: string): void {
  updateAlert(id, { isDismissed: true, isActive: false })
}

// ────────── Seed Data ──────────

export function seedVeilleData(): void {
  if ((getItem<VeilleRegulation[]>('regulations') || []).length > 0) return

  const now = new Date().toISOString()

  const regulations: VeilleRegulation[] = [
    {
      id: 'reg-1',
      title: 'Nouvelle Directive TVA UEMOA 2025',
      type: 'decree',
      category: 'fiscal',
      jurisdiction: 'UEMOA',
      country: 'Régional',
      authority: 'Commission UEMOA',
      referenceNumber: 'DIR/2024/TVA/001',
      publicationDate: '2024-11-15',
      effectiveDate: '2025-01-01',
      status: 'published',
      priority: 'high',
      summary: "Harmonisation des taux de TVA dans l'espace UEMOA avec nouvelles exonérations sectorielles",
      impacts: [
        {
          id: 'impact-1',
          area: 'Comptabilité',
          description: 'Mise à jour des taux de TVA dans le système',
          severity: 'high',
          deadline: '2024-12-31',
          actionRequired: 'Paramétrer les nouveaux taux dans le système',
          responsibleDepartment: 'Finance',
          status: 'in-progress',
          estimatedCost: 50000,
        },
      ],
      tags: ['TVA', 'UEMOA', 'Fiscal', '2025'],
      isBookmarked: true,
      readStatus: 'analyzed',
      complianceStatus: 'in-progress',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'reg-2',
      title: 'Réforme du Code du Travail OHADA',
      type: 'law',
      category: 'social',
      jurisdiction: 'OHADA',
      country: 'Régional',
      authority: 'Secrétariat Permanent OHADA',
      referenceNumber: 'AU/2024/SOC/003',
      publicationDate: '2024-10-20',
      effectiveDate: '2025-07-01',
      status: 'active',
      priority: 'medium',
      summary: 'Nouvelles dispositions sur le télétravail et la protection sociale',
      impacts: [],
      tags: ['Social', 'OHADA', 'Travail'],
      isBookmarked: false,
      readStatus: 'read',
      complianceStatus: 'compliant',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'reg-3',
      title: 'Instruction Fiscale sur la Déclaration Électronique',
      type: 'instruction',
      category: 'fiscal',
      jurisdiction: 'National',
      country: "Côte d'Ivoire",
      authority: 'Direction Générale des Impôts',
      referenceNumber: 'INSTR/2024/DGI/E-FILING',
      publicationDate: '2024-11-01',
      effectiveDate: '2024-12-01',
      status: 'active',
      priority: 'critical',
      summary: "Obligation de télédéclaration pour toutes les entreprises au chiffre d'affaires > 200M FCFA",
      impacts: [
        {
          id: 'impact-2',
          area: 'Déclarations',
          description: 'Migration vers la télédéclaration obligatoire',
          severity: 'critical',
          deadline: '2024-12-01',
          actionRequired: 'Activer le module de télédéclaration',
          responsibleDepartment: 'Fiscal',
          status: 'pending',
          estimatedCost: 0,
        },
      ],
      tags: ['Télédéclaration', 'Digital', 'Obligatoire'],
      isBookmarked: true,
      readStatus: 'analyzed',
      complianceStatus: 'non-compliant',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'reg-4',
      title: 'Acte Uniforme OHADA sur les Sociétés Commerciales (révisé)',
      type: 'law',
      category: 'commercial',
      jurisdiction: 'OHADA',
      country: 'Régional',
      authority: 'Secrétariat Permanent OHADA',
      referenceNumber: 'AU/2024/COM/005',
      publicationDate: '2024-09-15',
      effectiveDate: '2025-03-01',
      status: 'published',
      priority: 'medium',
      summary: 'Révision des obligations de transparence et de gouvernance des sociétés commerciales',
      impacts: [],
      tags: ['OHADA', 'Commercial', 'Sociétés'],
      isBookmarked: false,
      readStatus: 'unread',
      complianceStatus: 'not-applicable',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'reg-5',
      title: 'Nouvelle norme SYSCOHADA révisé - Instruments financiers',
      type: 'standard',
      category: 'accounting',
      jurisdiction: 'OHADA',
      country: 'Régional',
      authority: 'Commission de Normalisation Comptable',
      referenceNumber: 'SYSCOHADA/2025/IF/001',
      publicationDate: '2025-01-10',
      effectiveDate: '2025-06-01',
      status: 'draft',
      priority: 'low',
      summary: 'Traitement comptable des instruments financiers dérivés selon le SYSCOHADA révisé',
      impacts: [],
      tags: ['SYSCOHADA', 'Comptabilité', 'Instruments financiers'],
      isBookmarked: false,
      readStatus: 'unread',
      complianceStatus: 'not-applicable',
      createdAt: now,
      updatedAt: now,
    },
  ]
  setItem('regulations', regulations)

  const tasks: ComplianceTask[] = [
    {
      id: 'task-1',
      regulationId: 'reg-1',
      title: 'Mise à jour des taux de TVA UEMOA',
      description: 'Paramétrer les nouveaux taux de TVA conformément à la directive UEMOA 2025',
      dueDate: '2024-12-31',
      assignedTo: ['Responsable Fiscal', 'Administrateur Système'],
      status: 'in-progress',
      priority: 'high',
      progress: 40,
      checkpoints: [
        { id: 'c1', description: 'Analyser la directive', isCompleted: true, completedBy: 'Jean Dupont', completedAt: '2024-11-20' },
        { id: 'c2', description: 'Identifier les changements de taux', isCompleted: true, completedBy: 'Marie Martin', completedAt: '2024-11-22' },
        { id: 'c3', description: 'Paramétrer dans le système', isCompleted: false },
        { id: 'c4', description: 'Tester les calculs', isCompleted: false },
        { id: 'c5', description: 'Former les utilisateurs', isCompleted: false },
      ],
      createdAt: '2024-11-16T00:00:00.000Z',
    },
    {
      id: 'task-2',
      regulationId: 'reg-3',
      title: 'Activation Télédéclaration Obligatoire',
      description: "Configurer et activer le module de télédéclaration pour se conformer à l'instruction DGI",
      dueDate: '2024-12-01',
      assignedTo: ['Chef de Projet IT', 'Responsable Fiscal'],
      status: 'pending',
      priority: 'critical',
      progress: 0,
      checkpoints: [
        { id: 'c6', description: 'Étudier les spécifications DGI', isCompleted: false },
        { id: 'c7', description: 'Configurer le module', isCompleted: false },
        { id: 'c8', description: 'Tests de transmission', isCompleted: false },
      ],
      createdAt: '2024-11-02T00:00:00.000Z',
    },
  ]
  setItem('tasks', tasks)

  const alerts: RegulatoryAlert[] = [
    {
      id: 'alert-1',
      title: 'URGENT: Télédéclaration Obligatoire',
      message: 'La télédéclaration devient obligatoire pour les entreprises > 200M FCFA',
      type: 'critical',
      source: 'Direction Générale des Impôts',
      date: now,
      jurisdictions: ["Côte d'Ivoire"],
      categories: ['fiscal'],
      isActive: true,
      isDismissed: false,
      expiresAt: '2025-06-01',
      actions: ['Activer module télédéclaration', 'Former les équipes'],
      createdAt: now,
    },
    {
      id: 'alert-2',
      title: 'Nouveaux Taux TVA UEMOA',
      message: 'Les nouveaux taux de TVA entrent en vigueur le 1er janvier 2025',
      type: 'warning',
      source: 'Commission UEMOA',
      date: '2024-11-20',
      jurisdictions: ['UEMOA'],
      categories: ['fiscal'],
      isActive: true,
      isDismissed: false,
      actions: ['Mettre à jour les taux', 'Informer les clients'],
      createdAt: now,
    },
    {
      id: 'alert-3',
      title: 'Rappel: Clôture exercice fiscal',
      message: 'Date limite de dépôt des états financiers au greffe',
      type: 'info',
      source: 'Greffe du Tribunal de Commerce',
      date: '2024-12-15',
      jurisdictions: ["Côte d'Ivoire"],
      categories: ['commercial'],
      isActive: true,
      isDismissed: false,
      expiresAt: '2025-04-30',
      actions: ['Préparer les états financiers', 'Vérifier les pièces jointes'],
      createdAt: now,
    },
  ]
  setItem('alerts', alerts)
}

// ────────── Stats ──────────

export function getVeilleStats(): {
  totalRegulations: number
  compliant: number
  nonCompliant: number
  inProgress: number
  pendingTasks: number
  criticalAlerts: number
} {
  const regs = getItem<VeilleRegulation[]>('regulations') || []
  const tasks = getItem<ComplianceTask[]>('tasks') || []
  const alerts = getItem<RegulatoryAlert[]>('alerts') || []
  return {
    totalRegulations: regs.length,
    compliant: regs.filter(r => r.complianceStatus === 'compliant').length,
    nonCompliant: regs.filter(r => r.complianceStatus === 'non-compliant').length,
    inProgress: regs.filter(r => r.complianceStatus === 'in-progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
    criticalAlerts: alerts.filter(a => a.type === 'critical' && a.isActive).length,
  }
}
