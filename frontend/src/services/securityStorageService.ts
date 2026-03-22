/**
 * Service de persistance localStorage pour le module Sécurité
 * Pattern identique à dgiFilingStorageService.ts
 */
import { scopeKey } from './dossierScopeService'

const PREFIX = 'fiscasync_security_'

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

export interface SecRole {
  id: string
  name: string
  description: string
  level: number
  permissions: SecPermission[]
  isSystem: boolean
  createdAt: string
  createdBy: string
}

export interface SecPermission {
  id: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin'
  scope?: 'own' | 'department' | 'company' | 'all'
}

export interface SecUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roleId: string
  department: string
  status: 'active' | 'inactive' | 'suspended' | 'locked'
  createdAt: string
  lastLogin?: string
  lastPasswordChange?: string
  passwordExpiresAt?: string
  mfaEnabled: boolean
  mfaMethod?: 'sms' | 'email' | 'authenticator'
  groups: string[]
  loginAttempts: number
  ipWhitelist: string[]
  securityLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  result: 'success' | 'failure' | 'partial'
  ipAddress: string
  userAgent: string
  details?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flagged: boolean
}

export interface SecurityIncident {
  id: string
  type: 'breach' | 'attempt' | 'violation' | 'anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  detectedAt: string
  resolvedAt?: string
  affectedUsers: string[]
  affectedResources: string[]
  description: string
  actions: string[]
  assignedTo?: string
}

export interface SecSession {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
  startedAt: string
  lastActivity: string
  expiresAt: string
  isActive: boolean
  location?: string
  device?: string
}

export interface SecurityPolicy {
  id: string
  name: string
  type: 'password' | 'session' | 'mfa'
  config: Record<string, unknown>
  updatedAt: string
}

// ────────── Role CRUD ──────────

export function getAllRoles(): SecRole[] {
  return getItem<SecRole[]>('roles') || []
}

export function getRole(id: string): SecRole | null {
  return getAllRoles().find(r => r.id === id) || null
}

export function createRole(data: Omit<SecRole, 'id' | 'createdAt'>): SecRole {
  const role: SecRole = { ...data, id: generateId(), createdAt: new Date().toISOString() }
  const list = getAllRoles()
  list.push(role)
  setItem('roles', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
  return role
}

export function updateRole(id: string, updates: Partial<SecRole>): SecRole | null {
  const list = getAllRoles()
  const idx = list.findIndex(r => r.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('roles', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
  return list[idx]
}

export function deleteRole(id: string): void {
  setItem('roles', getAllRoles().filter(r => r.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
}

// ────────── User CRUD ──────────

export function getAllUsers(): SecUser[] {
  return getItem<SecUser[]>('users') || []
}

export function getUser(id: string): SecUser | null {
  return getAllUsers().find(u => u.id === id) || null
}

export function createUser(data: Omit<SecUser, 'id' | 'createdAt'>): SecUser {
  const user: SecUser = { ...data, id: generateId(), createdAt: new Date().toISOString() }
  const list = getAllUsers()
  list.push(user)
  setItem('users', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
  return user
}

export function updateUser(id: string, updates: Partial<SecUser>): SecUser | null {
  const list = getAllUsers()
  const idx = list.findIndex(u => u.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('users', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
  return list[idx]
}

export function deleteUser(id: string): void {
  setItem('users', getAllUsers().filter(u => u.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
}

// ────────── AuditLog CRUD ──────────

export function getAllAuditLogs(filters?: {
  userId?: string
  action?: string
  riskLevel?: string
  result?: string
  startDate?: string
  endDate?: string
}): AuditLog[] {
  let list = getItem<AuditLog[]>('auditLogs') || []
  if (filters?.userId) list = list.filter(l => l.userId === filters.userId)
  if (filters?.action) list = list.filter(l => l.action === filters.action)
  if (filters?.riskLevel) list = list.filter(l => l.riskLevel === filters.riskLevel)
  if (filters?.result) list = list.filter(l => l.result === filters.result)
  if (filters?.startDate) list = list.filter(l => l.timestamp >= filters.startDate!)
  if (filters?.endDate) list = list.filter(l => l.timestamp <= filters.endDate!)
  return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function addAuditLog(data: Omit<AuditLog, 'id'>): AuditLog {
  const log: AuditLog = { ...data, id: generateId() }
  const list = getItem<AuditLog[]>('auditLogs') || []
  list.unshift(log)
  if (list.length > 500) list.length = 500
  setItem('auditLogs', list)
  return log
}

// ────────── Incident CRUD ──────────

export function getAllIncidents(filters?: { status?: string; severity?: string }): SecurityIncident[] {
  let list = getItem<SecurityIncident[]>('incidents') || []
  if (filters?.status) list = list.filter(i => i.status === filters.status)
  if (filters?.severity) list = list.filter(i => i.severity === filters.severity)
  return list.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
}

export function createIncident(data: Omit<SecurityIncident, 'id'>): SecurityIncident {
  const incident: SecurityIncident = { ...data, id: generateId() }
  const list = getItem<SecurityIncident[]>('incidents') || []
  list.unshift(incident)
  setItem('incidents', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
  return incident
}

export function updateIncident(id: string, updates: Partial<SecurityIncident>): SecurityIncident | null {
  const list = getItem<SecurityIncident[]>('incidents') || []
  const idx = list.findIndex(i => i.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('incidents', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
  return list[idx]
}

// ────────── Session CRUD ──────────

export function getAllSessions(): SecSession[] {
  return getItem<SecSession[]>('sessions') || []
}

export function createSession(data: Omit<SecSession, 'id'>): SecSession {
  const session: SecSession = { ...data, id: generateId() }
  const list = getAllSessions()
  list.unshift(session)
  setItem('sessions', list)
  return session
}

export function endSession(id: string): void {
  const list = getAllSessions()
  const idx = list.findIndex(s => s.id === id)
  if (idx >= 0) {
    list[idx].isActive = false
    setItem('sessions', list)
  }
}

// ────────── Policy CRUD ──────────

export function getAllPolicies(): SecurityPolicy[] {
  return getItem<SecurityPolicy[]>('policies') || []
}

export function getPolicy(type: string): SecurityPolicy | null {
  return getAllPolicies().find(p => p.type === type) || null
}

export function savePolicy(policy: SecurityPolicy): void {
  const list = getAllPolicies()
  const idx = list.findIndex(p => p.type === policy.type)
  if (idx >= 0) {
    list[idx] = { ...policy, updatedAt: new Date().toISOString() }
  } else {
    list.push({ ...policy, updatedAt: new Date().toISOString() })
  }
  setItem('policies', list)
  window.dispatchEvent(new CustomEvent('fiscasync:security-updated'))
}

// ────────── Seed Data ──────────

export function seedSecurityData(): void {
  if ((getItem<SecUser[]>('users') || []).length > 0) return

  const now = new Date().toISOString()
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const twoHoursAgo = new Date(Date.now() - 7200000).toISOString()
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString()

  const roles: SecRole[] = [
    {
      id: 'role-1', name: 'Administrateur', description: 'Accès complet au système', level: 100,
      permissions: [
        { id: 'p1', resource: 'Balance', action: 'admin', scope: 'all' },
        { id: 'p2', resource: 'Liasse', action: 'admin', scope: 'all' },
        { id: 'p3', resource: 'Declarations', action: 'admin', scope: 'all' },
        { id: 'p4', resource: 'Utilisateurs', action: 'admin', scope: 'all' },
        { id: 'p5', resource: 'Dossiers', action: 'admin', scope: 'all' },
        { id: 'p6', resource: 'Audit', action: 'admin', scope: 'all' },
      ],
      isSystem: true, createdAt: '2024-01-01', createdBy: 'system',
    },
    {
      id: 'role-2', name: 'Comptable', description: 'Accès aux modules comptables', level: 50,
      permissions: [
        { id: 'p7', resource: 'Balance', action: 'update', scope: 'department' },
        { id: 'p8', resource: 'Liasse', action: 'update', scope: 'department' },
        { id: 'p9', resource: 'Declarations', action: 'read', scope: 'department' },
      ],
      isSystem: false, createdAt: '2024-01-15', createdBy: 'admin',
    },
    {
      id: 'role-3', name: 'Auditeur', description: 'Accès en lecture seule', level: 30,
      permissions: [
        { id: 'p10', resource: 'Balance', action: 'read', scope: 'all' },
        { id: 'p11', resource: 'Liasse', action: 'read', scope: 'all' },
        { id: 'p12', resource: 'Audit', action: 'read', scope: 'all' },
      ],
      isSystem: false, createdAt: '2024-01-20', createdBy: 'admin',
    },
    {
      id: 'role-4', name: 'Viewer', description: 'Consultation uniquement', level: 10,
      permissions: [
        { id: 'p13', resource: 'Balance', action: 'read', scope: 'own' },
        { id: 'p14', resource: 'Liasse', action: 'read', scope: 'own' },
      ],
      isSystem: false, createdAt: '2024-02-01', createdBy: 'admin',
    },
  ]
  setItem('roles', roles)

  const users: SecUser[] = [
    {
      id: 'user-1', username: 'admin', email: 'admin@entreprise.com', firstName: 'Jean', lastName: 'Dupont',
      roleId: 'role-1', department: 'IT', status: 'active', createdAt: '2024-01-01',
      lastLogin: oneHourAgo, lastPasswordChange: '2024-10-01', passwordExpiresAt: '2025-04-01',
      mfaEnabled: true, mfaMethod: 'authenticator', groups: ['admins'], loginAttempts: 0,
      ipWhitelist: [], securityLevel: 'critical',
    },
    {
      id: 'user-2', username: 'comptable1', email: 'marie.martin@entreprise.com', firstName: 'Marie', lastName: 'Martin',
      roleId: 'role-2', department: 'Comptabilité', status: 'active', createdAt: '2024-02-01',
      lastLogin: twoHoursAgo, lastPasswordChange: '2024-11-01',
      mfaEnabled: false, groups: ['comptabilite'], loginAttempts: 0,
      ipWhitelist: [], securityLevel: 'medium',
    },
    {
      id: 'user-3', username: 'auditeur', email: 'pierre.durand@entreprise.com', firstName: 'Pierre', lastName: 'Durand',
      roleId: 'role-3', department: 'Audit', status: 'active', createdAt: '2024-03-01',
      lastLogin: oneDayAgo, mfaEnabled: true, mfaMethod: 'email', groups: ['audit'],
      loginAttempts: 0, ipWhitelist: ['192.168.1.0/24'], securityLevel: 'high',
    },
  ]
  setItem('users', users)

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1', timestamp: oneHourAgo, userId: 'user-1', userName: 'admin',
      action: 'LOGIN', resource: 'Authentication', result: 'success',
      ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0', riskLevel: 'low', flagged: false,
    },
    {
      id: 'log-2', timestamp: twoHoursAgo, userId: 'user-2', userName: 'comptable1',
      action: 'UPDATE', resource: 'Balance', resourceId: 'bal-2024', result: 'success',
      ipAddress: '192.168.1.101', userAgent: 'Mozilla/5.0',
      details: 'Modification de la balance générale', riskLevel: 'medium', flagged: false,
    },
    {
      id: 'log-3', timestamp: twoHoursAgo, userId: 'unknown', userName: 'unknown',
      action: 'LOGIN_FAILED', resource: 'Authentication', result: 'failure',
      ipAddress: '89.234.56.78', userAgent: 'curl/7.68.0',
      details: 'Tentative de connexion échouée - utilisateur inconnu', riskLevel: 'high', flagged: true,
    },
  ]
  setItem('auditLogs', auditLogs)

  const incidents: SecurityIncident[] = [
    {
      id: 'inc-1', type: 'attempt', severity: 'high', status: 'investigating',
      detectedAt: twoHoursAgo, affectedUsers: [], affectedResources: ['Authentication'],
      description: "Multiples tentatives de connexion échouées depuis une IP suspecte",
      actions: ['IP bloquée', 'Notification envoyée'],
    },
  ]
  setItem('incidents', incidents)

  const sessions: SecSession[] = [
    {
      id: 'session-1', userId: 'user-1', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0',
      startedAt: oneHourAgo, lastActivity: new Date(Date.now() - 300000).toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), isActive: true,
      location: 'Abidjan, CI', device: 'Windows PC',
    },
    {
      id: 'session-2', userId: 'user-2', ipAddress: '192.168.1.101', userAgent: 'Mozilla/5.0',
      startedAt: twoHoursAgo, lastActivity: new Date(Date.now() - 600000).toISOString(),
      expiresAt: new Date(Date.now() + 1800000).toISOString(), isActive: true,
      location: 'Abidjan, CI', device: 'MacBook',
    },
  ]
  setItem('sessions', sessions)

  const policies: SecurityPolicy[] = [
    {
      id: 'pol-1', name: 'Politique de Mots de Passe', type: 'password',
      config: { minLength: 8, requireUppercase: true, requireNumber: true, requireSpecial: true, expiryDays: 90, historyCount: 5 },
      updatedAt: now,
    },
    {
      id: 'pol-2', name: 'Politique de Session', type: 'session',
      config: { maxSessions: 3, timeoutMinutes: 30, ipRestriction: false },
      updatedAt: now,
    },
    {
      id: 'pol-3', name: 'Politique MFA', type: 'mfa',
      config: { requiredForRoles: ['Administrateur'], allowedMethods: ['authenticator', 'email', 'sms'], gracePeriodDays: 7 },
      updatedAt: now,
    },
  ]
  setItem('policies', policies)
}
