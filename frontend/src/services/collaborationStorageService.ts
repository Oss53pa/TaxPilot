/**
 * Service de persistance localStorage pour le module Collaboration
 * Pattern identique à dgiFilingStorageService.ts
 */
import { scopeKey } from './dossierScopeService'

const PREFIX = 'fiscasync_collab_'

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

export interface CollabUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'accountant' | 'auditor' | 'viewer'
  department: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: string
  isActive: boolean
}

export interface CollabTeam {
  id: string
  name: string
  description: string
  members: CollabTeamMember[]
  projects: string[]
  createdAt: string
  createdBy: string
  isPrivate: boolean
  settings: CollabTeamSettings
}

export interface CollabTeamMember {
  userId: string
  role: 'owner' | 'admin' | 'member' | 'guest'
  joinedAt: string
  permissions: string[]
}

export interface CollabTeamSettings {
  allowGuestAccess: boolean
  requireApproval: boolean
  notificationsEnabled: boolean
  defaultPermissions: string[]
}

export interface CollabWorkspace {
  id: string
  name: string
  type: 'project' | 'department' | 'temporary'
  description: string
  owner: string
  teams: string[]
  documents: CollabDocument[]
  tasks: CollabTask[]
  createdAt: string
  lastActivity: string
  status: 'active' | 'archived' | 'completed'
  progress: number
}

export interface CollabDocument {
  id: string
  name: string
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'other'
  size: number
  owner: string
  version: number
  isLocked: boolean
  lockedBy?: string
  lastModified: string
  lastModifiedBy: string
  tags: string[]
}

export interface CollabTask {
  id: string
  title: string
  description: string
  assignees: string[]
  dueDate?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in-progress' | 'review' | 'done'
  workspaceId: string
  createdBy: string
  createdAt: string
  completedAt?: string
  estimatedHours?: number
  actualHours?: number
}

export interface CollabActivity {
  id: string
  type: 'document' | 'task' | 'discussion' | 'member' | 'system'
  action: string
  userId: string
  targetId?: string
  targetName?: string
  timestamp: string
  details?: string
  isImportant: boolean
}

export interface CollabMessage {
  id: string
  channelId: string
  senderId: string
  content: string
  timestamp: string
  isEdited: boolean
  attachments: string[]
}

export interface CollabChannel {
  id: string
  name: string
  type: 'channel' | 'direct'
  description?: string
  members: string[]
  createdAt: string
  lastMessage?: string
}

// ────────── User CRUD ──────────

export function getAllUsers(): CollabUser[] {
  return getItem<CollabUser[]>('users') || []
}

export function getUser(id: string): CollabUser | null {
  return getAllUsers().find(u => u.id === id) || null
}

export function updateUser(id: string, updates: Partial<CollabUser>): CollabUser | null {
  const list = getAllUsers()
  const idx = list.findIndex(u => u.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('users', list)
  return list[idx]
}

// ────────── Workspace CRUD ──────────

export function getAllWorkspaces(filters?: { status?: string }): CollabWorkspace[] {
  let list = getItem<CollabWorkspace[]>('workspaces') || []
  if (filters?.status) list = list.filter(w => w.status === filters.status)
  return list.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
}

export function getWorkspace(id: string): CollabWorkspace | null {
  return getAllWorkspaces().find(w => w.id === id) || null
}

export function createWorkspace(data: Omit<CollabWorkspace, 'id' | 'createdAt' | 'lastActivity' | 'documents' | 'tasks'>): CollabWorkspace {
  const now = new Date().toISOString()
  const ws: CollabWorkspace = { ...data, id: generateId(), createdAt: now, lastActivity: now, documents: [], tasks: [] }
  const list = getItem<CollabWorkspace[]>('workspaces') || []
  list.unshift(ws)
  setItem('workspaces', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return ws
}

export function updateWorkspace(id: string, updates: Partial<CollabWorkspace>): CollabWorkspace | null {
  const list = getItem<CollabWorkspace[]>('workspaces') || []
  const idx = list.findIndex(w => w.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates, lastActivity: new Date().toISOString() }
  setItem('workspaces', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return list[idx]
}

export function deleteWorkspace(id: string): void {
  setItem('workspaces', (getItem<CollabWorkspace[]>('workspaces') || []).filter(w => w.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
}

export function addDocumentToWorkspace(wsId: string, doc: Omit<CollabDocument, 'id'>): CollabDocument | null {
  const list = getItem<CollabWorkspace[]>('workspaces') || []
  const idx = list.findIndex(w => w.id === wsId)
  if (idx < 0) return null
  const newDoc: CollabDocument = { ...doc, id: generateId() }
  list[idx].documents.push(newDoc)
  list[idx].lastActivity = new Date().toISOString()
  setItem('workspaces', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return newDoc
}

export function addTaskToWorkspace(wsId: string, task: Omit<CollabTask, 'id' | 'createdAt' | 'workspaceId'>): CollabTask | null {
  const list = getItem<CollabWorkspace[]>('workspaces') || []
  const idx = list.findIndex(w => w.id === wsId)
  if (idx < 0) return null
  const newTask: CollabTask = { ...task, id: generateId(), createdAt: new Date().toISOString(), workspaceId: wsId }
  list[idx].tasks.push(newTask)
  list[idx].lastActivity = new Date().toISOString()
  setItem('workspaces', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return newTask
}

export function updateTaskInWorkspace(wsId: string, taskId: string, updates: Partial<CollabTask>): void {
  const list = getItem<CollabWorkspace[]>('workspaces') || []
  const idx = list.findIndex(w => w.id === wsId)
  if (idx < 0) return
  const tIdx = list[idx].tasks.findIndex(t => t.id === taskId)
  if (tIdx < 0) return
  list[idx].tasks[tIdx] = { ...list[idx].tasks[tIdx], ...updates }
  setItem('workspaces', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
}

// ────────── Team CRUD ──────────

export function getAllTeams(): CollabTeam[] {
  return getItem<CollabTeam[]>('teams') || []
}

export function getTeam(id: string): CollabTeam | null {
  return getAllTeams().find(t => t.id === id) || null
}

export function createTeam(data: Omit<CollabTeam, 'id' | 'createdAt'>): CollabTeam {
  const team: CollabTeam = { ...data, id: generateId(), createdAt: new Date().toISOString() }
  const list = getAllTeams()
  list.push(team)
  setItem('teams', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return team
}

export function updateTeam(id: string, updates: Partial<CollabTeam>): CollabTeam | null {
  const list = getAllTeams()
  const idx = list.findIndex(t => t.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...updates }
  setItem('teams', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return list[idx]
}

export function deleteTeam(id: string): void {
  setItem('teams', getAllTeams().filter(t => t.id !== id))
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
}

export function addMemberToTeam(teamId: string, member: CollabTeamMember): void {
  const list = getAllTeams()
  const idx = list.findIndex(t => t.id === teamId)
  if (idx < 0) return
  if (list[idx].members.some(m => m.userId === member.userId)) return
  list[idx].members.push(member)
  setItem('teams', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
}

export function removeMemberFromTeam(teamId: string, userId: string): void {
  const list = getAllTeams()
  const idx = list.findIndex(t => t.id === teamId)
  if (idx < 0) return
  list[idx].members = list[idx].members.filter(m => m.userId !== userId)
  setItem('teams', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
}

// ────────── Activity CRUD ──────────

export function getAllActivities(): CollabActivity[] {
  return getItem<CollabActivity[]>('activities') || []
}

export function addActivity(data: Omit<CollabActivity, 'id' | 'timestamp'>): CollabActivity {
  const activity: CollabActivity = { ...data, id: generateId(), timestamp: new Date().toISOString() }
  const list = getItem<CollabActivity[]>('activities') || []
  list.unshift(activity)
  if (list.length > 200) list.length = 200
  setItem('activities', list)
  return activity
}

// ────────── Channel & Message CRUD ──────────

export function getAllChannels(): CollabChannel[] {
  return getItem<CollabChannel[]>('channels') || []
}

export function getChannel(id: string): CollabChannel | null {
  return getAllChannels().find(c => c.id === id) || null
}

export function createChannel(data: Omit<CollabChannel, 'id' | 'createdAt'>): CollabChannel {
  const channel: CollabChannel = { ...data, id: generateId(), createdAt: new Date().toISOString() }
  const list = getAllChannels()
  list.push(channel)
  setItem('channels', list)
  window.dispatchEvent(new CustomEvent('fiscasync:collab-updated'))
  return channel
}

export function getMessages(channelId: string): CollabMessage[] {
  const all = getItem<CollabMessage[]>('messages') || []
  return all.filter(m => m.channelId === channelId).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function sendMessage(data: Omit<CollabMessage, 'id' | 'timestamp' | 'isEdited'>): CollabMessage {
  const msg: CollabMessage = { ...data, id: generateId(), timestamp: new Date().toISOString(), isEdited: false }
  const list = getItem<CollabMessage[]>('messages') || []
  list.push(msg)
  setItem('messages', list)
  // Update channel last message
  const channels = getAllChannels()
  const chIdx = channels.findIndex(c => c.id === data.channelId)
  if (chIdx >= 0) {
    channels[chIdx].lastMessage = data.content.substring(0, 80)
    setItem('channels', channels)
  }
  window.dispatchEvent(new CustomEvent('fiscasync:collab-message'))
  return msg
}

// ────────── Seed Data ──────────

export function seedCollabData(): void {
  if ((getItem<CollabUser[]>('users') || []).length > 0) return

  const now = new Date().toISOString()
  const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString()
  const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString()

  const users: CollabUser[] = [
    { id: 'user-1', name: 'Jean Dupont', email: 'jean.dupont@entreprise.com', role: 'manager', department: 'Finance', status: 'online', lastSeen: now, isActive: true },
    { id: 'user-2', name: 'Marie Martin', email: 'marie.martin@entreprise.com', role: 'accountant', department: 'Comptabilité', status: 'online', lastSeen: now, isActive: true },
    { id: 'user-3', name: 'Pierre Durand', email: 'pierre.durand@entreprise.com', role: 'auditor', department: 'Audit', status: 'away', lastSeen: new Date(Date.now() - 15 * 60000).toISOString(), isActive: true },
    { id: 'user-4', name: 'Sophie Bernard', email: 'sophie.bernard@entreprise.com', role: 'admin', department: 'IT', status: 'busy', lastSeen: now, isActive: true },
  ]
  setItem('users', users)

  const workspaces: CollabWorkspace[] = [
    {
      id: 'ws-1', name: 'Clôture Annuelle 2024', type: 'project',
      description: 'Préparation et validation des états financiers annuels',
      owner: 'user-1', teams: ['team-1'],
      documents: [
        { id: 'doc-1', name: 'Balance Générale 2024.xlsx', type: 'spreadsheet', size: 2456789, owner: 'user-2', version: 3, isLocked: false, lastModified: '2024-11-25', lastModifiedBy: 'user-2', tags: ['balance', '2024'] },
        { id: 'doc-2', name: 'Rapport Audit Q4.pdf', type: 'document', size: 1234567, owner: 'user-3', version: 1, isLocked: false, lastModified: '2024-11-20', lastModifiedBy: 'user-3', tags: ['audit', 'Q4'] },
      ],
      tasks: [
        { id: 'task-1', title: 'Valider les écritures de régularisation', description: "Vérifier et valider toutes les écritures de fin d'exercice", assignees: ['user-2', 'user-3'], dueDate: '2024-12-15', priority: 'high', status: 'in-progress', workspaceId: 'ws-1', createdBy: 'user-1', createdAt: '2024-11-01', estimatedHours: 8 },
        { id: 'task-2', title: 'Préparer les annexes', description: 'Rédiger les notes annexes aux états financiers', assignees: ['user-2'], dueDate: '2024-12-20', priority: 'medium', status: 'todo', workspaceId: 'ws-1', createdBy: 'user-1', createdAt: '2024-11-10', estimatedHours: 12 },
      ],
      createdAt: '2024-11-01', lastActivity: now, status: 'active', progress: 45,
    },
    {
      id: 'ws-2', name: 'Audit Fiscal Q4 2024', type: 'project',
      description: 'Audit de conformité fiscale du quatrième trimestre',
      owner: 'user-3', teams: ['team-1'],
      documents: [],
      tasks: [
        { id: 'task-3', title: 'Vérifier les déclarations TVA', description: 'Contrôler les déclarations TVA Q4', assignees: ['user-3'], dueDate: '2025-01-15', priority: 'high', status: 'in-progress', workspaceId: 'ws-2', createdBy: 'user-3', createdAt: '2024-10-15', estimatedHours: 16 },
      ],
      createdAt: '2024-10-15', lastActivity: '2024-11-20', status: 'active', progress: 70,
    },
  ]
  setItem('workspaces', workspaces)

  const teams: CollabTeam[] = [
    {
      id: 'team-1', name: 'Équipe Finance', description: 'Équipe responsable de la comptabilité et finances',
      members: [
        { userId: 'user-1', role: 'admin', joinedAt: '2024-01-01', permissions: ['all'] },
        { userId: 'user-2', role: 'member', joinedAt: '2024-01-15', permissions: ['read', 'write'] },
        { userId: 'user-3', role: 'member', joinedAt: '2024-02-01', permissions: ['read'] },
      ],
      projects: ['ws-1', 'ws-2'], createdAt: '2024-01-01', createdBy: 'user-1', isPrivate: false,
      settings: { allowGuestAccess: false, requireApproval: true, notificationsEnabled: true, defaultPermissions: ['read'] },
    },
  ]
  setItem('teams', teams)

  const activities: CollabActivity[] = [
    { id: 'act-1', type: 'document', action: 'a modifié', userId: 'user-2', targetId: 'doc-1', targetName: 'Balance Générale 2024.xlsx', timestamp: thirtyMinAgo, isImportant: false },
    { id: 'act-2', type: 'task', action: 'a commencé', userId: 'user-3', targetId: 'task-1', targetName: 'Valider les écritures de régularisation', timestamp: twoHoursAgo, isImportant: true },
    { id: 'act-3', type: 'member', action: 'a rejoint l\'espace', userId: 'user-4', targetName: 'Clôture Annuelle 2024', timestamp: twoHoursAgo, isImportant: false },
  ]
  setItem('activities', activities)

  const channels: CollabChannel[] = [
    { id: 'ch-general', name: '#general', type: 'channel', description: 'Discussions générales', members: ['user-1', 'user-2', 'user-3', 'user-4'], createdAt: '2024-01-01', lastMessage: 'Bienvenue sur FiscaSync!' },
    { id: 'ch-compta', name: '#comptabilité', type: 'channel', description: 'Discussions comptables', members: ['user-1', 'user-2'], createdAt: '2024-01-01', lastMessage: 'Balance mise à jour.' },
    { id: 'ch-audit', name: '#audit', type: 'channel', description: 'Canal audit et conformité', members: ['user-1', 'user-3'], createdAt: '2024-01-01' },
  ]
  setItem('channels', channels)

  const messages: CollabMessage[] = [
    { id: 'msg-1', channelId: 'ch-general', senderId: 'user-1', content: 'Bienvenue sur FiscaSync! N\'hésitez pas à utiliser cet espace pour les discussions.', timestamp: '2024-11-01T09:00:00.000Z', isEdited: false, attachments: [] },
    { id: 'msg-2', channelId: 'ch-general', senderId: 'user-2', content: 'Merci Jean! Je commence la clôture annuelle cette semaine.', timestamp: '2024-11-01T09:15:00.000Z', isEdited: false, attachments: [] },
    { id: 'msg-3', channelId: 'ch-compta', senderId: 'user-2', content: 'La balance générale a été mise à jour avec les écritures de novembre.', timestamp: '2024-11-25T14:30:00.000Z', isEdited: false, attachments: [] },
    { id: 'msg-4', channelId: 'ch-compta', senderId: 'user-1', content: 'Parfait Marie, je vais vérifier les totaux.', timestamp: '2024-11-25T14:45:00.000Z', isEdited: false, attachments: [] },
  ]
  setItem('messages', messages)
}
